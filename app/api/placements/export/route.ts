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

    // Convert to CSV - using only fields that exist in the schema
    const headers = session.user.role === 'admin' 
      ? ['Reference Number', 'User Email', 'User Name', 'Business Name', 'City', 'Province', 'Revenue', 'Status', 'Created Date']
      : ['Reference Number', 'Business Name', 'City', 'Province', 'Revenue', 'Status', 'Created Date'];

    const rows = placements.map(p => {
      const baseRow = [
        p.referenceNumber || '',
        p.businessName || '',
        p.city || '',
        p.province || '',
        p.revenue?.toString() || '0',
        p.status || '',
        new Date(p.createdAt).toLocaleDateString()
      ];

      if (session.user.role === 'admin') {
        // Add user info at the beginning for admin export
        return [
          p.referenceNumber || '',
          p.user?.email || '',
          p.user?.name || '',
          p.businessName || '',
          p.city || '',
          p.province || '',
          p.revenue?.toString() || '0',
          p.status || '',
          new Date(p.createdAt).toLocaleDateString()
        ];
      }

      return baseRow;
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
