// app/admin/page.tsx
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  
  // Check if user is logged in and is an admin
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      agency: true,
      _count: {
        select: { placements: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Get all placements with user info
  const recentPlacements = await prisma.placement.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          agency: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Get activity logs
  const recentActivity = await prisma.activityLog.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // Get stats
  const totalUsers = await prisma.user.count();
  const totalPlacements = await prisma.placement.count();
  const totalAgencies = await prisma.agency.count();
  
  const todayPlacements = await prisma.placement.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">System Overview</p>
            </div>
            <div className="space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                User Dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Placements</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalPlacements}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Agencies</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalAgencies}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Today's Placements</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{todayPlacements}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || 'No name'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user.agency?.name || 'No agency'} • {user.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user._count.placements} placements
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Placements */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Placements</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {recentPlacements.map((placement) => (
                <div key={placement.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {placement.businessName}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {placement.user?.name || placement.user?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {placement.user?.agency?.name || 'Independent'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        placement.status === 'bound' ? 'bg-green-100 text-green-800' :
                        placement.status === 'quoted' ? 'bg-yellow-100 text-yellow-800' :
                        placement.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {placement.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(placement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.action === 'login' ? 'bg-green-500' :
                      activity.action === 'registration' ? 'bg-blue-500' :
                      activity.action === 'placement_created' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user?.name || activity.user?.email}</span>
                        <span className="text-gray-500"> {activity.action.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}