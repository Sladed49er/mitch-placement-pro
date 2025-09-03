// scripts/check-placement-fields.js
// Run this to see all available fields in a placement

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFields() {
  try {
    // Get one placement to see all fields
    const placement = await prisma.placement.findFirst({
      include: {
        user: true
      }
    });
    
    if (placement) {
      console.log('Available fields in Placement model:');
      console.log('=====================================');
      Object.keys(placement).forEach(key => {
        const value = placement[key];
        const type = typeof value;
        console.log(`- ${key}: ${type} (sample: ${JSON.stringify(value)?.substring(0, 50)}...)`);
      });
    } else {
      console.log('No placements found. Create one first to see fields.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();
