import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs before any page is rendered
export function middleware(request: NextRequest) {
  // Just pass through all requests without modification
  // This ensures Next.js properly initializes its context
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  // Apply this middleware to all routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};