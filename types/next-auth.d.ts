// FILE: types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;  // Required - every user has a role
      agencyId?: string;
      agencyName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;  // Required - every user has a role
    agencyId?: string;
    agencyName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string;
    name?: string | null;
    role: string;  // Required - every user has a role
    agencyId?: string;
    agencyName?: string;
  }
}