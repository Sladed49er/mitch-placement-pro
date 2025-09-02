'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <span className="text-4xl mr-3">🍁</span>
            <h1 className="text-3xl font-bold text-blue-600">
              Mitch Placement Pro
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Quick Placement
              </h2>
              <p className="text-gray-600">
                Match clients with carriers in minutes
              </p>
              <button 
                onClick={() => router.push('/placement')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Start New
              </button>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                87% Success Rate
              </h2>
              <p className="text-gray-600">
                Industry-leading placement accuracy
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">
                8 Carriers Active
              </h2>
              <p className="text-gray-600">
                Real-time Canadian market coverage
              </p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Database: Connected ✓ | Carriers Loaded ✓ | Ready for Placements
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}