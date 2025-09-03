/**
 * ============================================
 * FILE: /app/placement/page.tsx
 * LOCATION: Replace ENTIRE file at /app/placement/page.tsx
 * PURPOSE: Complete placement wizard with ComparativeRater integration
 * LAST UPDATED: Final working version
 * ============================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ComparativeRater from '@/app/components/ComparativeRater';
import { AIAppetitePredictor } from '@/app/components/AIAppetitePredictor';

// Import postal codes data
const postalCodesData = require('@/data/postal-codes.json');

interface ClientInfo {
  businessName: string;
  firstName: string;
  lastName: string;
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
  // Additional comparative rater fields
  annual_revenue_range?: string;
  employee_range?: string;
  secondary_operations?: string;
  annual_payroll?: string;
  operations_location?: string;
  building_occupancy?: string;
  uses_subcontractors?: string;
  previous_insurance?: string;
  prior_experience?: string;
  subcontractor_percentage?: string;
  requires_certificates?: string;
  us_percentage?: string;
  safety_program?: string;
  loss_history?: string;
  work_heights?: boolean;
  hazmat?: boolean;
  professional_services?: boolean;
  products_sold?: boolean;
  alcohol_sales?: boolean;
  vehicle_repair?: boolean;
  data_storage?: boolean;
  none_apply?: boolean;
  [key: string]: any; // Allow additional properties
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
  matchScore?: number;
  recommended?: boolean;
  headquarters?: string;
  apiDetails?: {
    hasAPI: boolean;
    apiType: string | null;
    dataStandards: string[];
    realTimeQuoting: boolean;
    portalAvailable: boolean;
    portalName: string;
    certifications?: string[];
  };
  products?: any;
  underwritingGuidelines?: {
    preferredIndustries: string[];
    restrictedIndustries: string[];
    maxEmployees: number;
    minYearsInBusiness: number;
    lossHistoryRequirements: string;
  };
  brokerPortal?: any;
  contactInfo?: any;
}

export default function PlacementPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    businessName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  });

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    industry: '',
    annualRevenue: '',
    numberOfEmployees: '',
    yearsInBusiness: '',
    lossHistory: '',
    // Initialize comparative rater fields
    annual_revenue_range: '',
    employee_range: '',
    secondary_operations: 'no',
    annual_payroll: '',
    operations_location: '',
    building_occupancy: '',
    uses_subcontractors: 'no',
    previous_insurance: '',
    prior_experience: '',
    subcontractor_percentage: '',
    requires_certificates: '',
    us_percentage: '',
    safety_program: '',
    loss_history: '',
    work_heights: false,
    hazmat: false,
    professional_services: false,
    products_sold: false,
    alcohol_sales: false,
    vehicle_repair: false,
    data_storage: false,
    none_apply: false
  });

  // Handle postal code changes
  const handlePostalCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setClientInfo({ ...clientInfo, postalCode: upperValue });
    
    if (upperValue.length >= 3) {
      const prefix = upperValue.substring(0, 3);
      // Access postalCodes safely from the data
      const postalCode = postalCodesData?.postalCodes?.[prefix];
      
      if (postalCode) {
        setClientInfo(prev => ({
          ...prev,
          city: postalCode.city || '',
          province: postalCode.province || '',
          postalCode: upperValue
        }));
      }
    }
  };

  // Navigate between steps
  const handleNextStep = () => {
    if (currentStep === 3 && selectedCarriers.length === 0) {
      alert('Please select at least one carrier');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Map revenue range to numeric value
  const getRevenueValue = (range: string): number => {
    const revenueMap: { [key: string]: number } = {
      'Under $500K': 250000,
      '$500K-$1M': 750000,
      '$1M-$5M': 3000000,
      '$5M-$10M': 7500000,
      '$10M-$25M': 17500000,
      '$25M-$50M': 37500000,
      'Over $50M': 75000000,
      '0-100k': 50000,
      '100k-250k': 175000,
      '250k-500k': 375000,
      '500k-1m': 750000,
      '1m-2.5m': 1750000,
      '2.5m-5m': 3750000,
      '5m-10m': 7500000,
      '10m-25m': 17500000,
      '25m-50m': 37500000,
      '50m+': 75000000
    };
    return revenueMap[range] || 1000000;
  };

  // Map employee range to numeric value
  const getEmployeeCount = (range: string): number => {
    const employeeMap: { [key: string]: number } = {
      '1-5': 3,
      '6-10': 8,
      '11-25': 18,
      '26-50': 38,
      '51-100': 75,
      '101-500': 300,
      'Over 500': 750,
      '1-2': 2,
      '3-5': 4,
      '101-250': 175,
      '250+': 500
    };
    return employeeMap[range] || 10;
  };

  // Find matching carriers
  const handleFindCarriers = async () => {
    setLoading(true);
    setError('');
    try {
      const revenue = businessDetails.annual_revenue_range 
        ? getRevenueValue(businessDetails.annual_revenue_range)
        : getRevenueValue(businessDetails.annualRevenue);
      
      const response = await fetch('/api/placements/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province: clientInfo.province,
          industry: businessDetails.industry,
          revenue: revenue,
          employees: businessDetails.employee_range 
            ? getEmployeeCount(businessDetails.employee_range)
            : parseInt(businessDetails.numberOfEmployees) || 10
        })
      });

      const data = await response.json();
      setCarriers(data.carriers || []);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error finding carriers:', error);
      setError('Error finding carriers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle carrier selection
  const handleCarrierSelection = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    );
  };

  // Submit placement
  const handleSubmitPlacement = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientInfo,
          businessDetails,
          selectedCarriers,
          carriers: carriers.filter(c => selectedCarriers.includes(c.id))
        })
      });

      const data = await response.json();
      setTrackingNumber(data.trackingNumber || `MPP-${Date.now()}`);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting placement:', error);
      alert('Error submitting placement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-2 sm:px-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`flex-1 h-1 mx-1 sm:mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render client info step
  const renderClientInfo = () => (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Client Information</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          value={clientInfo.businessName}
          onChange={(e) => setClientInfo({...clientInfo, businessName: e.target.value})}
          placeholder="ABC Company Inc."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            value={clientInfo.firstName}
            onChange={(e) => setClientInfo({...clientInfo, firstName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            value={clientInfo.lastName}
            onChange={(e) => setClientInfo({...clientInfo, lastName: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded-lg"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full p-2 border rounded-lg"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Postal Code</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          value={clientInfo.postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          placeholder="M5V 3A8"
          maxLength={7}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg bg-gray-50"
            value={clientInfo.city}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Province</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg bg-gray-50"
            value={clientInfo.province}
            readOnly
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          value={clientInfo.address}
          onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
        />
      </div>

      <button
        onClick={handleNextStep}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Next: Business Details
      </button>
    </div>
  );

  // Render business details step - Using ComparativeRater component
  const renderBusinessDetails = () => (
    <ComparativeRater
      businessDetails={businessDetails}
      setBusinessDetails={setBusinessDetails}
      onNext={handleFindCarriers}
      onBack={handlePreviousStep}
      loading={loading}
      error={error}
    />
  );

  // Render carrier selection step with mobile fixes
  const renderCarrierSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Select Carriers</h2>
      
      {/* AI Predictions Component */}
      <AIAppetitePredictor 
        placement={{
          businessName: clientInfo.businessName,
          province: clientInfo.province,
          naicsCode: businessDetails.industry,
          revenue: businessDetails.annual_revenue_range 
            ? getRevenueValue(businessDetails.annual_revenue_range)
            : parseFloat(businessDetails.annualRevenue?.replace(/[^0-9]/g, '') || '1000000'),
          employees: businessDetails.employee_range
            ? getEmployeeCount(businessDetails.employee_range)
            : parseInt(businessDetails.numberOfEmployees || '10'),
          yearsInBusiness: parseInt(businessDetails.yearsInBusiness || '5'),
          lossHistory: businessDetails.loss_history || businessDetails.lossHistory || "Unknown"
        }}
      />
      
      {carriers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">No matching carriers found.</p>
          <p className="text-sm">Please adjust your criteria and try again.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Found {carriers.length} matching carrier{carriers.length !== 1 ? 's' : ''}. 
            Select the carriers you want to submit to:
          </p>
          <div className="space-y-3">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCarriers.includes(carrier.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCarrierSelection(carrier.id)}
              >
                {/* Mobile-optimized header with carrier name and checkbox */}
                <div className="flex items-start gap-2 sm:gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedCarriers.includes(carrier.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg break-words">
                      {carrier.name}
                    </h3>
                    
                    {/* Badges container - wraps on mobile */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {carrier.recommended && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                          RECOMMENDED
                        </span>
                      )}
                      {carrier.apiEnabled && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          API Ready
                        </span>
                      )}
                      {carrier.partnerStatus === 'Preferred' && (
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Preferred
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile-responsive details grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mt-3">
                  {carrier.amBestRating && (
                    <div className="truncate">
                      <span className="text-gray-500">AM Best:</span>
                      <span className="ml-1 font-medium">{carrier.amBestRating}</span>
                    </div>
                  )}
                  
                  {carrier.responseTime && (
                    <div className="truncate">
                      <span className="text-gray-500">Response:</span>
                      <span className="ml-1 font-medium">{carrier.responseTime}</span>
                    </div>
                  )}
                  
                  {carrier.minPremium && (
                    <div className="truncate">
                      <span className="text-gray-500">Min:</span>
                      <span className="ml-1 font-medium">${carrier.minPremium.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {carrier.maxRevenue && (
                    <div className="truncate">
                      <span className="text-gray-500">Max Rev:</span>
                      <span className="ml-1 font-medium">
                        ${(carrier.maxRevenue / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  )}

                  {carrier.commissionNew && (
                    <div className="truncate">
                      <span className="text-gray-500">New:</span>
                      <span className="ml-1 font-medium">{carrier.commissionNew}%</span>
                    </div>
                  )}
                  
                  {carrier.commissionRenewal && (
                    <div className="truncate">
                      <span className="text-gray-500">Renewal:</span>
                      <span className="ml-1 font-medium">{carrier.commissionRenewal}%</span>
                    </div>
                  )}
                </div>

                {/* Specialties - now wrapping properly */}
                {carrier.specialties && carrier.specialties.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Specialties:</div>
                    <div className="flex flex-wrap gap-1">
                      {carrier.specialties.slice(0, 4).map((specialty, index) => (
                        <span 
                          key={index} 
                          className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded truncate max-w-[120px]"
                          title={specialty}
                        >
                          {specialty}
                        </span>
                      ))}
                      {carrier.specialties.length > 4 && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{carrier.specialties.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="sticky bottom-0 bg-white border-t pt-4 mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePreviousStep}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (selectedCarriers.length === 0) {
                    alert('Please select at least one carrier');
                    return;
                  }
                  handleSubmitPlacement();
                }}
                disabled={selectedCarriers.length === 0 || loading}
                className="w-full sm:flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Continue with {selectedCarriers.length} Carrier{selectedCarriers.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render success step
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Placement Submitted!</h2>
      <p className="text-gray-600 mb-6">
        Your placement has been successfully submitted to {selectedCarriers.length} carrier{selectedCarriers.length !== 1 ? 's' : ''}.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
        <p className="text-xl font-mono font-bold">{trackingNumber}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            // Reset form
            setCurrentStep(1);
            setClientInfo({
              businessName: '',
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              province: '',
              postalCode: ''
            });
            setBusinessDetails({
              industry: '',
              annualRevenue: '',
              numberOfEmployees: '',
              yearsInBusiness: '',
              lossHistory: '',
              annual_revenue_range: '',
              employee_range: '',
              secondary_operations: 'no',
              annual_payroll: '',
              operations_location: '',
              building_occupancy: '',
              uses_subcontractors: 'no',
              previous_insurance: '',
              prior_experience: '',
              subcontractor_percentage: '',
              requires_certificates: '',
              us_percentage: '',
              safety_program: '',
              loss_history: '',
              work_heights: false,
              hazmat: false,
              professional_services: false,
              products_sold: false,
              alcohol_sales: false,
              vehicle_repair: false,
              data_storage: false,
              none_apply: false
            });
            setCarriers([]);
            setSelectedCarriers([]);
            setTrackingNumber('');
            setError('');
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🍁 Mitch Insurance - New Placement</h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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