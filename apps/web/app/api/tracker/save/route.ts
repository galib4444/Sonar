/**
 * Save Application API Route
 * POST /api/tracker/save
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveApplication } from '@/lib/tracker/storage';
import type { SaveApplicationRequest, SaveApplicationResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SaveApplicationRequest = await request.json();

    if (!body.application) {
      return NextResponse.json<SaveApplicationResponse>(
        {
          status: 'error',
          error: 'Missing application data',
        },
        { status: 400 }
      );
    }

    // Save the application
    const result = saveApplication(body.application);

    return NextResponse.json<SaveApplicationResponse>({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json<SaveApplicationResponse>(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to save application',
      },
      { status: 500 }
    );
  }
}
