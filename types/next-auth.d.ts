// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
      agencyId?: string;
      agencyName?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    agencyId?: string;
    agencyName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    agencyId?: string;
    agencyName?: string;
  }
}