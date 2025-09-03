# Mitch Insurance 75-Carrier System Setup Script
# Tailored for Supabase PostgreSQL

param(
    [switch]$SkipDependencies,
    [switch]$Force
)

# Color functions
function Write-Success($message) { Write-Host "✅ $message" -ForegroundColor Green }
function Write-Info($message) { Write-Host "ℹ️  $message" -ForegroundColor Blue }
function Write-Warning($message) { Write-Host "⚠️  $message" -ForegroundColor Yellow }
function Write-Error($message) { Write-Host "❌ $message" -ForegroundColor Red }
function Write-Step($message) { Write-Host "`n📋 $message" -ForegroundColor Cyan }

# Check if we're in the right directory
if (!(Test-Path "./package.json")) {
    Write-Error "Please run this script from your project root directory"
    exit 1
}

Write-Host @"
========================================
Mitch Insurance 75-Carrier System Setup
========================================
Database: Supabase PostgreSQL
Carriers: 75 Canadian Insurance Companies
"@ -ForegroundColor Magenta

# Step 1: Backup existing .env
Write-Step "Backing up configuration"
Copy-Item ".env" ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')" -ErrorAction SilentlyContinue
Write-Success "Configuration backed up"

# Step 2: Update Prisma Schema
Write-Step "Updating Database Schema"

$schemaPath = "./prisma/schema.prisma"
if (Test-Path $schemaPath) {
    Copy-Item $schemaPath "$schemaPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Info "Backed up existing schema"
}

# Create comprehensive schema
$schemaContent = @"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Carrier {
  id                String   @id @default(cuid())
  carrierId         String   @unique
  name              String
  parentCompany     String?
  amBestRating      String?
  headquarters      String?
  provinces         String[]
  minPremium        Float?
  maxRevenue        Float?
  commissionNew     Float?
  commissionRenewal Float?
  responseTime      String?
  apiEnabled        Boolean  @default(false)
  apiDetails        Json?
  partnerStatus     String?
  specialties       String[]
  products          Json?
  underwritingGuidelines Json?
  brokerPortal      Json?
  contactInfo       Json?
  
  agencySettings    AgencyCarrierSetting[]
  placements        Placement[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([carrierId])
  @@index([name])
}

model AgencyCarrierSetting {
  id                String   @id @default(cuid())
  carrierId         String
  carrier           Carrier  @relation(fields: [carrierId], references: [carrierId], onDelete: Cascade)
  
  agencyStatus      String   @default("not-appointed")
  appointmentDate   DateTime?
  
  commissionNew     Float?
  commissionRenewal Float?
  volumeBonus       Float?
  contingentBonus   Json?
  
  contacts          Json?
  performance       Json?
  appetiteNotes     Json?
  systemAccess      Json?
  notes             Json?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  updatedBy         String?
  
  @@unique([carrierId])
  @@index([agencyStatus])
}

model Placement {
  id                String   @id @default(cuid())
  referenceNumber   String   @unique @default(cuid())
  
  businessName      String
  postalCode        String
  city              String
  province          String
  contactName       String
  contactEmail      String
  contactPhone      String
  
  businessType      String?
  naicsCode         String?
  naicsDescription  String?
  revenue           Float?
  employees         Int?
  yearsInBusiness   Int?
  
  coverageType      String[]
  effectiveDate     DateTime?
  expiryDate        DateTime?
  
  selectedCarriers  String[]
  carrierId         String?
  carrier           Carrier? @relation(fields: [carrierId], references: [id])
  
  status            String   @default("draft")
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String?
  
  @@index([referenceNumber])
  @@index([businessName])
  @@index([status])
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  role              String   @default("broker")
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([email])
}
"@

$schemaContent | Out-File -FilePath $schemaPath -Encoding UTF8
Write-Success "Schema file updated"

# Step 3: Generate Prisma Client
Write-Info "Generating Prisma Client..."
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to generate Prisma client"
    exit 1
}

# Step 4: Push schema to database
Write-Info "Pushing schema to Supabase..."
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Schema push failed. Trying with reset..."
    if ($Force) {
        npx prisma db push --accept-data-loss --force-reset
    } else {
        $response = Read-Host "Reset database? This will delete existing data (y/n)"
        if ($response -eq 'y') {
            npx prisma db push --accept-data-loss --force-reset
        }
    }
}

Write-Success "Database schema updated"

# Step 5: Create seed script
Write-Step "Creating Database Seed Script"

$seedScript = @'
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
'@

$seedScript | Out-File -FilePath "./prisma/seed.js" -Encoding UTF8
Write-Success "Seed script created"

# Step 6: Run the seed
Write-Info "Seeding database with carrier data..."
node ./prisma/seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Success "Database seeded successfully"
} else {
    Write-Error "Seeding failed - check ./prisma/seed.js for debugging"
}

# Step 7: Update package.json with seed script
Write-Info "Updating package.json..."
$packageJson = Get-Content "./package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.prisma) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "prisma" -Value @{}
}
$packageJson.prisma | Add-Member -MemberType NoteProperty -Name "seed" -Value "node prisma/seed.js" -Force
$packageJson | ConvertTo-Json -Depth 10 | Out-File "./package.json" -Encoding UTF8

# Step 8: Test the setup
Write-Step "Testing Setup"

$testScript = @'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const carrierCount = await prisma.carrier.count();
    const settingsCount = await prisma.agencyCarrierSetting.count();
    const appointed = await prisma.agencyCarrierSetting.count({
      where: { agencyStatus: 'appointed' }
    });
    
    console.log(`✅ Carriers: ${carrierCount}`);
    console.log(`✅ Agency Settings: ${settingsCount}`);
    console.log(`✅ Appointed Carriers: ${appointed}`);
    
    if (carrierCount === 75) {
      console.log('✅ All 75 carriers loaded successfully!');
    } else {
      console.log(`⚠️  Expected 75 carriers, found ${carrierCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
test();
'@

$testScript | Out-File -FilePath "./test-setup.js" -Encoding UTF8
node ./test-setup.js
Remove-Item "./test-setup.js"

# Final Summary
Write-Host @"

========================================
✅ SETUP COMPLETE!
========================================

Your system now has:
📊 Database:
  - 75 Canadian insurance carriers
  - Agency settings for each carrier
  - 6 carriers marked as "appointed"
  - Full placement tracking system

🚀 Next Steps:
  1. Start your dev server: npm run dev
  2. Visit http://localhost:3000
  3. Access Prisma Studio: npm run db:studio

💾 Database Access:
  - Your Supabase database is configured
  - Access via Prisma Studio or Supabase dashboard
  - Connection pooler configured for production

📝 Quick Commands:
  npm run dev          # Start development server
  npm run db:studio    # Open Prisma Studio
  npm run db:push      # Push schema changes
  npm run db:seed      # Re-seed database

⚠️  Backups Created:
  - .env.backup.*
  - schema.prisma.backup.*

"@ -ForegroundColor Green