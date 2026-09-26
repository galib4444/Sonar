import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/auth/mongodb';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth/auth-utils';
import { errorLogger } from '@/lib/utils/error-logger';

export async function POST(request: NextRequest) {
  const source = 'API:/api/auth/register';

  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Local-only mode (no MongoDB)
    if (!db) {
      console.log('🏠 [API REGISTER] Running in local-only mode');
      const token = await generateToken({
        id: 'local-user',
        email: email,
        role: 'user',
      });

      return NextResponse.json({
        message: 'Registration successful (local mode)',
        token,
        user: {
          id: 'local-user',
          name: name,
          email: email,
          role: 'user',
        },
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Generate token
    const token = await generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('💥 [API REGISTER] Server error:', error);

    errorLogger.log(
      error as Error,
      source,
      {
        route: '/api/auth/register',
        method: 'POST',
      }
    );

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

