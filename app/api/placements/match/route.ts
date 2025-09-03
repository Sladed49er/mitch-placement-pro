import { NextResponse } from 'next/server';
import carriersData from '@/data/carriers-data.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientInfo, businessDetails } = body;
    
    console.log('=== MATCHING REQUEST ===');
    console.log('Client Province:', clientInfo.province);
    console.log('Industry Code:', businessDetails.industry);
    console.log('Revenue:', businessDetails.annualRevenue);
    console.log('Employees:', businessDetails.numberOfEmployees);
    console.log('Years in Business:', businessDetails.yearsInBusiness);

    // Get all carriers
    const allCarriers = carriersData.carriers;
    console.log('Total carriers in database:', allCarriers.length);
    
    // Get NAICS code information for the selected industry
    const selectedNAICS = carriersData.naicsCodes.find(
      code => code.code === businessDetails.industry
    );
    
    if (selectedNAICS) {
      console.log('Selected NAICS:', selectedNAICS.code, '-', selectedNAICS.description);
      console.log('Accepted by carriers:', selectedNAICS.acceptedByCarriers);
    } else {
      console.log('WARNING: NAICS code not found in database');
    }

    // Parse revenue (remove commas and convert to number)
    const revenue = parseFloat(String(businessDetails.annualRevenue).replace(/,/g, ''));
    console.log('Parsed revenue:', revenue);

    // Filter and score carriers
    let matchedCarriers = allCarriers
      .filter(carrier => {
        // Check province match
        const provinceMatch = carrier.provinces.includes(clientInfo.province);
        
        // Check NAICS acceptance - be more lenient
        let naicsMatch = false;
        if (selectedNAICS) {
          naicsMatch = selectedNAICS.acceptedByCarriers.includes(carrier.id);
        } else {
          // If NAICS not found, still show some carriers
          naicsMatch = true;
        }
        
        // Check revenue limits
        const revenueMatch = !revenue || isNaN(revenue) || revenue <= carrier.maxRevenue;
        
        // Check minimum premium - be more lenient
        const estimatedPremium = revenue * 0.005; // 0.5% of revenue as rough estimate
        const meetsMinPremium = !revenue || isNaN(revenue) || estimatedPremium >= carrier.minPremium || carrier.minPremium <= 1000;
        
        console.log(`Carrier: ${carrier.name}`);
        console.log(`  - Province match: ${provinceMatch} (looking for ${clientInfo.province} in ${carrier.provinces.join(', ')})`);
        console.log(`  - NAICS match: ${naicsMatch}`);
        console.log(`  - Revenue match: ${revenueMatch} (${revenue} <= ${carrier.maxRevenue})`);
        console.log(`  - Min premium match: ${meetsMinPremium} (estimated ${estimatedPremium} >= ${carrier.minPremium})`);
        console.log(`  - PASSES: ${provinceMatch && naicsMatch && revenueMatch && meetsMinPremium}`);
        
        return provinceMatch && naicsMatch && revenueMatch && meetsMinPremium;
      })
      .map(carrier => {
        // Calculate match score
        let score = 50; // Base score
        
        // Province coverage bonus (already filtered, so all get this)
        score += 20;
        
        // Industry specialization bonus
        if (selectedNAICS && carrier.specialties) {
          const hasSpecialty = carrier.specialties.some(specialty => {
            const specialtyLower = specialty.toLowerCase();
            const categoryLower = selectedNAICS.category.toLowerCase();
            return specialtyLower.includes(categoryLower) || 
                   categoryLower.includes(specialtyLower) ||
                   selectedNAICS.description.toLowerCase().includes(specialtyLower);
          });
          if (hasSpecialty) {
            score += 15;
          }
        }
        
        // API availability bonus
        if (carrier.apiEnabled) {
          score += 10;
        }
        
        // Partner status bonus
        if (carrier.partnerStatus === 'Preferred') {
          score += 15;
        } else if (carrier.partnerStatus === 'Specialty') {
          score += 10;
        } else if (carrier.partnerStatus === 'Standard') {
          score += 5;
        }
        
        // Response time bonus
        if (carrier.responseTime === '24-48 hours') {
          score += 5;
        } else if (carrier.responseTime === '48-72 hours') {
          score += 2;
        }
        
        // Loss history adjustment
        const lossHistory = businessDetails.lossHistory;
        if (lossHistory === 'No claims (5+ years)') {
          score += 10;
        } else if (lossHistory === '1-2 claims') {
          score += 0;
        } else if (lossHistory === '3+ claims') {
          score -= 15;
        }
        
        // Years in business adjustment
        const yearsInBusiness = parseInt(businessDetails.yearsInBusiness);
        if (!isNaN(yearsInBusiness)) {
          if (yearsInBusiness >= carrier.underwritingGuidelines.minYearsInBusiness) {
            score += 5;
          } else if (yearsInBusiness === carrier.underwritingGuidelines.minYearsInBusiness - 1) {
            score += 0; // Close enough, neutral
          } else {
            score -= 10;
          }
        }
        
        // Size of business adjustment
        const numEmployees = parseInt(businessDetails.numberOfEmployees);
        if (!isNaN(numEmployees)) {
          if (numEmployees <= 10) {
            score += 5; // Small business bonus
          } else if (numEmployees <= 50) {
            score += 3;
          } else if (numEmployees <= carrier.underwritingGuidelines.maxEmployees) {
            score += 1;
          } else {
            score -= 10; // Too large for carrier
          }
        }
        
        // Revenue size bonus
        if (!isNaN(revenue)) {
          if (revenue >= 500000 && revenue <= 10000000) {
            score += 5; // Sweet spot for most carriers
          } else if (revenue < 100000) {
            score -= 5; // May be too small
          } else if (revenue > 50000000) {
            score -= 5; // May need specialty carrier
          }
        }
        
        return {
          ...carrier,
          matchScore: Math.min(100, Math.max(0, score))
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    
    console.log(`=== RESULTS: Found ${matchedCarriers.length} matching carriers ===`);
    
    // If no exact matches, provide some fallback carriers based on province only
    if (matchedCarriers.length === 0) {
      console.log('No exact matches found, showing carriers for province only...');
      
      matchedCarriers = allCarriers
        .filter(carrier => carrier.provinces.includes(clientInfo.province))
        .map(carrier => ({
          ...carrier,
          matchScore: 40 // Lower score for partial matches
        }))
        .slice(0, 3); // Show top 3 as fallback
        
      console.log(`Showing ${matchedCarriers.length} fallback carriers for province ${clientInfo.province}`);
    }
    
    return NextResponse.json(matchedCarriers);
    
  } catch (error) {
    console.error('Error matching carriers:', error);
    return NextResponse.json(
      { error: 'Failed to match carriers' },
      { status: 500 }
    );
  }
}