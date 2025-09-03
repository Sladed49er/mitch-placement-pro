import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const placements = await prisma.placement.findMany({
      where: { 
        userId: session.user.id 
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      select: {
        id: true,
        referenceNumber: true,
        businessName: true,
        status: true,
        createdAt: true,
        city: true,
        province: true,
        revenue: true
      }
    });

    return NextResponse.json(placements);
  } catch (error) {
    console.error('Error fetching placements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch placements' }, 
      { status: 500 }
    );
  }
}
