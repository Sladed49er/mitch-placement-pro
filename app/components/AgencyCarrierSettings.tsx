'use client';

import { useState, useEffect } from 'react';

interface CarrierSetting {
  carrierId: string;
  carrierName: string;
  agencyStatus: 'appointed' | 'pending' | 'not-appointed' | 'terminated';
  appointmentDate?: string | null;
  commissions?: {
    newBusiness: number;
    renewal: number;
    volumeBonus?: number;
  };
  contacts?: {
    primary?: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
  };
  performance?: {
    currentYear?: {
      premiumWritten: number;
      policyCount: number;
      lossRatio: number;
      avgPremium: number;
    };
  };
  notes?: {
    general?: string;
  };
}

export default function AgencyCarrierSettings() {
  const [settings, setSettings] = useState<any>({ carrierSettings: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierSetting | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/agency-settings');
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSaveCarrier = async (carrierData: CarrierSetting) => {
    try {
      const response = await fetch('/api/agency-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carrierData),
      });

      if (response.ok) {
        await fetchSettings(); // Reload settings
        setIsEditing(false);
        setSelectedCarrier(null);
      }
    } catch (error) {
      console.error('Error saving carrier:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'appointed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not-appointed': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="p-8">Loading agency settings...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agency Carrier Management</h1>
        <p className="text-gray-600">Manage your carrier appointments and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Active Appointments</div>
          <div className="text-2xl font-bold text-green-600">
            {settings.carrierSettings?.filter((c: CarrierSetting) => c.agencyStatus === 'appointed').length || 0}
          </div>
          <div className="text-xs text-gray-500">of {settings.carrierSettings?.length || 0} carriers</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">YTD Premium</div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              settings.carrierSettings?.reduce((sum: number, c: CarrierSetting) => 
                sum + (c.performance?.currentYear?.premiumWritten || 0), 0
              ) || 0
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total Policies</div>
          <div className="text-2xl font-bold">
            {settings.carrierSettings?.reduce((sum: number, c: CarrierSetting) => 
              sum + (c.performance?.currentYear?.policyCount || 0), 0
            ) || 0}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Avg Loss Ratio</div>
          <div className="text-2xl font-bold">
            {(
              settings.carrierSettings
                ?.filter((c: CarrierSetting) => c.performance?.currentYear?.lossRatio)
                .reduce((sum: number, c: CarrierSetting, _: any, arr: any[]) => 
                  sum + (c.performance?.currentYear?.lossRatio || 0) / arr.length, 0
                ) || 0
            ).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Contacts
          </button>
        </nav>
      </div>

      {/* Carrier Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {activeTab === 'overview' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    YTD Premium
                  </th>
                </>
              )}
              {activeTab === 'performance' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loss Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Premium
                  </th>
                </>
              )}
              {activeTab === 'contacts' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.carrierSettings?.map((carrier: CarrierSetting) => (
              <tr key={carrier.carrierId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{carrier.carrierName}</div>
                  <div className="text-sm text-gray-500">{carrier.carrierId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(carrier.agencyStatus)}`}>
                    {carrier.agencyStatus}
                  </span>
                </td>
                {activeTab === 'overview' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.commissions ? `${carrier.commissions.newBusiness}% / ${carrier.commissions.renewal}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.performance?.currentYear ? formatCurrency(carrier.performance.currentYear.premiumWritten) : '-'}
                    </td>
                  </>
                )}
                {activeTab === 'performance' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.performance?.currentYear?.policyCount || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.performance?.currentYear?.lossRatio ? `${carrier.performance.currentYear.lossRatio}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.performance?.currentYear?.avgPremium ? formatCurrency(carrier.performance.currentYear.avgPremium) : '-'}
                    </td>
                  </>
                )}
                {activeTab === 'contacts' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.contacts?.primary?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.contacts?.primary?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carrier.contacts?.primary?.phone || '-'}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedCarrier(carrier);
                      setIsEditing(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal - simplified for brevity */}
      {isEditing && selectedCarrier && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Edit {selectedCarrier.carrierName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedCarrier.agencyStatus}
                  onChange={(e) => setSelectedCarrier({
                    ...selectedCarrier,
                    agencyStatus: e.target.value as any
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="appointed">Appointed</option>
                  <option value="pending">Pending</option>
                  <option value="not-appointed">Not Appointed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedCarrier(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveCarrier(selectedCarrier)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}