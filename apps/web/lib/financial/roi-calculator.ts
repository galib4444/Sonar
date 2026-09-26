/**
 * Financial ROI Calculator
 * Calculates salary fit, ROI score, and priority score for job opportunities
 */

import type { FinancialMetrics, JDInsights, UserProfile } from '../types';

export interface ROICalculatorInput {
  jd_insights: JDInsights;
  user_profile: UserProfile;
  match_score: number;
}

/**
 * Calculate comprehensive financial metrics for a job opportunity
 */
export function calculateFinancialMetrics(input: ROICalculatorInput): FinancialMetrics {
  const { jd_insights, user_profile, match_score } = input;

  // Calculate salary fit
  const salary_fit = calculateSalaryFit(jd_insights, user_profile);

  // Calculate skill growth
  const skill_growth = calculateSkillGrowth(jd_insights, user_profile);

  // Calculate ROI score
  const roi_score = calculateROIScore(jd_insights, match_score, skill_growth.growth_factor);

  // Calculate career trajectory
  const career_trajectory = calculateCareerTrajectory(jd_insights, user_profile);

  // Calculate priority score
  const priority_score = calculatePriorityScore({
    roi_score,
    match_score,
    skill_growth_factor: skill_growth.growth_factor,
    company: jd_insights.company,
  });

  return {
    roi_score,
    salary_fit,
    skill_growth,
    career_trajectory,
    priority_score,
  };
}

/**
 * Calculate salary fit metrics
 */
function calculateSalaryFit(
  jd_insights: JDInsights,
  user_profile: UserProfile
): FinancialMetrics['salary_fit'] {
  const salary_estimate = jd_insights.salary_estimate;

  if (!salary_estimate) {
    // Default salary range based on seniority
    const ranges: Record<string, { low: number; high: number }> = {
      entry: { low: 60000, high: 90000 },
      mid: { low: 90000, high: 130000 },
      senior: { low: 130000, high: 180000 },
      staff: { low: 180000, high: 250000 },
      principal: { low: 250000, high: 350000 },
    };

    const range = ranges[jd_insights.seniority] || ranges.mid;
    const user_current = user_profile.baseline_salary || 100000;
    const avg_role_salary = (range.low + range.high) / 2;
    const potential_lift_pct = ((avg_role_salary - user_current) / user_current) * 100;

    return {
      role_range: range,
      user_current,
      potential_lift_pct: Math.round(potential_lift_pct),
      market_percentile: 50, // Default
    };
  }

  const user_current = user_profile.baseline_salary || 100000;
  const role_range = { low: salary_estimate.min, high: salary_estimate.max };
  const avg_role_salary = (role_range.low + role_range.high) / 2;
  const potential_lift_pct = ((avg_role_salary - user_current) / user_current) * 100;

  // Calculate market percentile (simplified - would use real market data in production)
  const market_percentile = calculateMarketPercentile(user_current, jd_insights.seniority);

  return {
    role_range,
    user_current,
    potential_lift_pct: Math.round(potential_lift_pct),
    market_percentile,
  };
}

/**
 * Calculate market percentile for user's current salary
 */
function calculateMarketPercentile(salary: number, seniority: string): number {
  // Simplified percentile calculation
  // In production, would use actual market data from Levels.fyi, H1B data, etc.
  const benchmarks: Record<string, number> = {
    entry: 75000,
    mid: 110000,
    senior: 155000,
    staff: 215000,
    principal: 300000,
  };

  const benchmark = benchmarks[seniority] || benchmarks.mid;
  const percentile = Math.min(Math.round((salary / benchmark) * 50) + 25, 95);

  return percentile;
}

/**
 * Calculate skill growth potential
 */
function calculateSkillGrowth(
  jd_insights: JDInsights,
  user_profile: UserProfile
): FinancialMetrics['skill_growth'] {
  const user_skills_lower = user_profile.skills.map((s) => s.toLowerCase());

  // Find new skills user would learn
  const new_skills = jd_insights.skills_extracted
    .filter((skill) => !user_skills_lower.includes(skill.name.toLowerCase()))
    .filter((skill) => skill.weight >= 6) // Only high-value skills
    .map((skill) => skill.name);

  // Growth factor: 1.0 (no new skills) to 2.0 (many new skills)
  const growth_factor = 1 + Math.min(new_skills.length * 0.15, 1.0);

  return {
    new_skills: new_skills.slice(0, 5), // Top 5 new skills
    growth_factor: Math.round(growth_factor * 100) / 100,
  };
}

/**
 * Calculate ROI score (earnings per hour invested)
 *
 * Formula:
 * ROI = (Avg Salary × Match Score × Skill Factor) ÷ Est. App Time
 */
function calculateROIScore(
  jd_insights: JDInsights,
  match_score: number,
  skill_growth_factor: number
): number {
  const salary_estimate = jd_insights.salary_estimate;

  // Average salary for role
  let avg_salary: number;
  if (salary_estimate) {
    avg_salary = (salary_estimate.min + salary_estimate.max) / 2;
  } else {
    // Default based on seniority
    const defaults: Record<string, number> = {
      entry: 75000,
      mid: 110000,
      senior: 155000,
      staff: 215000,
      principal: 300000,
    };
    avg_salary = defaults[jd_insights.seniority] || defaults.mid;
  }

  // Match score as decimal (0.0 - 1.0)
  const match_decimal = match_score / 100;

  // Estimated application time with HustlerAI (hours)
  const app_time_hours = 0.5; // 30 minutes with autofill

  // ROI calculation
  const roi = (avg_salary * match_decimal * skill_growth_factor) / app_time_hours;

  return Math.round(roi);
}

/**
 * Calculate career trajectory
 */
function calculateCareerTrajectory(
  jd_insights: JDInsights,
  user_profile: UserProfile
): FinancialMetrics['career_trajectory'] {
  // Infer current level from experience
  const total_experience_years = user_profile.experience.reduce((total, exp) => {
    const years = calculateYearsOfExperience(exp.start_date, exp.end_date);
    return total + years;
  }, 0);

  const current_level = inferSeniorityLevel(total_experience_years);
  const target_level = jd_insights.seniority;

  // Time to target (months) - simplified calculation
  const seniority_order = ['entry', 'mid', 'senior', 'staff', 'principal'];
  const current_index = seniority_order.indexOf(current_level);
  const target_index = seniority_order.indexOf(target_level);
  const levels_gap = target_index - current_index;

  // Average 18-24 months per level
  const time_to_target_months = Math.max(levels_gap * 20, 0);

  return {
    current_level,
    target_level,
    time_to_target_months,
  };
}

/**
 * Calculate years of experience from dates
 */
function calculateYearsOfExperience(start_date: string, end_date: string): number {
  // Simple calculation - would be more sophisticated in production
  const now = new Date();
  const start = parseDateString(start_date);
  const end = end_date.toLowerCase().includes('present') || end_date.toLowerCase().includes('current')
    ? now
    : parseDateString(end_date);

  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.max(years, 0);
}

/**
 * Parse date string (e.g., "Jan 2020", "2020-01")
 */
function parseDateString(dateStr: string): Date {
  // Handle formats like "Jan 2020", "January 2020", "2020-01"
  const parts = dateStr.trim().split(/[\s-]/);

  if (parts.length === 2) {
    const [monthOrYear, yearOrMonth] = parts;

    // Check if first part is a year
    if (monthOrYear.length === 4) {
      return new Date(parseInt(monthOrYear), parseInt(yearOrMonth) - 1, 1);
    }

    // Otherwise, assume "Month Year" format
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = months.findIndex((m) => monthOrYear.toLowerCase().startsWith(m));
    const year = parseInt(yearOrMonth);

    return new Date(year, monthIndex >= 0 ? monthIndex : 0, 1);
  }

  // Fallback
  return new Date(dateStr);
}

/**
 * Infer seniority level from years of experience
 */
function inferSeniorityLevel(years: number): string {
  if (years < 2) return 'entry';
  if (years < 5) return 'mid';
  if (years < 8) return 'senior';
  if (years < 12) return 'staff';
  return 'principal';
}

/**
 * Calculate priority score (0-100) for ranking opportunities
 *
 * Formula:
 * Priority = 0.40 × ROI (normalized) + 0.30 × Match + 0.20 × Skill Growth + 0.10 × Brand
 */
export function calculatePriorityScore(params: {
  roi_score: number;
  match_score: number;
  skill_growth_factor: number;
  company: string;
}): number {
  const { roi_score, match_score, skill_growth_factor, company } = params;

  const weights = {
    roi: 0.4,
    match: 0.3,
    skill_growth: 0.2,
    brand: 0.1,
  };

  // Normalize ROI to 0-100 scale (assuming max ROI of $500K/hr)
  const roi_normalized = Math.min((roi_score / 500000) * 100, 100);

  // Match score is already 0-100
  const match_normalized = match_score;

  // Skill growth: 1.0-2.0 → 0-100
  const skill_growth_normalized = (skill_growth_factor - 1.0) * 100;

  // Brand score
  const brand_score = getBrandScore(company);

  // Calculate weighted priority
  const priority =
    weights.roi * roi_normalized +
    weights.match * match_normalized +
    weights.skill_growth * skill_growth_normalized +
    weights.brand * brand_score;

  return Math.round(Math.min(priority, 100));
}

/**
 * Get brand score for company (0-100)
 */
function getBrandScore(company: string): number {
  const company_lower = company.toLowerCase();

  // FAANG/Big Tech: 100
  const tier1 = ['google', 'meta', 'facebook', 'apple', 'amazon', 'microsoft', 'netflix', 'nvidia'];
  if (tier1.some((t) => company_lower.includes(t))) return 100;

  // Hot Unicorns: 80
  const tier2 = ['openai', 'stripe', 'airbnb', 'databricks', 'figma', 'notion', 'anthropic', 'scale'];
  if (tier2.some((t) => company_lower.includes(t))) return 80;

  // Established Tech: 60
  const tier3 = ['salesforce', 'oracle', 'sap', 'adobe', 'cisco', 'intel', 'uber', 'lyft', 'doordash'];
  if (tier3.some((t) => company_lower.includes(t))) return 60;

  // Default: 40
  return 40;
}
