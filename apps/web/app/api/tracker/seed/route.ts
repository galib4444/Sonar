/**
 * Seed Demo Data API Route
 * POST /api/tracker/seed
 */

import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/tracker/storage';

export async function POST() {
  try {
    seedDemoData();

    return NextResponse.json({
      status: 'success',
      message: 'Demo data seeded successfully',
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to seed demo data',
      },
      { status: 500 }
    );
  }
}
