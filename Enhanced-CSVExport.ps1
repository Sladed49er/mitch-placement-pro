# Enhanced-CSVExport.ps1
# Creates a detailed CSV export with all placement fields

Write-Host "📊 Enhancing CSV Export with all details..." -ForegroundColor Cyan

# First, let's create a test script to check what fields exist
Write-Host "📝 Creating field discovery script..." -ForegroundColor Yellow

$fieldDiscoveryScript = @'
// scripts/check-placement-fields.js
// Run this to see all available fields in a placement

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFields() {
  try {
    // Get one placement to see all fields
    const placement = await prisma.placement.findFirst({
      include: {
        user: true
      }
    });
    
    if (placement) {
      console.log('Available fields in Placement model:');
      console.log('=====================================');
      Object.keys(placement).forEach(key => {
        const value = placement[key];
        const type = typeof value;
        console.log(`- ${key}: ${type} (sample: ${JSON.stringify(value)?.substring(0, 50)}...)`);
      });
    } else {
      console.log('No placements found. Create one first to see fields.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();
'@

$fieldDiscoveryScript | Out-File -FilePath "scripts\check-placement-fields.js" -Encoding UTF8

Write-Host "✅ Field discovery script created!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Run this to see all available fields:" -ForegroundColor Cyan
Write-Host "   node scripts/check-placement-fields.js" -ForegroundColor White
Write-Host ""

# Now create the enhanced CSV export
Write-Host "📝 Creating enhanced CSV export..." -ForegroundColor Yellow

$enhancedCsvExportContent = @'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    // If admin, get all placements. Otherwise, just user's placements
    const whereClause = session.user.role === 'admin' 
      ? {} 
      : { userId: session.user.id };

    const placements = await prisma.placement.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Enhanced headers with all possible fields from the placement form
    const headers = [
      // Metadata
      'Reference Number',
      'Status',
      'Created Date',
      'Updated Date',
      
      // User info (admin only)
      ...(session.user.role === 'admin' ? ['User Email', 'User Name'] : []),
      
      // Business Basic Info
      'Business Name',
      'Business Type',
      'Industry Code',
      'Industry Description',
      'Year Established',
      'Number of Employees',
      'Annual Revenue',
      
      // Location Info
      'Address',
      'City',
      'Province',
      'Postal Code',
      
      // Contact Info (if these fields exist)
      'Contact Email',
      'Contact Phone',
      
      // Risk/Coverage Details (from ComparativeRater if saved)
      'Building Value',
      'Contents Value',
      'Liability Limit',
      'Deductible',
      
      // Carrier Selection
      'Selected Carriers',
      'Number of Carriers Selected',
      
      // AI Predictions
      'AI Predictions',
      'AI Confidence Score',
      
      // Additional fields that might exist
      'Notes',
      'Submission Type',
      'Effective Date',
      'Expiry Date'
    ];

    const rows = placements.map(p => {
      // Parse JSON fields safely
      let selectedCarriersList = [];
      let aiPredictionData = null;
      
      try {
        if (p.selectedCarriers) {
          if (typeof p.selectedCarriers === 'string') {
            selectedCarriersList = JSON.parse(p.selectedCarriers);
          } else if (Array.isArray(p.selectedCarriers)) {
            selectedCarriersList = p.selectedCarriers;
          }
        }
      } catch (e) {
        console.log('Error parsing selectedCarriers:', e);
      }
      
      try {
        if (p.aiPredictions) {
          if (typeof p.aiPredictions === 'string') {
            aiPredictionData = JSON.parse(p.aiPredictions);
          } else {
            aiPredictionData = p.aiPredictions;
          }
        }
      } catch (e) {
        console.log('Error parsing aiPredictions:', e);
      }

      const row = [
        // Metadata
        p.referenceNumber || '',
        p.status || 'draft',
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
        p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '',
        
        // User info (admin only)
        ...(session.user.role === 'admin' ? [
          p.user?.email || '',
          p.user?.name || ''
        ] : []),
        
        // Business Basic Info
        p.businessName || '',
        p.businessType || '',
        p.industryCode || '',
        p.industryDescription || '',
        p.yearEstablished || '',
        p.employees || '',
        p.revenue || '0',
        
        // Location Info
        p.address || '',
        p.city || '',
        p.province || '',
        p.postalCode || '',
        
        // Contact Info (check if these exist)
        p.email || '',
        p.phone || '',
        
        // Risk/Coverage Details (check if these exist)
        p.buildingValue || '',
        p.contentsValue || '',
        p.liabilityLimit || '',
        p.deductible || '',
        
        // Carrier Selection
        selectedCarriersList.join('; ') || '',
        selectedCarriersList.length.toString(),
        
        // AI Predictions - format nicely if it exists
        aiPredictionData ? 
          (typeof aiPredictionData === 'object' ? 
            JSON.stringify(aiPredictionData).substring(0, 500) : 
            aiPredictionData) : '',
        aiPredictionData?.confidence || '',
        
        // Additional fields
        p.notes || '',
        p.submissionType || '',
        p.effectiveDate ? new Date(p.effectiveDate).toLocaleDateString() : '',
        p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
      ];

      return row;
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape commas, quotes, and newlines in cell content
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Add BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Return CSV file
    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="placements-detailed-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting placements:', error);
    return NextResponse.json(
      { error: 'Failed to export placements' }, 
      { status: 500 }
    );
  }
}
'@

$enhancedCsvExportContent | Out-File -FilePath "app\api\placements\export\route.ts" -Encoding UTF8

Write-Host "✅ Enhanced CSV export created!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 The enhanced export now attempts to include:" -ForegroundColor Cyan
Write-Host "   - All business details entered" -ForegroundColor White
Write-Host "   - Complete location information" -ForegroundColor White
Write-Host "   - Industry codes and descriptions" -ForegroundColor White
Write-Host "   - Selected carriers list" -ForegroundColor White
Write-Host "   - AI predictions (if any)" -ForegroundColor White
Write-Host "   - All metadata (dates, status, reference)" -ForegroundColor White
Write-Host "   - Any additional fields that exist" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To deploy:" -ForegroundColor Cyan
Write-Host "   1. First, check what fields exist:" -ForegroundColor Yellow
Write-Host "      node scripts/check-placement-fields.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Then deploy the enhanced export:" -ForegroundColor Yellow
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "      git commit -m 'Add detailed CSV export with all placement fields'" -ForegroundColor Gray
Write-Host "      git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Note: Fields that don't exist will show as empty columns." -ForegroundColor Yellow
Write-Host "   This way the export won't break but will include everything available." -ForegroundColor Yellow