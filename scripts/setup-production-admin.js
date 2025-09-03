// scripts/setup-production-admin.js
// Run this ONCE after deployment with your production database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// IMPORTANT: Set your production DATABASE_URL before running
const prisma = new PrismaClient();

async function setupAdmin() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!', 10);
  
  try {
    const admin = await prisma.user.create({
      data: {
        email: 'matt.slade@netstarinc.com',
        password: hash,
        role: 'admin',
        name: 'Matt Slade'
      }
    });
    console.log('Admin created:', admin.email);
  } catch (error) {
    if (error.code === 'P2002') {
      const admin = await prisma.user.update({
        where: { email: 'matt.slade@netstarinc.com' },
        data: { role: 'admin' }
      });
      console.log('User updated to admin:', admin.email);
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
