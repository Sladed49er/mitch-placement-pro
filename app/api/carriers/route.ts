import { NextResponse } from 'next/server';
import carriersData from '@/data/carriers-data.json';

export async function GET() {
  try {
    // Return just the carriers array from the JSON
    return NextResponse.json(carriersData.carriers);
  } catch (error) {
    console.error('Error loading carriers:', error);
    return NextResponse.json(
      { error: 'Failed to load carriers' },
      { status: 500 }
    );
  }
}