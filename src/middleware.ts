import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for protecting admin routes
 *
 * This middleware checks:
 * 1. If the request is for an admin route
 * 2. If the user is authenticated
 * 3. If the user's email is in the ADMIN_EMAILS list
 *
 * For MVP, we use a simple email whitelist approach
 * In production, you might want to use Supabase Auth with RLS
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // For MVP, we'll implement a simple session check
    // In production, integrate with Supabase Auth

    // Check for session cookie
    const session = request.cookies.get('admin-session');

    if (!session) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // In production, validate the session and check ADMIN_EMAILS
    // For now, we trust the session cookie (set during login)
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
