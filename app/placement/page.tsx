'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientInfo {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface BusinessDetails {
  industry: string;
  annualRevenue: string;
  numberOfEmployees: string;
  yearsInBusiness: string;
  lossHistory: string;
}

interface Carrier {
  id: string;
  carrierId: string;
  name: string;
  amBestRating: string;
  provinces: string[];
  minPremium: number;
  maxRevenue: number;
  commissionNew: number;
  commissionRenewal: number;
  responseTime: string;
  apiEnabled: boolean;
  partnerStatus: string;
  specialties?: string[];
  notes: string;
  matchScore?: number;
  recommended?: boolean;
}

export default function PlacementWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [naicsCodes, setNaicsCodes] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'ON',
    postalCode: ''
  });
  
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    industry: '',
    annualRevenue: '',
    numberOfEmployees: '',
    yearsInBusiness: '',
    lossHistory: 'No claims (5+ years)'
  });

  // Fetch NAICS codes on component mount
  useEffect(() => {
    fetchNAICSCodes();
  }, []);

  const fetchNAICSCodes = async () => {
    try {
      const response = await fetch('/api/naics');
      if (!response.ok) throw new Error('Failed to fetch NAICS codes');
      const data = await response.json();
      setNaicsCodes(data);
    } catch (error) {
      console.error('Error fetching NAICS codes:', error);
      // Set some default codes if fetch fails
      setNaicsCodes([
        { id: '1', code: '541511', description: 'Custom Computer Programming' },
        { id: '2', code: '238210', description: 'Electrical Contractors' },
        { id: '3', code: '722511', description: 'Full-Service Restaurants' }
      ]);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFindCarriers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/placements/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientInfo,
          businessDetails
        })
      });

      if (!response.ok) {
        throw new Error('Failed to find matching carriers');
      }

      const data = await response.json();
      
      // Ensure we have an array
      if (Array.isArray(data)) {
        setCarriers(data);
        setCurrentStep(3);
      } else {
        console.error('Unexpected response format:', data);
        setCarriers([]);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error finding carriers:', error);
      setError('Error finding carriers. Please try again.');
      setCarriers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierSelection = (carrierId: string) => {
    setSelectedCarriers(prev => {
      if (prev.includes(carrierId)) {
        return prev.filter(id => id !== carrierId);
      } else {
        return [...prev, carrierId];
      }
    });
  };

  const handleSubmitPlacements = () => {
    // For now, just move to success step
    setCurrentStep(4);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {['Client Info', 'Business Details', 'Carrier Selection', 'Success'].map((step, index) => (
        <div
          key={index}
          className={`flex-1 text-center pb-2 border-b-2 ${
            currentStep > index + 1
              ? 'border-green-500 text-green-500'
              : currentStep === index + 1
              ? 'border-blue-500 text-blue-500'
              : 'border-gray-300 text-gray-400'
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );

  const renderClientInfo = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Client Information</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={clientInfo.businessName}
          onChange={(e) => setClientInfo({...clientInfo, businessName: e.target.value})}
          placeholder="ABC Company Ltd."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={clientInfo.contactName}
          onChange={(e) => setClientInfo({...clientInfo, contactName: e.target.value})}
          placeholder="John Smith"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-lg"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
            placeholder="(416) 555-0123"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={clientInfo.address}
          onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={clientInfo.city}
            onChange={(e) => setClientInfo({...clientInfo, city: e.target.value})}
            placeholder="Toronto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Province</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={clientInfo.province}
            onChange={(e) => setClientInfo({...clientInfo, province: e.target.value})}
          >
            <option value="ON">Ontario</option>
            <option value="QC">Quebec</option>
            <option value="BC">British Columbia</option>
            <option value="AB">Alberta</option>
            <option value="MB">Manitoba</option>
            <option value="SK">Saskatchewan</option>
            <option value="NS">Nova Scotia</option>
            <option value="NB">New Brunswick</option>
            <option value="NL">Newfoundland</option>
            <option value="PE">PEI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Postal Code</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={clientInfo.postalCode}
            onChange={(e) => setClientInfo({...clientInfo, postalCode: e.target.value})}
            placeholder="M5V 3A8"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Business Details</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Industry (NAICS)</label>
        <select
          className="w-full px-3 py-2 border rounded-lg"
          value={businessDetails.industry}
          onChange={(e) => setBusinessDetails({...businessDetails, industry: e.target.value})}
        >
          <option value="">Select an industry</option>
          {naicsCodes.map((code) => (
            <option key={code.id} value={code.code}>
              {code.code} - {code.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Annual Revenue (CAD)</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded-lg"
          value={businessDetails.annualRevenue}
          onChange={(e) => setBusinessDetails({...businessDetails, annualRevenue: e.target.value})}
          placeholder="2000000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Number of Employees</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded-lg"
          value={businessDetails.numberOfEmployees}
          onChange={(e) => setBusinessDetails({...businessDetails, numberOfEmployees: e.target.value})}
          placeholder="50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Years in Business</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded-lg"
          value={businessDetails.yearsInBusiness}
          onChange={(e) => setBusinessDetails({...businessDetails, yearsInBusiness: e.target.value})}
          placeholder="5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Loss History</label>
        <select
          className="w-full px-3 py-2 border rounded-lg"
          value={businessDetails.lossHistory}
          onChange={(e) => setBusinessDetails({...businessDetails, lossHistory: e.target.value})}
        >
          <option value="No claims (5+ years)">No claims (5+ years)</option>
          <option value="1-2 claims">1-2 claims in last 5 years</option>
          <option value="3+ claims">3+ claims in last 5 years</option>
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleFindCarriers}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Finding...' : 'Find Carriers'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );

  const renderCarrierSelection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Select Carriers</h2>
      
      {carriers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No matching carriers found. Please adjust your criteria and try again.
        </div>
      ) : (
        <div className="space-y-3">
          {carriers.map((carrier) => (
            <div
              key={carrier.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCarriers.includes(carrier.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCarrierSelection(carrier.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{carrier.name}</h3>
                    {carrier.recommended && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Recommended
                      </span>
                    )}
                    {carrier.apiEnabled && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        API
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Rating: {carrier.amBestRating}</div>
                    <div>Response: {carrier.responseTime}</div>
                    <div>Commission: {carrier.commissionNew}% / {carrier.commissionRenewal}%</div>
                    <div>Min Premium: ${carrier.minPremium.toLocaleString()}</div>
                  </div>
                  
                  {carrier.notes && (
                    <p className="mt-2 text-sm text-gray-500">{carrier.notes}</p>
                  )}
                </div>
                
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {carrier.matchScore}%
                  </div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmitPlacements}
          disabled={selectedCarriers.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit to {selectedCarriers.length} Carrier{selectedCarriers.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-3xl font-bold mb-4">Placement Submitted!</h2>
      <p className="text-gray-600 mb-2">
        Your placement has been successfully submitted to {selectedCarriers.length} carrier{selectedCarriers.length !== 1 ? 's' : ''}.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Reference: PL-{Date.now().toString().slice(-8)}
      </p>
      
      <div className="space-x-4">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            setCurrentStep(1);
            setClientInfo({
              businessName: '',
              contactName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              province: 'ON',
              postalCode: ''
            });
            setBusinessDetails({
              industry: '',
              annualRevenue: '',
              numberOfEmployees: '',
              yearsInBusiness: '',
              lossHistory: 'No claims (5+ years)'
            });
            setCarriers([]);
            setSelectedCarriers([]);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start New Placement
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🍁 New Placement</h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderClientInfo()}
          {currentStep === 2 && renderBusinessDetails()}
          {currentStep === 3 && renderCarrierSelection()}
          {currentStep === 4 && renderSuccess()}
        </div>
      </div>
    </div>
  );
}