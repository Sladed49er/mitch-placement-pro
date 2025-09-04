// app/api/auth/[...nextauth]/route.ts
import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

// Export named exports for App Router
export { handler as GET, handler as POST };