/**
 * Guards on an AI provider's output before it's trusted, for the pieces the
 * structured resume-parser/reassembler pipeline (resume-parser.ts,
 * resume-tailor-service.ts) still can't make structurally impossible:
 *
 * - A local model can still loop while producing one bullet's text, even
 *   though it's no longer free-writing the whole resume (hasRunawayRepetition).
 * - A reworded bullet could still introduce a fact — a number, a tool name,
 *   a proper noun — that appears nowhere in the candidate's real resume
 *   (extractGuardTokens/isGrounded). Header-level fabrication (employer,
 *   title, dates, entry-merging, a target company posing as a past
 *   employer) is already impossible by construction once headers are always
 *   re-emitted verbatim from the parse, never authored by the AI — this
 *   file no longer needs to detect that after the fact.
 *
 * Pure, dependency-free — same testability tier as resume-render.ts.
 */

const REPEAT_LINE_MIN_LENGTH = 20;
const REPEAT_LINE_THRESHOLD = 3;

/**
 * True once some non-trivial line has appeared REPEAT_LINE_THRESHOLD+ times
 * verbatim — a local model that's lost track of its own earlier output
 * tends to re-emit the same line rather than producing new content. Used
 * both mid-stream (see resume-tailor-service.ts's generate()) and as a
 * final check on an individual bullet string the AI returned.
 */
export function hasRunawayRepetition(text: string): boolean {
  const counts = new Map<string, number>();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.length < REPEAT_LINE_MIN_LENGTH) continue;
    const count = (counts.get(line) ?? 0) + 1;
    counts.set(line, count);
    if (count >= REPEAT_LINE_THRESHOLD) return true;
  }
  return false;
}

// No trailing \b: a %/k/m/b suffix is itself a non-word character, so a
// boundary check right after it fails whenever the next character is also
// non-word (e.g. "25% " — no \w/\W transition between "%" and the space),
// silently dropping the suffix. Lookaround instead: not preceded/followed by
// another alphanumeric, so "25%" and "Q3"'s "3" are treated correctly.
const NUMBER_TOKEN_RE = /(?<![A-Za-z0-9])\$?\d+(?:\.\d+)?(?:%|[kmbKMB])?(?![A-Za-z0-9])/g;
const PROPER_NOUN_RE = /\b[A-Z][A-Za-z0-9+.#]{1,}\b/g;

/**
 * Numbers (with an optional %/$/K/M-style suffix) and capitalized
 * multi-character words — the tokens that actually carry a verifiable fact
 * (a tool name, a client, a metric, an employer) as opposed to ordinary
 * prose. Used to build the ground-truth pool from the *whole original
 * resume* — see isGrounded. Unlike extractCandidateGuardTokens below, this
 * doesn't exclude a leading word: a false positive here only makes the pool
 * slightly more permissive, never less, so there's no failure mode to guard
 * against on this side.
 */
export function extractGuardTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const m of text.matchAll(NUMBER_TOKEN_RE)) tokens.add(m[0].toLowerCase());
  for (const m of text.matchAll(PROPER_NOUN_RE)) tokens.add(m[0].toLowerCase());
  return tokens;
}

/**
 * Same token extraction, but for text being *checked* as a candidate
 * rewrite rather than used to build the ground-truth pool: per VOICE_RULES,
 * a bullet is one sentence, and its first word is almost always its leading
 * action verb ("Optimized", "Streamlined", "Migrated", ...) — capitalized
 * only by sentence position, not because it names a real fact. Excluding it
 * by *position* (rather than a lexical list of known verbs, which is
 * exactly the "enumerate every bad case" anti-pattern this project already
 * got burned by once) means there's no verb list to maintain and none it
 * can miss. Numbers aren't exempted the same way — a leading number in a
 * bullet ("40% increase...") is still a fact, not a sentence-position
 * artifact, so it's still checked.
 */
function extractCandidateGuardTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const m of text.matchAll(NUMBER_TOKEN_RE)) tokens.add(m[0].toLowerCase());
  const withoutLeadingWord = text.replace(/^\s*\S+\s*/, '');
  for (const m of withoutLeadingWord.matchAll(PROPER_NOUN_RE)) tokens.add(m[0].toLowerCase());
  return tokens;
}

/**
 * True if every guard token in `candidateText` already appears in
 * `allowedTokens`. The allowed pool should be every guard token in the
 * *entire* original resume, not just one bullet's original wording — a
 * legitimate rewrite is free to borrow a fact from elsewhere in the same
 * resume (e.g. a skill mentioned in the SKILLS section appearing in a
 * reworded EXPERIENCE bullet); it just can't introduce something that
 * appears nowhere in the candidate's real resume, which is exactly how
 * "Anthropic" (the job posting's own company) or a fabricated statistic
 * would show up.
 */
export function isGrounded(candidateText: string, allowedTokens: Set<string>): boolean {
  for (const token of extractCandidateGuardTokens(candidateText)) {
    if (!allowedTokens.has(token)) return false;
  }
  return true;
}

// Fuses across internal hyphens/apostrophes so "e-commerce" and "Dylana's"
// tokenize as one word each, not ["e", "commerce"] / ["Dylana", "s"] — a
// naive `\b[A-Za-z]+\b` split flags those as spurious one-letter "words"
// (confirmed against every bullet in packages/profile/master-profile.json:
// the only two false hits were exactly this shape). This also means a
// dropped-space corruption like "high-impact engineering" -> "high-impacengineering"
// is measured as one 21-char fused token, not two separate ~4/~16-char
// ones — which is what actually pushes it over MAX_PLAUSIBLE_WORD_LENGTH.
// ’ is the curly/smart right single quote ('), not just the straight
// ASCII apostrophe (') — confirmed missing live: a model's own output used
// a curly apostrophe in "client's", which without this split into
// ["client", "s"] and flagged "s" as an orphan single-letter word, the
// exact false positive this fusing was already supposed to prevent.
const WORD_RE = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g;
const SUSPICIOUS_SHORT_WORD_ALLOWLIST = new Set(['a', 'i']);
// Longest real word across every bullet in the master profile is 15 chars
// ("recommendations", "collaboratively"); 20 leaves headroom above any
// genuine long word while still catching a dropped-space merge like
// "high-impacengineering" (21 chars).
const MAX_PLAUSIBLE_WORD_LENGTH = 20;

/**
 * Heuristic, structural check for a bullet that looks garbled rather than a
 * genuine complete sentence — targets two shapes observed live from Gemini
 * (a character or two silently dropped mid-generation, a known quirk of
 * that model, not something in this codebase's own text handling): a
 * missing letter leaves an orphan single-letter "word" ("t intern" for
 * "the intern"), or a missing space merges two words into one implausibly
 * long one ("high-impacengineering" for "high-impact engineering").
 *
 * Deliberately does NOT require terminal punctuation — tested against a
 * real llama3.2 run and found that a smaller model's legitimate, complete
 * rewrites frequently omit the trailing period entirely (e.g. "Designed,
 * prototyped, and shipped full-stack features rapidly"); requiring one
 * rejected the large majority of that model's genuine work, a far worse
 * outcome than the narrower guard below. As a result, a truncation that
 * cuts off mid-word without leaving an orphan short word or an overlong
 * merge (e.g. "...text ta") isn't caught by this check — that would need
 * real spellcheck/NLP to catch reliably without this exact false-positive
 * risk, which is out of scope here.
 */
export function looksLikeCompleteSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  for (const m of trimmed.matchAll(WORD_RE)) {
    const word = m[0];
    if (word.length === 1 && !SUSPICIOUS_SHORT_WORD_ALLOWLIST.has(word.toLowerCase())) return false;
    if (word.length > MAX_PLAUSIBLE_WORD_LENGTH) return false;
  }
  return true;
}
