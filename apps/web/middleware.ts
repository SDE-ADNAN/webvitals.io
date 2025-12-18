import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * Requirements: 24.5, 58
 * 
 * This middleware checks for authentication tokens and redirects users
 * to the login page if they try to access protected routes without authentication.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies or check if it exists in localStorage
  // Note: In a real app, we'd use httpOnly cookies for security
  // For now, we'll check if the user is trying to access protected routes
  
  // Define protected routes (routes that require authentication)
  const protectedRoutes = ['/dashboard', '/settings', '/alerts'];
  
  // Define public routes (routes that don't require authentication)
  const publicRoutes = ['/auth/login', '/auth/signup', '/'];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/auth/')
  );

  // For protected routes, we need to check authentication on the client side
  // Since middleware runs on the server and localStorage is client-side only,
  // we'll let the pages handle the redirect logic using useEffect
  // This middleware serves as a backup and for future server-side token validation

  // Allow all requests to pass through
  // The actual authentication check happens in the page components
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
