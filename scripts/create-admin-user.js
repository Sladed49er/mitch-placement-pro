// scripts/create-admin-user.js
// Usage: node scripts/create-admin-user.js email@example.com password

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser(email, password) {
  if (!email || !password) {
    console.log('❌ Please provide both email and password');
    console.log('Usage: node scripts/create-admin-user.js email@example.com password');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists. Updating to admin role...');
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      console.log(`✅ User ${updatedUser.email} is now an admin!`);
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'admin',
          name: email.split('@')[0] // Use part before @ as name
        }
      });
      
      console.log(`✅ Admin user created successfully!`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: [hidden]`);
      console.log(`👤 Role: ${user.role}`);
      console.log('');
      console.log(`🚀 You can now sign in at http://localhost:3000/auth/signin`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.log('This email is already registered.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
const password = process.argv[3];

createAdminUser(email, password);
