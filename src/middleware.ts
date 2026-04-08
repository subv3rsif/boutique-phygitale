import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for protecting admin routes and applying security headers
 *
 * This middleware:
 * 1. Checks for admin-token cookie presence (full verification happens in API routes)
 * 2. Applies security headers to all responses
 *
 * Note: We don't verify the token signature here because Edge Runtime doesn't support
 * Node.js crypto module. Token verification happens in API routes via requireAdminAuth().
 * This provides defense-in-depth: edge check + server-side verification.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/auth/admin') {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      // No token - redirect to admin login
      const loginUrl = new URL('/auth/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - let it through
    // Full verification happens in page/API route via requireAdminAuth()
  }

  // Apply security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Don't set CSP yet - Next.js inline scripts need tuning
  // Add when moving to production

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
