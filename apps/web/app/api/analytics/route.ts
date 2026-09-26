/**
 * Analytics API Route
 * POST /api/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { listApplications } from '@/lib/tracker/storage';
import { calculateAnalytics } from '@/lib/analytics/calculations';
import type { AnalyticsRequest, AnalyticsResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsRequest = await request.json();

    // Get all applications for the user
    const { applications } = listApplications();

    // Parse time range if provided
    let time_range: { start: Date; end: Date } | undefined;
    if (body.time_range) {
      time_range = {
        start: new Date(body.time_range.start),
        end: new Date(body.time_range.end),
      };
    }

    // Calculate analytics
    const analytics = calculateAnalytics(applications, time_range);

    return NextResponse.json<AnalyticsResponse>({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json<AnalyticsResponse>(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to calculate analytics',
      },
      { status: 500 }
    );
  }
}
