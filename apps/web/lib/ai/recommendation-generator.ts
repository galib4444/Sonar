/**
 * AI Recommendation Generator
 * Generates smart recommendations to improve resume match score
 */

import type { UserProfile, JDInsights, MatchScoreResult } from '@/lib/types';
import type { Recommendation } from '@/components/analyzer/RecommendationPanel';

export function generateRecommendations(
  userProfile: UserProfile,
  jdInsights: JDInsights,
  matchScore: MatchScoreResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Check for missing must-have keywords
  const userSkills = userProfile.skills.map((s) => s.toLowerCase());
  const missingKeywords = (jdInsights.keywords_top_10 || []).filter(
    (keyword) => !userSkills.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase()))
  );

  if (missingKeywords.length > 0) {
    // High priority: Add missing critical keywords
    missingKeywords.slice(0, 3).forEach((keyword, index) => {
      recommendations.push({
        id: `keyword-${index}`,
        type: 'add_keyword',
        priority: 'high',
        title: `Add "${keyword}" to your skills`,
        reason: `This keyword appears in the top 10 JD keywords but is missing from your resume. Adding it could increase ATS match rate.`,
        matchScore: 85 + index * 5,
        content: keyword,
        targetSection: 'skills',
        action: 'add',
      });
    });
  }

  // 2. Check for missing must-have requirements
  const missingMustHaves = (jdInsights.must_haves || []).filter((mustHave) => {
    const lowerMustHave = mustHave.toLowerCase();
    return !userProfile.experience.some((exp) =>
      exp.bullets.some((bullet) => bullet.toLowerCase().includes(lowerMustHave))
    );
  });

  if (missingMustHaves.length > 0) {
    // High priority: Address missing must-haves
    missingMustHaves.slice(0, 2).forEach((requirement, index) => {
      recommendations.push({
        id: `musthave-${index}`,
        type: 'add_experience',
        priority: 'high',
        title: `Highlight "${requirement}" experience`,
        reason: `This is a must-have requirement for the role. Review your experience and add a bullet point showcasing relevant work.`,
        matchScore: 90,
        content: `[Action Verb] + achieved [result] by applying ${requirement} in [context]`,
        targetSection: 'experience',
        action: 'add',
      });
    });
  }

  // 3. Check skill gaps
  if (matchScore.gaps && matchScore.gaps.length > 0) {
    matchScore.gaps.slice(0, 3).forEach((gap, index) => {
      const hasRelatedExperience = userProfile.experience.some((exp) =>
        exp.bullets.some((bullet) => bullet.toLowerCase().includes(gap.toLowerCase()))
      );

      if (hasRelatedExperience) {
        // Medium priority: Enhance existing bullet to highlight this skill
        recommendations.push({
          id: `enhance-${index}`,
          type: 'enhance_bullet',
          priority: 'medium',
          title: `Emphasize your "${gap}" experience`,
          reason: `You have experience with ${gap}, but it's not prominent enough. Consider enhancing a bullet point to highlight this skill.`,
          matchScore: 75 + index * 5,
          targetSection: 'experience',
          action: 'replace',
        });
      } else {
        // Low priority: Consider adding if transferable
        recommendations.push({
          id: `consider-${index}`,
          type: 'add_skill',
          priority: 'low',
          title: `Consider adding "${gap}" if applicable`,
          reason: `This skill is valued for the role. If you have any related experience, even tangentially, mention it.`,
          matchScore: 60 + index * 3,
          content: gap,
          targetSection: 'skills',
          action: 'add',
        });
      }
    });
  }

  // 4. Summary enhancement recommendation
  if (!userProfile.summary || userProfile.summary.length < 100) {
    recommendations.push({
      id: 'summary-enhance',
      type: 'add_experience',
      priority: 'medium',
      title: 'Strengthen your professional summary',
      reason: `A compelling summary that mirrors the JD language can catch recruiters' attention. Include ${jdInsights.title} keywords.`,
      matchScore: 78,
      content: `[X] years of experience in [domain], specializing in ${jdInsights.skills_extracted
        .slice(0, 3)
        .map((s) => s.name)
        .join(', ')}. Proven track record in [key achievement].`,
      targetSection: 'summary',
      action: 'replace',
    });
  }

  // 5. Seniority mismatch check
  const seniorityLevel = {
    entry: 0,
    mid: 1,
    senior: 2,
    staff: 3,
    principal: 4,
  };

  const userSeniority = estimateUserSeniority(userProfile);
  const jdSeniorityLevel = seniorityLevel[jdInsights.seniority || 'mid'];
  const userSeniorityLevel = seniorityLevel[userSeniority];

  if (jdSeniorityLevel > userSeniorityLevel) {
    // Medium priority: User may be under-qualified
    recommendations.push({
      id: 'seniority-gap',
      type: 'add_experience',
      priority: 'medium',
      title: 'Highlight leadership and impact',
      reason: `This role is at ${jdInsights.seniority} level. Emphasize leadership, mentorship, and high-impact projects in your bullets.`,
      matchScore: 72,
      targetSection: 'experience',
      action: 'replace',
    });
  }

  // 6. Quantification check
  const totalBullets = userProfile.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
  const quantifiedBullets = userProfile.experience.reduce(
    (sum, exp) => sum + exp.bullets.filter((b) => /\d/.test(b)).length,
    0
  );
  const quantificationRate = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;

  if (quantificationRate < 0.6) {
    recommendations.push({
      id: 'quantify-bullets',
      type: 'enhance_bullet',
      priority: 'high',
      title: 'Add metrics to your achievements',
      reason: `Only ${Math.round(quantificationRate * 100)}% of your bullets have quantifiable metrics. Recruiters love numbers! Add percentages, dollar amounts, or team sizes.`,
      matchScore: 82,
      content: 'Example: "Increased revenue by 25%" or "Led team of 5 engineers"',
      targetSection: 'experience',
      action: 'replace',
    });
  }

  // 7. Relevance check - remove irrelevant sections if resume is too long
  const totalLines = estimateResumeLines(userProfile);
  if (totalLines > 50) {
    recommendations.push({
      id: 'remove-irrelevant',
      type: 'remove_section',
      priority: 'low',
      title: 'Consider removing less relevant experience',
      reason: 'Your resume may exceed 1 page. Consider removing older or less relevant positions to fit ATS requirements.',
      matchScore: 68,
      targetSection: 'experience',
      action: 'remove',
    });
  }

  // Sort by priority and match score
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.matchScore - a.matchScore;
  });
}

function estimateUserSeniority(profile: UserProfile): 'entry' | 'mid' | 'senior' | 'staff' | 'principal' {
  if (!profile.experience || profile.experience.length === 0) return 'entry';

  const totalYears = profile.experience.reduce((sum, exp) => {
    const years = estimateYears(exp.start_date, exp.end_date);
    return sum + years;
  }, 0);

  if (totalYears < 2) return 'entry';
  if (totalYears < 5) return 'mid';
  if (totalYears < 10) return 'senior';
  if (totalYears < 15) return 'staff';
  return 'principal';
}

function estimateYears(startDate: string, endDate: string | null | undefined): number {
  // Simple estimation - could be improved with actual date parsing
  const currentYear = new Date().getFullYear();
  const startYear = parseInt(startDate.match(/\d{4}/)?.[0] || currentYear.toString());

  // Handle null/undefined end dates as current/ongoing positions
  const endYear =
    !endDate || endDate.toLowerCase().includes('present') || endDate.toLowerCase().includes('current')
      ? currentYear
      : parseInt(endDate.match(/\d{4}/)?.[0] || currentYear.toString());

  return Math.max(0, endYear - startYear);
}

function estimateResumeLines(profile: UserProfile): number {
  let lines = 0;

  // Header: 3 lines
  lines += 3;

  // Summary: 2-3 lines
  if (profile.summary) {
    lines += Math.ceil(profile.summary.length / 80);
  }

  // Experience
  profile.experience.forEach((exp) => {
    lines += 2; // Title and dates
    lines += exp.bullets.length * 1.5; // Each bullet is ~1.5 lines on average
  });

  // Education
  lines += profile.education.length * 2;

  // Skills
  lines += 2;

  // Projects
  if (profile.projects) {
    lines += profile.projects.length * 3;
  }

  // Certifications
  if (profile.certifications) {
    lines += profile.certifications.length;
  }

  return Math.ceil(lines);
}
