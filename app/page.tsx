// app/page.tsx
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session) {
    // User is logged in - show dashboard-like content
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user.name || session.user.email}!
            </h1>
            <p className="text-gray-600 mb-8">
              {session.user.agencyName && `${session.user.agencyName} • `}
              Ready to streamline your insurance placements?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Placement</h3>
                <p className="text-sm text-blue-700 mb-4">Start a new placement in under 3 minutes</p>
                <Link
                  href="/placement"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start New
                </Link>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">My Dashboard</h3>
                <p className="text-sm text-green-700 mb-4">View your placements and stats</p>
                <Link
                  href="/dashboard"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View Dashboard
                </Link>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Placements</h3>
                <p className="text-sm text-purple-700 mb-4">Manage all your placements</p>
                <Link
                  href="/placements"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  View All
                </Link>
              </div>
            </div>

            <div className="border-t pt-4">
              <Link 
                href="/api/auth/signout"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is not logged in - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Mitch Placement Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Commercial Insurance Placement System for Canadian Brokers
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Reduce placement time from hours to minutes
            </h2>
            <p className="text-gray-600 mb-6">
              AI-powered carrier matching with 75+ Canadian insurance carriers. 
              Get instant appetite predictions and streamline your workflow.
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full px-6 py-3 text-center bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Sign In to Your Account
              </Link>
              
              <Link
                href="/auth/signup"
                className="block w-full px-6 py-3 text-center bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Create New Account
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Demo Credentials: demo@mitchinsurance.com / demo123
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">75+</div>
              <div className="text-gray-600">Canadian Carriers</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600 mb-2">3 min</div>
              <div className="text-gray-600">Average Placement Time</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
              <div className="text-gray-600">Powered Predictions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}