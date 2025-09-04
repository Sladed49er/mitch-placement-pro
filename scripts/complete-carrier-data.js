// FILE: scripts/complete-carrier-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Additional POC data to make carriers more complete
const additionalCarrierData = [
  {
    carrierId: 'intact',
    appSubmissionTime: '2-3 business days',
    appointmentDate: new Date('2023-01-15'),
    specialNotes: 'Preferred partner. Fast turnaround on quotes. Strong appetite for hospitality and retail sectors.',
    preferredBrokerVolume: 500000,
    claimsRatio: 0.68,
    yearEstablished: 1809,
    employeeCount: 26000,
    annualRevenue: 12500000000
  },
  {
    carrierId: 'aviva',
    appSubmissionTime: '3-5 business days',
    appointmentDate: new Date('2023-02-01'),
    specialNotes: 'Good for tech startups. Competitive cyber liability rates. Requires detailed application for risks over $10M.',
    preferredBrokerVolume: 250000,
    claimsRatio: 0.72,
    yearEstablished: 1696,
    employeeCount: 22000,
    annualRevenue: 15000000000
  },
  {
    carrierId: 'wawanesa',
    appSubmissionTime: '2-4 business days',
    appointmentDate: new Date('2023-03-10'),
    specialNotes: 'Regional leader in Western Canada. Strong farm and agriculture expertise. Manual processes - no API.',
    preferredBrokerVolume: 300000,
    claimsRatio: 0.65,
    yearEstablished: 1896,
    employeeCount: 5200,
    annualRevenue: 3500000000
  },
  {
    carrierId: 'economical',
    appSubmissionTime: '3-4 business days',
    appointmentDate: new Date('2023-01-20'),
    specialNotes: 'Recently rebranded to Definity. Good package deals for small commercial. Strong in contractor space.',
    preferredBrokerVolume: 200000,
    claimsRatio: 0.70,
    yearEstablished: 1871,
    employeeCount: 2700,
    annualRevenue: 2800000000
  },
  {
    carrierId: 'gore',
    appSubmissionTime: '1-2 business days',
    appointmentDate: new Date('2023-04-15'),
    specialNotes: 'Mutual company with local decision making. Excellent for farm and rural risks. Personal touch service.',
    preferredBrokerVolume: 150000,
    claimsRatio: 0.64,
    yearEstablished: 1839,
    employeeCount: 650,
    annualRevenue: 1500000000
  },
  {
    carrierId: 'chubb',
    appSubmissionTime: '5-7 business days',
    appointmentDate: new Date('2022-11-01'),
    specialNotes: 'Premium carrier for complex risks. Minimum premiums are high but coverage is comprehensive. Global capabilities.',
    preferredBrokerVolume: 1000000,
    claimsRatio: 0.62,
    yearEstablished: 1882,
    employeeCount: 31000,
    annualRevenue: 44000000000
  },
  {
    carrierId: 'travelers',
    appSubmissionTime: '3-5 business days',
    appointmentDate: new Date('2023-02-15'),
    specialNotes: 'Strong in construction and technology sectors. Good risk control services. Prefers accounts over $5K premium.',
    preferredBrokerVolume: 750000,
    claimsRatio: 0.66,
    yearEstablished: 1853,
    employeeCount: 30000,
    annualRevenue: 35000000000
  },
  {
    carrierId: 'northbridge',
    appSubmissionTime: '2-3 business days',
    appointmentDate: new Date('2023-01-30'),
    specialNotes: 'Part of Fairfax group. Specializes in transportation and energy. Good claims handling reputation.',
    preferredBrokerVolume: 400000,
    claimsRatio: 0.69,
    yearEstablished: 1960,
    employeeCount: 1400,
    annualRevenue: 1800000000
  },
  {
    carrierId: 'rsa',
    appSubmissionTime: '3-4 business days',
    appointmentDate: new Date('2023-03-01'),
    specialNotes: 'Now part of Intact. Strong marine and cargo expertise. Good for import/export businesses.',
    preferredBrokerVolume: 350000,
    claimsRatio: 0.71,
    yearEstablished: 1706,
    employeeCount: 3100,
    annualRevenue: 2200000000
  },
  {
    carrierId: 'zurich',
    appSubmissionTime: '4-6 business days',
    appointmentDate: new Date('2022-12-01'),
    specialNotes: 'Global reach important for international risks. Strong construction and surety bonds. Higher premiums but comprehensive.',
    preferredBrokerVolume: 800000,
    claimsRatio: 0.67,
    yearEstablished: 1872,
    employeeCount: 55000,
    annualRevenue: 60000000000
  }
];

// Enrich the existing data with more details
async function completeCarrierData() {
  console.log('📊 Adding complete POC data to carriers...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const data of additionalCarrierData) {
    try {
      // Get existing carrier data
      const existing = await prisma.carrier.findUnique({
        where: { carrierId: data.carrierId }
      });
      
      if (!existing) {
        console.log(`⚠️ Carrier ${data.carrierId} not found, skipping...`);
        continue;
      }
      
      // Update with additional fields while preserving existing data
      const updated = await prisma.carrier.update({
        where: { carrierId: data.carrierId },
        data: {
          // Add new fields that might be empty
          apiDetails: existing.apiDetails || {
            endpoint: `https://api.${data.carrierId}.ca/v1/quote`,
            authType: 'OAuth2',
            rateLimit: '100/hour',
            sandbox: true,
            documentation: `https://developers.${data.carrierId}.ca`
          },
          brokerPortal: existing.brokerPortal || {
            url: `https://broker.${data.carrierId}.ca`,
            features: ['Quote', 'Bind', 'Policy Service', 'Claims'],
            training: `https://training.${data.carrierId}.ca`,
            support: '24/7 phone and email'
          },
          contactInfo: existing.contactInfo || {
            underwriting: `underwriting@${data.carrierId}.ca`,
            claims: `claims@${data.carrierId}.ca`,
            brokerSupport: `broker.support@${data.carrierId}.ca`,
            phone: '1-800-XXX-XXXX',
            hours: 'Mon-Fri 8AM-8PM EST'
          },
          products: existing.products || {
            primary: ['General Liability', 'Property', 'Auto'],
            specialty: ['Professional Liability', 'Cyber', 'D&O'],
            packages: ['BOP', 'Contractor Package', 'Retail Package'],
            minPremiums: {
              GL: 750,
              Property: 1000,
              Auto: 1500,
              Professional: 2000
            }
          },
          underwritingGuidelines: existing.underwritingGuidelines || {
            appetiteScore: Math.floor(Math.random() * 30) + 70, // 70-100
            sweetSpots: ['Retail', 'Services', 'Light Manufacturing'],
            avoidList: ['Cannabis', 'Crypto', 'Asbestos'],
            documentation: ['Financial Statements', 'Loss Runs', 'Operations Description'],
            turnaround: data.appSubmissionTime,
            referralTriggers: ['New venture', 'High hazard', 'Large losses']
          }
        }
      });
      
      console.log(`✅ ${existing.name} - Enhanced with complete POC data`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating ${data.carrierId}:`, error.message);
      errorCount++;
    }
  }
  
  // Also update carriers that might not be in our additional data list
  console.log('\n🔧 Filling any remaining empty fields for other carriers...');
  
  const allCarriers = await prisma.carrier.findMany();
  
  for (const carrier of allCarriers) {
    // Skip if already processed
    if (additionalCarrierData.find(d => d.carrierId === carrier.carrierId)) {
      continue;
    }
    
    try {
      await prisma.carrier.update({
        where: { id: carrier.id },
        data: {
          // Ensure all carriers have at least basic data
          minPremium: carrier.minPremium || 1000,
          maxRevenue: carrier.maxRevenue || 10000000,
          commissionNew: carrier.commissionNew || 12,
          commissionRenewal: carrier.commissionRenewal || 10,
          responseTime: carrier.responseTime || '48-72 hours',
          partnerStatus: carrier.partnerStatus || 'Standard',
          apiDetails: carrier.apiDetails || {
            endpoint: 'Contact for API access',
            authType: 'TBD',
            rateLimit: 'TBD',
            sandbox: false
          },
          products: carrier.products || {
            primary: ['General Liability', 'Property'],
            specialty: [],
            packages: ['Small Business Package']
          }
        }
      });
      
      console.log(`✅ ${carrier.name} - Basic data ensured`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error with ${carrier.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount} carriers`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Display sample of the complete data
  console.log('\n📋 Sample Complete Carrier (Intact):');
  const sample = await prisma.carrier.findUnique({
    where: { carrierId: 'intact' }
  });
  
  console.log('Basic Info:', {
    name: sample.name,
    commissionNew: sample.commissionNew + '%',
    minPremium: '$' + sample.minPremium,
    provinces: sample.provinces.length + ' provinces'
  });
  
  console.log('API Details:', sample.apiDetails);
  console.log('Products:', sample.products);
  console.log('Portal:', sample.brokerPortal);
}

completeCarrierData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });