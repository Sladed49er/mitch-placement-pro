// FILE: app/admin/placements/page.tsx
// LOCATION: Replace ENTIRE file at app/admin/placements/page.tsx
// PURPOSE: Admin placement management with carrier management link in header
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Session } from 'next-auth';

// Extend the Session type locally to include our custom fields
interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    agencyId?: string;
    agencyName?: string;
    image?: string | null;
  };
}

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
  address?: string;
  businessType?: string;
  naicsCode?: string;
  naicsDescription?: string;
  employees?: number;
  yearsInBusiness?: number;
  coverageType: string[];
  effectiveDate?: string;
  expiryDate?: string;
  aiScore?: number;
  selectedCarriers?: string[];
  matchResults?: any;
  aiPredictions?: any;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  carrier?: {
    id: string;
    name: string;
    carrierId: string;
  };
  notes?: Array<{
    id: string;
    content: string;
    type: string;
    isPrivate: boolean;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
  activities?: Array<{
    id: string;
    action: string;
    details?: any;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

export default function AdminPlacementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [revenueRange, setRevenueRange] = useState({ min: '', max: '' });
  
  // Note form
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [notePrivate, setNotePrivate] = useState(false);

  // Check if user has admin or agency_manager role
  const hasAccess = (session: Session | null): session is ExtendedSession => {
    if (!session?.user || !('role' in session.user)) return false;
    const role = (session.user as any).role;
    return role === 'admin' || role === 'agency_manager';
  };

  const userRole = session?.user && 'role' in session.user ? (session.user as any).role : null;
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session) {
      if (!hasAccess(session)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && hasAccess(session)) {
      fetchPlacements();
    }
  }, [session, searchTerm, statusFilter, dateRange, revenueRange]);

  const fetchPlacements = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      if (revenueRange.min) params.append('minRevenue', revenueRange.min);
      if (revenueRange.max) params.append('maxRevenue', revenueRange.max);

      const response = await fetch(`/api/admin/placements?${params}`);
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

  const handleViewDetails = async (placementId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/placements/${placementId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPlacement(data);
        setShowDetail(true);
      } else {
        setError('Failed to load placement details');
      }
    } catch (error) {
      console.error('Error fetching placement details:', error);
      setError('Failed to load placement details');
    }
  };

  const handleUpdatePlacement = async () => {
    if (!editingPlacement) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/admin/placements/${editingPlacement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlacement)
      });

      if (response.ok) {
        setSuccessMessage('Placement updated successfully');
        setEditingPlacement(null);
        fetchPlacements();
        if (selectedPlacement?.id === editingPlacement.id) {
          handleViewDetails(editingPlacement.id);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update placement');
      }
    } catch (error) {
      console.error('Error updating placement:', error);
      setError('Error updating placement');
    }
  };

  const handleDeletePlacement = async (placementId: string) => {
    if (!confirm('Are you sure you want to delete this placement? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/admin/placements/${placementId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccessMessage('Placement deleted successfully');
        setShowDetail(false);
        setSelectedPlacement(null);
        fetchPlacements();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete placement');
      }
    } catch (error) {
      console.error('Error deleting placement:', error);
      setError('Error deleting placement');
    }
  };

  const handleAddNote = async () => {
    if (!selectedPlacement || !newNote.trim()) return;

    try {
      setError(null);
      const response = await fetch(`/api/admin/placements/${selectedPlacement.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote,
          type: noteType,
          isPrivate: notePrivate
        })
      });

      if (response.ok) {
        setNewNote('');
        setNoteType('general');
        setNotePrivate(false);
        handleViewDetails(selectedPlacement.id);
        setSuccessMessage('Note added successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Error adding note');
    }
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
      link.download = `admin-placements-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || !hasAccess(session)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Placement Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all placement requests
                {!isAdmin && <span className="ml-2 text-blue-600">(Agency Manager View)</span>}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <Link
                href="/admin/carriers"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
              >
                Manage Carriers
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/admin/reports"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                  >
                    View Reports
                  </Link>
                </>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by business, reference, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border rounded flex-1"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border rounded flex-1"
                placeholder="End Date"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex space-x-2 flex-1 min-w-[200px] max-w-md">
              <input
                type="number"
                placeholder="Min Revenue"
                value={revenueRange.min}
                onChange={(e) => setRevenueRange({...revenueRange, min: e.target.value})}
                className="px-3 py-2 border rounded flex-1"
              />
              <input
                type="number"
                placeholder="Max Revenue"
                value={revenueRange.max}
                onChange={(e) => setRevenueRange({...revenueRange, max: e.target.value})}
                className="px-3 py-2 border rounded flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDateRange({ start: '', end: '' });
                  setRevenueRange({ min: '', max: '' });
                }}
                className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 whitespace-nowrap"
              >
                Clear All Filters
              </button>
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Found {placements.length} placements
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
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
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 mb-4">
            {successMessage}
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Placements Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No placements found
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
                      {placement.user?.name || placement.user?.email || 'Unknown'}
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
                        onClick={() => handleViewDetails(placement.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeletePlacement(placement.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Placement Details</h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedPlacement(null);
                    setEditingPlacement(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Placement Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg mb-2">Business Information</h3>
                  <p><span className="font-medium">Reference:</span> {selectedPlacement.referenceNumber}</p>
                  <p><span className="font-medium">Name:</span> {selectedPlacement.businessName}</p>
                  <p><span className="font-medium">Type:</span> {selectedPlacement.businessType || 'N/A'}</p>
                  <p><span className="font-medium">NAICS:</span> {selectedPlacement.naicsCode || 'N/A'}</p>
                  <p><span className="font-medium">Revenue:</span> ${selectedPlacement.revenue?.toLocaleString() || '0'}</p>
                  <p><span className="font-medium">Employees:</span> {selectedPlacement.employees || 'N/A'}</p>
                  <p><span className="font-medium">Years in Business:</span> {selectedPlacement.yearsInBusiness || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedPlacement.contactName}</p>
                  <p><span className="font-medium">Email:</span> {selectedPlacement.contactEmail}</p>
                  <p><span className="font-medium">Phone:</span> {selectedPlacement.contactPhone}</p>
                  <p><span className="font-medium">Address:</span> {selectedPlacement.address || 'N/A'}</p>
                  <p><span className="font-medium">City:</span> {selectedPlacement.city}</p>
                  <p><span className="font-medium">Province:</span> {selectedPlacement.province}</p>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Status & Timeline</h3>
                <div className="grid grid-cols-3 gap-4">
                  <p><span className="font-medium">Status:</span> {selectedPlacement.status}</p>
                  <p><span className="font-medium">Created:</span> {new Date(selectedPlacement.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">AI Score:</span> {selectedPlacement.aiScore || 'N/A'}</p>
                </div>
                {selectedPlacement.effectiveDate && (
                  <p className="mt-2"><span className="font-medium">Effective Date:</span> {new Date(selectedPlacement.effectiveDate).toLocaleDateString()}</p>
                )}
                {selectedPlacement.expiryDate && (
                  <p className="mt-2"><span className="font-medium">Expiry Date:</span> {new Date(selectedPlacement.expiryDate).toLocaleDateString()}</p>
                )}
              </div>

              {/* Coverage Types */}
              {selectedPlacement.coverageType && selectedPlacement.coverageType.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Coverage Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlacement.coverageType.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlacement.selectedCarriers && selectedPlacement.selectedCarriers.length > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 rounded">
                  <h3 className="font-semibold text-lg mb-3">Submitted Carriers</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This placement was submitted to {selectedPlacement.selectedCarriers.length} carrier(s)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPlacement.selectedCarriers.map((carrierId, index) => {
                      let carrierName = carrierId;
                      let carrierDetails = null;
                      
                      if (selectedPlacement.matchResults && Array.isArray(selectedPlacement.matchResults)) {
                        const found = selectedPlacement.matchResults.find((c: any) => 
                          c && (c.id === carrierId || c.carrierId === carrierId)
                        );
                        if (found) {
                          carrierName = found.name || carrierId;
                          carrierDetails = found;
                        }
                      }
                      
                      return (
                        <div key={index} className="bg-white p-3 rounded border border-indigo-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{carrierName}</p>
                              {carrierDetails && carrierDetails.responseTime && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Response: {carrierDetails.responseTime}
                                </p>
                              )}
                            </div>
                            {carrierDetails && carrierDetails.matchScore != null && (
                              <span className="text-sm font-semibold text-indigo-600">
                                {carrierDetails.matchScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Notes</h3>
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full px-3 py-2 border rounded resize-none"
                    rows={3}
                  />
                  <div className="mt-3 flex items-center space-x-3">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="general">General</option>
                      <option value="important">Important</option>
                      <option value="followup">Follow Up</option>
                      <option value="issue">Issue</option>
                    </select>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notePrivate"
                        checked={notePrivate}
                        onChange={(e) => setNotePrivate(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="notePrivate" className="text-sm">Private Note</label>
                    </div>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPlacement.notes && selectedPlacement.notes.length > 0 ? (
                    selectedPlacement.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-white border rounded">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {note.user.name || note.user.email} | {note.type}
                            {note.isPrivate && ' | Private'}
                          </span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-800">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No notes yet</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setEditingPlacement(selectedPlacement)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Placement
                </button>
                <button
                  onClick={() => handleDeletePlacement(selectedPlacement.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Placement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}