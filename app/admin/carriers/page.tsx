// FILE: app/admin/carriers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Carrier {
  id: string;
  carrierId: string;
  name: string;
  parentCompany?: string;
  amBestRating?: string;
  headquarters?: string;
  provinces: string[];
  minPremium?: number;
  maxRevenue?: number;
  commissionNew?: number;
  commissionRenewal?: number;
  responseTime?: string;
  apiEnabled: boolean;
  apiDetails?: any;
  partnerStatus?: string;
  specialties: string[];
  products?: any;
  underwritingGuidelines?: any;
  brokerPortal?: any;
  contactInfo?: any;
}

export default function AdminCarriersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states for editing
  const [formData, setFormData] = useState<Partial<Carrier>>({});
  const [jsonErrors, setJsonErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchCarriers();
    }
  }, [status, session, router]);

  const fetchCarriers = async () => {
    try {
      const response = await fetch('/api/admin/carriers');
      if (response.ok) {
        const data = await response.json();
        setCarriers(data);
      } else {
        setError('Failed to fetch carriers');
      }
    } catch (error) {
      console.error('Error fetching carriers:', error);
      setError('Error loading carriers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setFormData(carrier);
    setEditMode(false);
    setJsonErrors({});
  };

  const handleEditMode = () => {
    setEditMode(true);
    setFormData(selectedCarrier || {});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData(selectedCarrier || {});
    setJsonErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    // Convert comma-separated string to array
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const handleJsonChange = (field: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        [field]: parsedValue
      }));
      setJsonErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    } catch (error) {
      setJsonErrors(prev => ({
        ...prev,
        [field]: 'Invalid JSON format'
      }));
    }
  };

  const handleSave = async () => {
    if (!selectedCarrier) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/admin/carriers/${selectedCarrier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedCarrier = await response.json();
        setSuccessMessage('Carrier updated successfully');
        setSelectedCarrier(updatedCarrier);
        setEditMode(false);
        fetchCarriers(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update carrier');
      }
    } catch (error) {
      console.error('Error updating carrier:', error);
      setError('Error updating carrier');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Carrier Management</h1>
            <div className="space-x-4">
              <Link
                href="/admin/placements"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Placements
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Users
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
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-600">✕</button>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 mb-4">
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="ml-2 text-green-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carrier List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Carriers</h2>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {carriers.map((carrier) => (
                  <button
                    key={carrier.id}
                    onClick={() => handleSelectCarrier(carrier)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedCarrier?.id === carrier.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{carrier.name}</div>
                    <div className="text-sm text-gray-500">
                      {carrier.commissionNew}% / {carrier.provinces?.length || 0} provinces
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Carrier Details/Edit */}
          <div className="lg:col-span-2">
            {selectedCarrier ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">{selectedCarrier.name}</h2>
                  {!editMode ? (
                    <button
                      onClick={handleEditMode}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit Carrier
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Company</label>
                        <input
                          type="text"
                          value={formData.parentCompany || ''}
                          onChange={(e) => handleInputChange('parentCompany', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AM Best Rating</label>
                        <input
                          type="text"
                          value={formData.amBestRating || ''}
                          onChange={(e) => handleInputChange('amBestRating', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                        <input
                          type="text"
                          value={formData.headquarters || ''}
                          onChange={(e) => handleInputChange('headquarters', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Commission & Limits */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">Commission & Limits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Business Commission (%)</label>
                        <input
                          type="number"
                          value={formData.commissionNew || ''}
                          onChange={(e) => handleInputChange('commissionNew', parseFloat(e.target.value))}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Commission (%)</label>
                        <input
                          type="number"
                          value={formData.commissionRenewal || ''}
                          onChange={(e) => handleInputChange('commissionRenewal', parseFloat(e.target.value))}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Premium ($)</label>
                        <input
                          type="number"
                          value={formData.minPremium || ''}
                          onChange={(e) => handleInputChange('minPremium', parseFloat(e.target.value))}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Revenue ($)</label>
                        <input
                          type="number"
                          value={formData.maxRevenue || ''}
                          onChange={(e) => handleInputChange('maxRevenue', parseFloat(e.target.value))}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coverage */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">Coverage</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provinces (comma-separated: AB,BC,ON)
                        </label>
                        <input
                          type="text"
                          value={formData.provinces?.join(', ') || ''}
                          onChange={(e) => handleArrayChange('provinces', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialties (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.specialties?.join(', ') || ''}
                          onChange={(e) => handleArrayChange('specialties', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* API & Technical */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">API & Technical</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                        <input
                          type="text"
                          value={formData.responseTime || ''}
                          onChange={(e) => handleInputChange('responseTime', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Partner Status</label>
                        <select
                          value={formData.partnerStatus || ''}
                          onChange={(e) => handleInputChange('partnerStatus', e.target.value)}
                          disabled={!editMode}
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-50"
                        >
                          <option value="">Select Status</option>
                          <option value="Preferred">Preferred</option>
                          <option value="Standard">Standard</option>
                          <option value="Regional">Regional</option>
                          <option value="Specialty">Specialty</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.apiEnabled || false}
                            onChange={(e) => handleInputChange('apiEnabled', e.target.checked)}
                            disabled={!editMode}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">API Enabled</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* JSON Fields */}
                  <div>
                    <h3 className="font-semibold mb-3">Advanced Configuration (JSON)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                        <textarea
                          value={JSON.stringify(formData.products || {}, null, 2)}
                          onChange={(e) => handleJsonChange('products', e.target.value)}
                          disabled={!editMode}
                          rows={4}
                          className="w-full px-3 py-2 border rounded font-mono text-sm disabled:bg-gray-50"
                        />
                        {jsonErrors.products && (
                          <p className="text-red-600 text-sm mt-1">{jsonErrors.products}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Underwriting Guidelines</label>
                        <textarea
                          value={JSON.stringify(formData.underwritingGuidelines || {}, null, 2)}
                          onChange={(e) => handleJsonChange('underwritingGuidelines', e.target.value)}
                          disabled={!editMode}
                          rows={4}
                          className="w-full px-3 py-2 border rounded font-mono text-sm disabled:bg-gray-50"
                        />
                        {jsonErrors.underwritingGuidelines && (
                          <p className="text-red-600 text-sm mt-1">{jsonErrors.underwritingGuidelines}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                        <textarea
                          value={JSON.stringify(formData.contactInfo || {}, null, 2)}
                          onChange={(e) => handleJsonChange('contactInfo', e.target.value)}
                          disabled={!editMode}
                          rows={4}
                          className="w-full px-3 py-2 border rounded font-mono text-sm disabled:bg-gray-50"
                        />
                        {jsonErrors.contactInfo && (
                          <p className="text-red-600 text-sm mt-1">{jsonErrors.contactInfo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">Select a carrier to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}