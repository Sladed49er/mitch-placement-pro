import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const carriers = await prisma.carrier.findMany({
      include: {
        appetites: {
          include: {
            naics: true
          }
        }
      }
    })
    return NextResponse.json(carriers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 })
  }
}