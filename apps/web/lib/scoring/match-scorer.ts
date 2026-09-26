/**
 * Match Scoring Algorithm
 * Calculates job-resume fit score (0-100)
 */

import type { UserProfile, JDInsights, MatchScoreResult } from '../types';
import { extractWords, containsKeyword } from '../utils/text';
import { getSkillAliases } from '../utils/keywords';

/**
 * Calculate match score between user profile and job description
 */
export function calculateMatchScore(
  userProfile: UserProfile,
  jdInsights: JDInsights
): MatchScoreResult {
  const skillOverlap = calculateSkillOverlap(userProfile, jdInsights);
  const mustHaveCoverage = calculateMustHaveCoverage(userProfile, jdInsights);
  const seniorityFit = calculateSeniorityFit(userProfile, jdInsights);
  const evidenceScore = calculateEvidenceScore(userProfile, jdInsights);

  const totalScore = Math.round(
    skillOverlap.score + mustHaveCoverage.score + seniorityFit.score + evidenceScore.score
  );

  const recommendations = generateRecommendations(
    skillOverlap,
    mustHaveCoverage,
    seniorityFit,
    evidenceScore
  );

  return {
    total_score: totalScore,
    breakdown: {
      skill_overlap: Math.round(skillOverlap.score),
      must_have_coverage: Math.round(mustHaveCoverage.score),
      seniority_fit: Math.round(seniorityFit.score),
      evidence_score: Math.round(evidenceScore.score),
    },
    matched_skills: skillOverlap.matched,
    gaps: skillOverlap.gaps,
    recommendations,
  };
}

/**
 * Calculate skill overlap (max 50 points)
 */
function calculateSkillOverlap(
  userProfile: UserProfile,
  jdInsights: JDInsights
): {
  score: number;
  matched: string[];
  gaps: string[];
} {
  // Defensive checks for undefined/null values
  const userSkills = new Set((userProfile.skills || []).map((s) => s.toLowerCase()));
  const jdTopSkills = (jdInsights.keywords_top_10 || []).map((k) => k.toLowerCase());

  const matched: string[] = [];
  const gaps: string[] = [];

  // If no JD skills, return default
  if (jdTopSkills.length === 0) {
    return { score: 50, matched: [], gaps: [] };
  }

  jdTopSkills.forEach((jdSkill) => {
    let found = false;

    // Direct match
    if (userSkills.has(jdSkill)) {
      found = true;
      matched.push(jdSkill);
    } else {
      // Check aliases
      const aliases = getSkillAliases(jdSkill);
      for (const alias of aliases) {
        if (Array.from(userSkills).some((us) => us.includes(alias) || alias.includes(us))) {
          found = true;
          matched.push(jdSkill);
          break;
        }
      }
    }

    if (!found) {
      gaps.push(jdSkill);
    }
  });

  const score = (matched.length / jdTopSkills.length) * 50;

  return { score, matched, gaps };
}

/**
 * Calculate must-have coverage (max 20 points)
 */
function calculateMustHaveCoverage(
  userProfile: UserProfile,
  jdInsights: JDInsights
): {
  score: number;
  covered: string[];
  missing: string[];
} {
  const allUserText = [
    ...(userProfile.experience || []).flatMap((e) => e.bullets || []),
    ...(userProfile.projects || []).flatMap((p) => p.bullets || []),
    (userProfile.skills || []).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const covered: string[] = [];
  const missing: string[] = [];

  const mustHaves = jdInsights.must_haves || [];

  mustHaves.forEach((mustHave) => {
    const keywords = extractWords(mustHave);
    const hasMatch = keywords.some((kw) => allUserText.includes(kw.toLowerCase()));

    if (hasMatch) {
      covered.push(mustHave);
    } else {
      missing.push(mustHave);
    }
  });

  const score = mustHaves.length > 0 ? (covered.length / mustHaves.length) * 20 : 20;

  return { score, covered, missing };
}

/**
 * Calculate seniority fit (max 15 points)
 */
function calculateSeniorityFit(
  userProfile: UserProfile,
  jdInsights: JDInsights
): {
  score: number;
  yearsExp: number;
  delta: number;
} {
  const yearsExp = calculateYearsOfExperience(userProfile);

  const seniorityMap: Record<
    string,
    { min: number; max: number; ideal: number }
  > = {
    entry: { min: 0, max: 2, ideal: 1 },
    mid: { min: 2, max: 5, ideal: 3.5 },
    senior: { min: 5, max: 10, ideal: 7 },
    staff: { min: 8, max: 15, ideal: 10 },
    principal: { min: 12, max: 25, ideal: 15 },
  };

  const target = seniorityMap[jdInsights.seniority];
  if (!target) {
    return { score: 15, yearsExp, delta: 0 };
  }

  let score = 15;
  let delta = 0;

  if (yearsExp >= target.min && yearsExp <= target.max) {
    score = 15;
  } else if (yearsExp < target.min) {
    delta = target.min - yearsExp;
    score = Math.max(0, 15 - delta * 3);
  } else {
    delta = yearsExp - target.max;
    score = Math.max(0, 15 - delta * 2); // Penalize overqualification less
  }

  return { score, yearsExp, delta };
}

/**
 * Calculate evidence score (max 15 points)
 */
function calculateEvidenceScore(
  userProfile: UserProfile,
  jdInsights: JDInsights
): {
  score: number;
  quantifiedBullets: number;
  relevantBullets: number;
} {
  const allBullets = [
    ...(userProfile.experience || []).flatMap((e) => e.bullets || []),
    ...(userProfile.projects || []).flatMap((p) => p.bullets || []),
  ];

  const jdKeywords = (jdInsights.keywords_top_10 || []).map((k) => k.toLowerCase());

  let quantifiedRelevant = 0;
  let relevant = 0;

  allBullets.forEach((bullet) => {
    const hasNumber = /\d+/.test(bullet);
    const hasJDKeyword = containsKeyword(bullet, jdKeywords);

    if (hasJDKeyword) {
      relevant++;
      if (hasNumber) {
        quantifiedRelevant++;
      }
    }
  });

  const score = allBullets.length > 0 ? (quantifiedRelevant / allBullets.length) * 30 : 0;

  return {
    score: Math.min(score, 15),
    quantifiedBullets: quantifiedRelevant,
    relevantBullets: relevant,
  };
}

/**
 * Calculate years of experience from profile
 */
function calculateYearsOfExperience(userProfile: UserProfile): number {
  let totalMonths = 0;

  (userProfile.experience || []).forEach((exp) => {
    const start = parseDate(exp.start_date);

    // Handle end date: null or "Present"/"Current" = current date
    let end: Date | null = null;
    if (!exp.end_date || exp.end_date.toLowerCase().includes('present') || exp.end_date.toLowerCase().includes('current')) {
      end = new Date();
    } else {
      end = parseDate(exp.end_date);
    }

    if (start && end) {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
  });

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
}

/**
 * Parse date string (handles "Jan 2020", "2020-01", etc.)
 */
function parseDate(dateStr: string | null | undefined): Date | null {
  // Handle null/undefined dates (e.g., current/ongoing positions)
  if (!dateStr) return null;

  const cleaned = dateStr.trim();

  // Try formats: "Jan 2020", "January 2020"
  const monthYearMatch = cleaned.match(/([A-Za-z]+)\s+(\d{4})/);
  if (monthYearMatch) {
    const [, monthStr, year] = monthYearMatch;
    const monthMap: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = monthMap[monthStr.toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      return new Date(parseInt(year), month, 1);
    }
  }

  // Try ISO format: "2020-01"
  const isoMatch = cleaned.match(/(\d{4})-(\d{2})/);
  if (isoMatch) {
    const [, year, month] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  }

  // Just year: "2020"
  const yearMatch = cleaned.match(/(\d{4})/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1]), 0, 1);
  }

  return null;
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  skillOverlap: { score: number; gaps: string[] },
  mustHaveCoverage: { score: number; missing: string[] },
  seniorityFit: { score: number; delta: number },
  evidenceScore: { score: number }
): string[] {
  const recommendations: string[] = [];

  if (skillOverlap.score < 30) {
    recommendations.push(
      `Add these missing skills to your resume: ${skillOverlap.gaps.slice(0, 5).join(', ')}`
    );
  }

  if (mustHaveCoverage.missing.length > 0) {
    recommendations.push(
      `Highlight experience with must-have requirements: ${mustHaveCoverage.missing[0]}`
    );
  }

  if (seniorityFit.delta > 2) {
    recommendations.push('This role may require more experience than you currently have');
  } else if (seniorityFit.delta < -3) {
    recommendations.push('You may be overqualified for this role');
  }

  if (evidenceScore.score < 8) {
    recommendations.push('Add more quantified achievements to your resume bullets');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great fit! Your profile aligns well with this role.');
  }

  return recommendations;
}
