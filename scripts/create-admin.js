// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Create a hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@mitchinsurance.com' }
    });

    if (existingAdmin) {
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'admin' }
        });
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('⚠️ Admin user already exists');
      }
    } else {
      // Create admin agency
      const adminAgency = await prisma.agency.create({
        data: {
          name: 'Mitch Insurance Admin',
          city: 'Toronto',
          province: 'ON',
          email: 'admin@mitchinsurance.com',
          primaryContact: 'System Administrator'
        }
      });
      
      // Create new admin user
      const admin = await prisma.user.create({
        data: {
          email: 'admin@mitchinsurance.com',
          name: 'System Admin',
          password: hashedPassword,
          role: 'admin',
          agencyId: adminAgency.id
        }
      });
      
      console.log('✅ Created admin user:', admin.email);
    }
    
    console.log('\n📧 Admin Login Credentials:');
    console.log('Email: admin@mitchinsurance.com');
    console.log('Password: admin123');
    console.log('\n🔗 Admin Dashboard: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();