const { PrismaClient } = require('@prisma/client');
const carriersData = require('../data/carriers-data.json');
const agencySettings = require('../data/agency-carrier-settings.json');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 75 carriers...');
  
  // Clear existing data
  await prisma.agencyCarrierSetting.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.carrier.deleteMany();
  
  // Insert all 75 carriers
  let successCount = 0;
  for (const carrier of carriersData.carriers) {
    try {
      await prisma.carrier.create({
        data: {
          carrierId: carrier.id,
          name: carrier.name,
          parentCompany: carrier.parentCompany,
          amBestRating: carrier.amBestRating,
          headquarters: carrier.headquarters,
          provinces: carrier.provinces,
          minPremium: carrier.minPremium,
          maxRevenue: carrier.maxRevenue,
          commissionNew: carrier.commissionNew,
          commissionRenewal: carrier.commissionRenewal,
          responseTime: carrier.responseTime,
          apiEnabled: carrier.apiEnabled,
          apiDetails: carrier.apiDetails,
          partnerStatus: carrier.partnerStatus,
          specialties: carrier.specialties,
          products: carrier.products,
          underwritingGuidelines: carrier.underwritingGuidelines,
          brokerPortal: carrier.brokerPortal,
          contactInfo: carrier.contactInfo
        }
      });
      successCount++;
      console.log(`✓ ${carrier.name}`);
    } catch (error) {
      console.error(`✗ Failed to import ${carrier.name}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${successCount} carriers`);
  
  // Set up agency settings for key carriers
  const appointedCarriers = [
    'intact-001', 'aviva-002', 'northbridge-003', 'wawanesa-004',
    'chubb-006', 'victor-060'
  ];
  
  for (const carrierId of appointedCarriers) {
    const settings = agencySettings.carrierSettings.find(s => s.carrierId === carrierId);
    if (settings) {
      await prisma.agencyCarrierSetting.create({
        data: {
          carrierId: settings.carrierId,
          agencyStatus: settings.agencyStatus || 'appointed',
          appointmentDate: settings.appointmentDate ? new Date(settings.appointmentDate) : null,
          commissionNew: settings.commissions?.newBusiness,
          commissionRenewal: settings.commissions?.renewal,
          volumeBonus: settings.commissions?.volumeBonus,
          contingentBonus: settings.commissions?.contingentBonus,
          contacts: settings.contacts,
          performance: settings.performance,
          appetiteNotes: settings.appetiteNotes,
          systemAccess: settings.systemAccess,
          notes: settings.notes,
          updatedBy: 'system'
        }
      });
    }
  }
  
  // Create default settings for remaining carriers
  const allCarrierIds = carriersData.carriers.map(c => c.id);
  const remainingCarriers = allCarrierIds.filter(id => !appointedCarriers.includes(id));
  
  for (const carrierId of remainingCarriers) {
    await prisma.agencyCarrierSetting.create({
      data: {
        carrierId: carrierId,
        agencyStatus: 'not-appointed',
        updatedBy: 'system'
      }
    });
  }
  
  console.log('✅ Created agency settings for all carriers');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
