/**
 * Update Application API Route
 * POST /api/tracker/update
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateApplication } from '@/lib/tracker/storage';
import type { ApplicationRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: {
      id: string;
      updates: Partial<Omit<ApplicationRecord, 'id' | 'user_id'>>;
    } = await request.json();

    if (!body.id || !body.updates) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Missing id or updates',
        },
        { status: 400 }
      );
    }

    const updated = updateApplication(body.id, body.updates);

    if (!updated) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { application: updated },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to update application',
      },
      { status: 500 }
    );
  }
}
