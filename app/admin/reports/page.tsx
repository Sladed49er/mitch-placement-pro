// FILE: app/admin/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ReportData {
  users?: {
    total: number;
    active: number;
  };
  placements?: {
    total: number;
    byStatus: Array<{
      status: string;
      _count: { status: number };
    }>;
  };
  revenue?: {
    _avg: { revenue: number };
    _min: { revenue: number };
    _max: { revenue: number };
    _sum: { revenue: number };
  };
  topBrokers?: Array<{
    id: string;
    email: string;
    name: string;
    _count: { placements: number };
  }>;
  recentActivities?: Array<{
    id: string;
    action: string;
    createdAt: string;
    user: {
      email: string;
      name: string;
    };
  }>;
  [key: string]: any;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [reportType, setReportType] = useState('summary');
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [error, setError] = useState<string | null>(null);
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
      fetchReport();
    }
  }, [session, reportType, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      setExporting(true);
      // Create CSV content based on current report type
      let csvContent = '';
      const currentDate = new Date().toLocaleDateString();
      
      if (reportType === 'summary') {
        csvContent = `Summary Report - ${currentDate}\n\n`;
        csvContent += `Total Users,${reportData.users?.total || 0}\n`;
        csvContent += `Active Users,${reportData.users?.active || 0}\n`;
        csvContent += `Total Placements,${reportData.placements?.total || 0}\n`;
        csvContent += `Total Revenue,$${reportData.revenue?._sum?.revenue || 0}\n`;
        csvContent += `Average Revenue,$${Math.round(reportData.revenue?._avg?.revenue || 0)}\n\n`;
        
        csvContent += `Top Brokers\n`;
        csvContent += `Email,Name,Placements\n`;
        reportData.topBrokers?.forEach(broker => {
          csvContent += `${broker.email},${broker.name || 'N/A'},${broker._count.placements}\n`;
        });
      } else if (reportType === 'user-activity' && Array.isArray(reportData)) {
        csvContent = `User Activity Report - ${currentDate}\n`;
        csvContent += `Email,Name,Role,Placements,Total Revenue,Avg Revenue,Last Login\n`;
        reportData.forEach((user: any) => {
          csvContent += `${user.email},${user.name || 'N/A'},${user.role},${user._count.placements},`;
          csvContent += `$${user.totalRevenue || 0},$${Math.round(user.averageRevenue || 0)},`;
          csvContent += `${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}\n`;
        });
      } else if (reportType === 'geographic' && Array.isArray(reportData)) {
        csvContent = `Geographic Distribution Report - ${currentDate}\n`;
        csvContent += `Province,City,Count,Total Revenue,Avg Revenue\n`;
        reportData.forEach((location: any) => {
          csvContent += `${location.province},${location.city},${location._count.id},`;
          csvContent += `$${location._sum.revenue || 0},$${Math.round(location._avg.revenue || 0)}\n`;
        });
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading') {
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
            <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
            <div className="space-x-4">
              <button
                onClick={exportReport}
                disabled={exporting || loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export Report'}
              </button>
              <Link
                href="/admin/users"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/placements"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Manage Placements
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="summary">Summary Dashboard</option>
              <option value="user-activity">User Activity</option>
              <option value="placement-trends">Placement Trends</option>
              <option value="geographic">Geographic Distribution</option>
              <option value="carrier-performance">Carrier Performance</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border rounded"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border rounded"
              placeholder="End Date"
            />
            <button
              onClick={() => {
                setDateRange({ start: '', end: '' });
              }}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
            {error}
          </div>
        )}

        {/* Report Content */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-lg">Loading report...</div>
          </div>
        ) : (
          <div>
            {/* Summary Dashboard */}
            {reportType === 'summary' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{reportData.users?.total || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Active: {reportData.users?.active || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Total Placements</h3>
                    <p className="text-3xl font-bold text-gray-900">{reportData.placements?.total || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(reportData.revenue?._sum?.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Avg Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      ${Math.round(reportData.revenue?._avg?.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Placement Status Breakdown */}
                {reportData.placements?.byStatus && (
                  <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold mb-4">Placements by Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {reportData.placements.byStatus.map((item) => (
                        <div key={item.status} className="text-center p-4 bg-gray-50 rounded">
                          <p className="text-2xl font-bold text-gray-900">{item._count.status}</p>
                          <p className="text-sm text-gray-600 capitalize mt-1">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Brokers Table */}
                {reportData.topBrokers && reportData.topBrokers.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold mb-4">Top Performing Brokers</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Broker</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.topBrokers.map((broker) => (
                            <tr key={broker.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{broker.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{broker.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-900">{broker._count.placements}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                {reportData.recentActivities && reportData.recentActivities.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Recent System Activities</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {reportData.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.user.name || activity.user.email}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              performed: {activity.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* User Activity Report */}
            {reportType === 'user-activity' && Array.isArray(reportData) && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'broker'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user._count.placements}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${user.totalRevenue?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Math.round(user.averageRevenue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Placement Trends */}
            {reportType === 'placement-trends' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Monthly Placement Trends</h3>
                <div className="space-y-4">
                  {Object.entries(reportData).map(([month, data]: [string, any]) => (
                    <div key={month} className="border rounded p-4 hover:bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-3">{month}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Placements:</span>
                          <span className="ml-2 font-semibold">{data.count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Revenue:</span>
                          <span className="ml-2 font-semibold">${data.revenue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Top Status:</span>
                          <span className="ml-2 font-semibold capitalize">
                            {Object.entries(data.statuses).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Top Province:</span>
                          <span className="ml-2 font-semibold">
                            {Object.entries(data.provinces).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Distribution */}
            {reportType === 'geographic' && Array.isArray(reportData) && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((location: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{location.province}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{location.city}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{location._count.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${(location._sum.revenue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Math.round(location._avg.revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Carrier Performance */}
            {reportType === 'carrier-performance' && Array.isArray(reportData) && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((carrier: any) => (
                      <tr key={carrier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{carrier.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{carrier.totalPlacements}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${carrier.totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Math.round(carrier.averageRevenue).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            {Object.entries(carrier.statusBreakdown).map(([status, count]: any) => (
                              <div key={status} className="text-xs">
                                <span className="capitalize">{status}:</span>
                                <span className="ml-1 font-semibold">{count}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}