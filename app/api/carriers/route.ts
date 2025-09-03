// app/api/carriers/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hardcoded carriers data
    const carriers = [
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
        appetiteScore: 95
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
        appetiteScore: 88
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
        appetiteScore: 82
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
        appetiteScore: 90
      }
    ];
    
    return NextResponse.json(carriers);
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carriers' },
      { status: 500 }
    );
  }
}