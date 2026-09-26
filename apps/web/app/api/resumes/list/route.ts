/**
 * GET /api/resumes/list
 * Get user's saved resumes with filtering and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Resume } from '@/lib/db';
import { verifyToken } from '@/lib/auth/auth-utils';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const jobTitle = searchParams.get('jobTitle');
    const tag = searchParams.get('tag');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = { userId };

    if (company) {
      query.companyName = { $regex: company, $options: 'i' };
    }

    if (jobTitle) {
      query.jobTitle = { $regex: jobTitle, $options: 'i' };
    }

    if (tag) {
      query.tags = tag;
    }

    // Get resumes
    const resumes = await Resume.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .select('-sections -jdInsights') // Exclude large fields for list view
      .lean();

    // Get statistics
    const stats = {
      total: resumes.length,
      byCompany: await Resume.aggregate([
        { $match: { userId } },
        { $group: { _id: '$companyName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      byTag: await Resume.aggregate([
        { $match: { userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    };

    return NextResponse.json({
      success: true,
      data: {
        resumes,
        stats,
      },
    });
  } catch (error) {
    console.error('List resumes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
