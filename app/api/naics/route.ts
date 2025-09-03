import { NextResponse } from 'next/server';
import carriersData from '@/data/carriers-data.json';

export async function GET() {
  try {
    // Return the NAICS codes array from the JSON
    return NextResponse.json(carriersData.naicsCodes);
  } catch (error) {
    console.error('Error loading NAICS codes:', error);
    return NextResponse.json(
      { error: 'Failed to load NAICS codes' },
      { status: 500 }
    );
  }
}