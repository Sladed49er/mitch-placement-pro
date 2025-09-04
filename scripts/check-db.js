const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.carrier.count()
  .then(count => console.log(`Carriers in database: ${count}`))
  .catch(err => console.log('Database error:', err))
  .finally(() => prisma.$disconnect());
