# Create-AdminUser.ps1
# Creates the admin user creation script

Write-Host "📝 Creating admin user script..." -ForegroundColor Cyan

# Make sure scripts directory exists
New-Item -ItemType Directory -Path "scripts" -Force | Out-Null

# Create the admin user script
$createAdminScript = @'
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
'@

# Write the script
$createAdminScript | Out-File -FilePath "scripts\create-admin-user.js" -Encoding UTF8

Write-Host "✅ Admin user script created!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Now creating your admin user..." -ForegroundColor Cyan
Write-Host ""

# Install bcryptjs if not already installed
Write-Host "📦 Checking for bcryptjs..." -ForegroundColor Yellow
npm list bcryptjs 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing bcryptjs..." -ForegroundColor Yellow
    npm install bcryptjs
}

Write-Host ""
Write-Host "✨ Script ready! Now run:" -ForegroundColor Green
Write-Host "   node scripts/create-admin-user.js matt.slade@netstarinc.com DillonCO@49" -ForegroundColor White
Write-Host ""
Write-Host "This will create an admin user with:" -ForegroundColor Cyan
Write-Host "   Email: matt.slade@netstarinc.com" -ForegroundColor Gray
Write-Host "   Password: DillonCO@49" -ForegroundColor Gray
Write-Host "   Role: admin" -ForegroundColor Gray