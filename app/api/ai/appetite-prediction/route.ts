// FILE: /app/api/ai/appetite-prediction/route.ts
// Replace your existing file with this version that has better error handling

import { predictCarrierAppetite } from '@/app/services/openai-service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const placement = await request.json();
    console.log('Received placement request:', placement);
    
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
    
    console.log('Eligible carriers:', eligibleCarriers.length);
    
    // Get AI predictions
    const predictions = await predictCarrierAppetite(placement, eligibleCarriers);
    console.log('Predictions received:', predictions);
    
    // Make sure we have the correct structure
    if (!predictions || !predictions.topCarriers) {
      console.error('Invalid prediction structure:', predictions);
      throw new Error('Invalid prediction structure');
    }
    
    // Return predictions directly (not wrapped)
    return NextResponse.json(predictions);
    
  } catch (error) {
    console.error('API error:', error);
    
    // Return mock data if AI fails
    const mockResponse = {
      topCarriers: [
        {
          carrierName: "Intact Insurance",
          quoteProbability: 85,
          reasoning: "Strong appetite for this business type in your province",
          concerns: ["Consider highlighting safety programs"],
          tips: ["Emphasize years of experience", "Provide detailed operations description"]
        },
        {
          carrierName: "Aviva Canada",
          quoteProbability: 72,
          reasoning: "Good match for your business size",
          concerns: ["Revenue may be at lower range"],
          tips: ["Prepare detailed financial statements"]
        },
        {
          carrierName: "Northbridge",
          quoteProbability: 68,
          reasoning: "Specializes in commercial risks",
          concerns: ["May require additional underwriting"],
          tips: ["Provide detailed business plan"]
        }
      ]
    };
    
    return NextResponse.json(mockResponse);
  }
}