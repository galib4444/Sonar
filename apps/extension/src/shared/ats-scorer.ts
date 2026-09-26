/**
 * Deterministic, local ATS scoring for the Resume Tailor page.
 *
 * Ported from apps/web/lib/validation/ats-validator.ts + lib/utils/keywords.ts
 * (calculateATSScore / validateKeywords / calculateKeywordDensity), adapted to
 * score raw resume text instead of a structured ResumeSections object — the
 * extension only ever has freeform text pasted/loaded from the profile, not
 * per-bullet structure like the web app's resume editor produces.
 *
 * No AI call in this file. The score is pure text math over resume text +
 * a JD keyword list (see jd-analyzer.ts for where that list comes from),
 * so it's reproducible and doesn't depend on an LLM grading its own output.
 */

export interface ATSChecks {
  layout: { plain_text: boolean };
  sections: { required_present: boolean; present: string[]; missing: string[] };
  keywords: { coverage: number; density_ok: boolean; placement_ok: boolean };
  length: { within_target: boolean; wordCount: number };
}

export interface ATSScoreResult {
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  recommendations: string[];
  checks: ATSChecks;
}

export interface KeywordMatch {
  present: string[];
  missing: string[];
  coverage: number; // 0-1
  density: number; // 0-1
}

const REQUIRED_SECTIONS = ['experience', 'education', 'skills'] as const;

// Matches the heading at the start of a line, with or without a trailing
// colon, whether or not the section's content follows on the same line
// ("SKILLS: Python, AWS, ...") or starts on the next line ("EXPERIENCE\n...").
const SECTION_HEADING_PATTERNS: Record<string, RegExp> = {
  summary: /^\s*(summary|profile|objective)\s*:?/im,
  experience: /^\s*(experience|work experience|employment history|professional experience)\s*:?/im,
  education: /^\s*education\s*:?/im,
  // Also matches a categorized skills layout (export-extension-profile.ts
  // can emit "Languages: Python, ...", "Frontend: React, ..." etc. as
  // separate lines instead of one flat "SKILLS: ..." line) — any one of
  // these category labels is as much evidence of a skills section as the
  // literal word "skills" would be.
  skills: /^\s*(skills|technical skills|core competencies|languages|frontend|backend & databases|infrastructure|applied ai|automation & data)\s*:?/im,
};

// Matches apps/web's ats-rules thresholds (CLAUDE.md's documented ATS rules):
// keyword density < 3%, ~1 page target.
const MAX_KEYWORD_DENSITY = 0.03;
const TARGET_MAX_WORDS = 650;

function extractWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9][a-z0-9+.#-]*/g) || [];
}

function detectSections(resumeText: string): { present: string[]; missing: string[] } {
  const present = Object.keys(SECTION_HEADING_PATTERNS).filter((name) =>
    SECTION_HEADING_PATTERNS[name].test(resumeText)
  );
  const missing = REQUIRED_SECTIONS.filter((s) => !present.includes(s));
  return { present, missing };
}

/** Text-level keyword coverage + density against a JD keyword list. */
export function matchKeywords(resumeText: string, jdKeywords: string[]): KeywordMatch {
  const lower = resumeText.toLowerCase();
  const present: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    if (kw && lower.includes(kw.toLowerCase())) present.push(kw);
    else if (kw) missing.push(kw);
  }

  const words = extractWords(resumeText);
  const keywordSet = new Set(jdKeywords.map((k) => k.toLowerCase()));
  const hits = words.filter((w) => keywordSet.has(w)).length;
  const density = words.length > 0 ? hits / words.length : 0;
  const coverage = jdKeywords.length > 0 ? present.length / jdKeywords.length : 1;

  return { present, missing, coverage, density };
}

/**
 * Score a resume for ATS compliance against a JD's keyword list.
 *
 * Point allocation (100 total), adapted from ats-validator.ts's 30/20/20/10
 * layout+font+section+page-count split:
 *   - 30 layout — auto-awarded: extension output is always plain text, so
 *     "no tables/columns/images" is true by construction, not something to
 *     check for.
 *   - 20 sections — standard heading presence (Experience/Education/Skills).
 *   - 30 keywords — coverage of the JD's top keywords (weighted higher than
 *     the web app's 20pt version, since the extension has no separate
 *     must-have/skill-overlap match score to lean on).
 *   - 20 length — word-count heuristic standing in for the per-bullet line
 *     estimate ats-validator.ts uses, since the extension has no structured
 *     bullets to count.
 */
export function scoreATS(resumeText: string, jdKeywords: string[]): ATSScoreResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 30; // layout — see doc comment above

  const { present, missing } = detectSections(resumeText);
  if (missing.length === 0) {
    score += 20;
  } else {
    score += Math.round(((REQUIRED_SECTIONS.length - missing.length) / REQUIRED_SECTIONS.length) * 20);
    issues.push(`Missing standard section heading(s): ${missing.join(', ')}`);
  }

  const kw = matchKeywords(resumeText, jdKeywords);
  score += Math.round(kw.coverage * 30);
  if (kw.missing.length > 0) {
    warnings.push(`${kw.missing.length} JD keyword(s) not found in the resume: ${kw.missing.slice(0, 8).join(', ')}`);
  }
  if (kw.density > MAX_KEYWORD_DENSITY) {
    warnings.push(`Keyword density is high (${(kw.density * 100).toFixed(1)}%) — may read as keyword stuffing`);
  }

  const wordCount = extractWords(resumeText).length;
  const withinTarget = wordCount <= TARGET_MAX_WORDS;
  if (withinTarget) {
    score += 20;
  } else {
    score += 10;
    issues.push(`Resume is ~${wordCount} words — likely runs past one page (target under ${TARGET_MAX_WORDS})`);
  }

  if (kw.coverage < 0.8) {
    recommendations.push(
      `Work more of the job description's own keywords in — currently ${Math.round(kw.coverage * 100)}% covered`
    );
  }
  if (missing.length > 0) {
    recommendations.push(`Add a standard "${missing[0]}" section heading — ATS parsers look for it by name`);
  }
  if (issues.length === 0 && recommendations.length === 0) {
    recommendations.push('Looks ATS-clean.');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    warnings,
    recommendations,
    checks: {
      layout: { plain_text: true },
      sections: { required_present: missing.length === 0, present, missing },
      keywords: {
        coverage: Math.round(kw.coverage * 100),
        density_ok: kw.density <= MAX_KEYWORD_DENSITY,
        placement_ok: kw.present.length > 0,
      },
      length: { within_target: withinTarget, wordCount },
    },
  };
}
