'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import postalCodesData from '@/data/postal-codes.json';

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

// Common Canadian cities by province - defined at the top level
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

// Lookup city and province from postal code
const lookupPostalCode = (postalCode: string): { province: string; city: string } | null => {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length >= 3) {
    const prefix = cleaned.substring(0, 3);
    // Access the postalCodes object from the imported data
    return (postalCodesData as any).postalCodes[prefix] || null;
  }
  return null;
};

export default function PlacementWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [naicsCodes, setNaicsCodes] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [postalCodeInfo, setPostalCodeInfo] = useState<string>('');
  
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
      setNaicsCodes([]);
    }
  };

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

  // Format currency
  const formatCurrency = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return '';
    
    // Convert to number and format with commas
    const num = parseInt(cleaned);
    return num.toLocaleString();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientInfo({...clientInfo, phone: formatted});
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    
    // Auto-populate city and province if we find a match
    const locationData = lookupPostalCode(formatted);
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
      if (formatted.length >= 3) {
        setPostalCodeInfo('Postal code not recognized - please verify city and province');
      } else {
        setPostalCodeInfo('');
      }
    }
    
    // Clear error if they're typing
    if (error && error.includes('postal code')) {
      setError('');
    }
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setBusinessDetails({...businessDetails, annualRevenue: formatted.replace(/,/g, '')});
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
           businessDetails.annualRevenue && 
           businessDetails.numberOfEmployees && 
           businessDetails.yearsInBusiness;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
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

  const handleFindCarriers = async () => {
    if (!validateStep2()) {
      setError('Please fill in all required fields');
      return;
    }

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

  const handleSubmitPlacements = () => {
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

  const renderBusinessDetails = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Business Details</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Industry (NAICS) <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={businessDetails.industry}
          onChange={(e) => setBusinessDetails({...businessDetails, industry: e.target.value})}
        >
          <option value="">Select an industry</option>
          {naicsCodes.map((code) => (
            <option key={code.code} value={code.code}>
              {code.code} - {code.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Annual Revenue (CAD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="text"
            className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.annualRevenue ? formatCurrency(businessDetails.annualRevenue) : ''}
            onChange={handleRevenueChange}
            placeholder="2,000,000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Employees <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.numberOfEmployees}
            onChange={(e) => setBusinessDetails({...businessDetails, numberOfEmployees: e.target.value})}
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Years in Business <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.yearsInBusiness}
            onChange={(e) => setBusinessDetails({...businessDetails, yearsInBusiness: e.target.value})}
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Loss History <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={businessDetails.lossHistory}
          onChange={(e) => setBusinessDetails({...businessDetails, lossHistory: e.target.value})}
        >
          <option value="No claims (5+ years)">No claims (5+ years)</option>
          <option value="1-2 claims">1-2 claims in last 5 years</option>
          <option value="3+ claims">3+ claims in last 5 years</option>
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
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
          onClick={handleFindCarriers}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Finding Carriers...' : 'Find Carriers'}
        </button>
      </div>
    </div>
  );

  const renderCarrierSelection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Select Carriers</h2>
      
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
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCarriers.includes(carrier.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCarrierSelection(carrier.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCarriers.includes(carrier.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600"
                      />
                      <h3 className="font-semibold text-lg">{carrier.name}</h3>
                      {carrier.recommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
                          RECOMMENDED
                        </span>
                      )}
                      {carrier.apiEnabled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          API Ready
                        </span>
                      )}
                      {carrier.partnerStatus === 'Preferred' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          Preferred Partner
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">AM Best Rating:</span> {carrier.amBestRating}
                      </div>
                      <div>
                        <span className="font-medium">Response Time:</span> {carrier.responseTime}
                      </div>
                      <div>
                        <span className="font-medium">Min Premium:</span> ${carrier.minPremium.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">New Business:</span> {carrier.commissionNew}%
                      </div>
                      <div>
                        <span className="font-medium">Renewal:</span> {carrier.commissionRenewal}%
                      </div>
                      <div>
                        <span className="font-medium">Max Revenue:</span> ${(carrier.maxRevenue / 1000000).toFixed(0)}M
                      </div>
                    </div>
                    
                    {carrier.specialties && carrier.specialties.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Specialties: </span>
                        {carrier.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded mr-1">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {carrier.matchScore}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
      <h2 className="text-3xl font-bold mb-4">Placement Submitted Successfully!</h2>
      <p className="text-gray-600 mb-2">
        Your placement for <strong>{clientInfo.businessName}</strong> has been submitted to {selectedCarriers.length} carrier{selectedCarriers.length !== 1 ? 's' : ''}.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Reference Number: <strong>PL-{Date.now().toString().slice(-8)}</strong>
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="text-sm text-left text-gray-600 space-y-1">
          <li>• Carriers will review the submission</li>
          <li>• You'll receive quotes within {carriers[0]?.responseTime || '24-48 hours'}</li>
          <li>• Check your email for updates</li>
        </ul>
      </div>
      
      <div className="space-x-4">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
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
              lossHistory: 'No claims (5+ years)'
            });
            setCarriers([]);
            setSelectedCarriers([]);
            setError('');
            setPostalCodeInfo('');
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
          <h1 className="text-2xl font-bold text-gray-900">🍁 Mitch Insurance - New Placement</h1>
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