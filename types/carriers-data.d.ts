// /types/carriers-data.d.ts
// Type declarations for the carriers data structure

declare module '@/data/carriers-data.json' {
  interface CarrierAPIDetails {
    hasAPI: boolean;
    apiType: string | null;
    dataStandards: string[];
    realTimeQuoting: boolean;
    portalAvailable: boolean;
    portalName: string | null;
    certifications?: string[];
  }

  interface CarrierProducts {
    commercial: {
      [key: string]: boolean;
    };
    packages?: {
      [key: string]: string[];
    };
  }

  interface CarrierUnderwritingGuidelines {
    preferredIndustries: string[];
    restrictedIndustries: string[];
    maxEmployees: number;
    minYearsInBusiness: number;
    lossHistoryRequirements: string;
  }

  interface CarrierBrokerPortal {
    available: boolean;
    features: string[];
    training: string;
  }

  interface CarrierContactInfo {
    brokerSupport: string;
    website: string;
    email: string;
  }

  interface Carrier {
    id: string;
    carrierId: string;
    name: string;
    parentCompany: string;
    amBestRating: string;
    headquarters: string;
    provinces: string[];
    minPremium: number;
    maxRevenue: number;
    commissionNew: number;
    commissionRenewal: number;
    responseTime: string;
    apiEnabled: boolean;
    apiDetails: CarrierAPIDetails;
    partnerStatus: string;
    specialties: string[];
    products: CarrierProducts;
    underwritingGuidelines: CarrierUnderwritingGuidelines;
    brokerPortal: CarrierBrokerPortal;
    contactInfo: CarrierContactInfo;
  }

  interface NAICSCode {
    code: string;
    description: string;
    category: string;
    acceptedByCarriers: string[];
  }

  interface BrokerManagementSystem {
    name: string;
    supportedCarriers: string[];
    integrationType: string;
    features: string[];
  }

  interface BrokerIntegrations {
    brokerManagementSystems: BrokerManagementSystem[];
  }

  interface RiskCategory {
    description: string;
    carriers: string[];
    typicalPremium: string;
  }

  interface RiskAppetiteMatrix {
    lowRisk: RiskCategory;
    mediumRisk: RiskCategory;
    highRisk: RiskCategory;
    specialtyRisk: RiskCategory;
    nonStandardRisk: RiskCategory;
  }

  interface Metadata {
    lastUpdated: string;
    source: string;
    disclaimer: string;
    totalCarriers: number;
    totalNAICSCodes: number;
    dataCompleteness: string;
  }

  interface CarriersData {
    carriers: Carrier[];
    naicsCodes: NAICSCode[];
    brokerIntegrations: BrokerIntegrations;
    riskAppetiteMatrix: RiskAppetiteMatrix;
    metadata: Metadata;
  }

  const carriersData: CarriersData;
  export = carriersData;
}