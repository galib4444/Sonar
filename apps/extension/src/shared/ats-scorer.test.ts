import { describe, it, expect } from 'vitest';
import { scoreATS, matchKeywords } from './ats-scorer';

const COMPLIANT_RESUME = `
SUMMARY
Backend engineer with 5 years building distributed systems in Python and AWS.

EXPERIENCE
Senior Engineer, Acme Corp, 2021-Present
- Built a Python microservice on AWS handling 10k requests per second.
- Led migration to Kubernetes, cutting deploy time by half.

EDUCATION
B.S. Computer Science, State University, 2018

SKILLS
Python, AWS, Kubernetes, Docker, PostgreSQL
`;

const JD_KEYWORDS = ['Python', 'AWS', 'Kubernetes', 'Docker', 'PostgreSQL'];

describe('matchKeywords', () => {
  it('finds keywords present in the resume text case-insensitively', () => {
    const result = matchKeywords(COMPLIANT_RESUME, JD_KEYWORDS);
    expect(result.present).toEqual(JD_KEYWORDS);
    expect(result.missing).toEqual([]);
    expect(result.coverage).toBe(1);
  });

  it('reports missing keywords not found in the resume', () => {
    const result = matchKeywords(COMPLIANT_RESUME, ['Python', 'Rust', 'Go']);
    expect(result.present).toEqual(['Python']);
    expect(result.missing).toEqual(['Rust', 'Go']);
    expect(result.coverage).toBeCloseTo(1 / 3);
  });

  it('returns full coverage when the JD has no keywords to check', () => {
    const result = matchKeywords(COMPLIANT_RESUME, []);
    expect(result.coverage).toBe(1);
  });
});

describe('scoreATS', () => {
  it('scores a resume with all standard sections and full keyword coverage highly', () => {
    const result = scoreATS(COMPLIANT_RESUME, JD_KEYWORDS);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.checks.sections.required_present).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('detects a section heading followed by inline content on the same line', () => {
    const inlineHeadings = `
EXPERIENCE
Senior Engineer, Acme Corp, 2021-Present
- Built things.

EDUCATION
B.S. Computer Science, State University, 2018

SKILLS: Python, AWS, Kubernetes, Docker, PostgreSQL
`;
    const result = scoreATS(inlineHeadings, JD_KEYWORDS);
    expect(result.checks.sections.missing).not.toContain('skills');
    expect(result.checks.sections.required_present).toBe(true);
  });

  it('docks points and lists an issue when a required section is missing', () => {
    const missingEducation = COMPLIANT_RESUME.replace(/EDUCATION[\s\S]*?2018\n/, '');
    const withEducation = scoreATS(COMPLIANT_RESUME, JD_KEYWORDS);
    const withoutEducation = scoreATS(missingEducation, JD_KEYWORDS);

    expect(withoutEducation.score).toBeLessThan(withEducation.score);
    expect(withoutEducation.checks.sections.missing).toContain('education');
    expect(withoutEducation.issues.some((i) => i.toLowerCase().includes('education'))).toBe(true);
  });

  it('warns when keyword density exceeds the configured max', () => {
    const stuffed = `SUMMARY\nPython Python Python Python.\n\nEXPERIENCE\nPython.\n\nEDUCATION\nPython.\n\nSKILLS\nPython.`;
    const result = scoreATS(stuffed, ['Python']);
    expect(result.checks.keywords.density_ok).toBe(false);
    expect(result.warnings.some((w) => w.toLowerCase().includes('density'))).toBe(true);
  });

  it('flags a resume that runs well past the one-page word-count target', () => {
    const longResume = COMPLIANT_RESUME + ' word'.repeat(700);
    const result = scoreATS(longResume, JD_KEYWORDS);
    expect(result.checks.length.within_target).toBe(false);
    expect(result.issues.some((i) => i.toLowerCase().includes('page'))).toBe(true);
  });

  it('keeps the score within 0-100', () => {
    const result = scoreATS('', []);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('says "Looks ATS-clean" only when there is nothing left to recommend', () => {
    const result = scoreATS(COMPLIANT_RESUME, JD_KEYWORDS);
    expect(result.recommendations).toEqual(['Looks ATS-clean.']);
  });

  it('scores a genuine skill mismatch low across every dimension at once, not just one', () => {
    // The real scenario this guards: a candidate applying to a role they
    // truly don't have the background for (e.g. a GPU/ML-accelerator
    // posting for someone with no direct GPU experience). A low score
    // here is the *correct*, honest signal — this pipeline must never
    // inflate it by claiming skills that aren't real (see the resume
    // tailor plan's Step 5 notes) — so this test locks in that a genuine
    // mismatch produces a low score, not a misleadingly middling one.
    const noSectionHeadings = 'Some freeform text with no resume structure at all, ' + 'padding '.repeat(700);
    const result = scoreATS(noSectionHeadings, ['distributed systems', 'GPU programming', 'CUDA', 'PyTorch internals']);

    expect(result.score).toBeLessThan(50);
    expect(result.checks.sections.required_present).toBe(false);
    expect(result.checks.keywords.coverage).toBe(0);
    expect(result.checks.length.within_target).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.recommendations).not.toContain('Looks ATS-clean.');
  });

  it('scores a partial, realistic fit in the middle of the range, not high or low', () => {
    const partialFit = `
EXPERIENCE
Backend Engineer, Acme Corp, 2021-Present
- Built a Python service on AWS.

EDUCATION
B.S. Computer Science, State University, 2018

SKILLS
Python, AWS
`;
    // 2 of 5 JD keywords present (40% coverage) — a real "some overlap,
    // not a strong match" case, distinct from both the 100% and 0% tests.
    const result = scoreATS(partialFit, JD_KEYWORDS);

    expect(result.checks.keywords.coverage).toBe(40);
    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(90);
    expect(result.recommendations.some((r) => r.includes('40% covered'))).toBe(true);
  });
});
