/**
 * ============================================
 * FILE: /app/api/placements/save/route.ts
 * LOCATION: Replace ENTIRE file at /app/api/placements/save/route.ts
 * PURPOSE: Save placement data to database
 * FIX: Changed streetAddress to address (line 30)
 * ============================================
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Create the placement with user association
    const placement = await prisma.placement.create({
      data: {
        userId: session.user.id,
        agencyId: session.user.agencyId,
        
        // Client info
        businessName: data.businessName,
        contactName: data.clientFirstName + ' ' + data.clientLastName,
        contactEmail: data.email,
        contactPhone: data.phone,
        address: data.address,  // FIXED: Changed from streetAddress to address
        postalCode: data.postalCode,
        city: data.city,
        province: data.province,
        
        // Business details
        businessType: data.industry,
        naicsCode: data.naicsCode || data.industry,  // Use industry as fallback
        revenue: data.revenue,
        employees: data.employees,
        yearsInBusiness: data.yearsInBusiness,
        
        // AI and matching
        aiPredictions: data.aiPredictions || {},
        aiScore: data.aiScore || null,
        matchResults: data.matchResults || {},
        selectedCarriers: data.selectedCarriers || [],
        
        // Status
        status: 'submitted',
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
      }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        placementId: placement.id,
        action: 'placement_created',
        details: {
          businessName: data.businessName,
          industry: data.industry
        }
      }
    });

    return NextResponse.json({
      success: true,
      placementId: placement.id,
      referenceNumber: placement.referenceNumber
    });
  } catch (error) {
    console.error('Error saving placement:', error);
    return NextResponse.json(
      { error: 'Failed to save placement' },
      { status: 500 }
    );
  }
}