import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {session.user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/placement" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">New Placement</h2>
            <p className="text-gray-600">Create a new insurance placement</p>
          </Link>

          <Link href="/placements" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">View Placements</h2>
            <p className="text-gray-600">See all your placements</p>
          </Link>

          <Link href="/auth/signout" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Sign Out</h2>
            <p className="text-gray-600">Log out of your account</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
