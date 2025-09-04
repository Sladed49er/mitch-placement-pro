// FILE: scripts/populate-carriers.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive carrier data for Canadian insurance companies
const carrierData = [
  {
    carrierId: 'intact',
    name: 'Intact Insurance',
    parentCompany: 'Intact Financial Corporation',
    amBestRating: 'A+',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    minPremium: 1500,
    maxRevenue: 50000000,
    commissionNew: 15,
    commissionRenewal: 12,
    responseTime: '24-48 hours',
    apiEnabled: true,
    partnerStatus: 'Preferred',
    specialties: ['Property', 'General Liability', 'Commercial Auto', 'Professional Liability'],
    products: {
      primary: ['CGL', 'Property', 'Auto', 'Umbrella'],
      specialty: ['Cyber', 'D&O', 'E&O']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Retail', 'Hospitality', 'Manufacturing', 'Professional Services'],
      excludedIndustries: ['Cannabis', 'Cryptocurrency', 'Adult Entertainment'],
      minYearsInBusiness: 3,
      minRevenue: 100000
    },
    brokerPortal: {
      url: 'https://broker.intact.ca',
      features: ['Quote', 'Bind', 'Issue', 'Endorse']
    },
    contactInfo: {
      underwriting: '1-877-341-1464',
      claims: '1-866-464-2424',
      brokerSupport: 'broker.support@intact.net'
    }
  },
  {
    carrierId: 'aviva',
    name: 'Aviva Canada',
    parentCompany: 'Aviva plc',
    amBestRating: 'A',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
    minPremium: 1000,
    maxRevenue: 25000000,
    commissionNew: 12,
    commissionRenewal: 10,
    responseTime: '48 hours',
    apiEnabled: true,
    partnerStatus: 'Standard',
    specialties: ['Small Business', 'Professional Liability', 'Cyber', 'Technology'],
    products: {
      primary: ['Business Package', 'CGL', 'Property'],
      specialty: ['Cyber', 'Tech E&O', 'Media Liability']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Technology', 'Professional Services', 'Healthcare', 'Real Estate'],
      excludedIndustries: ['Mining', 'Aviation', 'Weapons'],
      minYearsInBusiness: 2,
      minRevenue: 50000
    },
    brokerPortal: {
      url: 'https://broker.avivacanada.com',
      features: ['Quote', 'Bind', 'Policy Service']
    },
    contactInfo: {
      underwriting: '1-866-692-8482',
      claims: '1-866-692-8482',
      brokerSupport: 'brokerhelp@avivacanada.com'
    }
  },
  {
    carrierId: 'wawanesa',
    name: 'Wawanesa Insurance',
    parentCompany: 'Wawanesa Mutual Insurance Company',
    amBestRating: 'A+',
    headquarters: 'Winnipeg, MB',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NS', 'ON', 'PE', 'SK'],
    minPremium: 2000,
    maxRevenue: 30000000,
    commissionNew: 14,
    commissionRenewal: 11,
    responseTime: '24-72 hours',
    apiEnabled: false,
    partnerStatus: 'Standard',
    specialties: ['Agriculture', 'Property', 'Fleet', 'Construction'],
    products: {
      primary: ['Property', 'CGL', 'Commercial Auto'],
      specialty: ['Farm', 'Equipment Breakdown']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Agriculture', 'Transportation', 'Construction', 'Retail'],
      excludedIndustries: ['Nightclubs', 'Bars', 'Cannabis'],
      minYearsInBusiness: 3,
      minRevenue: 250000
    },
    brokerPortal: {
      url: 'https://broker.wawanesa.com',
      features: ['Quote', 'Bind']
    },
    contactInfo: {
      underwriting: '1-844-929-2637',
      claims: '1-844-929-2637',
      brokerSupport: 'commercial@wawanesa.com'
    }
  },
  {
    carrierId: 'economical',
    name: 'Definity Insurance Company',
    parentCompany: 'Definity Financial Corporation',
    amBestRating: 'A-',
    headquarters: 'Waterloo, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
    minPremium: 1200,
    maxRevenue: 35000000,
    commissionNew: 13,
    commissionRenewal: 10,
    responseTime: '48 hours',
    apiEnabled: true,
    partnerStatus: 'Standard',
    specialties: ['Package Policies', 'Manufacturing', 'Contractors', 'Wholesale'],
    products: {
      primary: ['Package', 'CGL', 'Property', 'Auto'],
      specialty: ['Contractors Package', 'Manufacturing']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Manufacturing', 'Wholesale', 'Service Industries', 'Contractors'],
      excludedIndustries: ['Asbestos', 'Fireworks', 'Explosives'],
      minYearsInBusiness: 2,
      minRevenue: 100000
    },
    brokerPortal: {
      url: 'https://broker.economical.com',
      features: ['Quote', 'Bind', 'Issue']
    },
    contactInfo: {
      underwriting: '1-800-265-2178',
      claims: '1-800-607-2424',
      brokerSupport: 'broker@economical.com'
    }
  },
  {
    carrierId: 'gore',
    name: 'Gore Mutual Insurance',
    parentCompany: 'Gore Mutual Insurance Company',
    amBestRating: 'B++',
    headquarters: 'Cambridge, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NS', 'ON', 'SK'],
    minPremium: 1800,
    maxRevenue: 20000000,
    commissionNew: 16,
    commissionRenewal: 13,
    responseTime: '24-48 hours',
    apiEnabled: false,
    partnerStatus: 'Regional',
    specialties: ['Agriculture', 'Rural Commercial', 'Small Business', 'Equipment'],
    products: {
      primary: ['Farm', 'Property', 'CGL', 'Auto'],
      specialty: ['Equipment Breakdown', 'Agricultural']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Agriculture', 'Food Processing', 'Rural Retail', 'Equipment Dealers'],
      excludedIndustries: ['High Tech', 'Pharmaceuticals', 'Aviation'],
      minYearsInBusiness: 3,
      minRevenue: 150000
    },
    brokerPortal: {
      url: 'https://broker.goremutual.ca',
      features: ['Quote', 'Bind']
    },
    contactInfo: {
      underwriting: '1-800-265-8600',
      claims: '1-800-265-8600',
      brokerSupport: 'broker@goremutual.ca'
    }
  },
  {
    carrierId: 'chubb',
    name: 'Chubb Insurance Canada',
    parentCompany: 'Chubb Limited',
    amBestRating: 'A++',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    minPremium: 5000,
    maxRevenue: 100000000,
    commissionNew: 10,
    commissionRenewal: 8,
    responseTime: '72 hours',
    apiEnabled: true,
    partnerStatus: 'Specialty',
    specialties: ['D&O', 'E&O', 'Cyber', 'High-Value Commercial', 'International'],
    products: {
      primary: ['D&O', 'E&O', 'Cyber', 'Umbrella'],
      specialty: ['Political Risk', 'Kidnap & Ransom', 'Fine Art']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Financial Services', 'Technology', 'Manufacturing', 'Life Sciences'],
      excludedIndustries: ['Adult Entertainment', 'Weapons', 'Tobacco'],
      minYearsInBusiness: 5,
      minRevenue: 1000000
    },
    brokerPortal: {
      url: 'https://www.chubb.com/ca-en/brokers',
      features: ['Quote', 'Bind', 'Global Access']
    },
    contactInfo: {
      underwriting: '1-416-368-2811',
      claims: '1-800-532-4822',
      brokerSupport: 'brokercanada@chubb.com'
    }
  },
  {
    carrierId: 'travelers',
    name: 'Travelers Canada',
    parentCompany: 'The Travelers Companies Inc.',
    amBestRating: 'A++',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
    minPremium: 2500,
    maxRevenue: 75000000,
    commissionNew: 11,
    commissionRenewal: 9,
    responseTime: '48 hours',
    apiEnabled: true,
    partnerStatus: 'Preferred',
    specialties: ['Technology', 'Professional Services', 'Manufacturing', 'Construction'],
    products: {
      primary: ['CGL', 'Property', 'Auto', 'Umbrella'],
      specialty: ['Tech E&O', 'Cyber', 'Construction']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Technology', 'Professional Services', 'Manufacturing', 'Construction'],
      excludedIndustries: ['Cannabis', 'Tobacco', 'Firearms'],
      minYearsInBusiness: 3,
      minRevenue: 500000
    },
    brokerPortal: {
      url: 'https://www.travelerscanada.com',
      features: ['Quote', 'Bind', 'Risk Control Tools']
    },
    contactInfo: {
      underwriting: '1-800-661-5522',
      claims: '1-800-661-5522',
      brokerSupport: 'brokercanada@travelers.com'
    }
  },
  {
    carrierId: 'northbridge',
    name: 'Northbridge Insurance',
    parentCompany: 'Fairfax Financial Holdings',
    amBestRating: 'A',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    minPremium: 2000,
    maxRevenue: 40000000,
    commissionNew: 14,
    commissionRenewal: 11,
    responseTime: '24-48 hours',
    apiEnabled: false,
    partnerStatus: 'Standard',
    specialties: ['Transportation', 'Construction', 'Manufacturing', 'Energy'],
    products: {
      primary: ['CGL', 'Property', 'Fleet', 'Cargo'],
      specialty: ['Transportation', 'Energy', 'Construction']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Transportation', 'Construction', 'Energy', 'Manufacturing'],
      excludedIndustries: ['Hazardous Waste', 'Nuclear', 'Munitions'],
      minYearsInBusiness: 3,
      minRevenue: 250000
    },
    brokerPortal: {
      url: 'https://www.nbins.com/broker',
      features: ['Quote', 'Bind', 'Claims Service']
    },
    contactInfo: {
      underwriting: '1-855-620-6262',
      claims: '1-855-620-6262',
      brokerSupport: 'broker@nbins.com'
    }
  },
  {
    carrierId: 'rsa',
    name: 'RSA Canada',
    parentCompany: 'Intact Financial Corporation',
    amBestRating: 'A+',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
    minPremium: 1500,
    maxRevenue: 45000000,
    commissionNew: 13,
    commissionRenewal: 10,
    responseTime: '48 hours',
    apiEnabled: true,
    partnerStatus: 'Standard',
    specialties: ['Marine', 'Professional Services', 'Real Estate', 'Environmental'],
    products: {
      primary: ['Marine', 'Property', 'CGL', 'Professional'],
      specialty: ['Environmental', 'Marine Cargo']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Marine', 'Real Estate', 'Professional Services', 'Environmental'],
      excludedIndustries: ['Underground Mining', 'Hazardous Materials'],
      minYearsInBusiness: 2,
      minRevenue: 100000
    },
    brokerPortal: {
      url: 'https://www.rsagroup.ca',
      features: ['Quote', 'Bind', 'Marine Specialty']
    },
    contactInfo: {
      underwriting: '1-800-319-9993',
      claims: '1-800-319-9993',
      brokerSupport: 'broker@rsagroup.ca'
    }
  },
  {
    carrierId: 'zurich',
    name: 'Zurich Canada',
    parentCompany: 'Zurich Insurance Group',
    amBestRating: 'A+',
    headquarters: 'Toronto, ON',
    provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
    minPremium: 3000,
    maxRevenue: 80000000,
    commissionNew: 12,
    commissionRenewal: 9,
    responseTime: '48-72 hours',
    apiEnabled: true,
    partnerStatus: 'Preferred',
    specialties: ['Construction', 'Technology', 'International', 'Risk Engineering'],
    products: {
      primary: ['CGL', 'Property', 'International', 'Builders Risk'],
      specialty: ['Global Programs', 'Construction Wrap-Up']
    },
    underwritingGuidelines: {
      preferredIndustries: ['Construction', 'Technology', 'Manufacturing', 'International Trade'],
      excludedIndustries: ['Cryptocurrency', 'Cannabis Production'],
      minYearsInBusiness: 4,
      minRevenue: 750000
    },
    brokerPortal: {
      url: 'https://www.zurichcanada.com/broker',
      features: ['Quote', 'Bind', 'Risk Engineering']
    },
    contactInfo: {
      underwriting: '1-416-586-3000',
      claims: '1-800-387-5514',
      brokerSupport: 'broker.ca@zurich.com'
    }
  }
];

async function populateCarriers() {
  console.log('🚀 Starting carrier population...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const carrier of carrierData) {
    try {
      const result = await prisma.carrier.upsert({
        where: { carrierId: carrier.carrierId },
        update: carrier,
        create: carrier
      });
      
      console.log(`✅ ${result.name} - Updated successfully`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating ${carrier.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount} carriers`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show sample commission rates
  console.log('\n💰 Commission Rates Summary:');
  const carriers = await prisma.carrier.findMany({
    select: {
      name: true,
      commissionNew: true,
      commissionRenewal: true
    }
  });
  
  carriers.forEach(c => {
    if (c.commissionNew) {
      console.log(`${c.name}: New ${c.commissionNew}% | Renewal ${c.commissionRenewal}%`);
    }
  });
}

populateCarriers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });