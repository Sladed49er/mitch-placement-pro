const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🍁 Seeding Mitch Placement Pro database...')

  // Create NAICS codes (Canadian industries)
  const naicsCodes = [
    { code: '541110', description: 'Offices of Lawyers', category: 'Professional', riskLevel: 'preferred', baseRate: 0.008 },
    { code: '541211', description: 'Offices of CPAs', category: 'Professional', riskLevel: 'preferred', baseRate: 0.006 },
    { code: '541330', description: 'Engineering Services', category: 'Professional', riskLevel: 'preferred', baseRate: 0.007 },
    { code: '541511', description: 'Custom Computer Programming', category: 'Technology', riskLevel: 'preferred', baseRate: 0.005 },
    { code: '238210', description: 'Electrical Contractors', category: 'Construction', riskLevel: 'standard', baseRate: 0.015 },
    { code: '238220', description: 'Plumbing & HVAC Contractors', category: 'Construction', riskLevel: 'standard', baseRate: 0.014 },
    { code: '236220', description: 'Commercial Building Construction', category: 'Construction', riskLevel: 'standard', baseRate: 0.018 },
    { code: '238160', description: 'Roofing Contractors', category: 'Construction', riskLevel: 'substandard', baseRate: 0.025 },
    { code: '445110', description: 'Supermarkets and Grocery', category: 'Retail', riskLevel: 'preferred', baseRate: 0.009 },
    { code: '453310', description: 'Cannabis Stores', category: 'Retail', riskLevel: 'standard', baseRate: 0.016 },
    { code: '722511', description: 'Full-Service Restaurants', category: 'Hospitality', riskLevel: 'standard', baseRate: 0.012 },
    { code: '111110', description: 'Soybean Farming', category: 'Agriculture', riskLevel: 'standard', baseRate: 0.011 },
    { code: '211110', description: 'Oil and Gas Extraction', category: 'Energy', riskLevel: 'substandard', baseRate: 0.022 },
  ]

  for (const naics of naicsCodes) {
    await prisma.nAICSCode.upsert({
      where: { code: naics.code },
      update: naics,
      create: naics,
    })
  }

  // Create Canadian insurance carriers
  const carriers = [
    {
      carrierId: 'INT001',
      name: 'Intact Insurance',
      amBestRating: 'A+',
      provinces: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB'],
      linesOfBusiness: ['property', 'casualty', 'auto', 'specialty'],
      minPremium: 2500,
      maxRevenue: 50000000,
      commissionNew: 15,
      commissionRenewal: 12.5,
      responseTime: '2-4 hours',
      apiEnabled: true,
      mitchPartner: true,
    },
    {
      carrierId: 'AVI001',
      name: 'Aviva Canada',
      amBestRating: 'A',
      provinces: ['ON', 'QC', 'BC', 'AB'],
      linesOfBusiness: ['property', 'casualty', 'professional'],
      minPremium: 3000,
      maxRevenue: 40000000,
      commissionNew: 12,
      commissionRenewal: 10,
      responseTime: '4-6 hours',
      apiEnabled: false,
      mitchPartner: false,
    },
    {
      carrierId: 'NOR001',
      name: 'Northbridge Insurance',
      amBestRating: 'A',
      provinces: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK'],
      linesOfBusiness: ['property', 'casualty', 'construction', 'commercial_auto'],
      minPremium: 5000,
      maxRevenue: 75000000,
      commissionNew: 14,
      commissionRenewal: 12,
      responseTime: '3-5 hours',
      apiEnabled: true,
      mitchPartner: true,
    },
    {
      carrierId: 'WAW001',
      name: 'Wawanesa Insurance',
      amBestRating: 'A',
      provinces: ['MB', 'SK', 'AB', 'BC', 'ON'],
      linesOfBusiness: ['property', 'casualty', 'farm', 'auto'],
      minPremium: 2000,
      maxRevenue: 30000000,
      commissionNew: 13,
      commissionRenewal: 11,
      responseTime: '3-5 hours',
      apiEnabled: false,
      mitchPartner: false,
    },
  ]

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { carrierId: carrier.carrierId },
      update: carrier,
      create: carrier,
    })
  }

  // Create carrier appetites
  const appetites = [
    // Intact - loves tech and professional
    { carrierId: 'INT001', naicsCode: '541511', appetiteScore: 95 },
    { carrierId: 'INT001', naicsCode: '541110', appetiteScore: 90 },
    { carrierId: 'INT001', naicsCode: '541211', appetiteScore: 88 },
    { carrierId: 'INT001', naicsCode: '238210', appetiteScore: 40 },
    
    // Aviva - professional services focus
    { carrierId: 'AVI001', naicsCode: '541110', appetiteScore: 92 },
    { carrierId: 'AVI001', naicsCode: '541211', appetiteScore: 90 },
    { carrierId: 'AVI001', naicsCode: '541330', appetiteScore: 85 },
    { carrierId: 'AVI001', naicsCode: '238160', appetiteScore: 20 },
    
    // Northbridge - construction specialist
    { carrierId: 'NOR001', naicsCode: '238210', appetiteScore: 95 },
    { carrierId: 'NOR001', naicsCode: '238220', appetiteScore: 92 },
    { carrierId: 'NOR001', naicsCode: '236220', appetiteScore: 90 },
    { carrierId: 'NOR001', naicsCode: '541511', appetiteScore: 60 },
    
    // Wawanesa - agriculture and rural
    { carrierId: 'WAW001', naicsCode: '111110', appetiteScore: 98 },
    { carrierId: 'WAW001', naicsCode: '211110', appetiteScore: 85 },
    { carrierId: 'WAW001', naicsCode: '445110', appetiteScore: 80 },
  ]

  for (const appetite of appetites) {
    const carrier = await prisma.carrier.findUnique({
      where: { carrierId: appetite.carrierId }
    })
    if (carrier) {
      await prisma.carrierAppetite.create({
        data: {
          carrierId: carrier.id,
          naicsCode: appetite.naicsCode,
          appetiteScore: appetite.appetiteScore
        }
      })
    }
  }

  // Add current market intelligence
  await prisma.marketIntel.create({
    data: {
      propertyTrend: -6,
      casualtyTrend: -2,
      cyberTrend: -3,
      autoTrend: 1,
      marketCondition: 'softening',
      notes: 'Q1 2025: Market continues to soften across most lines except auto'
    }
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })