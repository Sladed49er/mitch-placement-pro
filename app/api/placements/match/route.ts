import { NextResponse } from 'next/server';
import carriersData from '@/data/carriers-data.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientInfo, businessDetails } = body;
    
    console.log('Matching request received:', {
      province: clientInfo.province,
      industry: businessDetails.industry,
      revenue: businessDetails.annualRevenue,
      employees: businessDetails.numberOfEmployees
    });

    // Get all carriers
    const allCarriers = carriersData.carriers;
    
    // Get NAICS code information for the selected industry
    const selectedNAICS = carriersData.naicsCodes.find(
      code => code.code === businessDetails.industry
    );
    
    console.log('Selected NAICS:', selectedNAICS?.code, selectedNAICS?.description);

    // Filter and score carriers
    const matchedCarriers = allCarriers
      .filter(carrier => {
        // Province is already in code format (e.g., "ON") from the form
        const provinceMatch = carrier.provinces.includes(clientInfo.province);
        
        // Check if carrier accepts this NAICS code
        const naicsMatch = selectedNAICS ? 
          selectedNAICS.acceptedByCarriers.includes(carrier.id) : 
          false; // If NAICS not found, don't match
        
        // Check revenue limits (remove commas from formatted number)
        const revenue = parseFloat(businessDetails.annualRevenue.replace(/,/g, ''));
        const revenueMatch = !isNaN(revenue) && revenue <= carrier.maxRevenue;
        
        // Check minimum premium (could enhance this with actual premium calculation)
        const estimatedPremium = revenue * 0.01; // Rough estimate: 1% of revenue
        const meetsMinPremium = estimatedPremium >= carrier.minPremium;
        
        console.log(`${carrier.name}: Province=${provinceMatch}, NAICS=${naicsMatch}, Revenue=${revenueMatch}, MinPrem=${meetsMinPremium}`);
        
        return provinceMatch && naicsMatch && revenueMatch && meetsMinPremium;
      })
      .map(carrier => {
        // Calculate match score
        let score = 50; // Base score
        
        // Province coverage bonus (already filtered, so all get this)
        score += 20;
        
        // Industry specialization bonus - check if carrier specializes in this category
        if (selectedNAICS && carrier.specialties) {
          // Check for exact specialty match
          const hasSpecialty = carrier.specialties.some(specialty => 
            selectedNAICS.category.toLowerCase().includes(specialty.toLowerCase()) ||
            specialty.toLowerCase().includes(selectedNAICS.category.toLowerCase())
          );
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
        
        // Revenue size bonus - carriers often prefer certain revenue ranges
        const revenue = parseFloat(businessDetails.annualRevenue.replace(/,/g, ''));
        if (!isNaN(revenue)) {
          if (revenue >= 1000000 && revenue <= 10000000) {
            score += 5; // Sweet spot for most carriers
          } else if (revenue < 500000) {
            score -= 5; // May be too small for some carriers
          }
        }
        
        return {
          ...carrier,
          matchScore: Math.min(100, Math.max(0, score)) // Cap between 0-100
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending
    
    console.log(`Found ${matchedCarriers.length} matching carriers`);
    
    // Return matched carriers even if empty array
    return NextResponse.json(matchedCarriers);
    
  } catch (error) {
    console.error('Error matching carriers:', error);
    return NextResponse.json(
      { error: 'Failed to match carriers' },
      { status: 500 }
    );
  }
}