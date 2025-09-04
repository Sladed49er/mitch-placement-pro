const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCarrierDetails() {
  // Get a specific carrier with all its data
  const intact = await prisma.carrier.findUnique({
    where: { carrierId: 'intact' }
  });
  
  console.log('\n=== INTACT INSURANCE FULL DATA ===\n');
  console.log('Basic Info:');
  console.log('- Name:', intact.name);
  console.log('- Commission:', intact.commissionNew + '% new /', intact.commissionRenewal + '% renewal');
  console.log('- Min Premium: $' + intact.minPremium);
  console.log('- Provinces:', intact.provinces);
  console.log('- Specialties:', intact.specialties);
  
  console.log('\nJSON Fields:');
  console.log('- Products:', JSON.stringify(intact.products, null, 2));
  console.log('- API Details:', JSON.stringify(intact.apiDetails, null, 2));
  console.log('- Guidelines:', JSON.stringify(intact.underwritingGuidelines, null, 2));
  
  await prisma.$disconnect();
}

showCarrierDetails();
