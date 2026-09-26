/**
 * POST /api/resumes/duplicate
 * Duplicate an existing resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Resume } from '@/lib/db';
import { verifyToken } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get user from JWT token
    const token = request.headers.get('authorization')?.split(' ')[1] ||
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.id;

    // Parse request body
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Missing required field: resumeId' },
        { status: 400 }
      );
    }

    // Find original resume
    const original = await Resume.findOne({ _id: resumeId, userId });

    if (!original) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Create duplicate
    const duplicate = new Resume({
      userId: original.userId,
      firstName: original.firstName,
      lastName: original.lastName,
      jobTitle: original.jobTitle,
      companyName: original.companyName,
      tags: [...original.tags, 'copy'],
      filename: original.filename.replace('.pdf', '_copy.pdf'),
      sections: original.sections,
      matchScore: original.matchScore,
      jdInsights: original.jdInsights,
    });

    await duplicate.save();

    return NextResponse.json({
      success: true,
      data: {
        resume_id: duplicate._id,
        filename: duplicate.filename,
      },
    });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
