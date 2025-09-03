// app/api/naics/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const naicsCodes = await prisma.nAICSCode.findMany({
      orderBy: {
        code: 'asc'
      }
    });
    
    return NextResponse.json(naicsCodes);
  } catch (error) {
    console.error('Error fetching NAICS codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NAICS codes' },
      { status: 500 }
    );
  }
}