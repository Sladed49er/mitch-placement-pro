import { NextResponse } from 'next/server';
import carriersData from '@/data/carriers-data.json';

export async function GET() {
  try {
    // Destructure to get carriers array and other data if needed
    const { carriers, naicsCodes, metadata } = carriersData;
    
    // Option 1: Return just the carriers array (maintains backward compatibility)
    return NextResponse.json(carriers);
    
    // Option 2: If you want to return more comprehensive data:
    // return NextResponse.json({
    //   carriers,
    //   totalCarriers: metadata.totalCarriers,
    //   lastUpdated: metadata.lastUpdated
    // });
    
  } catch (error) {
    console.error('Error loading carriers:', error);
    return NextResponse.json(
      { error: 'Failed to load carriers' },
      { status: 500 }
    );
  }
}