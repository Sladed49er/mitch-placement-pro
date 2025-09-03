// app/api/naics/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hardcoded NAICS codes to ensure the app works
    const naicsCodes = [
      { id: '1', code: '236210', description: 'Industrial Building Construction' },
      { id: '2', code: '236220', description: 'Commercial and Institutional Building Construction' },
      { id: '3', code: '238210', description: 'Electrical Contractors' },
      { id: '4', code: '238220', description: 'Plumbing & HVAC Contractors' },
      { id: '5', code: '445110', description: 'Supermarkets and Grocery Stores' },
      { id: '6', code: '445120', description: 'Convenience Stores' },
      { id: '7', code: '541110', description: 'Offices of Lawyers' },
      { id: '8', code: '541211', description: 'Offices of Certified Public Accountants' },
      { id: '9', code: '541330', description: 'Engineering Services' },
      { id: '10', code: '541511', description: 'Custom Computer Programming' },
      { id: '11', code: '541512', description: 'Computer Systems Design Services' },
      { id: '12', code: '541611', description: 'Administrative Management Consulting' },
      { id: '13', code: '722511', description: 'Full-Service Restaurants' }
    ];
    
    return NextResponse.json(naicsCodes);
  } catch (error) {
    console.error('Error in NAICS route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NAICS codes' },
      { status: 500 }
    );
  }
}