/**
 * Analytics Calculations
 * Generate insights from application data
 */

import type { ApplicationRecord, AnalyticsSnapshot } from '../types';

/**
 * Calculate analytics snapshot from applications
 */
export function calculateAnalytics(
  applications: ApplicationRecord[],
  time_range?: { start: Date; end: Date }
): AnalyticsSnapshot {
  const user_id = 'user_demo'; // For MVP

  // Filter by time range if provided
  let filtered_apps = applications;
  if (time_range) {
    filtered_apps = applications.filter((app) => {
      const app_date = new Date(app.applied_date);
      return app_date >= time_range.start && app_date <= time_range.end;
    });
  }

  // Calculate funnel
  const funnel = {
    applied: filtered_apps.filter((app) => ['applied', 'phone_screen', 'onsite', 'offer', 'accepted'].includes(app.status)).length,
    phone_screen: filtered_apps.filter((app) => ['phone_screen', 'onsite', 'offer', 'accepted'].includes(app.status)).length,
    onsite: filtered_apps.filter((app) => ['onsite', 'offer', 'accepted'].includes(app.status)).length,
    offer: filtered_apps.filter((app) => ['offer', 'accepted'].includes(app.status)).length,
  };

  // Calculate conversion rates
  const conversion_rates = {
    applied_to_phone: funnel.applied > 0 ? (funnel.phone_screen / funnel.applied) * 100 : 0,
    phone_to_onsite: funnel.phone_screen > 0 ? (funnel.onsite / funnel.phone_screen) * 100 : 0,
    onsite_to_offer: funnel.onsite > 0 ? (funnel.offer / funnel.onsite) * 100 : 0,
  };

  // Calculate financial metrics
  const total_potential_earnings = filtered_apps.reduce((sum, app) => {
    const avg_salary = (app.financial.salary_range.low + app.financial.salary_range.high) / 2;
    return sum + avg_salary;
  }, 0);

  const avg_target_salary =
    filtered_apps.length > 0 ? total_potential_earnings / filtered_apps.length : 0;

  const highest_offer = Math.max(
    ...filtered_apps
      .filter((app) => app.offer)
      .map((app) => app.offer!.salary),
    0
  );

  // Calculate time saved
  // Assume traditional application takes 3 hours, HustlerAI takes 0.5 hours
  const hours_saved = filtered_apps.length * (3 - 0.5);
  const avg_time_per_app = 0.5;

  // Calculate success by match score
  const success_by_match_score = calculateSuccessRateByMatchScore(filtered_apps);

  return {
    user_id,
    time_range: time_range || {
      start: new Date(0), // Beginning of time
      end: new Date(),
    },
    funnel,
    conversion_rates: {
      applied_to_phone: Math.round(conversion_rates.applied_to_phone * 10) / 10,
      phone_to_onsite: Math.round(conversion_rates.phone_to_onsite * 10) / 10,
      onsite_to_offer: Math.round(conversion_rates.onsite_to_offer * 10) / 10,
    },
    financial: {
      total_potential_earnings: Math.round(total_potential_earnings),
      avg_target_salary: Math.round(avg_target_salary),
      highest_offer: highest_offer > 0 ? highest_offer : undefined,
    },
    time_saved: {
      hours_saved: Math.round(hours_saved),
      avg_time_per_app,
    },
    success_by_match_score,
  };
}

/**
 * Calculate interview success rate by match score brackets
 */
function calculateSuccessRateByMatchScore(
  applications: ApplicationRecord[]
): Array<{ score_range: string; interview_rate: number }> {
  const brackets = [
    { range: '90-100', min: 90, max: 100 },
    { range: '80-89', min: 80, max: 89 },
    { range: '70-79', min: 70, max: 79 },
    { range: '60-69', min: 60, max: 69 },
    { range: '<60', min: 0, max: 59 },
  ];

  return brackets.map(({ range, min, max }) => {
    const in_bracket = applications.filter(
      (app) => app.resume.match_score >= min && app.resume.match_score <= max
    );

    const interviewed = in_bracket.filter((app) =>
      ['phone_screen', 'onsite', 'offer', 'accepted'].includes(app.status)
    );

    const interview_rate = in_bracket.length > 0 ? (interviewed.length / in_bracket.length) * 100 : 0;

    return {
      score_range: range,
      interview_rate: Math.round(interview_rate * 10) / 10,
    };
  });
}

/**
 * Predict interview likelihood based on match score
 */
export function predictInterviewLikelihood(
  match_score: number,
  historical_data: ApplicationRecord[]
): number {
  const score_buckets = calculateSuccessRateByMatchScore(historical_data);

  // Find the bucket for this match score
  let bucket_rate = 0.25; // Default 25%

  if (match_score >= 90) {
    bucket_rate = score_buckets.find((b) => b.score_range === '90-100')?.interview_rate || 50;
  } else if (match_score >= 80) {
    bucket_rate = score_buckets.find((b) => b.score_range === '80-89')?.interview_rate || 40;
  } else if (match_score >= 70) {
    bucket_rate = score_buckets.find((b) => b.score_range === '70-79')?.interview_rate || 30;
  } else if (match_score >= 60) {
    bucket_rate = score_buckets.find((b) => b.score_range === '60-69')?.interview_rate || 20;
  } else {
    bucket_rate = score_buckets.find((b) => b.score_range === '<60')?.interview_rate || 10;
  }

  return bucket_rate / 100; // Return as decimal (0.0 - 1.0)
}
