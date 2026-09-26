/**
 * POST /api/resumes/save
 * Save a resume with metadata for future use
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
    const {
      firstName,
      lastName,
      jobTitle,
      companyName,
      tags,
      filename,
      sections,
      pdfUrl,
      matchScore,
      jdInsights,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, filename' },
        { status: 400 }
      );
    }

    // Create new resume document
    const resume = new Resume({
      userId,
      firstName,
      lastName,
      jobTitle,
      companyName,
      tags: tags || [],
      filename,
      sections: sections || [],
      pdfUrl,
      matchScore,
      jdInsights,
    });

    await resume.save();

    return NextResponse.json({
      success: true,
      data: {
        resume_id: resume._id,
        filename: resume.filename,
        created_at: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Save resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
