// scripts/make-admin.js
// Usage: node scripts/make-admin.js user@example.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  if (!email) {
    console.log('Please provide an email address');
    console.log('Usage: node scripts/make-admin.js user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    
    console.log(`✅ User ${user.email} is now an admin!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2025') {
      console.log('User not found. Please check the email address.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
makeAdmin(email);
