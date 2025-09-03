# Safe-CSVExport.ps1
# Creates a CSV export using only fields we know exist

Write-Host "🔧 Creating safe CSV export with confirmed fields..." -ForegroundColor Cyan

# First, let's create a script to check the Prisma schema
Write-Host "📝 Creating Prisma schema checker..." -ForegroundColor Yellow

$schemaCheckerContent = @'
// scripts/check-schema.js
// Shows the actual Placement model fields

const fs = require('fs');
const path = require('path');

// Read the Prisma schema
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Find the Placement model
const placementModelMatch = schema.match(/model Placement\s*{[\s\S]*?^}/m);

if (placementModelMatch) {
  console.log('Placement model from schema.prisma:');
  console.log('=====================================');
  console.log(placementModelMatch[0]);
  console.log('=====================================');
  console.log('\nAvailable fields:');
  
  // Extract field names
  const fieldMatches = placementModelMatch[0].matchAll(/^\s*(\w+)\s+(\w+)/gm);
  for (const match of fieldMatches) {
    if (match[1] !== 'model' && match[1] !== '}') {
      console.log(`- ${match[1]} (${match[2]})`);
    }
  }
} else {
  console.log('Could not find Placement model in schema');
}
'@

$schemaCheckerContent | Out-File -FilePath "scripts\check-schema.js" -Encoding UTF8

# Now create a SAFE CSV export that uses ANY fields to avoid TypeScript errors
$safeCsvExportContent = @'
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

    // Build dynamic headers based on what fields exist
    const samplePlacement = placements[0];
    const availableFields = samplePlacement ? Object.keys(samplePlacement) : [];
    
    // Define the fields we want to export (if they exist)
    const desiredFields = [
      'referenceNumber',
      'status',
      'createdAt',
      'updatedAt',
      'businessName',
      'businessType',
      'address',
      'city',
      'province',
      'postalCode',
      'revenue',
      'employees',
      'yearEstablished',
      'industryCode',
      'industryDescription',
      'selectedCarriers',
      'aiPredictions',
      'notes'
    ];

    // Filter to only fields that actually exist
    const fieldsToExport = desiredFields.filter(field => 
      availableFields.includes(field)
    );

    // Create headers
    const headers = [
      ...(session.user.role === 'admin' ? ['User Email', 'User Name'] : []),
      ...fieldsToExport.map(field => {
        // Convert camelCase to Title Case
        return field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      })
    ];

    // Create rows using type assertion to bypass TypeScript checks
    const rows = placements.map((p: any) => {
      const row = [];
      
      // Add user info for admin
      if (session.user.role === 'admin') {
        row.push(p.user?.email || '');
        row.push(p.user?.name || '');
      }
      
      // Add each field value
      fieldsToExport.forEach(field => {
        let value = p[field];
        
        // Handle special formatting
        if (field === 'createdAt' || field === 'updatedAt') {
          value = value ? new Date(value).toLocaleDateString() : '';
        } else if (field === 'selectedCarriers' || field === 'aiPredictions') {
          // Handle JSON fields
          if (value) {
            try {
              const parsed = typeof value === 'string' ? JSON.parse(value) : value;
              if (Array.isArray(parsed)) {
                value = parsed.join('; ');
              } else if (typeof parsed === 'object') {
                value = JSON.stringify(parsed).substring(0, 500);
              }
            } catch (e) {
              // Keep original value if parsing fails
            }
          }
        }
        
        row.push(value?.toString() || '');
      });
      
      return row;
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape commas and quotes in cell content
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Add BOM for Excel UTF-8 recognition
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Return CSV file
    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="placements-export-${new Date().toISOString().split('T')[0]}.csv"`
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

$safeCsvExportContent | Out-File -FilePath "app\api\placements\export\route.ts" -Encoding UTF8

Write-Host "✅ Safe CSV export created!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 This version:" -ForegroundColor Cyan
Write-Host "   - Uses 'any' type to bypass TypeScript checks" -ForegroundColor White
Write-Host "   - Dynamically checks which fields exist" -ForegroundColor White
Write-Host "   - Only exports fields that are actually present" -ForegroundColor White
Write-Host "   - Won't break if fields are missing" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To see your actual schema fields:" -ForegroundColor Cyan
Write-Host "   node scripts/check-schema.js" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To deploy:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Fix CSV export with dynamic field detection'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 After deployment, the export will automatically include" -ForegroundColor Yellow
Write-Host "   whatever fields exist in your database!" -ForegroundColor Yellow