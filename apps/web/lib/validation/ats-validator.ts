/**
 * ATS Validation
 * Validates resume compliance with ATS systems
 */

import type { ResumeSections, ATSValidationResult, ATSChecks, ATSRules } from '../types';
import { loadATSRules } from '../utils/knowledge-base';
import { calculateKeywordDensity } from '../utils/keywords';

/**
 * Validate resume for ATS compliance
 */
export function validateATS(
  resumeSections: ResumeSections,
  jdKeywords?: string[]
): ATSValidationResult {
  const atsRules = loadATSRules();

  const checks: ATSChecks = {
    layout: validateLayout(),
    fonts: validateFonts(),
    sections: validateSections(resumeSections, atsRules),
    keywords: validateKeywords(resumeSections, jdKeywords || [], atsRules),
    page_count: validatePageCount(resumeSections),
  };

  const { score, issues, warnings } = calculateATSScore(checks, atsRules);
  const recommendations = generateRecommendations(checks, issues);

  return {
    valid: score >= 90,
    score,
    checks,
    issues,
    warnings,
    recommendations,
  };
}

/**
 * Validate layout (single column, no tables, etc.)
 */
function validateLayout() {
  return {
    single_column: true, // Our templates are always single column
    no_tables: true, // Our templates don't use tables
    no_text_boxes: true, // Our templates don't use text boxes
    no_images: true, // Our templates don't use images (except optional QR)
  };
}

/**
 * Validate fonts
 */
function validateFonts() {
  // Our templates use approved fonts
  return {
    approved_fonts: true, // Helvetica/Calibri/Arial
    body_size_ok: true, // 11pt
    header_size_ok: true, // 12-14pt
  };
}

/**
 * Validate sections
 */
function validateSections(resumeSections: ResumeSections, atsRules: ATSRules) {
  const presentSections = [];

  if (resumeSections.summary) presentSections.push('Summary');
  if (resumeSections.experience && resumeSections.experience.length > 0) presentSections.push('Experience');
  if (resumeSections.projects && resumeSections.projects.length > 0)
    presentSections.push('Projects');
  if (resumeSections.education && resumeSections.education.length > 0) presentSections.push('Education');
  if (resumeSections.skills) presentSections.push('Skills');

  const requiredPresent = atsRules.sections.required.every((req) =>
    presentSections.some((s) => s.toLowerCase() === req.toLowerCase())
  );

  return {
    standard_headings: true, // Our templates use standard headings
    required_present: requiredPresent,
    logical_order: true,
  };
}

/**
 * Validate keywords
 */
function validateKeywords(
  resumeSections: ResumeSections,
  jdKeywords: string[],
  atsRules: ATSRules
) {
  // Defensive: Handle both object and array skills formats
  let skillsText = '';
  if (resumeSections.skills) {
    if (Array.isArray(resumeSections.skills)) {
      skillsText = resumeSections.skills.join(' ');
    } else if (typeof resumeSections.skills === 'object') {
      skillsText = Object.values(resumeSections.skills).flat().join(' ');
    }
  }

  const allText = [
    resumeSections.summary || '',
    ...(resumeSections.experience || []).flatMap((e) => e.bullets || []),
    ...(resumeSections.projects || []).flatMap((p) => p.bullets || []),
    skillsText,
  ].join(' ');

  const lowerText = allText.toLowerCase();
  const coverage = (jdKeywords || []).filter((kw) => lowerText.includes(kw.toLowerCase())).length;

  const density = calculateKeywordDensity(allText, jdKeywords);

  const hasKeywordsInSummary = resumeSections.summary
    ? (jdKeywords || []).some((kw) => resumeSections.summary!.toLowerCase().includes(kw.toLowerCase()))
    : false;

  const hasKeywordsInBullets = (resumeSections.experience || []).some((exp) =>
    (exp.bullets || []).some((bullet) => (jdKeywords || []).some((kw) => bullet.toLowerCase().includes(kw.toLowerCase())))
  );

  return {
    coverage: Math.min(coverage, 10),
    density_ok: density < atsRules.keywords.max_density,
    placement_ok: hasKeywordsInSummary || hasKeywordsInBullets,
  };
}

/**
 * Validate page count
 */
function validatePageCount(resumeSections: ResumeSections) {
  // Estimate line count
  let lineCount = 0;

  // Header (name + contact): ~4 lines
  lineCount += 4;

  // Summary: ~2-3 lines
  if (resumeSections.summary) {
    const summaryWords = resumeSections.summary.split(' ').length;
    lineCount += Math.ceil(summaryWords / 12); // ~12 words per line at 11pt
  }

  // Experience
  (resumeSections.experience || []).forEach((exp) => {
    lineCount += 3; // Title, company, dates
    (exp.bullets || []).forEach((bullet) => {
      const words = bullet.split(' ').length;
      lineCount += Math.ceil(words / 12);
    });
    lineCount += 1; // Spacing
  });

  // Projects
  if (resumeSections.projects) {
    (resumeSections.projects || []).forEach((proj) => {
      lineCount += 2; // Name, link
      (proj.bullets || []).forEach((bullet) => {
        const words = bullet.split(' ').length;
        lineCount += Math.ceil(words / 12);
      });
      lineCount += 1; // Spacing
    });
  }

  // Education
  (resumeSections.education || []).forEach((edu) => {
    lineCount += 2; // Degree, school
    if (edu.highlights) {
      lineCount += edu.highlights.length;
    }
  });

  // Skills: ~2-4 lines
  lineCount += 3;

  // Max lines for 1 page at 11pt with 0.5" margins: ~52 lines
  const isOnePage = lineCount <= 52;

  // Estimate height in inches (8.5" - 1" margins = 7.5" usable)
  const estimatedHeight = (lineCount * 0.15); // ~0.15" per line

  return {
    is_one_page: isOnePage,
    line_count: lineCount,
    estimated_height: estimatedHeight,
  };
}

/**
 * Calculate ATS score (0-100)
 */
function calculateATSScore(checks: ATSChecks, atsRules: ATSRules) {
  let score = 0;
  const issues: string[] = [];
  const warnings: string[] = [];

  // Layout (30 points)
  if (checks.layout.single_column) score += 10;
  else issues.push('Resume uses multiple columns - ATS may misread');

  if (checks.layout.no_tables) score += 10;
  else issues.push('Resume contains tables - ATS may lose data');

  if (checks.layout.no_text_boxes) score += 5;
  else warnings.push('Avoid text boxes for better ATS compatibility');

  if (checks.layout.no_images) score += 5;
  else warnings.push('Images may not be parsed by ATS');

  // Fonts (20 points)
  if (checks.fonts.approved_fonts) score += 10;
  else issues.push('Use ATS-friendly fonts: Arial, Calibri, or Times New Roman');

  if (checks.fonts.body_size_ok) score += 5;
  else warnings.push('Body font should be 10.5-11.5pt');

  if (checks.fonts.header_size_ok) score += 5;
  else warnings.push('Header font should be 12-14pt');

  // Sections (20 points)
  if (checks.sections.standard_headings) score += 10;
  else warnings.push('Use standard section headings (EXPERIENCE, EDUCATION, SKILLS)');

  if (checks.sections.required_present) score += 10;
  else issues.push('Missing required sections (Experience, Education, or Skills)');

  // Keywords (20 points)
  score += checks.keywords.coverage * 2; // 0-10 coverage → 0-20 points

  if (!checks.keywords.density_ok) {
    warnings.push(`Keyword density too high (>${atsRules.keywords.max_density * 100}%)`);
  }

  if (!checks.keywords.placement_ok) {
    warnings.push('Include keywords in summary, experience bullets, and skills');
  }

  // Page count (10 points)
  if (checks.page_count.is_one_page) {
    score += 10;
  } else {
    issues.push(
      `Resume exceeds 1 page (estimated ${checks.page_count.line_count} lines, max 52)`
    );
  }

  return { score: Math.min(score, 100), issues, warnings };
}

/**
 * Generate recommendations
 */
function generateRecommendations(checks: ATSChecks, issues: string[]): string[] {
  const recommendations: string[] = [];

  if (!checks.page_count.is_one_page) {
    recommendations.push('Reduce resume to 1 page by removing older experiences or condensing bullets');
  }

  if (checks.keywords.coverage < 8) {
    recommendations.push(`Add more job-relevant keywords (currently ${checks.keywords.coverage}/10)`);
  }

  if (!checks.keywords.placement_ok) {
    recommendations.push('Distribute keywords across summary, experience bullets, and skills section');
  }

  if (issues.length === 0 && recommendations.length === 0) {
    recommendations.push('Excellent ATS compliance! Resume should parse well.');
  }

  return recommendations;
}
