# Add-CSVExport.ps1
# Adds CSV export functionality to placements

Write-Host "📊 Adding CSV Export functionality..." -ForegroundColor Cyan

# 1. Create CSV export API route
Write-Host "🔌 Creating CSV export API route..." -ForegroundColor Yellow

New-Item -ItemType Directory -Path "app\api\placements\export" -Force | Out-Null

$csvExportApiContent = @'
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
      p.user.email,
      p.user.name || '',
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
'@

$csvExportApiContent | Out-File -FilePath "app\api\placements\export\route.ts" -Encoding UTF8

# 2. Update user placements page with export button
Write-Host "📝 Adding export button to user placements page..." -ForegroundColor Yellow

$updatedPlacementsPageContent = @'
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Placement {
  id: string;
  referenceNumber: string;
  businessName: string;
  status: string;
  createdAt: string;
  city: string;
  province: string;
  revenue: number;
}

export default function PlacementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPlacements();
    }
  }, [session]);

  const fetchPlacements = async () => {
    try {
      setError(null);
      const response = await fetch('/api/placements/user');
      if (response.ok) {
        const data = await response.json();
        setPlacements(data);
      } else if (response.status === 401) {
        router.push('/auth/signin');
      } else {
        setError('Failed to load placements');
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
      setError('Error loading placements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/placements/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placements-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export placements. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading placements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchPlacements}
              className="mt-2 text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Placements</h1>
            <div className="space-x-4">
              {placements.length > 0 && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exporting ? 'Exporting...' : 'Export to CSV'}
                </button>
              )}
              <Link
                href="/placement"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                New Placement
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {placements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No placements</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new placement.</p>
            <div className="mt-6">
              <Link
                href="/placement"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create your first placement
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <p className="text-sm text-gray-500">
                Total placements: {placements.length}
              </p>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {placements.map((placement) => (
                    <tr key={placement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="font-mono text-xs">
                          {placement.referenceNumber.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {placement.businessName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {placement.city}, {placement.province}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${placement.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          placement.status === 'submitted' 
                            ? 'bg-green-100 text-green-800'
                            : placement.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {placement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(placement.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'@

$updatedPlacementsPageContent | Out-File -FilePath "app\placements\page.tsx" -Encoding UTF8

# 3. Update admin placements page with export button
Write-Host "📝 Adding export button to admin placements page..." -ForegroundColor Yellow

$updatedAdminPlacementsContent = @'
'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Placement {
  id: string;
  referenceNumber: string;
  businessName: string;
  status: string;
  createdAt: string;
  city: string;
  province: string;
  revenue: number;
  user: {
    email: string;
    name: string | null;
  };
}

export default function AdminPlacementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchPlacements();
    }
  }, [session]);

  const fetchPlacements = async () => {
    try {
      const response = await fetch('/api/admin/placements');
      if (response.ok) {
        const data = await response.json();
        setPlacements(data);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/placements/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-placements-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export placements. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin - All Placements</h1>
            <div className="space-x-4">
              {placements.length > 0 && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exporting ? 'Exporting...' : `Export All (${placements.length})`}
                </button>
              )}
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                All Users
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Total placements: {placements.length}
              </p>
              <p className="text-sm text-gray-500">
                Total revenue: ${placements.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {placements.map((placement) => (
                  <tr key={placement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {placement.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {placement.businessName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {placement.city}, {placement.province}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${placement.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {placement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(placement.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
'@

$updatedAdminPlacementsContent | Out-File -FilePath "app\admin\placements\page.tsx" -Encoding UTF8

Write-Host ""
Write-Host "✅ CSV Export functionality added!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 What's been added:" -ForegroundColor Cyan
Write-Host "   - Export button on user placements page" -ForegroundColor White
Write-Host "   - Export button on admin placements page (exports ALL)" -ForegroundColor White
Write-Host "   - CSV includes all placement details" -ForegroundColor White
Write-Host "   - Proper CSV formatting with escaped commas" -ForegroundColor White
Write-Host "   - Total revenue display for admins" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To deploy:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Add CSV export functionality for placements'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 The CSV export includes:" -ForegroundColor Yellow
Write-Host "   - All placement details" -ForegroundColor Gray
Write-Host "   - Client information" -ForegroundColor Gray
Write-Host "   - Business details" -ForegroundColor Gray
Write-Host "   - Selected carriers" -ForegroundColor Gray
Write-Host "   - AI predictions" -ForegroundColor Gray
Write-Host "   - User information (admin export only)" -ForegroundColor Gray