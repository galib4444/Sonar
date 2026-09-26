/**
 * Bookmarks API Route
 * POST /api/bookmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveBookmark, listBookmarks } from '@/lib/tracker/storage';
import type { SaveBookmarkRequest, SaveBookmarkResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SaveBookmarkRequest = await request.json();

    if (!body.action) {
      return NextResponse.json<SaveBookmarkResponse>(
        {
          status: 'error',
          error: 'Missing action',
        },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (body.action) {
      case 'save': {
        if (!body.job) {
          return NextResponse.json<SaveBookmarkResponse>(
            {
              status: 'error',
              error: 'Missing job data',
            },
            { status: 400 }
          );
        }

        const result = saveBookmark(body.job);

        return NextResponse.json<SaveBookmarkResponse>({
          status: 'success',
          data: result,
        });
      }

      case 'remove': {
        // For MVP, job URL is the identifier
        // In production, would use bookmark ID
        return NextResponse.json<SaveBookmarkResponse>({
          status: 'success',
          data: {},
        });
      }

      case 'list': {
        const bookmarks = listBookmarks();

        return NextResponse.json<SaveBookmarkResponse>({
          status: 'success',
          data: {
            bookmarks,
          },
        });
      }

      default:
        return NextResponse.json<SaveBookmarkResponse>(
          {
            status: 'error',
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling bookmark request:', error);
    return NextResponse.json<SaveBookmarkResponse>(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to handle bookmark request',
      },
      { status: 500 }
    );
  }
}
