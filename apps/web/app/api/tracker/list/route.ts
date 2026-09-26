/**
 * List Applications API Route
 * GET /api/tracker/list
 */

import { NextRequest, NextResponse } from 'next/server';
import { listApplications } from '@/lib/tracker/storage';
import type { ListApplicationsResponse, ApplicationStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status_param = searchParams.get('status');
    const status = status_param ? (status_param.split(',') as ApplicationStatus[]) : undefined;

    const min_match_score = searchParams.get('min_match')
      ? parseInt(searchParams.get('min_match')!)
      : undefined;

    const min_salary = searchParams.get('min_salary')
      ? parseInt(searchParams.get('min_salary')!)
      : undefined;

    const company = searchParams.get('company') || undefined;

    const sort_by = (searchParams.get('sort_by') as 'roi_score' | 'match_score' | 'applied_date' | 'salary') ||
      'roi_score';

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Get filtered applications
    const result = listApplications({
      status,
      min_match_score,
      min_salary,
      company,
      sort_by,
      limit,
    });

    return NextResponse.json<ListApplicationsResponse>({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error listing applications:', error);
    return NextResponse.json<ListApplicationsResponse>(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to list applications',
      },
      { status: 500 }
    );
  }
}
