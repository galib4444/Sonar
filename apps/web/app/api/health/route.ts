/**
 * Health Check API Route
 * GET /api/health
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HustlerAI API',
    version: '1.0.0',
  });
}
