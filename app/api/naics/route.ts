import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const naicsCodes = await prisma.nAICSCode.findMany({
      orderBy: { category: 'asc' }
    })
    return NextResponse.json(naicsCodes)
  } catch (error) {
    console.error('NAICS fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch NAICS codes' }, { status: 500 })
  }
}