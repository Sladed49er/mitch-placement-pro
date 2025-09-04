// FILE: app/api/admin/carriers/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all carriers
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carriers = await prisma.carrier.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(carriers);
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
  }
}