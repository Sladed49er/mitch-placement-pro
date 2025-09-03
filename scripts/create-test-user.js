// scripts/create-test-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a hashed password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Create test agency
    const agency = await prisma.agency.create({
      data: {
        name: 'Mitch Insurance Demo Agency',
        city: 'Toronto',
        province: 'ON',
        email: 'demo@mitchinsurance.com',
        primaryContact: 'Demo Admin'
      }
    });
    
    console.log('✅ Created agency:', agency.name);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'demo@mitchinsurance.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'broker',
        agencyId: agency.id
      }
    });
    
    console.log('✅ Created user:', user.email);
    console.log('\n📧 Login credentials:');
    console.log('Email: demo@mitchinsurance.com');
    console.log('Password: demo123');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists. Try logging in with:');
      console.log('Email: demo@mitchinsurance.com');
      console.log('Password: demo123');
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();