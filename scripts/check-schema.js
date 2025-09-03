// scripts/check-schema.js
// Shows the actual Placement model fields

const fs = require('fs');
const path = require('path');

// Read the Prisma schema
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Find the Placement model
const placementModelMatch = schema.match(/model Placement\s*{[\s\S]*?^}/m);

if (placementModelMatch) {
  console.log('Placement model from schema.prisma:');
  console.log('=====================================');
  console.log(placementModelMatch[0]);
  console.log('=====================================');
  console.log('\nAvailable fields:');
  
  // Extract field names
  const fieldMatches = placementModelMatch[0].matchAll(/^\s*(\w+)\s+(\w+)/gm);
  for (const match of fieldMatches) {
    if (match[1] !== 'model' && match[1] !== '}') {
      console.log(`- ${match[1]} (${match[2]})`);
    }
  }
} else {
  console.log('Could not find Placement model in schema');
}
