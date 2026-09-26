/**
 * Parses resume text into a structured, ID-tagged tree, and reassembles a
 * tailored version from an AI response that only says which entries/bullets
 * to keep and how to reword bullets — never free-text employer/title/date
 * headers. This is what makes header fabrication, entry-merging, and
 * target-company-as-employer fabrication (all live-observed this session)
 * structurally unrepresentable rather than merely detected after the fact:
 * the AI is never given a text field where a header could go.
 *
 * Reuses resume-render.ts's already-tested line-classification primitives
 * (same priority order as renderResumeHtml) so this parser and the preview
 * renderer can never classify the same line two different ways.
 *
 * Pure, dependency-free — no DOM, no AI-provider imports — same testability
 * tier as resume-render.ts. Grounding/fact checks live in
 * resume-output-guard.ts and are passed in as callbacks, not imported here,
 * so this file stays trivially unit-testable on its own.
 */

import {
  BULLET_RE,
  HEADING_RE,
  ENTRY_TYPE_SECTIONS,
  isExactSectionVocab,
  matchInlineVocabHeader,
  matchEntryHeader,
  looksLikeContactLine,
  looksLikeSectionHeaderHeuristic,
  stripHeadingDecoration,
} from './resume-render';

const LIST_TYPE_SECTIONS = new Set([
  'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'LANGUAGES', 'INTERESTS',
  // Categorized technical-skills labels — see resume-render.ts's SECTION_VOCAB.
  'FRONTEND', 'BACKEND & DATABASES', 'INFRASTRUCTURE', 'APPLIED AI', 'AUTOMATION & DATA',
  'DESIGN & CREATIVE', 'ADDITIONAL',
]);

export interface ParsedBullet { id: string; text: string }
export interface ParsedListItem { id: string; text: string }

export interface ParsedEntry {
  id: string;
  /** Verbatim org/title/dates line — never AI-authored, always re-emitted as-is. */
  headerLine: string;
  /** Verbatim, if a subtitle (e.g. italic job title on its own line) follows. */
  subtitleLine?: string;
  bullets: ParsedBullet[];
}

export interface ParsedEntriesSection { id: string; heading: string; kind: 'entries'; entries: ParsedEntry[] }
export interface ParsedListSection { id: string; heading: string; kind: 'list'; items: ParsedListItem[] }
export interface ParsedProseSection { id: string; heading: string; kind: 'prose'; lines: string[] }
export type ParsedSection = ParsedEntriesSection | ParsedListSection | ParsedProseSection;

export interface ParsedResume {
  /** Name + contact lines — verbatim, never sent to the AI as editable content. */
  preambleLines: string[];
  sections: ParsedSection[];
}

export class ResumeParseError extends Error {
  constructor(message: string, public readonly line: string) {
    super(message);
    this.name = 'ResumeParseError';
  }
}

function sectionKindFor(upperHeading: string): 'entries' | 'list' | 'prose' {
  if (ENTRY_TYPE_SECTIONS.has(upperHeading)) return 'entries';
  if (LIST_TYPE_SECTIONS.has(upperHeading)) return 'list';
  return 'prose';
}

/**
 * Walks the resume line by line with the exact same priority order
 * renderResumeHtml uses (heading -> bullet -> inline vocab header -> exact
 * vocab -> name/contact position -> heuristic header -> subtitle -> dated
 * entry -> undated entry -> paragraph), but builds this tree instead of
 * HTML. Unlike renderResumeHtml's original version of this walk, an undated
 * entry header is recognized every time it occurs, not just the first one
 * per section — a section of several undated entries back to back (e.g.
 * PROJECTS, one line per project title) otherwise merges every entry after
 * the first into the first one's bullets, with no ID of their own.
 *
 * Every branch below hands its line to one of a small set of "sink"
 * functions (startSection, startEntry, addBullet, or a direct
 * preambleLines/subtitleLine push) — there is no branch that can silently
 * discard a line. consumed/totalNonBlank at the end is therefore a cheap,
 * always-passing-unless-there's-a-real-bug assertion: it exists to catch a
 * *future* refactor that adds a branch without wiring it to a sink,
 * not to reject unusual-but-real resumes (the classifier's own fallback
 * chain already has nowhere left to fall through to).
 */
export function parseResume(text: string): ParsedResume {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const preambleLines: string[] = [];
  const sections: ParsedSection[] = [];

  let sectionSeq = 0;
  let entrySeq = 0;
  let listItemSeq = 0;
  let contentLineIndex = 0;
  let headerBlockDone = false;
  let awaitingSubtitle = false;

  let currentSection: ParsedSection | null = null;
  let currentEntry: ParsedEntry | null = null;

  let consumed = 0;
  let lastLine = '';
  const mark = (line: string) => { consumed++; lastLine = line; };

  // currentSection/currentEntry are `let`s reassigned inside these closures,
  // which defeats TypeScript's control-flow narrowing at every read site (a
  // documented limitation, not a runtime issue) — so every function here
  // snapshots them into a local `const` before branching on `.kind`, and
  // startSection/startEntry return the object they just created so callers
  // that act on it immediately never need to read the mutable field back.
  const startSection = (headingText: string): ParsedSection => {
    const upper = stripHeadingDecoration(headingText).toUpperCase();
    const kind = sectionKindFor(upper);
    sectionSeq++;
    const id = `s${sectionSeq}`;
    const section: ParsedSection =
      kind === 'entries' ? { id, heading: headingText, kind, entries: [] } :
      kind === 'list' ? { id, heading: headingText, kind, items: [] } :
      { id, heading: headingText, kind, lines: [] };
    sections.push(section);
    currentSection = section;
    currentEntry = null;
    return section;
  };

  const startEntry = (headerLine: string): ParsedEntry => {
    let section = currentSection;
    if (!section || section.kind !== 'entries') {
      // Defensive only — an entry-shaped line outside any entries section
      // shouldn't reach here given the checks below, but never lose it.
      sectionSeq++;
      const id = `s${sectionSeq}`;
      section = { id, heading: '', kind: 'entries', entries: [] };
      sections.push(section);
      currentSection = section;
    }
    // Globally sequential across the whole resume, not scoped to the
    // section — this must match the flat "e1"/"e2" ID shape the AI prompt's
    // JSON contract describes, or a model that echoes the contract's own
    // example IDs instead of the actual tagged resume silently matches
    // nothing (see JSON_CONTRACT in resume-tailor-service.ts).
    entrySeq++;
    const entry: ParsedEntry = {
      id: `e${entrySeq}`,
      headerLine,
      bullets: [],
    };
    section.entries.push(entry);
    currentEntry = entry;
    return entry;
  };

  const addBullet = (bulletText: string): void => {
    const section = currentSection;
    const entry = currentEntry;
    if (section?.kind === 'entries' && entry) {
      entry.bullets.push({ id: `${entry.id}-b${entry.bullets.length + 1}`, text: bulletText });
    } else if (section?.kind === 'list') {
      listItemSeq++;
      section.items.push({ id: `${section.id}-i${listItemSeq}`, text: bulletText });
    } else if (section?.kind === 'prose') {
      section.lines.push(bulletText);
    } else {
      preambleLines.push(bulletText);
    }
  };

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) { awaitingSubtitle = false; continue; }

    // 1. Markdown heading.
    const heading = line.match(HEADING_RE);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) preambleLines.push(heading[2]);
      else startSection(heading[2]);
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      mark(line);
      continue;
    }

    // 2. Bullet.
    const bullet = line.match(BULLET_RE);
    if (bullet) {
      addBullet(bullet[1]);
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      mark(line);
      continue;
    }

    // 3. "SKILLS: Python, AWS, ..." — heading + inline content on one line.
    const inlineHeader = matchInlineVocabHeader(line);
    if (inlineHeader) {
      const newSection = startSection(inlineHeader.header);
      if (newSection.kind === 'list') {
        for (const piece of inlineHeader.rest.split(',').map((s) => s.trim()).filter(Boolean)) {
          listItemSeq++;
          newSection.items.push({ id: `${newSection.id}-i${listItemSeq}`, text: piece });
        }
      } else {
        addBullet(inlineHeader.rest);
      }
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      mark(line);
      continue;
    }

    // 4. Exact section-vocabulary match.
    if (isExactSectionVocab(line)) {
      startSection(stripHeadingDecoration(line));
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      mark(line);
      continue;
    }

    // 5. Name — the very first content line.
    if (!headerBlockDone && contentLineIndex === 0) {
      preambleLines.push(line);
      contentLineIndex++;
      mark(line);
      continue;
    }

    // 6. Contact — the line right after the name, if contact-shaped.
    if (!headerBlockDone && contentLineIndex === 1) {
      headerBlockDone = true;
      if (looksLikeContactLine(line)) {
        preambleLines.push(line);
        contentLineIndex++;
        mark(line);
        continue;
      }
      // Falls through to normal classification below.
    }

    headerBlockDone = true;
    contentLineIndex++;

    // 7. Section header — looser heuristic.
    if (looksLikeSectionHeaderHeuristic(line)) {
      startSection(stripHeadingDecoration(line));
      awaitingSubtitle = false;
      mark(line);
      continue;
    }

    // 8. Subtitle — the line right after an entry header.
    if (awaitingSubtitle) {
      awaitingSubtitle = false;
      const entryForSubtitle = currentEntry as ParsedEntry | null;
      if (entryForSubtitle) entryForSubtitle.subtitleLine = line;
      else preambleLines.push(line);
      mark(line);
      continue;
    }

    // 9. Entry header — line ends in a date range.
    const entry = matchEntryHeader(line);
    if (entry) {
      awaitingSubtitle = true;
      startEntry(line);
      mark(line);
      continue;
    }

    // 10. Undated entry header — any otherwise-unclassified line inside an
    // entries-kind section is itself a new entry header (a project/cert/etc.
    // with no date range), not just the section's *first* such line. A
    // section with several undated entries back to back (e.g. PROJECTS, one
    // line per project title) used to only recognize the first one this
    // way; every title after it fell to the paragraph case and got glued
    // onto the *previous* entry as an "extra line" — silently merging every
    // later project's real bullets into the first project's entry, with no
    // ID of their own to ever be kept, dropped, or safely reworded.
    const sectionForUndatedCheck = currentSection as ParsedSection | null;
    if (sectionForUndatedCheck?.kind === 'entries') {
      awaitingSubtitle = true;
      startEntry(line);
      mark(line);
      continue;
    }

    // 11. Paragraph / fallback — never dropped.
    addBullet(line);
    mark(line);
  }

  const totalNonBlank = rawLines.filter((l) => l.trim().length > 0).length;
  if (consumed !== totalNonBlank) {
    throw new ResumeParseError(
      `Resume parsing lost track of some content near: "${lastLine}". Try tailoring again, or simplify that part of the resume's formatting.`,
      lastLine
    );
  }

  return { preambleLines, sections };
}

/**
 * Renders the parsed tree back to ID-tagged text for the AI prompt.
 *
 * Only entries and list sections get an ID tag ([ENTRY e1], [LIST s3]) —
 * the two things the response contract actually addresses by ID. Bullets
 * are shown as plain lines under their entry with no ID of their own: the
 * response contract addresses them by *array position* under their entry's
 * ID (see TailorAIResponse), so giving them a separate visible ID here
 * would invite a model to key its response by bullet ID instead, which
 * reassembleResume doesn't read.
 */
/** ID-tagged serialization of one entries-kind section on its own — see serializeForPrompt's doc comment for the tag format. Exported so a per-section selection call (resume-tailor-service.ts) can serialize just one section instead of the whole resume. */
export function serializeEntriesSection(section: ParsedEntriesSection): string {
  const out: string[] = [section.heading];
  for (const entry of section.entries) {
    out.push(`[ENTRY ${entry.id}] ${entry.headerLine}`);
    if (entry.subtitleLine) out.push(entry.subtitleLine);
    for (const b of entry.bullets) out.push(`- ${b.text}`);
  }
  return out.join('\n');
}

/** ID-tagged serialization of one list-kind section on its own — see serializeEntriesSection. */
export function serializeListSection(section: ParsedListSection): string {
  return `${section.heading}\n[LIST ${section.id}] ${section.items.map((i) => i.text).join(', ')}`;
}

export function serializeForPrompt(parsed: ParsedResume): string {
  const out: string[] = [...parsed.preambleLines];
  for (const section of parsed.sections) {
    if (section.kind === 'entries') {
      out.push(serializeEntriesSection(section));
    } else if (section.kind === 'list') {
      out.push(serializeListSection(section));
    } else {
      out.push(section.heading);
      for (const l of section.lines) out.push(l);
    }
  }
  return out.join('\n');
}

export interface TailorAIResponse {
  /** Entry IDs to keep, in desired order. Interpreted per-section (see reassembleResume). */
  keepEntries?: string[];
  /** entryId -> reworded bullet texts, positionally mapped onto that entry's original bullets. May be shorter (dropping trailing bullets is fine) but anything beyond the original count is ignored, never appended. */
  bullets?: Record<string, string[]>;
  /** entryId -> brand-new bullet(s) to append after the entry's (possibly reworded) original bullets — separate from `bullets` so a genuinely new bullet can never be confused with, or silently displace, a rewrite of an existing one. Capped by ReassembleOptions.maxExtraBulletsPerEntry (0 unless the caller opts in, e.g. chat refinement's "add a bullet" case). */
  addedBullets?: Record<string, string[]>;
  /** sectionId -> kept list-item texts, in order. Must match an original item's text to be honored. */
  lists?: Record<string, string[]>;
}

export interface ReassembleOptions {
  /** Grounding + repetition check for one candidate bullet string. False -> the rewrite falls back to the original bullet at that slot (or the addition is dropped). */
  isBulletAllowed: (text: string) => boolean;
  /** How many brand-new bullets (via `addedBullets`) an entry may gain beyond its original count. 0 for initial tailoring; 1 for chat refinement's "add a bullet" case. */
  maxExtraBulletsPerEntry?: number;
  /**
   * When a `bullets[entryId]` proposal is shorter than the entry's original
   * bullet count, true drops the unaddressed tail entirely; false (default)
   * appends it back unchanged. False is what chat refinement needs — a
   * response addressing only "reword bullet 2" must never be read as "drop
   * every bullet after 2." True is what a fresh tailoring pass needs — an
   * entry-level rewrite call is explicitly asked to return only the
   * strongest N bullets, and appending the rest back unchanged would defeat
   * that entirely (this was, in fact, exactly what was happening: a fresh
   * tailor response trimming a 40-bullet entry down to 5 was silently
   * getting the other 35 padded back on, so a resume that should have
   * gotten shorter never did).
   */
  dropUnaddressedBullets?: boolean;
  /** A pre-formatted headline line to insert right after the preamble (name/contact), before the first section — see buildHeadline. Omitted entirely when not provided; never computed inside reassembleResume itself, since it's a fact about the candidate, not something the AI response addresses. */
  headline?: string;
}

export interface ReassembleResult {
  text: string;
  /**
   * True once at least one entry ID or list-section ID in the response
   * matched something real in this resume. False means the response's IDs
   * didn't correspond to anything (e.g. a model that echoed the prompt's
   * own example IDs instead of the tagged resume it was given) — a
   * structural contract failure worth throwing on, not a quiet no-op.
   */
  idsMatched: boolean;
  /**
   * True once at least one bullet or list item's final text actually
   * differs from the original. `idsMatched` can be true with this false —
   * a response that only selects/drops entries without rewording anything
   * is well-formed but achieved essentially nothing as *tailoring*; that's
   * a real but much softer failure than `idsMatched` being false, worth a
   * warning rather than necessarily refusing the result outright.
   */
  contentChanged: boolean;
  /** Count of proposed bullet/added-bullet rewrites that were rejected (repetition or ungrounded) and fell back to the original wording or were dropped. */
  rejectedCount: number;
  /** Total entries across every entries-kind section in the original parse. */
  totalEntryCount: number;
  /** How many of those entries survived into the final text. */
  keptEntryCount: number;
  /** Of the kept entries, how many had at least one bullet whose final text differs from the original — the harness/diagnostic signal for "did tailoring do real work, not just curation." */
  entriesWithBulletChange: number;
}

/**
 * Resolves which of a section's entries survive `keepEntries`, and in what
 * order. If `keepEntries` gives no valid IDs for this section, all of its
 * entries are kept unchanged — a deliberate, safe default that favors never
 * silently losing an entire section over supporting a response that wants
 * to drop every entry in one section at once (indistinguishable, from IDs
 * alone, from a response that never addressed this section at all).
 *
 * Exported so resume-tailor-service.ts's per-entry bullet-rewrite calls can
 * ask for exactly the entries that will actually survive into the final
 * resume, without duplicating this resolution logic.
 */
export function resolveKeptEntries(
  section: ParsedEntriesSection,
  keepEntries?: string[]
): { entries: ParsedEntry[]; matched: boolean } {
  let entries = section.entries;
  let matched = false;
  // Array.isArray guards the same weaker-model-returns-a-string risk as
  // reassembleResume's bullets/lists branches.
  if (Array.isArray(keepEntries) && keepEntries.length > 0) {
    const sectionIds = new Set(entries.map((e) => e.id));
    const orderedIds = keepEntries.filter((id) => sectionIds.has(id));
    if (orderedIds.length > 0) {
      matched = true;
      const byId = new Map(entries.map((e) => [e.id, e] as const));
      entries = orderedIds.map((id) => byId.get(id)).filter((e): e is ParsedEntry => Boolean(e));
    }
  }
  return { entries, matched };
}

/** Every entry across every entries-kind section that `keepEntries` would keep, in final relative order. */
export function resolveAllKeptEntries(parsed: ParsedResume, keepEntries?: string[]): ParsedEntry[] {
  const result: ParsedEntry[] = [];
  for (const section of parsed.sections) {
    if (section.kind !== 'entries') continue;
    result.push(...resolveKeptEntries(section, keepEntries).entries);
  }
  return result;
}

/**
 * Reassembles a tailored resume from the parsed original + the AI's
 * structured response. Every header/subtitle/extra line is re-emitted
 * verbatim from the parse, never from the response — the AI response can
 * only select/reorder/drop entries and reword bullets and list items.
 */
export function reassembleResume(
  parsed: ParsedResume,
  response: TailorAIResponse,
  options: ReassembleOptions
): ReassembleResult {
  const { isBulletAllowed, maxExtraBulletsPerEntry = 0, dropUnaddressedBullets = false, headline } = options;
  const keepEntries = response.keepEntries;

  const out: string[] = [...parsed.preambleLines];
  if (headline) out.push(headline);
  let idsMatched = false;
  let contentChanged = false;
  let rejectedCount = 0;
  let totalEntryCount = 0;
  let keptEntryCount = 0;
  let entriesWithBulletChange = 0;

  for (const section of parsed.sections) {
    if (section.kind === 'entries') {
      totalEntryCount += section.entries.length;
      const resolved = resolveKeptEntries(section, keepEntries);
      const entries = resolved.entries;
      if (resolved.matched) idsMatched = true;
      keptEntryCount += entries.length;
      if (entries.length === 0) continue;

      if (out.length > 0) out.push('');
      out.push(section.heading);
      entries.forEach((entry, i) => {
        let entryBulletChanged = false;
        if (i > 0) out.push('');
        out.push(entry.headerLine);
        if (entry.subtitleLine) out.push(entry.subtitleLine);

        const original = entry.bullets;
        const proposed = response.bullets?.[entry.id];
        const finalBullets: string[] = [];

        // Array.isArray guards against a weaker model returning a plain
        // string here instead — indexing a string by position would
        // otherwise silently yield single characters as "bullets" rather
        // than throwing, since strings have both .length and [] access.
        if (Array.isArray(proposed) && proposed.length > 0) {
          // Never more slots than the entry originally had — a genuinely
          // new bullet belongs in `addedBullets`, not smuggled in here,
          // specifically so capping never has to guess whether an "extra"
          // proposed string was meant as a new bullet or a real rewrite
          // that would otherwise be truncated off the end.
          const cappedCount = Math.min(proposed.length, original.length);
          for (let bi = 0; bi < cappedCount; bi++) {
            const candidate = proposed[bi];
            if (typeof candidate === 'string' && candidate.trim() && isBulletAllowed(candidate)) {
              const trimmed = candidate.trim();
              finalBullets.push(trimmed);
              if (trimmed !== original[bi].text) { contentChanged = true; entryBulletChanged = true; }
            } else {
              finalBullets.push(original[bi].text);
              if (typeof candidate === 'string' && candidate.trim()) rejectedCount++;
            }
          }
          if (dropUnaddressedBullets) {
            if (cappedCount < original.length) { contentChanged = true; entryBulletChanged = true; }
          } else {
            for (let bi = cappedCount; bi < original.length; bi++) finalBullets.push(original[bi].text);
          }
        } else {
          for (const b of original) finalBullets.push(b.text);
        }

        if (maxExtraBulletsPerEntry > 0) {
          const added = response.addedBullets?.[entry.id];
          // Array.isArray guards the same string-slips-through risk as the
          // proposed-bullets and lists branches above.
          if (Array.isArray(added) && added.length > 0) {
            for (const candidate of added.slice(0, maxExtraBulletsPerEntry)) {
              if (typeof candidate === 'string' && candidate.trim() && isBulletAllowed(candidate)) {
                finalBullets.push(candidate.trim());
                contentChanged = true;
                entryBulletChanged = true;
              } else if (typeof candidate === 'string' && candidate.trim()) {
                rejectedCount++;
              }
            }
          }
        }

        if (entryBulletChanged) entriesWithBulletChange++;
        for (const line of finalBullets) out.push(`- ${line}`);
      });
    } else if (section.kind === 'list') {
      const proposed = response.lists?.[section.id];
      const originalByLower = new Map(section.items.map((i) => [i.text.toLowerCase(), i.text] as const));
      let items = section.items.map((i) => i.text);
      // An explicit empty array drops the whole section (e.g. "Additional:
      // Psychology, Geopolitics..." on an engineering resume). A section the
      // response leaves out entirely is still kept whole, so a model that
      // skips sections can't wipe out the skills block.
      if (Array.isArray(proposed) && proposed.length === 0) {
        idsMatched = true;
        contentChanged = true;
        continue;
      }
      // A weaker model can return a comma-joined string here instead of an
      // array — Array.isArray guards that before .filter, since a string
      // also has a truthy .length and would otherwise reach .filter and throw.
      if (Array.isArray(proposed) && proposed.length > 0) {
        const matched = proposed
          .filter((t): t is string => typeof t === 'string')
          .map((t) => originalByLower.get(t.trim().toLowerCase()))
          .filter((t): t is string => Boolean(t));
        if (matched.length > 0) {
          idsMatched = true;
          const original = section.items.map((i) => i.text);
          if (matched.length !== original.length || matched.some((t, idx) => t !== original[idx])) {
            contentChanged = true;
          }
          items = matched;
        }
      }
      if (out.length > 0) out.push('');
      // Always the inline "Heading: item, item" shape, regardless of how the
      // original was written — this is what makes a second pass (chat
      // refinement re-parsing this very output) recognize it as a list
      // section again via the same inline-vocab-header rule, instead of
      // falling through to the plain-paragraph case and collapsing every
      // item into one unsplittable string.
      out.push(`${section.heading}: ${items.join(', ')}`);
    } else {
      if (out.length > 0) out.push('');
      out.push(section.heading);
      for (const l of section.lines) out.push(l);
    }
  }

  return {
    text: out.join('\n'),
    idsMatched,
    contentChanged,
    rejectedCount,
    totalEntryCount,
    keptEntryCount,
    entriesWithBulletChange,
  };
}

// ── Headline derivation ──────────────────────────────────────────────────────

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Parses "Feb 2025" or a bare "2025" into a comparable (year, month) pair.
 * A year-only date uses `unknownMonth` for whichever end of the range it's
 * being used as, so a derived years-of-experience figure never overstates:
 * pass 11 (December) for a start date and 0 (January) for "now"/an end
 * date — both push the computed span shorter, never longer, than reality.
 */
function parseResumeDate(raw: string, unknownMonth: 0 | 11): { year: number; month: number } | null {
  const trimmed = raw.trim();
  const monthMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch) {
    const month = MONTH_INDEX[monthMatch[1].slice(0, 3).toLowerCase()];
    if (month === undefined) return null;
    return { year: Number(monthMatch[2]), month };
  }
  const yearMatch = trimmed.match(/^(\d{4})$/);
  if (yearMatch) return { year: Number(yearMatch[1]), month: unknownMonth };
  return null;
}

function monthsBetween(from: { year: number; month: number }, to: { year: number; month: number }): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export interface ResumeHeadline {
  /** The candidate's own most recent real job title — never the target posting's title, which would imply holding a title they don't. */
  title: string;
  /** Floored whole years, computed from the earliest EXPERIENCE start date to today — never rounds up. */
  yearsOfExperience: number;
}

/**
 * Derives a headline from facts already in the candidate's own EXPERIENCE
 * section only: the most recent role's title, and total years of
 * experience from the earliest real start date to today. Every word and
 * number here already exists in the candidate's resume — this never
 * writes new prose the way a generated summary would, so it doesn't
 * reopen the fabrication risk that keeps this pipeline from writing one.
 * Returns null when the section can't be reliably date-parsed (no
 * date-ranged entries found) rather than guessing at a headline.
 */
export function buildHeadline(parsed: ParsedResume, now: Date = new Date()): ResumeHeadline | null {
  const experienceSection = parsed.sections.find(
    (s): s is ParsedEntriesSection => s.kind === 'entries' && /experience/i.test(s.heading)
  );
  if (!experienceSection || experienceSection.entries.length === 0) return null;

  const candidates: Array<{ title: string; start: { year: number; month: number }; isCurrent: boolean }> = [];
  for (const entry of experienceSection.entries) {
    const match = matchEntryHeader(entry.headerLine);
    if (!match) continue;
    const startRaw = match.right.split(/[-–—]|\bto\b/i)[0]?.trim();
    if (!startRaw) continue;
    const start = parseResumeDate(startRaw, 11);
    if (!start) continue;
    // The stacked format (export-extension-profile.ts) puts the title on
    // its own subtitle line below "Company, Location (dates)" — prefer
    // that when present. Falls back to splitting "Title — Company" on the
    // header line itself for the older inline format (still what a
    // manually-pasted resume that doesn't follow this exact convention
    // would produce).
    let title = entry.subtitleLine?.trim() || match.left.split(/\s+—\s+/)[0]?.trim() || match.left;
    title = title.replace(/\s*\([^)]*\)\s*$/, '').trim(); // drop one trailing qualifier like "(Part-Time)"
    if (!title) continue;
    candidates.push({ title, start, isCurrent: /present|current/i.test(match.right) });
  }
  if (candidates.length === 0) return null;

  // First "Present"/"Current" entry in document order — resumes list roles
  // in the candidate's own priority order, so this favors their primary
  // role over a secondary concurrent one without guessing from date data
  // alone (which can't distinguish "most recently started" from "most
  // important" when several roles are simultaneously ongoing). If nothing
  // is currently ongoing, fall back to whichever entry started most
  // recently.
  const current =
    candidates.find((c) => c.isCurrent) ??
    candidates.reduce((latest, c) => (monthsBetween(latest.start, c.start) > 0 ? c : latest), candidates[0]);

  // Years of experience is measured from the *current* role's own start
  // date, not the earliest start across every EXPERIENCE entry — a
  // candidate's history can include much older, unrelated roles (a tour
  // guide job, a retail gig) that would otherwise inflate "years of
  // experience in {title}" with time spent doing something else entirely.
  // Confirmed live: including those older entries pushed a real headline
  // from "2+ Years" to a misleading "6+ Years" before this fix.
  const nowPoint = { year: now.getFullYear(), month: now.getMonth() };
  const yearsOfExperience = Math.max(0, Math.floor(monthsBetween(current.start, nowPoint) / 12));

  return { title: current.title, yearsOfExperience };
}
