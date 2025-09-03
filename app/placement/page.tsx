/**
 * ============================================
 * FILE: /app/placement/page.tsx
 * LOCATION: Replace ENTIRE file at /app/placement/page.tsx
 * PURPOSE: Complete placement wizard with ALL features + mobile fixes + user save
 * INCLUDES: Postal code validation, phone formatting, ComparativeRater, mobile-responsive carriers, save to database
 * ============================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ComparativeRater from '@/app/components/ComparativeRater';
import AIAppetitePredictor from '@/app/components/AIAppetitePredictor';

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
  [key: string]: any;
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

// Common Canadian cities by province
const citiesByProvince: { [key: string]: string[] } = {
  'ON': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kitchener', 'Windsor', 'Barrie', 'Kingston', 'Guelph'],
  'QC': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Trois-Rivières'],
  'BC': ['Vancouver', 'Surrey', 'Victoria', 'Burnaby', 'Richmond', 'Kelowna', 'Kamloops', 'Nanaimo'],
  'AB': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat', 'Fort McMurray', 'Grande Prairie'],
  'MB': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'],
  'SK': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'],
  'NS': ['Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow', 'Glace Bay'],
  'NB': ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Miramichi'],
  'NL': ['St. John\'s', 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Grand Falls-Windsor'],
  'PE': ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall'],
  'NT': ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith'],
  'NU': ['Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake'],
  'YT': ['Whitehorse', 'Dawson City', 'Watson Lake']
};

export default function PlacementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [postalCodeInfo, setPostalCodeInfo] = useState<string>('');
  const [aiPredictions, setAiPredictions] = useState<any>(null);
  
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

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  // Format postal code as user types
  const formatPostalCode = (value: string) => {
    // Remove all non-alphanumeric and convert to uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format as XXX XXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
    }
  };

  // Validate Canadian postal code format and province match
  const validatePostalCode = (postalCode: string, province: string): { valid: boolean; message?: string } => {
    const cleaned = postalCode.replace(/\s/g, '');
    
    // Check format: A1A 1A1
    const postalCodeRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
    if (!postalCodeRegex.test(cleaned)) {
      return { valid: false, message: 'Invalid postal code format (e.g., M5V 3A8)' };
    }
    
    // First letter indicates province/region
    const firstLetter = cleaned[0];
    const provinceMap: { [key: string]: string[] } = {
      'NL': ['A'],
      'NS': ['B'],
      'PE': ['C'],
      'NB': ['E'],
      'QC': ['G', 'H', 'J'],
      'ON': ['K', 'L', 'M', 'N', 'P'],
      'MB': ['R'],
      'SK': ['S'],
      'AB': ['T'],
      'BC': ['V'],
      'NT': ['X'],
      'NU': ['X'],
      'YT': ['Y']
    };
    
    const validLetters = provinceMap[province] || [];
    if (!validLetters.includes(firstLetter)) {
      const expectedProvinces = Object.entries(provinceMap)
        .filter(([_, letters]) => letters.includes(firstLetter))
        .map(([prov, _]) => prov);
      
      if (expectedProvinces.length > 0) {
        return { 
          valid: false, 
          message: `Postal code ${cleaned} is for ${expectedProvinces.join(' or ')}, not ${province}` 
        };
      }
      return { valid: false, message: 'Invalid postal code for selected province' };
    }
    
    return { valid: true };
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientInfo({...clientInfo, phone: formatted});
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    
    // Auto-populate city and province if we find a match
    const cleaned = formatted.replace(/\s/g, '');
    if (cleaned.length >= 3) {
      const prefix = cleaned.substring(0, 3);
      const locationData = postalCodesData?.postalCodes?.[prefix];
      
      if (locationData) {
        setClientInfo(prev => ({
          ...prev,
          postalCode: formatted,
          province: locationData.province,
          city: locationData.city
        }));
        setPostalCodeInfo(`✓ ${locationData.city}, ${locationData.province}`);
      } else {
        setClientInfo({...clientInfo, postalCode: formatted});
        setPostalCodeInfo('Postal code not recognized - please verify city and province');
      }
    } else {
      setClientInfo({...clientInfo, postalCode: formatted});
      setPostalCodeInfo('');
    }
    
    // Clear error if they're typing
    if (error && error.includes('postal code')) {
      setError('');
    }
  };

  const validateStep1 = () => {
    // Check all required fields are filled
    if (!clientInfo.businessName || 
        !clientInfo.firstName || 
        !clientInfo.lastName || 
        !clientInfo.email || 
        !clientInfo.phone || 
        !clientInfo.address || 
        !clientInfo.city || 
        !clientInfo.province ||
        !clientInfo.postalCode) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate phone number (should have 10 digits)
    const phoneDigits = clientInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate postal code
    const postalValidation = validatePostalCode(clientInfo.postalCode, clientInfo.province);
    if (!postalValidation.valid) {
      setError(postalValidation.message || 'Invalid postal code');
      return false;
    }
    
    // Validate city matches province (warning only)
    const validCities = citiesByProvince[clientInfo.province] || [];
    const cityMatch = validCities.some(city => 
      city.toLowerCase() === clientInfo.city.toLowerCase()
    );
    
    if (!cityMatch && clientInfo.city) {
      // Just a warning - don't block submission for smaller cities
      console.warn(`Note: ${clientInfo.city} may not be a major city in ${clientInfo.province}`);
    }
    
    return true;
  };

  const validateStep2 = () => {
    return businessDetails.industry && 
           businessDetails.annual_revenue_range && 
           businessDetails.employee_range && 
           businessDetails.yearsInBusiness;
  };

  const handleNext = async () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 3 && selectedCarriers.length > 0) {
      // Save placement before showing success
      await savePlacement();
    }
    setError('');
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper functions to map comparative rater values
  const mapRevenueRange = (range: string): string => {
    const mapping: Record<string, string> = {
      '0-100k': '50000',
      '100k-250k': '175000',
      '250k-500k': '375000',
      '500k-1m': '750000',
      '1m-2.5m': '1750000',
      '2.5m-5m': '3750000',
      '5m-10m': '7500000',
      '10m-25m': '17500000',
      '25m-50m': '37500000',
      '50m+': '75000000'
    };
    return mapping[range] || '1000000';
  };

  const mapEmployeeRange = (range: string): string => {
    const mapping: Record<string, string> = {
      '1-2': '2',
      '3-5': '4',
      '6-10': '8',
      '11-25': '18',
      '26-50': '38',
      '51-100': '75',
      '101-250': '175',
      '250+': '500'
    };
    return mapping[range] || '10';
  };

  const mapYearsInBusiness = (years: string): string => {
    if (years === '25+') return '30';
    if (years === '11-25') return '15';
    if (years === '6-10') return '8';
    if (years === '3-5') return '4';
    return years;
  };

  const mapLossHistory = (history: string): string => {
    const mapping: Record<string, string> = {
      'none': 'No claims (5+ years)',
      '1_small': '1-2 claims',
      '1_large': '1-2 claims',
      '2-3_claims': '1-2 claims',
      '4+_claims': '3+ claims'
    };
    return mapping[history] || 'No claims (5+ years)';
  };

  // Save placement to database
  const savePlacement = async () => {
    try {
      const response = await fetch('/api/placements/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Client info
          businessName: clientInfo.businessName,
          clientFirstName: clientInfo.firstName,
          clientLastName: clientInfo.lastName,
          email: clientInfo.email,
          phone: clientInfo.phone,
          address: clientInfo.address,
          postalCode: clientInfo.postalCode,
          city: clientInfo.city,
          province: clientInfo.province,
          
          // Business details
          industry: businessDetails.industry,
          naicsCode: businessDetails.industry, // Using industry as NAICS for now
          revenue: parseFloat(mapRevenueRange(businessDetails.annual_revenue_range || '1m-2.5m')),
          employees: parseInt(mapEmployeeRange(businessDetails.employee_range || '11-25')),
          yearsInBusiness: parseInt(mapYearsInBusiness(businessDetails.yearsInBusiness || '5')),
          
          // AI predictions and carrier matching
          aiPredictions: aiPredictions,
          aiScore: aiPredictions?.topCarriers?.[0]?.quoteProbability,
          matchResults: carriers,
          selectedCarriers: selectedCarriers,
          
          // Additional details
          effectiveDate: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTrackingNumber(result.referenceNumber);
        console.log('Placement saved with ID:', result.placementId);
      } else {
        console.error('Failed to save placement:', result.error);
      }
    } catch (error) {
      console.error('Error saving placement:', error);
    }
  };

  const handleFindCarriers = async () => {
    if (!validateStep2()) {
      setError('Please fill in all required fields');
      return;
    }

    // Map the comparative rater fields to existing API structure
    const mappedDetails = {
      industry: businessDetails.industry,
      annualRevenue: mapRevenueRange(businessDetails.annual_revenue_range || ''),
      numberOfEmployees: mapEmployeeRange(businessDetails.employee_range || ''),
      yearsInBusiness: mapYearsInBusiness(businessDetails.yearsInBusiness),
      lossHistory: mapLossHistory(businessDetails.loss_history || businessDetails.lossHistory)
    };

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
          businessDetails: mappedDetails
        })
      });

      if (!response.ok) {
        throw new Error('Failed to find matching carriers');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Add recommended flag for carriers with score >= 75
        const enhancedCarriers = data.map(carrier => ({
          ...carrier,
          recommended: carrier.matchScore >= 75
        }));
        setCarriers(enhancedCarriers);
        setCurrentStep(3);
      } else {
        setCarriers([]);
        setError('No carriers found for your criteria');
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

  const handleSubmitPlacements = async () => {
    await savePlacement();
    setCurrentStep(4);
  };

  // Show loading screen while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Render step indicator
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

  // Render client info step with postal code at front
  const renderClientInfo = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Client Information</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={clientInfo.businessName}
          onChange={(e) => setClientInfo({...clientInfo, businessName: e.target.value})}
          placeholder="ABC Company Ltd."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Postal Code <span className="text-red-500">*</span>
          {postalCodeInfo && (
            <span className={`ml-2 text-xs ${postalCodeInfo.startsWith('✓') ? 'text-green-600' : 'text-amber-600'}`}>
              {postalCodeInfo}
            </span>
          )}
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={clientInfo.postalCode}
          onChange={handlePostalCodeChange}
          placeholder="M5V 3A8"
          maxLength={7}
        />
        <p className="text-xs text-gray-500 mt-1">Enter postal code to auto-fill city and province</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.city}
            onChange={(e) => setClientInfo({...clientInfo, city: e.target.value})}
            placeholder={clientInfo.province ? `e.g., ${citiesByProvince[clientInfo.province]?.[0] || 'City Name'}` : 'City Name'}
            list="city-suggestions"
          />
          {clientInfo.province && citiesByProvince[clientInfo.province] && (
            <datalist id="city-suggestions">
              {citiesByProvince[clientInfo.province].map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Province <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.province}
            onChange={(e) => {
              setClientInfo({...clientInfo, province: e.target.value});
              setError(''); // Clear any postal code errors when province changes
              setPostalCodeInfo(''); // Clear postal code info
            }}
          >
            <option value="">Select Province</option>
            <option value="ON">Ontario</option>
            <option value="QC">Quebec</option>
            <option value="BC">British Columbia</option>
            <option value="AB">Alberta</option>
            <option value="MB">Manitoba</option>
            <option value="SK">Saskatchewan</option>
            <option value="NS">Nova Scotia</option>
            <option value="NB">New Brunswick</option>
            <option value="NL">Newfoundland and Labrador</option>
            <option value="PE">Prince Edward Island</option>
            <option value="NT">Northwest Territories</option>
            <option value="NU">Nunavut</option>
            <option value="YT">Yukon</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={clientInfo.address}
          onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.firstName}
            onChange={(e) => setClientInfo({...clientInfo, firstName: e.target.value})}
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.lastName}
            onChange={(e) => setClientInfo({...clientInfo, lastName: e.target.value})}
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({...clientInfo, email: e.target.value.toLowerCase()})}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientInfo.phone}
            onChange={handlePhoneChange}
            placeholder="(416) 555-0123"
            maxLength={14}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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

  // Use ComparativeRater component for Step 2
  const renderBusinessDetails = () => (
    <ComparativeRater
      businessDetails={businessDetails}
      setBusinessDetails={setBusinessDetails}
      onNext={handleFindCarriers}
      onBack={handleBack}
      loading={loading}
      error={error}
    />
  );

  // Render carrier selection with MOBILE FIXES ONLY
  const renderCarrierSelection = () => (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Select Carriers</h2>
      
      {/* AI Predictions Component */}
      <AIAppetitePredictor 
        placement={{
          businessName: clientInfo.businessName,
          province: clientInfo.province,
          naicsCode: businessDetails.industry,
          revenue: parseFloat(mapRevenueRange(businessDetails.annual_revenue_range || '1m-2.5m')),
          employees: parseInt(mapEmployeeRange(businessDetails.employee_range || '11-25')),
          yearsInBusiness: parseInt(mapYearsInBusiness(businessDetails.yearsInBusiness || '5')),
          lossHistory: mapLossHistory(businessDetails.loss_history || businessDetails.lossHistory || 'none')
        }}
        onPredictions={(predictions) => setAiPredictions(predictions)}
      />
      
      {carriers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-4">No matching carriers found.</p>
          <p className="text-sm">Please adjust your criteria and try again.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4 mt-6">
            Found {carriers.length} matching carrier{carriers.length !== 1 ? 's' : ''}. 
            Select the carriers you want to submit to:
          </p>
          <div className="space-y-3 pb-24">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all overflow-hidden ${
                  selectedCarriers.includes(carrier.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCarrierSelection(carrier.id)}
              >
                {/* Mobile-optimized header */}
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedCarriers.includes(carrier.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-semibold text-base break-words">
                      {carrier.name}
                    </h3>
                    
                    {/* Mobile-optimized badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {carrier.recommended && (
                        <span className="inline-flex px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                          RECOMMENDED
                        </span>
                      )}
                      {carrier.apiEnabled && (
                        <span className="inline-flex px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          API
                        </span>
                      )}
                      {carrier.partnerStatus === 'Preferred' && (
                        <span className="inline-flex px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Partner
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Match score on mobile */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {carrier.matchScore}%
                    </div>
                    <div className="text-xs text-gray-500">Match</div>
                  </div>
                </div>

                {/* Mobile-responsive details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
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
                      <span className="ml-1 font-medium">${(carrier.minPremium/1000).toFixed(0)}K</span>
                    </div>
                  )}
                  
                  {carrier.maxRevenue && (
                    <div className="truncate">
                      <span className="text-gray-500">Max:</span>
                      <span className="ml-1 font-medium">${(carrier.maxRevenue / 1000000).toFixed(0)}M</span>
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
                      <span className="text-gray-500">Renew:</span>
                      <span className="ml-1 font-medium">{carrier.commissionRenewal}%</span>
                    </div>
                  )}
                </div>

                {/* Mobile-optimized specialties */}
                {carrier.specialties && carrier.specialties.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {carrier.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index} 
                          className="inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded truncate max-w-[80px]"
                          title={specialty}
                        >
                          {specialty}
                        </span>
                      ))}
                      {carrier.specialties.length > 3 && (
                        <span className="inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{carrier.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-3 pb-3 px-4 z-50">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmitPlacements}
            disabled={selectedCarriers.length === 0}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:bg-gray-400"
          >
            Submit to {selectedCarriers.length} Carrier{selectedCarriers.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );

  // Render success step
  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-3xl font-bold mb-4">Placement Submitted Successfully!</h2>
      <p className="text-gray-600 mb-2">
        Your placement for <strong>{clientInfo.businessName}</strong> has been submitted to {selectedCarriers.length} carrier{selectedCarriers.length !== 1 ? 's' : ''}.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Reference Number: <strong>{trackingNumber || 'PL-' + Date.now().toString().slice(-8)}</strong>
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="text-sm text-left text-gray-600 space-y-1">
          <li>• Carriers will review the submission</li>
          <li>• You'll receive quotes within {carriers[0]?.responseTime || '24-48 hours'}</li>
          <li>• Check your email for updates</li>
          <li>• View this placement in "My Placements"</li>
        </ul>
      </div>
      
      <div className="space-x-4">
        <button
          onClick={() => router.push('/placements')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          View My Placements
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
              lossHistory: 'No claims (5+ years)',
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
            setError('');
            setPostalCodeInfo('');
            setTrackingNumber('');
            setAiPredictions(null);
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🚀 Mitch Insurance - New Placement</h1>
            {session?.user && (
              <div className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </div>
            )}
          </div>
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