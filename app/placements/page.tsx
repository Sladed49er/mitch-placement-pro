// FILE: app/placements/page.tsx
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
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  coverageType: string[];
  effectiveDate?: string;
  expiryDate?: string;
  aiScore?: number;
  selectedCarriers?: string[];
}

export default function PlacementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPlacements();
    }
  }, [session]);

  const fetchUserPlacements = async () => {
    try {
      setError(null);
      const response = await fetch('/api/placements/user');
      
      if (response.ok) {
        const data = await response.json();
        setPlacements(data);
      } else {
        setError('Failed to fetch placements');
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
      setError('Error loading placements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (placement: Placement) => {
    setSelectedPlacement(placement);
    setShowDetail(true);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/placements/export');
      
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placements-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export placements');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Placements</h1>
            <div className="space-x-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <Link
                href="/placement"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                New Placement
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No placements found. 
                    <Link href="/placement" className="ml-2 text-blue-600 hover:text-blue-800">
                      Create your first placement
                    </Link>
                  </td>
                </tr>
              ) : (
                placements.map((placement) => (
                  <tr key={placement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {placement.referenceNumber.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{placement.businessName}</div>
                        <div className="text-xs text-gray-500">{placement.contactEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {placement.city}, {placement.province}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${placement.revenue?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        placement.status === 'submitted' 
                          ? 'bg-green-100 text-green-800'
                          : placement.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : placement.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {placement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(placement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetails(placement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPlacement && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Placement Details</h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedPlacement(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Business Information</h3>
                    <p className="text-sm"><span className="font-medium">Reference:</span> {selectedPlacement.referenceNumber}</p>
                    <p className="text-sm"><span className="font-medium">Business:</span> {selectedPlacement.businessName}</p>
                    <p className="text-sm"><span className="font-medium">Location:</span> {selectedPlacement.city}, {selectedPlacement.province}</p>
                    <p className="text-sm"><span className="font-medium">Revenue:</span> ${selectedPlacement.revenue?.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedPlacement.contactName}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedPlacement.contactEmail}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedPlacement.contactPhone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Coverage Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlacement.coverageType.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Status & Dates</h3>
                  <p className="text-sm"><span className="font-medium">Status:</span> {selectedPlacement.status}</p>
                  <p className="text-sm"><span className="font-medium">Created:</span> {new Date(selectedPlacement.createdAt).toLocaleString()}</p>
                  {selectedPlacement.effectiveDate && (
                    <p className="text-sm"><span className="font-medium">Effective Date:</span> {new Date(selectedPlacement.effectiveDate).toLocaleDateString()}</p>
                  )}
                  {selectedPlacement.expiryDate && (
                    <p className="text-sm"><span className="font-medium">Expiry Date:</span> {new Date(selectedPlacement.expiryDate).toLocaleDateString()}</p>
                  )}
                  {selectedPlacement.aiScore && (
                    <p className="text-sm"><span className="font-medium">AI Score:</span> {selectedPlacement.aiScore}%</p>
                  )}
                </div>

                {selectedPlacement.selectedCarriers && selectedPlacement.selectedCarriers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Selected Carriers</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlacement.selectedCarriers.map((carrier, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {carrier}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedPlacement(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}