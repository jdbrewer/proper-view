import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an agent route
  if (request.nextUrl.pathname.startsWith('/agent')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/agent/login') {
      return NextResponse.next();
    }

    // For client-side auth, we'll let the client handle the redirect
    // The AuthProvider will handle the auth state and redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/agent/:path*',
}; 