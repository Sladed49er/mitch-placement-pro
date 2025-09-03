// ============================================
// FILE: /app/components/ComparativeRater.tsx
// LOCATION: This file should be at /app/components/ComparativeRater.tsx
// PURPOSE: Comparative rater component for Step 2 of the placement wizard
// ============================================

'use client';

import { useState, useEffect } from 'react';

interface ComparativeRaterProps {
  businessDetails: any;
  setBusinessDetails: (details: any) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

export default function ComparativeRater({
  businessDetails,
  setBusinessDetails,
  onNext,
  onBack,
  loading,
  error
}: ComparativeRaterProps) {
  
  const [showConditionalFields, setShowConditionalFields] = useState<Set<string>>(new Set());

  // Update conditional fields when values change
  useEffect(() => {
    const conditionals = new Set<string>();
    
    // Show prior experience for new businesses
    if (businessDetails.yearsInBusiness === '0' || businessDetails.yearsInBusiness === '1') {
      conditionals.add('prior_experience');
    }
    
    // Show subcontractor details if they use subs
    if (businessDetails.uses_subcontractors === 'yes') {
      conditionals.add('subcontractor_details');
    }
    
    // Show US operations if they have US exposure
    if (businessDetails.operations_location === 'canada_us' || 
        businessDetails.operations_location === 'us_only' ||
        businessDetails.operations_location === 'international') {
      conditionals.add('us_percentage');
    }
    
    setShowConditionalFields(conditionals);
  }, [businessDetails]);

  const handleFieldChange = (field: string, value: any) => {
    setBusinessDetails({
      ...businessDetails,
      [field]: value
    });
  };

  const validateForm = () => {
    // Required fields check
    const required = [
      'industry',
      'annual_revenue_range',
      'employee_range',
      'yearsInBusiness',
      'operations_location',
      'building_occupancy',
      'loss_history'
    ];
    
    for (const field of required) {
      if (!businessDetails[field]) {
        return false;
      }
    }
    
    // Check conditional required fields
    if (showConditionalFields.has('prior_experience') && !businessDetails.prior_experience) {
      return false;
    }
    
    if (showConditionalFields.has('subcontractor_details') && !businessDetails.subcontractor_percentage) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Business Information</h2>
      <p className="text-sm text-gray-600 mb-6">
        These questions help us match you with multiple carriers at once. All fields with * are required.
      </p>

      {/* SECTION 1: BUSINESS CLASSIFICATION */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">Business Classification</h3>
        
        {/* Primary Industry */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Primary Industry/Operations <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.industry || ''}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
          >
            <option value="">Select your primary industry</option>
            <optgroup label="Construction & Trades">
              <option value="236110">Residential Building Construction</option>
              <option value="236220">Commercial & Institutional Construction</option>
              <option value="236210">Industrial Building Construction</option>
              <option value="238110">Poured Concrete Foundation</option>
              <option value="238210">Electrical Contractors</option>
              <option value="238220">Plumbing, Heating & Air-Conditioning</option>
              <option value="238990">Other Specialty Trade Contractors</option>
            </optgroup>
            <optgroup label="Retail Trade">
              <option value="445110">Supermarkets & Grocery Stores</option>
              <option value="445120">Convenience Stores</option>
              <option value="448110">Men's Clothing Stores</option>
              <option value="448120">Women's Clothing Stores</option>
            </optgroup>
            <optgroup label="Professional Services">
              <option value="541110">Offices of Lawyers</option>
              <option value="541211">Offices of Accountants</option>
              <option value="541330">Engineering Services</option>
              <option value="541511">Computer Programming Services</option>
              <option value="541512">Computer Systems Design</option>
              <option value="541611">Management Consulting Services</option>
              <option value="541810">Advertising Agencies</option>
            </optgroup>
            <optgroup label="Real Estate">
              <option value="531210">Offices of Real Estate Agents & Brokers</option>
              <option value="531320">Offices of Real Estate Appraisers</option>
            </optgroup>
            <optgroup label="Food Services">
              <option value="722511">Full-Service Restaurants</option>
              <option value="722513">Limited-Service Restaurants</option>
            </optgroup>
            <optgroup label="Personal Services">
              <option value="812111">Barber Shops</option>
              <option value="812112">Beauty Salons</option>
              <option value="812199">Other Personal Care (Spas, etc.)</option>
            </optgroup>
            <optgroup label="Transportation">
              <option value="484110">Local Freight Trucking</option>
              <option value="484121">Long-Distance Freight Trucking</option>
            </optgroup>
            <optgroup label="Agriculture">
              <option value="111110">Soybean Farming</option>
              <option value="111120">Oilseed Farming</option>
              <option value="111140">Wheat Farming</option>
            </optgroup>
          </select>
          <p className="text-xs text-gray-500 mt-1">This determines which carriers can quote your business</p>
        </div>

        {/* Secondary Operations */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Do you have secondary operations? (&gt;20% of revenue)
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.secondary_operations || 'no'}
            onChange={(e) => handleFieldChange('secondary_operations', e.target.value)}
          >
            <option value="no">No - Single line of business</option>
            <option value="yes_related">Yes - Related to primary (e.g., retail + online)</option>
            <option value="yes_different">Yes - Different industry</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: BUSINESS SIZE & EXPERIENCE */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">Size & Experience</h3>
        
        {/* Annual Revenue */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Revenue <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.annual_revenue_range || ''}
            onChange={(e) => handleFieldChange('annual_revenue_range', e.target.value)}
          >
            <option value="">Select revenue range</option>
            <option value="0-100k">Under $100,000</option>
            <option value="100k-250k">$100,000 - $250,000</option>
            <option value="250k-500k">$250,000 - $500,000</option>
            <option value="500k-1m">$500,000 - $1,000,000</option>
            <option value="1m-2.5m">$1,000,000 - $2,500,000</option>
            <option value="2.5m-5m">$2,500,000 - $5,000,000</option>
            <option value="5m-10m">$5,000,000 - $10,000,000</option>
            <option value="10m-25m">$10,000,000 - $25,000,000</option>
            <option value="25m-50m">$25,000,000 - $50,000,000</option>
            <option value="50m+">Over $50,000,000</option>
          </select>
        </div>

        {/* Number of Employees */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Employees (including owners) <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.employee_range || ''}
            onChange={(e) => handleFieldChange('employee_range', e.target.value)}
          >
            <option value="">Select employee range</option>
            <option value="1-2">1-2 employees</option>
            <option value="3-5">3-5 employees</option>
            <option value="6-10">6-10 employees</option>
            <option value="11-25">11-25 employees</option>
            <option value="26-50">26-50 employees</option>
            <option value="51-100">51-100 employees</option>
            <option value="101-250">101-250 employees</option>
            <option value="250+">Over 250 employees</option>
          </select>
        </div>

        {/* Annual Payroll */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Payroll (including benefits)
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.annual_payroll || ''}
            onChange={(e) => handleFieldChange('annual_payroll', e.target.value)}
          >
            <option value="">Select payroll range</option>
            <option value="0-50k">Under $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k-250k">$100,000 - $250,000</option>
            <option value="250k-500k">$250,000 - $500,000</option>
            <option value="500k-1m">$500,000 - $1,000,000</option>
            <option value="1m-2.5m">$1,000,000 - $2,500,000</option>
            <option value="2.5m+">Over $2,500,000</option>
          </select>
        </div>

        {/* Years in Business */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Years in Business <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.yearsInBusiness || ''}
            onChange={(e) => handleFieldChange('yearsInBusiness', e.target.value)}
          >
            <option value="">Select years in business</option>
            <option value="0">New Business (less than 1 year)</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5">5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="11-25">11-25 years</option>
            <option value="25+">Over 25 years</option>
          </select>
        </div>

        {/* Prior Experience (conditional) */}
        {showConditionalFields.has('prior_experience') && (
          <div className="bg-yellow-50 p-3 rounded">
            <label className="block text-sm font-medium mb-1">
              Industry Experience <span className="text-red-500">*</span>
              <span className="text-xs text-gray-600 ml-2">(Required for new businesses)</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={businessDetails.prior_experience || ''}
              onChange={(e) => handleFieldChange('prior_experience', e.target.value)}
              placeholder="Years of experience in this industry"
              min="0"
            />
            <p className="text-xs text-gray-600 mt-1">Owner/management experience helps with carrier acceptance</p>
          </div>
        )}
      </div>

      {/* SECTION 3: OPERATIONS & RISK */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">Operations & Risk Factors</h3>
        
        {/* Geographic Operations */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Where do you operate? <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.operations_location || ''}
            onChange={(e) => handleFieldChange('operations_location', e.target.value)}
          >
            <option value="">Select operating territory</option>
            <option value="local">Local only (within 50km)</option>
            <option value="provincial">Provincial (single province)</option>
            <option value="regional">Regional (2-3 provinces)</option>
            <option value="national">National (Canada-wide)</option>
            <option value="canada_us">Canada + United States</option>
            <option value="international">International</option>
          </select>
        </div>

        {/* US Operations (conditional) */}
        {showConditionalFields.has('us_percentage') && (
          <div className="bg-yellow-50 p-3 rounded">
            <label className="block text-sm font-medium mb-1">
              Percentage of US Operations <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={businessDetails.us_percentage || ''}
              onChange={(e) => handleFieldChange('us_percentage', e.target.value)}
            >
              <option value="">Select US exposure</option>
              <option value="0-10">Less than 10%</option>
              <option value="10-25">10-25%</option>
              <option value="25-50">25-50%</option>
              <option value="50+">Over 50%</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">US operations may limit carrier options or require special coverage</p>
          </div>
        )}

        {/* Building/Location */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Building Occupancy <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.building_occupancy || ''}
            onChange={(e) => handleFieldChange('building_occupancy', e.target.value)}
          >
            <option value="">Select occupancy type</option>
            <option value="owner">Own building</option>
            <option value="tenant_full">Tenant - entire building</option>
            <option value="tenant_partial">Tenant - partial building</option>
            <option value="home_based">Home-based business</option>
            <option value="no_location">No fixed location (mobile)</option>
            <option value="multiple">Multiple locations</option>
          </select>
        </div>

        {/* Subcontractors */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Do you use subcontractors?
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.uses_subcontractors || 'no'}
            onChange={(e) => handleFieldChange('uses_subcontractors', e.target.value)}
          >
            <option value="no">No subcontractors</option>
            <option value="yes">Yes - we use subcontractors</option>
          </select>
        </div>

        {/* Subcontractor Details (conditional) */}
        {showConditionalFields.has('subcontractor_details') && (
          <div className="bg-yellow-50 p-3 rounded space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Percentage of work subcontracted <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={businessDetails.subcontractor_percentage || ''}
                onChange={(e) => handleFieldChange('subcontractor_percentage', e.target.value)}
              >
                <option value="">Select percentage</option>
                <option value="0-10">Less than 10%</option>
                <option value="10-25">10-25%</option>
                <option value="25-50">25-50%</option>
                <option value="50-75">50-75%</option>
                <option value="75+">Over 75%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Do you require certificates of insurance from all subcontractors?
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={businessDetails.requires_certificates || ''}
                onChange={(e) => handleFieldChange('requires_certificates', e.target.value)}
              >
                <option value="">Select</option>
                <option value="always">Yes - always required</option>
                <option value="sometimes">Sometimes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )}

        {/* Claims History */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Claims History (past 5 years) <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.loss_history || ''}
            onChange={(e) => handleFieldChange('loss_history', e.target.value)}
          >
            <option value="">Select claims history</option>
            <option value="none">No claims or losses</option>
            <option value="1_small">1 claim under $10,000</option>
            <option value="1_large">1 claim over $10,000</option>
            <option value="2-3_claims">2-3 claims</option>
            <option value="4+_claims">4+ claims</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Include any claims whether insured or not</p>
        </div>
      </div>

      {/* SECTION 4: ADDITIONAL RISK FACTORS */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">Additional Factors</h3>
        
        {/* Previous Insurance */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Current/Previous Commercial Insurance
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={businessDetails.previous_insurance || ''}
            onChange={(e) => handleFieldChange('previous_insurance', e.target.value)}
          >
            <option value="">Select insurance history</option>
            <option value="currently_insured">Currently insured</option>
            <option value="lapsed_30">Lapsed less than 30 days</option>
            <option value="lapsed_90">Lapsed 31-90 days</option>
            <option value="lapsed_over_90">Lapsed over 90 days</option>
            <option value="never">Never had commercial insurance</option>
          </select>
        </div>

        {/* Safety Programs (for certain industries) */}
        {(businessDetails.industry?.startsWith('236') || businessDetails.industry?.startsWith('238')) && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Safety Program
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={businessDetails.safety_program || ''}
              onChange={(e) => handleFieldChange('safety_program', e.target.value)}
            >
              <option value="">Select safety program status</option>
              <option value="written_program">Written safety program in place</option>
              <option value="informal">Informal safety procedures</option>
              <option value="none">No formal safety program</option>
              <option value="certified">COR/Industry certified program</option>
            </select>
          </div>
        )}

        {/* Specific Exposures */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Do any of these apply to your business? (Check all that apply)
          </label>
          <div className="space-y-2 mt-2">
            {[
              { id: 'work_heights', label: 'Work at heights (over 15 feet)' },
              { id: 'hazmat', label: 'Handle hazardous materials' },
              { id: 'professional_services', label: 'Provide professional advice/consulting' },
              { id: 'products_sold', label: 'Manufacture or import products for sale' },
              { id: 'alcohol_sales', label: 'Sell or serve alcohol' },
              { id: 'vehicle_repair', label: 'Vehicle/equipment repair or service' },
              { id: 'data_storage', label: 'Store customer personal/financial data' },
              { id: 'none_apply', label: 'None of these apply' }
            ].map(exposure => (
              <label key={exposure.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={businessDetails[exposure.id] || false}
                  onChange={(e) => {
                    if (exposure.id === 'none_apply' && e.target.checked) {
                      // Clear all other checkboxes if "none" is selected
                      ['work_heights', 'hazmat', 'professional_services', 'products_sold', 
                       'alcohol_sales', 'vehicle_repair', 'data_storage'].forEach(id => {
                        handleFieldChange(id, false);
                      });
                    } else if (exposure.id !== 'none_apply' && e.target.checked) {
                      // Clear "none" if any other is selected
                      handleFieldChange('none_apply', false);
                    }
                    handleFieldChange(exposure.id, e.target.checked);
                  }}
                />
                <span className="text-sm">{exposure.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (validateForm()) {
              onNext();
            } else {
              // Scroll to top to show user what's missing
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={loading || !validateForm()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Finding Carriers...' : 'Find Matching Carriers'}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Why these questions?</strong> Each carrier has different requirements. 
          By answering these questions once, we can submit to multiple carriers simultaneously, 
          saving you from filling out multiple applications.
        </p>
      </div>
    </div>
  );
}