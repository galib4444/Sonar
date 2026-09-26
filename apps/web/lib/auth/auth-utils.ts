import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('🔐 [AUTH UTILS] Verifying token:', token.substring(0, 20) + '...');
    console.log('🔐 [AUTH UTILS] JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
    const { payload } = await jwtVerify(token, secret);
    console.log('✅ [AUTH UTILS] Token verified successfully:', payload);
    return payload as JWTPayload;
  } catch (error) {
    console.error('❌ [AUTH UTILS] Token verification failed:', error);
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

