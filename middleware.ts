// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Custom logic can go here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
);

// Protect these routes - users must be logged in to access
export const config = {
  matcher: [
    '/placement/:path*',
    '/dashboard/:path*',
    '/placements/:path*',
    '/admin/:path*',
    '/api/placements/:path*',
    '/api/ai/:path*',
  ]
};