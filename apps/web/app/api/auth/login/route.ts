import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/auth/mongodb';
import User from '@/lib/models/User';
import { verifyPassword, generateToken } from '@/lib/auth/auth-utils';
import { errorLogger } from '@/lib/utils/error-logger';

export async function POST(request: NextRequest) {
  const source = 'API:/api/auth/login';
  console.log('🔵 [API LOGIN] Request received');

  try {
    const body = await request.json();
    const { email, password } = body;
    console.log('📧 [API LOGIN] Email:', email);
    console.log('🔑 [API LOGIN] Password provided:', !!password);

    // Validation
    if (!email || !password) {
      console.error('❌ [API LOGIN] Missing fields');
      return NextResponse.json(
        { error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    console.log('🔌 [API LOGIN] Connecting to database...');
    const db = await connectDB();

    // Local-only mode (no MongoDB)
    if (!db) {
      console.log('🏠 [API LOGIN] Running in local-only mode');
      // Accept any credentials in development
      const token = await generateToken({
        id: 'local-user',
        email: email,
        role: 'user',
      });

      return NextResponse.json({
        message: 'Login successful (local mode)',
        token,
        user: {
          id: 'local-user',
          name: email.split('@')[0],
          email: email,
          role: 'user',
        },
      });
    }

    console.log('✅ [API LOGIN] Database connected');

    // Find user
    console.log('🔍 [API LOGIN] Looking up user...');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.error('❌ [API LOGIN] User not found:', email);
      return NextResponse.json(
        { error: 'No account found with this email address. Please register first.' },
        { status: 401 }
      );
    }
    console.log('✅ [API LOGIN] User found:', user.email);

    // Verify password
    console.log('🔐 [API LOGIN] Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      console.error('❌ [API LOGIN] Invalid password');
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }
    console.log('✅ [API LOGIN] Password verified');

    // Generate token
    console.log('🎫 [API LOGIN] Generating token...');
    const token = await generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    console.log('✅ [API LOGIN] Token generated');

    console.log('✅ [API LOGIN] Login successful for:', user.email);
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('💥 [API LOGIN] Server error:', error);

    errorLogger.log(
      error as Error,
      source,
      {
        route: '/api/auth/login',
        method: 'POST',
      }
    );

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

