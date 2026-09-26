// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/auth-utils';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const data = rateLimitMap.get(ip)!;
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
    return true;
  }
  
  if (data.count >= limit) {
    return false;
  }
  
  data.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  
  // Log all API requests
  console.log(`[${new Date().toISOString()}] ${method} ${pathname} - IP: ${ip}`);
  
  // Public routes - no auth required
  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Protected routes
  const protectedPaths = ['/dashboard', '/tailor', '/tracker', '/analytics', '/result'];
  const protectedApiPaths = ['/api/analyze-jd', '/api/tailor', '/api/tracker', '/api/analytics', '/api/parse-resume', '/api/star', '/api/bookmarks', '/api/follow-up', '/api/generate-pdf'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isProtectedApi = protectedApiPaths.some(path => pathname.startsWith(path));

  console.log(`🔍 [MIDDLEWARE] Path: ${pathname}, isPublic: ${isPublicRoute}, isProtected: ${isProtectedPath}`);

  // Check authentication for protected routes
  if (!isPublicRoute && (isProtectedPath || isProtectedApi)) {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log(`🎫 [MIDDLEWARE] Token found: ${!!token}`);
    console.log(`🍪 [MIDDLEWARE] All cookies: ${request.cookies.toString()}`);
    
    if (!token || !(await verifyToken(token))) {
      console.log(`❌ [MIDDLEWARE] No valid token, redirecting to login`);
      console.log(`🔍 [MIDDLEWARE] Token verification failed for token: ${token?.substring(0, 20)}...`);
      if (isProtectedApi) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
      // Redirect to login for protected pages
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log(`✅ [MIDDLEWARE] Token valid, allowing access to ${pathname}`);
  }
  
  // CORS headers for Chrome extension
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }
  
  // Rate limiting for AI endpoints
  if (pathname.startsWith('/api/analyze-jd') || pathname.startsWith('/api/tailor')) {
    if (!rateLimit(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // Add processing time header
  response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/tailor',
    '/tailor/:path*',
    '/tracker',
    '/tracker/:path*',
    '/analytics',
    '/analytics/:path*',
    '/result',
    '/result/:path*',
  ],
};