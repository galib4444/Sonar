/**
 * Renders an AI-generated resume as structured HTML, for both the live
 * preview and the PDF export (same renderer, same CSS — see RESUME_CSS).
 *
 * The AI's output is never guaranteed to be Markdown. Local Ollama models in
 * particular tend to write plain text with ALL-CAPS section titles ("EXPERIENCE")
 * and bare or bullet-character (•) bullets, not "## Experience" / "- did a thing".
 * This is a line-based classifier, not a set of regexes run over the whole
 * string: Markdown syntax and the AI's typical plain-text shape are two more
 * entries in one priority list per line, not two code paths that can disagree
 * or fight each other. It also fixes the "everything fused onto one line"
 * symptom that the old regex-over-the-whole-string approach had: converting a
 * single `\n` into a real semantic break (not just `\n{2,}` between blank-line
 * paragraphs) falls out naturally from processing the text line by line.
 *
 * Pure functions, no DOM dependency — safe to unit test under Node.
 */

const SECTION_VOCAB = new Set([
  'SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'PROFILE',
  'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 'EMPLOYMENT HISTORY',
  'PROJECTS', 'EDUCATION', 'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
  'CERTIFICATIONS', 'AWARDS', 'PUBLICATIONS', 'LEADERSHIP', 'VOLUNTEER', 'VOLUNTEER EXPERIENCE',
  'ACTIVITIES', 'LANGUAGES', 'INTERESTS',
  // Categorized technical-skills labels (export-extension-profile.ts emits
  // these as separate "Category: items" lines instead of one flat SKILLS
  // list) — 'LANGUAGES' above is reused for the programming-languages
  // category, matching the same word used on real reference resumes for
  // both meanings, disambiguated by context (list contents), not label.
  'FRONTEND', 'BACKEND & DATABASES', 'INFRASTRUCTURE', 'APPLIED AI', 'AUTOMATION & DATA',
  'DESIGN & CREATIVE', 'ADDITIONAL',
]);

// Sections whose content is entries (jobs/projects) rather than prose —
// used to render every undated line in these sections in the entry-header
// layout instead of demoting it to a plain paragraph (resume-build-rules.md
// §2: "if one entry is stacked that way, all are").
export const ENTRY_TYPE_SECTIONS = new Set([
  'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 'EMPLOYMENT HISTORY',
  'PROJECTS', 'CERTIFICATIONS', 'VOLUNTEER', 'VOLUNTEER EXPERIENCE', 'LEADERSHIP',
]);

const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?';
const DATE = `(?:${MONTH}\\s+\\d{4}|\\d{4})`;
const DATE_RANGE_RE = new RegExp(`\\(?\\s*(${DATE})\\s*(?:[-–—]|to)\\s*(Present|Current|${DATE})\\s*\\)?\\s*$`, 'i');
export const BULLET_RE = /^[-*+•·▪–]\s+(.+)$/;
export const HEADING_RE = /^(#{1,3})\s+(.+)$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Bold/italic Markdown emphasis — the one piece of the old mdToHtml worth keeping verbatim. */
function renderInline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return html;
}

export function stripHeadingDecoration(line: string): string {
  return line
    .replace(/^\*\*(.+)\*\*$/, '$1')
    .replace(/^-{2,}\s*(.+?)\s*-{2,}$/, '$1')
    .replace(/:\s*$/, '')
    .trim();
}

/** Exact match against the section vocabulary — unambiguous, safe at any position. */
export function isExactSectionVocab(line: string): boolean {
  return SECTION_VOCAB.has(stripHeadingDecoration(line).toUpperCase());
}

/**
 * Looser heuristic (short, no trailing punctuation, mostly uppercase) for
 * section titles outside the fixed vocabulary. Deliberately NOT checked at
 * the name/contact positions (0/1) — an all-caps name would false-positive
 * here, so those positions are claimed first in the main loop.
 */
export function looksLikeSectionHeaderHeuristic(line: string): boolean {
  const stripped = stripHeadingDecoration(line);
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 5) return false;
  if (/[.!?]$/.test(stripped)) return false;

  const letters = stripped.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  const upperLetters = stripped.replace(/[^A-Z]/g, '');
  return upperLetters.length / letters.length >= 0.8;
}

/** "SKILLS: Python, AWS, ..." — a vocab word followed by its content on the same line. */
export function matchInlineVocabHeader(line: string): { header: string; rest: string } | null {
  const m = line.match(/^([A-Za-z][A-Za-z &]{1,30}?):\s*(.+)$/);
  if (!m) return null;
  const header = m[1].trim();
  if (!SECTION_VOCAB.has(header.toUpperCase())) return null;
  return { header, rest: m[2].trim() };
}

export function looksLikeContactLine(line: string): boolean {
  if (/[|•@]/.test(line)) return true;
  return /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(line);
}

export interface EntryMatch {
  left: string;
  right: string;
}

export function matchEntryHeader(line: string): EntryMatch | null {
  const m = line.match(DATE_RANGE_RE);
  if (!m || m.index === undefined) return null;
  const right = m[0].replace(/^\(|\)\s*$/g, '').trim();
  const left = line.slice(0, m.index).replace(/[\s\-–—(,|]+$/, '').trim();
  if (!left) return null;
  return { left, right };
}

export function renderResumeHtml(text: string): string {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];

  let listOpen = false;
  let contentLineIndex = 0;
  let headerBlockDone = false;
  let awaitingSubtitle = false;
  let currentSectionIsEntryType = false;

  const closeList = () => {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      awaitingSubtitle = false;
      continue;
    }

    // 1. Markdown heading — keeps real Markdown input working.
    const heading = line.match(HEADING_RE);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      const cls = level === 1 ? ' class="resume-name"' : level === 2 ? ' class="resume-section"' : '';
      out.push(`<${tag}${cls}>${renderInline(heading[2])}</${tag}>`);
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      if (level === 2) {
        const upper = stripHeadingDecoration(heading[2]).toUpperCase();
        currentSectionIsEntryType = ENTRY_TYPE_SECTIONS.has(upper);
      }
      continue;
    }

    // 2. Bullet — covers Markdown bullets and the AI's bare/•-prefixed ones.
    const bullet = line.match(BULLET_RE);
    if (bullet) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${renderInline(bullet[1])}</li>`);
      contentLineIndex++;
      headerBlockDone = true;
      awaitingSubtitle = false;
      continue;
    }

    closeList();

    const markSection = (upper: string) => {
      currentSectionIsEntryType = ENTRY_TYPE_SECTIONS.has(upper);
      awaitingSubtitle = false;
      headerBlockDone = true;
      contentLineIndex++;
    };

    // 3. "SKILLS: Python, AWS, ..." — heading + its content on one line.
    // Exact-vocabulary match, so it's safe to check ahead of the name/contact
    // position heuristics below (an inline-colon vocab line is never a name).
    const inlineHeader = matchInlineVocabHeader(line);
    if (inlineHeader) {
      markSection(inlineHeader.header.toUpperCase());
      out.push(`<h2 class="resume-section">${renderInline(inlineHeader.header)}</h2>`);
      out.push(`<p>${renderInline(inlineHeader.rest)}</p>`);
      continue;
    }

    // 4. Exact section-vocabulary match ("EXPERIENCE", "SKILLS", ...) — also
    // unambiguous, so it wins regardless of position (a resume's name is
    // never literally the word "Experience").
    if (isExactSectionVocab(line)) {
      const upper = stripHeadingDecoration(line).toUpperCase();
      markSection(upper);
      out.push(`<h2 class="resume-section">${renderInline(stripHeadingDecoration(line))}</h2>`);
      continue;
    }

    // 5. Name — the very first content line, once it's not a known section word.
    if (!headerBlockDone && contentLineIndex === 0) {
      out.push(`<h1 class="resume-name">${renderInline(line)}</h1>`);
      contentLineIndex++;
      continue;
    }

    // 6. Contact — the line right after the name, if it looks contact-shaped.
    if (!headerBlockDone && contentLineIndex === 1) {
      headerBlockDone = true;
      if (looksLikeContactLine(line)) {
        out.push(`<p class="resume-contact">${renderInline(line)}</p>`);
        contentLineIndex++;
        continue;
      }
      // Falls through to normal classification below if it didn't look like a contact line.
    }

    headerBlockDone = true;
    contentLineIndex++;

    // 7. Section header — looser heuristic, only reached once name/contact
    // positions are already claimed (an all-caps name won't reach here).
    if (looksLikeSectionHeaderHeuristic(line)) {
      const upper = stripHeadingDecoration(line).toUpperCase();
      currentSectionIsEntryType = ENTRY_TYPE_SECTIONS.has(upper);
      awaitingSubtitle = false;
      out.push(`<h2 class="resume-section">${renderInline(stripHeadingDecoration(line))}</h2>`);
      continue;
    }

    // 8. Subtitle — the line right after an entry header (job title, italic).
    if (awaitingSubtitle) {
      awaitingSubtitle = false;
      out.push(`<p class="resume-subtitle">${renderInline(line)}</p>`);
      continue;
    }

    // 9. Entry header — line ends in a date range (org/project left, dates right).
    const entry = matchEntryHeader(line);
    if (entry) {
      awaitingSubtitle = true;
      out.push(
        `<div class="resume-entry-header"><span class="resume-entry-org">${renderInline(entry.left)}</span>` +
        `<span class="resume-entry-dates">${renderInline(entry.right)}</span></div>`
      );
      continue;
    }

    // 10. Undated entry header — any otherwise-unclassified line inside an
    // entry-type section, not just the section's first one. A section with
    // several undated entries back to back (e.g. PROJECTS, one line per
    // project title with no date range) used to only recognize the very
    // first such line as an entry header — every title after it fell
    // through to the paragraph case and got glued onto the *previous*
    // entry, silently merging every later project's bullets into the
    // first project's entry. §2: uniform entry shape, and every entry
    // needs to stay independently addressable.
    if (currentSectionIsEntryType) {
      awaitingSubtitle = true;
      out.push(
        `<div class="resume-entry-header"><span class="resume-entry-org">${renderInline(line)}</span>` +
        `<span class="resume-entry-dates"></span></div>`
      );
      continue;
    }

    // 11. Paragraph — everything else.
    out.push(`<p>${renderInline(line)}</p>`);
  }

  closeList();
  return out.join('\n');
}

// ── Shared stylesheet (preview + print) ─────────────────────────────────────

/**
 * Scoped entirely under .resume-doc so page-shell dark-mode tokens never leak
 * in and vice versa. Fixed white/black regardless of html.dark — it's WYSIWYG
 * for a printed page; inverting it would make the preview lie about what
 * actually gets exported.
 */
export const RESUME_CSS = `
.resume-doc {
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.3;
}
.resume-doc .resume-name {
  font-size: 14pt;
  font-weight: bold;
  text-align: center;
  margin: 0 0 4pt;
}
.resume-doc .resume-contact {
  font-size: 10pt;
  text-align: center;
  margin: 0 0 12pt;
}
.resume-doc .resume-section {
  font-size: 12pt;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 1pt solid #000;
  padding-bottom: 2pt;
  margin: 12pt 0 6pt;
}
.resume-doc .resume-section:first-of-type {
  margin-top: 0;
}
/* display: table (not flex) — same visual result (title left, dates flush
   right, one line), but flexbox two-column positioning is a known ATS
   PDF-parsing risk: some text extractors read a flex row's children in an
   order that doesn't match visual left-to-right position. Table-cell
   layout doesn't have that failure mode and every ATS-facing PDF parser
   handles it as ordinary same-line text. This is the one output that
   actually leaves the browser as a file (buildPrintDocument reuses this
   same CSS), so it's worth the more conservative layout even though the
   on-screen preview would have been fine either way. */
.resume-doc .resume-entry-header {
  display: table;
  width: 100%;
  font-weight: bold;
  margin: 8pt 0 0;
}
.resume-doc .resume-entry-org {
  display: table-cell;
  vertical-align: baseline;
}
.resume-doc .resume-entry-dates {
  display: table-cell;
  vertical-align: baseline;
  text-align: right;
  white-space: nowrap;
  padding-left: 12pt;
  font-weight: normal;
  font-size: 10pt;
}
.resume-doc .resume-subtitle {
  font-style: italic;
  font-size: 10pt;
  margin: 1pt 0 2pt;
}
.resume-doc p {
  font-size: 10.5pt;
  line-height: 1.4;
  margin: 4pt 0;
}
.resume-doc ul {
  margin: 3pt 0 0;
  padding-left: 15pt;
}
.resume-doc li {
  font-size: 10.5pt;
  margin-bottom: 3pt;
}
`.trim();

export const DEFAULT_MARGIN_IN = 0.5;

/** Wraps rendered resume HTML + RESUME_CSS for the print/export window. */
export function buildPrintDocument(html: string, marginIn: number = DEFAULT_MARGIN_IN): string {
  return `<!DOCTYPE html><html><head>
<title>Tailored Resume</title>
<style>
  @page { size: letter; margin: ${marginIn}in; }
  /* The padding is for the on-screen print window only. On paper, @page
     already supplies the margin; padding on top of it doubled every
     printed margin. */
  body { margin: 0; padding: ${marginIn}in; }
  @media print { body { padding: 0; } }
  ${RESUME_CSS}
</style>
</head><body>
<div class="resume-doc">
${html}
</div>
</body></html>`;
}
