import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/auth-utils';
import connectDB from '@/lib/auth/mongodb';
import User from '@/lib/models/User';
import { errorLogger } from '@/lib/utils/error-logger';

export async function GET(request: NextRequest) {
  const source = 'API:/api/auth/verify';

  try {
    console.log('🔍 [API VERIFY] Verify request received');

    // Try to get token from Authorization header first
    let token = getTokenFromRequest(request);
    console.log('🎫 [API VERIFY] Token from header:', !!token);

    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('token')?.value;
      console.log('🍪 [API VERIFY] Token from cookie:', !!token);
    }

    if (!token) {
      console.log('❌ [API VERIFY] No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    console.log('🔐 [API VERIFY] Verifying token...');
    const payload = await verifyToken(token);

    if (!payload) {
      console.log('❌ [API VERIFY] Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('✅ [API VERIFY] Token valid, looking up user:', payload.id);
    const db = await connectDB();

    // Local-only mode (no MongoDB)
    if (!db) {
      console.log('🏠 [API VERIFY] Running in local-only mode');
      return NextResponse.json({
        user: {
          id: payload.id,
          name: payload.email.split('@')[0],
          email: payload.email,
          role: payload.role,
        },
      });
    }

    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      console.log('❌ [API VERIFY] User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ [API VERIFY] User found:', user.email);
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('💥 [API VERIFY] Server error:', error);

    errorLogger.log(
      error as Error,
      source,
      {
        route: '/api/auth/verify',
        method: 'GET',
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

