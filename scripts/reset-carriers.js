const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetCarriers() {
  console.log('Resetting carrier data to basic state...');
  
  // Clear all potentially problematic data
  await prisma.carrier.updateMany({
    data: {
      commissionNew: null,
      commissionRenewal: null,
      minPremium: null,
      maxRevenue: null,
      responseTime: null,
      apiDetails: null,
      products: null,
      underwritingGuidelines: null,
      brokerPortal: null,
      contactInfo: null
    }
  });
  
  console.log('Carrier data reset to basic state');
  await prisma.();
}

resetCarriers();
