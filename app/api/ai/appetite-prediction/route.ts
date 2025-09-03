// app/api/ai/appetite-prediction/route.ts
import { predictCarrierAppetite } from '@/app/services/openai-service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const placement = await request.json();
    
    // Mock carriers for testing
    const mockCarriers = [
      { name: "Intact Insurance", provinces: ["ON", "BC", "AB"] },
      { name: "Aviva Canada", provinces: ["ON", "QC", "BC"] },
      { name: "Northbridge", provinces: ["ON", "AB", "BC"] },
      { name: "Wawanesa", provinces: ["ON", "MB", "AB"] },
      { name: "Chubb", provinces: ["ON", "BC", "QC"] }
    ];
    
    // Filter carriers by province
    const eligibleCarriers = mockCarriers.filter(carrier => 
      carrier.provinces.includes(placement.province)
    );
    
    // Get AI predictions
    const predictions = await predictCarrierAppetite(placement, eligibleCarriers);
    
    return NextResponse.json({
      success: true,
      placement: placement,
      predictions: predictions,
      totalCarriersAnalyzed: eligibleCarriers.length
    });
    
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
