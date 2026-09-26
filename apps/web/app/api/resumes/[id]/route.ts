/**
 * GET /api/resumes/[id] - Get a specific resume
 * DELETE /api/resumes/[id] - Delete a resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Resume } from '@/lib/db';
import { verifyToken } from '@/lib/auth/auth-utils';

// GET - Retrieve a specific resume
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Find resume
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    console.error('Get resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Delete resume
    const result = await Resume.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
