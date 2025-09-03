import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to your agency settings file
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'agency-carrier-settings.json');

// GET - Retrieve agency settings
export async function GET() {
  try {
    // Read the settings file
    const fileContent = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(fileContent);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading agency settings:', error);
    
    // If file doesn't exist, return empty settings
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json({
        agencyInfo: {},
        carrierSettings: []
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to load agency settings' },
      { status: 500 }
    );
  }
}

// POST - Update a specific carrier's settings
export async function POST(request: NextRequest) {
  try {
    const updatedCarrierData = await request.json();
    
    // Read current settings
    const fileContent = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(fileContent);
    
    // Find and update the specific carrier
    const carrierIndex = settings.carrierSettings.findIndex(
      (carrier: any) => carrier.carrierId === updatedCarrierData.carrierId
    );
    
    if (carrierIndex === -1) {
      // Add new carrier if it doesn't exist
      settings.carrierSettings.push({
        ...updatedCarrierData,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin' // You can get this from session later
      });
    } else {
      // Update existing carrier
      settings.carrierSettings[carrierIndex] = {
        ...settings.carrierSettings[carrierIndex],
        ...updatedCarrierData,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin' // You can get this from session later
      };
    }
    
    // Write back to file
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carrier settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating agency settings:', error);
    return NextResponse.json(
      { error: 'Failed to update agency settings' },
      { status: 500 }
    );
  }
}

// PUT - Update entire agency info
export async function PUT(request: NextRequest) {
  try {
    const { agencyInfo } = await request.json();
    
    // Read current settings
    const fileContent = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(fileContent);
    
    // Update agency info
    settings.agencyInfo = {
      ...settings.agencyInfo,
      ...agencyInfo,
      lastUpdated: new Date().toISOString()
    };
    
    // Write back to file
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agency info updated successfully' 
    });
  } catch (error) {
    console.error('Error updating agency info:', error);
    return NextResponse.json(
      { error: 'Failed to update agency info' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a carrier from settings
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carrierId = searchParams.get('carrierId');
    
    if (!carrierId) {
      return NextResponse.json(
        { error: 'Carrier ID is required' },
        { status: 400 }
      );
    }
    
    // Read current settings
    const fileContent = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(fileContent);
    
    // Remove the carrier
    settings.carrierSettings = settings.carrierSettings.filter(
      (carrier: any) => carrier.carrierId !== carrierId
    );
    
    // Write back to file
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carrier removed from settings' 
    });
  } catch (error) {
    console.error('Error removing carrier:', error);
    return NextResponse.json(
      { error: 'Failed to remove carrier' },
      { status: 500 }
    );
  }
}