/**
 * AI resume tailoring service. Takes the user's resume and a job description,
 * produces a tailored version with keyword gap analysis.
 *
 * Routes through whichever provider is active in Settings (Gemini/Claude
 * when configured with an API key, local Ollama otherwise) via
 * `getActiveCloudClient()` — same contract as cover-letter-service.ts.
 *
 * Generation is structured, not free-text: the resume is parsed into
 * ID-tagged entries/bullets (resume-parser.ts) and the AI is only ever asked
 * which IDs to keep/reorder and how to reword bullet text — it never gets a
 * text field where an employer, title, or date could go. This is what makes
 * every fabrication category observed live this session (employer
 * substitution, entry-merging, the target company posing as a past
 * employer) structurally impossible rather than merely detected afterward.
 */

import { ollamaFetch } from './ollama-fetch';
import { getOllamaConfig } from './ollama-config';
import { getActiveCloudClient, voicePromptBlock } from './ai-provider';
import { analyzeJD } from './jd-analyzer';
import { scoreATS, matchKeywords, type ATSScoreResult } from './ats-scorer';
import { hasRunawayRepetition, extractGuardTokens, isGrounded, looksLikeCompleteSentence } from './resume-output-guard';
import { stripApplicationFormNoise } from './job-description-scraper';
import {
  parseResume,
  serializeForPrompt,
  reassembleResume,
  resolveAllKeptEntries,
  buildHeadline,
  serializeEntriesSection,
  serializeListSection,
  type ParsedEntry,
  type ParsedEntriesSection,
  type ParsedListSection,
  type TailorAIResponse,
  type ReassembleResult,
} from './resume-parser';
// Bundled at build time (esbuild's `.md` -> text loader) from the /resume
// Claude Code skill's output (.claude/skills/resume/SKILL.md's `learn` mode) —
// a rebuild is what picks up newly approved rules. See resume-build-rules.md
// and packages/profile/voice-dna.md for the rest of the skill's inputs.
import resumePreferences from '../../../../packages/profile/resume-preferences.md';

const OLLAMA_BASE_URL = 'http://localhost:11434';
// Generous context window: a resume + a full job description + the voice and
// preferences guidance blocks easily runs several thousand tokens, and Ollama
// silently truncates from the front (of the prompt, and — once a generation
// is already this long — of the model's own output so far) when num_ctx is
// too small.
const OLLAMA_NUM_CTX = 12288;
// A JSON response of bullet rewrites is much shorter than a full free-text
// resume; capping generation keeps a looping model bounded.
const OLLAMA_NUM_PREDICT = 3072;

export interface TailorResult {
  tailoredResume: string;
  keywordGap: KeywordAnalysis;
}

export interface KeywordAnalysis {
  present: string[];
  missing: string[];
  score: number; // 0-100
}

// ── Prompt builders ──────────────────────────────────────────────────────────

const VOICE_RULES = `
WRITING RULES (follow exactly — a resume that breaks these reads as AI-written):
- Plain and direct. No em dashes. No buzzwords ("dynamic", "results-driven", "synergy"), no aspirational framing, no abstract praise.
- Each bullet is one sentence. It leads with what was built or done, then the result. Cut filler words instead of stacking clauses.
- Use the job description's own vocabulary for skills and tools — that is what keyword-matching software and human skimmers both key on.
- Never invent a number, tool, employer, date, or achievement that is not already in the candidate's resume. Reordering and rewording are fine; fabrication is not.`.trim();

/**
 * Preferences the /resume skill's `learn` mode has approved so far — bendable
 * defaults (section order, framing, emphasis), distinct from the hard
 * VOICE_RULES above. Empty until a `/resume learn` pass has written any.
 *
 * Kept short (this + voicePromptBlock together are a second full guidance
 * block competing with the resume/JD for OLLAMA_NUM_CTX's fixed budget).
 */
function preferencesPromptBlock(maxChars = 1500): string {
  if (!resumePreferences || !resumePreferences.trim()) return '';
  return `\nLEARNED PREFERENCES (apply unless the posting calls for otherwise):\n${resumePreferences.slice(0, maxChars)}\n`;
}

const JSON_CONTRACT_BASE = `Respond with JSON ONLY, in exactly this shape:
{"keepEntries": ["e2","e1"], "bullets": {"e1": ["reworded bullet text", "..."]}, "lists": {"s3": ["Skill A","Skill B"]}}

HARD RULES:
1. Only use IDs that appear in the tagged resume below — an entry ID looks like "e1" (see the "[ENTRY e1] ..." lines) and a list-section ID looks like "s3" (see the "[LIST s3] ..." line). These are the ONLY valid IDs. Never invent one, and never use the example IDs above literally unless they happen to also appear in the tagged resume below.
2. Never write an employer name, job title, or date anywhere in your response — those come from the resume automatically. You only choose which entry IDs to keep (and their relative order within their own section) and how to reword each entry's bullets.
3. "bullets" maps an entry ID to a list of reworded bullet strings, positioned to match that entry's existing bullets in order (the first string replaces the first bullet, etc.) — an entry's list may contain fewer strings than it originally had (dropping a bullet is fine) but never more.
4. A "lists" entry (e.g. skills) may only reorder or drop items that already appear in the tagged resume — never add one that isn't already listed.
5. Never invent a number, tool, client, or achievement that isn't already somewhere in the candidate's real resume.
6. Output nothing but the JSON object — no preamble, no markdown code fence, no commentary.`;

const ADDED_BULLET_RULE = `7. To add a genuinely new bullet under an entry (only when the candidate's feedback specifically asks for one), put it in a separate "addedBullets" field: {"addedBullets": {"e1": ["new bullet text"]}} — at most one per entry, and only if every fact in it already appears somewhere in the candidate's real resume. Never put a new bullet inside "bullets" — that field is only for rewording bullets that already exist.`;

// Selection (which entries/list items survive) and bullet rewriting (how a
// kept entry's own bullets read) are split into separate calls — one
// selection call, then one rewrite call per kept entry — rather than one
// call asking for everything at once. A single call covering a resume's
// full ~90 lines has no way to guarantee every kept entry actually gets
// reworded: measured live, it would rewrite a handful of bullets under
// token/attention pressure and silently leave the rest of a large entry
// (e.g. one with 30+ original bullets) untouched, or truncate mid-bullet.
// Each rewrite call below only ever sees one entry's own bullets, so it
// can't run out of room mid-entry, and its own prompt states a length
// target the old whole-resume prompt never did: never more than the
// original bullet count.
// A real one-page resume shows a handful of entries, not everything a
// candidate has ever done — confirmed as a real gap live: once the
// candidate's full profile (18 entries across experience + projects, up
// from the ~6-10 tested earlier) became available to the selection call,
// it kept 11 of them with no cap ever stated, well past what fits on one
// page. Per-entry bullet caps alone don't fix this — the number of
// *entries* kept needs its own limit too.
const MAX_TOTAL_ENTRIES = 8;

// Selecting which entries survive is itself split one call per
// entries-section (Experience, Projects, ...), rather than one call
// spanning every section — confirmed live: once the candidate's full
// profile grew to 18 entries across sections, both llama3.2 and
// qwen2.5:7b returned a near-empty, attention-starved response (2 valid
// ids, both from the very start of the document) instead of properly
// covering the whole resume. Same root cause and same fix as the
// per-entry bullet-rewrite split below: a model given too much to select
// from in one call quietly stops partway through instead of failing loud.
function buildSectionSelectionPrompt(
  section: ParsedEntriesSection,
  jobDescription: string,
  extraGuidance: string,
  cap: number
): string {
  const effectiveCap = Math.min(section.entries.length, cap);
  const contract = `Respond with JSON ONLY, in exactly this shape:
{"keepEntries": ["e2","e1"]}

HARD RULES:
1. Only use IDs that appear in this section below — an entry ID looks like "e1" (see the "[ENTRY e1] ..." lines). Never invent one, and never use the example IDs above literally unless they happen to also appear below.
2. Never write an employer name, job title, bullet text, or date anywhere in your response — those come from the resume automatically. You only choose which entry IDs to keep, and their relative order (most relevant first).
3. Keep at most ${effectiveCap} of this section's ${section.entries.length} entries — a real one-page resume shows only its strongest few for this posting, not everything the candidate has ever done. Fewer than ${effectiveCap} is fine if this posting doesn't call for that many.
4. Output nothing but the JSON object — no preamble, no markdown code fence, no commentary.`;
  return `You are an expert resume writer deciding which entries in ONE resume section to keep for a specific job posting. A separate pass afterward rewords each kept entry's bullets — this pass only selects and orders entries within this section.

${contract}

${extraGuidance}

---

SECTION:
${serializeEntriesSection(section)}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

Respond with the JSON object now.`;
}

// List-section trimming (skills etc.) stays one combined call — the total
// content across every list section is far smaller than the entries pool
// that actually caused the failure above, so splitting it further isn't
// warranted by anything measured yet.
function buildListsSelectionPrompt(listSections: ParsedListSection[], jobDescription: string, extraGuidance: string): string {
  const serialized = listSections.map((s) => serializeListSection(s)).join('\n\n');
  // The example is built from this resume's own real list IDs and items. A
  // hardcoded example ("s3") was echoed back verbatim by qwen2.5:7b in the
  // golden-set run; "s3" was the Education section, so nothing matched and
  // every skills group was kept untrimmed. Echoing a real example is harmless.
  const [first, second] = listSections;
  const example: Record<string, string[]> = { [first.id]: first.items.slice(0, 2).map((i) => i.text) };
  if (second) example[second.id] = [];
  const contract = `Respond with JSON ONLY, in exactly this shape:
${JSON.stringify({ lists: example })}

HARD RULES:
1. Only use IDs that appear below (see the "[LIST ...]" lines). Never invent one.
2. Give every list-section ID below an entry. A "lists" entry may only reorder or drop items that already appear in that section — never add one that isn't already listed.
3. To remove a whole section that does nothing for this posting, give it an empty array [].
4. Output nothing but the JSON object — no preamble, no markdown code fence, no commentary.`;
  return `You are an expert resume writer trimming list sections (e.g. skills) down to what's relevant for one specific job posting. Each list section below is tagged with a stable ID, e.g. "[LIST s3] Python, React".

${contract}

${extraGuidance}

---

LIST SECTIONS:
${serialized}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

Respond with the JSON object now.`;
}

// A resume entry with 40 original bullets (a real shape in the owner's RTI
// role — a brain-dump-style master entry, not a curated resume section)
// must never dump anywhere close to that many into a tailored result just
// because the per-entry rewrite call is allowed up to its own original
// count. This caps every entry the same way a real one-page resume would,
// regardless of how many bullets its source material happens to carry.
// MIN keeps a kept entry from looking sparse (a "why is this even listed"
// single bullet) — real ones per the owner's own reference resumes run 2-6
// bullets depending on relevance, never fewer than 2.
const MIN_BULLETS_PER_ENTRY = 2;
const MAX_BULLETS_PER_ENTRY = 5;

function buildEntryBulletPrompt(entry: ParsedEntry, jobDescription: string, extraGuidance: string): string {
  const originalBullets = entry.bullets.map((b, i) => `${i + 1}. ${b.text}`).join('\n');
  const maxBullets = Math.min(entry.bullets.length, MAX_BULLETS_PER_ENTRY);
  const minBullets = Math.min(entry.bullets.length, MIN_BULLETS_PER_ENTRY);
  const contract = `Respond with JSON ONLY, in exactly this shape:
{"bullets": ["reworded bullet 1", "reworded bullet 2"]}

HARD RULES:
1. Return between ${minBullets} and ${maxBullets} bullet(s) — this entry has ${entry.bullets.length} original bullets, but a real resume entry shows only its most relevant few, not everything a candidate has ever done in that role. Give the strongest, most relevant entries closer to ${maxBullets}; give a weaker-fit entry closer to ${minBullets} — never fewer than ${minBullets}, never more than ${maxBullets}.
2. Each returned string replaces one original bullet, in the same relative order it appeared, but you are choosing WHICH of the ${entry.bullets.length} originals are worth keeping — pick the ones most relevant to this posting, not just the first ones.
3. Never invent a number, tool, employer, date, or achievement that isn't already stated in the bullets below.
4. Use the job description's own vocabulary for skills and tools where the candidate's real experience already supports it.
5. Output nothing but the JSON object — no preamble, no markdown code fence, no commentary.`;
  return `You are an expert resume writer rewording one entry's bullets to fit a specific job posting. Reword for relevance and impact — never add anything not already true of this entry.

ENTRY: ${entry.headerLine}${entry.subtitleLine ? `\n${entry.subtitleLine}` : ''}

ORIGINAL BULLETS (${entry.bullets.length} total):
${originalBullets}

${contract}

${VOICE_RULES}
${extraGuidance}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

Respond with the JSON object now.`;
}

function buildRefinePrompt(serializedResume: string, jobDescription: string, feedback: string, extraGuidance: string): string {
  return `You are revising a tailored resume based on the candidate's own feedback about the current draft. The resume below uses the same ID-tagged format as before: "[ENTRY e1] ..." for each entry, "[LIST s3] ..." for each list section, and plain "- ..." lines for bullets (addressed by position, not their own ID).

${JSON_CONTRACT_BASE}
${ADDED_BULLET_RULE}

---

CURRENT TAGGED RESUME:
${serializedResume}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

CANDIDATE'S FEEDBACK — apply this change:
${feedback}

${VOICE_RULES}
${extraGuidance}

---

Respond with the JSON object now.`;
}

// ── JSON extraction ──────────────────────────────────────────────────────────

class TailorResponseError extends Error {}

function extractJsonBlock(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return t;
  return t.slice(start, end + 1);
}

function parseJsonResponse<T>(rawText: string): T {
  const jsonText = extractJsonBlock(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    if (typeof process !== 'undefined' && process.env?.TAILOR_DEBUG) {
      console.error(`[TAILOR_DEBUG] raw response (${rawText.length} chars):\n${rawText}`);
    }
    throw new TailorResponseError(
      "The AI didn't return the structured response tailoring needs — try again, or switch providers in Settings."
    );
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new TailorResponseError(
      "The AI's response wasn't in the expected format — try again, or switch providers in Settings."
    );
  }
  return parsed as T;
}

function parseAIResponse(rawText: string): TailorAIResponse {
  return parseJsonResponse<TailorAIResponse>(rawText);
}

interface EntryBulletResponse {
  bullets?: string[];
}

/** One bullet-rewrite call for a single kept entry. Returns undefined (never throws past its caller) so one entry's failure can fall back to its original wording without aborting the whole tailor. */
async function rewriteEntryBullets(entry: ParsedEntry, jobDescription: string, extraGuidance: string): Promise<string[] | undefined> {
  const raw = await generate(buildEntryBulletPrompt(entry, jobDescription, extraGuidance));
  const response = parseJsonResponse<EntryBulletResponse>(raw);
  if (!Array.isArray(response.bullets)) return undefined;
  return response.bullets.filter((b): b is string => typeof b === 'string' && b.trim().length > 0);
}

// ── Generation (provider-routed) ─────────────────────────────────────────────

// A hang shouldn't be able to last forever even when it doesn't trip the
// line-repetition check below (e.g. a model that rambles without repeating
// an exact line) — matches the timeout ceiling the cloud clients already use.
const OLLAMA_TIMEOUT_MS = 120000;

/**
 * Run one prompt through the active provider and return the full response
 * text. Streaming is used internally for the Ollama path purely to abort
 * early on a runaway-repetition loop — a local model can still loop while
 * producing JSON, even though it's no longer free-writing resume prose — but
 * no partial text is exposed to callers: a partial JSON response has nothing
 * sensible to show as a live preview.
 */
async function generate(prompt: string): Promise<string> {
  const cloud = await getActiveCloudClient();
  if (cloud) {
    return cloud.chat([{ role: 'user', content: prompt }], { temperature: 0.3 });
  }

  const ollamaConfig = await getOllamaConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  let response: Response;
  try {
    response = await ollamaFetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaConfig.chatModel,
        prompt,
        stream: true,
        // Every caller of generate() parses the reply as JSON. Without this,
        // qwen2.5:7b returned `[{"MongoDB"}]`-style invalid JSON for the
        // skills-list call and every skills section fell back to untrimmed.
        format: 'json',
        options: {
          temperature: 0.3,
          num_predict: OLLAMA_NUM_PREDICT,
          num_ctx: OLLAMA_NUM_CTX,
          // Extra insurance against the exact repetition loop seen live —
          // Ollama's own default is already 1.1, this leans harder into it.
          repeat_penalty: 1.3,
          repeat_last_n: 256,
        },
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Ollama request timed out after ${OLLAMA_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  let fullText = '';
  const reader = response.body?.getReader();
  if (!reader) {
    clearTimeout(timeoutId);
    const data = await response.json();
    return data.response ?? '';
  }
  const decoder = new TextDecoder();
  let buffer = '';
  const LF = String.fromCharCode(10);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(LF);
      buffer = lines.pop() || '';
      let sawNewText = false;
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.response) {
            fullText += data.response;
            sawNewText = true;
          }
        } catch { /* partial JSON — skip */ }
      }
      if (sawNewText && hasRunawayRepetition(fullText)) {
        await reader.cancel().catch(() => {});
        break;
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
  return fullText;
}

/** Formats a derived headline (see buildHeadline) for insertion into the resume text, or undefined when there's nothing safe to derive. */
function formatHeadline(headline: ReturnType<typeof buildHeadline>): string | undefined {
  if (!headline) return undefined;
  if (headline.yearsOfExperience <= 0) return headline.title;
  const years = headline.yearsOfExperience;
  // " | " rather than an em dash: voice-dna.md bans em dashes, and this line
  // is code-built, so it would otherwise put one on every resume.
  return `${headline.title} | ${years}+ Year${years === 1 ? '' : 's'} of Experience`;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Full result of a tailoring pass, including the reassembly stats
 * (entry/bullet counts) — exposed separately from `tailorResume()` so
 * diagnostic tooling (scripts/smoke-tailor.ts) can measure "did this
 * actually reword anything" without duplicating prompt-building logic.
 */
export async function tailorResumeDetailed(resumeText: string, jobDescription: string): Promise<ReassembleResult> {
  jobDescription = stripApplicationFormNoise(jobDescription);
  const parsed = parseResume(resumeText);
  const voice = await voicePromptBlock(1500);
  const extraGuidance = [preferencesPromptBlock(), voice].filter(Boolean).join('\n');

  // Step 1a: selection, one call per entries-section (see
  // buildSectionSelectionPrompt's doc comment for why this is split).
  // Each section's own cap is proportional to its share of the resume's
  // total entries, so a section with many entries doesn't starve a
  // smaller one; MAX_TOTAL_ENTRIES is still enforced globally afterward.
  const entriesSections = parsed.sections.filter((s): s is ParsedEntriesSection => s.kind === 'entries');
  const listSections = parsed.sections.filter((s): s is ParsedListSection => s.kind === 'list');
  const totalEntryCount = entriesSections.reduce((sum, s) => sum + s.entries.length, 0);

  const perSectionKeepEntries = await Promise.all(
    entriesSections.map(async (section): Promise<string[]> => {
      const proportionalCap = Math.max(
        1,
        Math.round((MAX_TOTAL_ENTRIES * section.entries.length) / Math.max(totalEntryCount, 1))
      );
      try {
        const raw = await generate(buildSectionSelectionPrompt(section, jobDescription, extraGuidance, proportionalCap));
        const parsedResponse = parseJsonResponse<{ keepEntries?: string[] }>(raw);
        const sectionIds = new Set(section.entries.map((e) => e.id));
        const kept = Array.isArray(parsedResponse.keepEntries)
          ? parsedResponse.keepEntries.filter((id) => sectionIds.has(id))
          : [];
        // A response with zero real matches for this section (garbled
        // JSON ids, or a model that returned nothing useful) is treated
        // the same as an outright call failure below — fail open to this
        // section's own real entries rather than losing it entirely.
        return kept.length > 0 ? kept : section.entries.map((e) => e.id);
      } catch (err) {
        console.warn(`Resume tailoring: selection call failed for section "${section.heading}", keeping all its entries.`, err);
        return section.entries.map((e) => e.id);
      }
    })
  );
  let keepEntries = perSectionKeepEntries.flat();
  if (typeof process !== 'undefined' && process.env?.TAILOR_DEBUG) {
    console.error(`[TAILOR_DEBUG] per-section keepEntries (${keepEntries.length}): ${JSON.stringify(keepEntries)}`);
  }

  // The per-section caps above are proportional, not a hard global limit —
  // enforce MAX_TOTAL_ENTRIES here. Concatenating sections in document
  // order before truncating is unsafe two different ways: (1) it can zero
  // out a whole section's ids, which resolveKeptEntries reads as "never
  // addressed" and falls back to keeping everything in it (confirmed live
  // earlier this session), and (2) even once each section has at least
  // one guaranteed slot, dumping the remainder in section order lets one
  // section that failed open with many entries (e.g. Experience, 8
  // entries) crowd out nearly every remaining slot before a second
  // section (e.g. Projects) gets to contribute more than its guaranteed
  // one — a real project more relevant than a kept Experience entry could
  // lose out purely on section order, not relevance. Round-robin across
  // sections (one id from each in turn, in each section's own order)
  // fixes both: every represented section gets a fair, interleaved shot
  // at the remaining slots instead of the first section exhausting them.
  if (keepEntries.length > MAX_TOTAL_ENTRIES) {
    const sectionOfEntry = new Map<string, string>();
    for (const section of entriesSections) {
      for (const entry of section.entries) sectionOfEntry.set(entry.id, section.id);
    }
    const bySection = new Map<string, string[]>();
    for (const id of keepEntries) {
      const section = sectionOfEntry.get(id);
      if (!section) continue;
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section)!.push(id);
    }
    const queues = [...bySection.values()];
    const result: string[] = [];
    let anyLeft = true;
    while (result.length < MAX_TOTAL_ENTRIES && anyLeft) {
      anyLeft = false;
      for (const queue of queues) {
        if (queue.length === 0) continue;
        result.push(queue.shift()!);
        anyLeft = true;
        if (result.length >= MAX_TOTAL_ENTRIES) break;
      }
    }
    keepEntries = result;
  }

  // Step 1b: list-section trimming (skills etc.) — one combined call, see
  // buildListsSelectionPrompt's doc comment for why this isn't split too.
  let lists: Record<string, string[]> | undefined;
  if (listSections.length > 0) {
    try {
      const raw = await generate(buildListsSelectionPrompt(listSections, jobDescription, extraGuidance));
      if (typeof process !== 'undefined' && process.env?.TAILOR_DEBUG) {
        console.error(`[TAILOR_DEBUG] raw list-trim response: ${raw.slice(0, 2000)}`);
      }
      const parsedResponse = parseJsonResponse<{ lists?: Record<string, string[]> }>(raw);
      lists = parsedResponse.lists;
    } catch (err) {
      console.warn('Resume tailoring: list-trimming call failed, keeping all list items unchanged.', err);
    }
  }

  // Step 2: one bullet-rewrite call per kept entry with bullets, in
  // parallel. keepEntries above is always a real, non-empty subset of
  // actual entry ids by construction (each section either succeeds
  // partially or fails open to its own full entry list) — there's no
  // longer a "selection matched nothing real" case to gate this on.
  const bulletsById: Record<string, string[]> = {};
  const keptEntries = resolveAllKeptEntries(parsed, keepEntries).filter((e) => e.bullets.length > 0);
  const rewrites = await Promise.all(
    keptEntries.map(async (entry): Promise<readonly [string, string[] | undefined]> => {
      try {
        return [entry.id, await rewriteEntryBullets(entry, jobDescription, extraGuidance)] as const;
      } catch (err) {
        // Falling back to `undefined` here would make reassembleResume
        // treat this entry as never addressed, keeping ALL of its
        // original bullets unfiltered — for a large entry (RTI's ~40)
        // that undoes the length cap entirely for the one entry whose
        // call happened to fail, confirmed live: a single failed call
        // here ballooned one run's total output from ~350 to 1383 words.
        // Falling back to the same MAX_BULLETS_PER_ENTRY-capped slice of
        // real, verbatim original bullets keeps the cap intact even on
        // failure, with zero fabrication risk since nothing here is new
        // text.
        console.warn(`Resume tailoring: bullet rewrite failed for entry ${entry.id}, keeping its first ${MAX_BULLETS_PER_ENTRY} original bullets.`, err);
        return [entry.id, entry.bullets.slice(0, MAX_BULLETS_PER_ENTRY).map((b) => b.text)] as const;
      }
    })
  );
  for (const [id, bullets] of rewrites) {
    if (bullets && bullets.length > 0) bulletsById[id] = bullets;
  }

  const response: TailorAIResponse = {
    keepEntries,
    lists,
    bullets: bulletsById,
  };

  const allowedTokens = extractGuardTokens(resumeText);
  const debugGuard = typeof process !== 'undefined' && process.env?.TAILOR_DEBUG;
  const result = reassembleResume(parsed, response, {
    isBulletAllowed: (text) => {
      const repetition = hasRunawayRepetition(text);
      const grounded = isGrounded(text, allowedTokens);
      const complete = looksLikeCompleteSentence(text);
      if (debugGuard && (repetition || !grounded || !complete)) {
        console.error(`[TAILOR_DEBUG] rejected (repetition=${repetition} grounded=${grounded} complete=${complete}): ${text}`);
      }
      return !repetition && grounded && complete;
    },
    // Each per-entry rewrite call is explicitly asked to return only its
    // strongest few bullets (buildEntryBulletPrompt's MAX_BULLETS_PER_ENTRY
    // cap) — without this, a shorter response gets the untouched remainder
    // padded back on, defeating the cap entirely (this was, in fact,
    // exactly why real-browser runs stayed 3-4 pages regardless of what
    // the model returned).
    dropUnaddressedBullets: true,
    // Computed from `parsed` (the original, untailored resume) so it
    // reflects the candidate's real career regardless of which entries
    // this particular JD kept — never the target posting's title.
    headline: formatHeadline(buildHeadline(parsed)),
  });
  // Valid JSON with IDs that don't correspond to anything real (e.g. a model
  // that echoed the prompt's own example IDs instead of the tagged resume)
  // would otherwise silently "succeed" by returning the untouched original —
  // indistinguishable from a real tailoring pass unless this is checked.
  if (!result.idsMatched) {
    throw new TailorResponseError(
      "The AI's response didn't reference any of this resume's actual content — try again, or switch providers in Settings."
    );
  }
  if (!result.contentChanged) {
    console.warn('Resume tailoring: the AI selected/reordered entries but did not actually reword any bullets or lists — result may look nearly identical to the input.');
  }
  if (result.rejectedCount > 0) {
    console.warn(`Resume tailoring: ${result.rejectedCount} proposed bullet(s) were rejected (ungrounded or repetitive) and fell back to the original wording.`);
  }
  return result;
}

export async function tailorResume(resumeText: string, jobDescription: string): Promise<string> {
  const result = await tailorResumeDetailed(resumeText, jobDescription);
  return result.text;
}

export interface ResumeFitAnalysis {
  ats: ATSScoreResult;
  keywordGap: KeywordAnalysis;
}

/**
 * Extracts the JD's keywords with AI once, then derives both the keyword-gap
 * panel and the deterministic ATS score from that single list — previously
 * these were two separate LLM calls that could each extract a different set
 * of keywords and disagree with each other.
 */
export async function analyzeResumeFit(
  resumeText: string,
  jobDescription: string,
): Promise<ResumeFitAnalysis> {
  const jd = await analyzeJD(stripApplicationFormNoise(jobDescription));
  const kw = matchKeywords(resumeText, jd.keywords_top_10);
  const ats = scoreATS(resumeText, jd.keywords_top_10);

  return {
    ats,
    keywordGap: {
      present: kw.present,
      missing: kw.missing,
      score: Math.round(kw.coverage * 100),
    },
  };
}

/**
 * Revise the current tailored resume in response to one piece of typed
 * feedback ("cut the second bullet, it's too wordy"). The candidate's full
 * feedback text is queued separately (see resume-feedback.ts) for a later
 * `/resume learn` pass — this call only produces the live revision.
 *
 * Uses the same structured pipeline as tailorResume, parsed fresh from the
 * *current* tailored resume (which still has real entry headers/bullets —
 * it's just been through one tailoring pass already). Allows one new bullet
 * per entry (for feedback like "add a bullet about X"), still subject to the
 * same grounding check as every other bullet.
 *
 * `originalResumeText` — the candidate's real, untailored resume, not
 * `currentResume` — is what builds the grounding pool: `currentResume` may
 * already have had bullets or whole entries cut by the first tailoring
 * pass, and the single most likely use of "add a bullet" feedback is asking
 * to bring one of those back. Grounding against the already-trimmed
 * `currentResume` would make that request impossible to ever satisfy.
 */
export async function refineTailoredResume(
  originalResumeText: string,
  currentResume: string,
  jobDescription: string,
  feedback: string,
): Promise<string> {
  jobDescription = stripApplicationFormNoise(jobDescription);
  const parsed = parseResume(currentResume);
  const serialized = serializeForPrompt(parsed);
  const voice = await voicePromptBlock(1500);
  const extraGuidance = [preferencesPromptBlock(), voice].filter(Boolean).join('\n');
  const prompt = buildRefinePrompt(serialized, jobDescription, feedback, extraGuidance);

  const rawResponse = await generate(prompt);
  const response = parseAIResponse(rawResponse);

  const allowedTokens = extractGuardTokens(originalResumeText);
  const result = reassembleResume(parsed, response, {
    isBulletAllowed: (text) => !hasRunawayRepetition(text) && isGrounded(text, allowedTokens) && looksLikeCompleteSentence(text),
    maxExtraBulletsPerEntry: 1,
  });
  if (!result.idsMatched) {
    throw new TailorResponseError(
      "The AI's response didn't reference any of this resume's actual content — try again, or switch providers in Settings."
    );
  }
  if (result.rejectedCount > 0) {
    console.warn(`Resume refinement: ${result.rejectedCount} proposed bullet(s) were rejected (ungrounded or repetitive) and fell back to the original wording.`);
  }
  return result.text;
}
