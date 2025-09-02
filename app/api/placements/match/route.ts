import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Get the NAICS code first
    const naics = await prisma.nAICSCode.findUnique({
      where: { code: data.naicsCode }
    })
    
    // Get all carriers with their appetites
    const carriers = await prisma.carrier.findMany({
      where: {
        provinces: {
          has: data.province
        },
        maxRevenue: {
          gte: parseFloat(data.revenue)
        }
      },
      include: {
        appetites: {
          where: {
            naicsCode: data.naicsCode
          }
        }
      }
    })

    // Calculate match scores
    const matches = carriers.map(carrier => {
      let score = 50 // Base score
      
      // Appetite score (0-40 points)
      if (carrier.appetites.length > 0) {
        score += (carrier.appetites[0].appetiteScore / 100) * 40
      }
      
      // Commission bonus (0-10 points)
      score += (carrier.commissionNew / 20) * 10
      
      // Partner bonus (10 points)
      if (carrier.mitchPartner) {
        score += 10
      }
      
      // Loss history penalty
      if (data.lossHistory === 'major') {
        score -= 20
      } else if (data.lossHistory === 'moderate') {
        score -= 10
      }
      
      // Calculate estimated premium
      const basePremium = parseFloat(data.revenue) * (naics?.baseRate || 0.01)
      const estimatedPremium = Math.round(basePremium)
      
      return {
        ...carrier,
        matchScore: Math.min(Math.round(score), 100),
        estimatedPremium
      }
    })
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore)
    
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Failed to match carriers' }, { status: 500 })
  }
}
