// app/api/placements/match/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Placement match request:', body);
    
    // Extract placement details
    const { 
      businessDetails: { 
        industry, 
        annualRevenue, 
        numberOfEmployees,
        yearsInBusiness,
        lossHistory 
      },
      clientInfo: {
        province
      }
    } = body;
    
    // All available carriers
    const allCarriers = [
      {
        id: '1',
        carrierId: 'intact-001',
        name: 'Intact Insurance',
        amBestRating: 'A+',
        provinces: ['ON', 'QC', 'BC', 'AB'],
        minPremium: 2500,
        maxRevenue: 50000000,
        commissionNew: 15,
        commissionRenewal: 12.5,
        responseTime: '2-4 hours',
        apiEnabled: true,
        partnerStatus: 'Preferred',
        specialties: ['Construction', 'Retail', 'Professional'],
        notes: 'Preferred partner - fast response times'
      },
      {
        id: '2',
        carrierId: 'aviva-001',
        name: 'Aviva Canada',
        amBestRating: 'A',
        provinces: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK'],
        minPremium: 3000,
        maxRevenue: 40000000,
        commissionNew: 12,
        commissionRenewal: 10,
        responseTime: '4-6 hours',
        apiEnabled: true,
        partnerStatus: 'Standard',
        specialties: ['Retail', 'Hospitality', 'Technology'],
        notes: 'Good for retail and hospitality sectors'
      },
      {
        id: '3',
        carrierId: 'northbridge-001',
        name: 'Northbridge Insurance',
        amBestRating: 'A',
        provinces: ['ON', 'QC', 'BC', 'AB'],
        minPremium: 5000,
        maxRevenue: 75000000,
        commissionNew: 14,
        commissionRenewal: 12,
        responseTime: '3-5 hours',
        apiEnabled: false,
        partnerStatus: 'Standard',
        specialties: ['Construction', 'Manufacturing', 'Transportation'],
        notes: 'Strong in construction and contractors'
      },
      {
        id: '4',
        carrierId: 'wawanesa-001',
        name: 'Wawanesa Insurance',
        amBestRating: 'A+',
        provinces: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB'],
        minPremium: 2000,
        maxRevenue: 30000000,
        commissionNew: 13,
        commissionRenewal: 11,
        responseTime: '2-3 hours',
        apiEnabled: true,
        partnerStatus: 'Preferred',
        specialties: ['Small Business', 'Professional', 'Retail'],
        notes: 'Excellent for small to medium businesses'
      }
    ];
    
    // Filter and score carriers
    const matchedCarriers = allCarriers
      .filter(carrier => {
        // Check province coverage
        if (province && !carrier.provinces.includes(province)) {
          return false;
        }
        
        // Check revenue limits
        const revenue = parseInt(annualRevenue) || 0;
        if (revenue > carrier.maxRevenue) {
          return false;
        }
        
        return true;
      })
      .map(carrier => {
        let matchScore = 50; // Base score
        
        // Province match
        if (province && carrier.provinces.includes(province)) {
          matchScore += 20;
        }
        
        // Revenue fit
        const revenue = parseInt(annualRevenue) || 0;
        if (revenue < carrier.maxRevenue * 0.5) {
          matchScore += 15; // Well within limits
        } else if (revenue < carrier.maxRevenue * 0.8) {
          matchScore += 10; // Within comfortable limits
        }
        
        // Partner status bonus
        if (carrier.partnerStatus === 'Preferred') {
          matchScore += 15;
        }
        
        // API enabled bonus
        if (carrier.apiEnabled) {
          matchScore += 10;
        }
        
        // Loss history consideration
        if (lossHistory === 'No claims (5+ years)') {
          matchScore += 10;
        } else if (lossHistory === '1-2 claims') {
          matchScore -= 5;
        } else if (lossHistory === '3+ claims') {
          matchScore -= 15;
        }
        
        // Ensure score is between 0 and 100
        matchScore = Math.min(100, Math.max(0, matchScore));
        
        return {
          ...carrier,
          matchScore,
          recommended: matchScore >= 75
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    
    // Return array directly (not wrapped in object)
    return NextResponse.json(matchedCarriers);
    
  } catch (error) {
    console.error('Error matching carriers:', error);
    
    // Return empty array on error so frontend doesn't break
    return NextResponse.json([]);
  }
}