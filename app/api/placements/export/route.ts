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

    // Convert to CSV
    const headers = [
      'Reference Number',
      'Created Date',
      'Status',
      'User Email',
      'User Name',
      'Client Name',
      'Business Name',
      'Address',
      'City',
      'Province',
      'Postal Code',
      'Phone',
      'Email',
      'Industry Code',
      'Industry Description',
      'Business Type',
      'Year Established',
      'Employees',
      'Annual Revenue',
      'Carriers Selected',
      'AI Predictions'
    ];

    const rows = placements.map(p => [
      p.referenceNumber,
      new Date(p.createdAt).toLocaleDateString(),
      p.status,
      p.user?.email || '',  // Fixed: Added optional chaining
      p.user?.name || '',    // Fixed: Added optional chaining
      p.clientName || '',
      p.businessName,
      p.address || '',
      p.city,
      p.province,
      p.postalCode || '',
      p.phone || '',
      p.email || '',
      p.industryCode || '',
      p.industryDescription || '',
      p.businessType || '',
      p.yearEstablished || '',
      p.employees || '',
      p.revenue || '',
      p.selectedCarriers ? JSON.parse(p.selectedCarriers as string).join('; ') : '',
      p.aiPredictions || ''
    ]);

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

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
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
