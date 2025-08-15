/**
 * Comprehensive Federal Entity Inventory
 * Complete database of federal cybersecurity and critical infrastructure entities
 */

import { FederalEntity, CriticalInfrastructureSector, OperationalFunction, FederalAgency } from '../types/federalEntity';

// Tier 1: Primary Cybersecurity Agencies - CISA Regional Offices
const cisaRegionalOffices: FederalEntity[] = [
  {
    id: 'cisa-region-1',
    name: 'CISA Region 1 (Boston)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '10 Causeway Street, Suite 791',
      city: 'Boston',
      state: 'MA',
      zipCode: '02222-1073',
      coordinates: { lat: 42.3656, lng: -71.0619 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-617-565-8190',
      email: 'region1@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region1',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'New England States',
      states: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT'],
      specialties: ['incident_response', 'critical_infrastructure_protection', 'cyber_forensics']
    },
    sectors: ['government_facilities', 'financial_services', 'healthcare_public_health'],
    functions: ['incident_response', 'information_sharing', 'vulnerability_assessment'],
    capabilities: ['cyber_forensics', 'threat_hunting', 'incident_coordination'],
    icon: {
      primary: 'government_facilities',
      iconSet: 'sector',
      fallbacks: ['incident_response', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  },
  {
    id: 'cisa-region-2',
    name: 'CISA Region 2 (New York)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '26 Federal Plaza, Room 15-130',
      city: 'New York',
      state: 'NY',
      zipCode: '10278-0075',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-212-637-5800',
      email: 'region2@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region2',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'New York, New Jersey, Puerto Rico, Virgin Islands',
      states: ['NY', 'NJ', 'PR', 'VI'],
      specialties: ['financial_services', 'critical_manufacturing', 'transportation_systems']
    },
    sectors: ['financial_services', 'transportation_systems', 'commercial_facilities'],
    functions: ['regulation', 'incident_response', 'information_sharing'],
    capabilities: ['threat_intelligence', 'vulnerability_assessment', 'critical_infrastructure_protection'],
    icon: {
      primary: 'financial_services',
      iconSet: 'sector',
      fallbacks: ['incident_response', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  },
  {
    id: 'cisa-region-3',
    name: 'CISA Region 3 (Philadelphia)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '800 North Point Parkway, Suite 120',
      city: 'West Palm Beach',
      state: 'FL',
      zipCode: '33407-1823',
      coordinates: { lat: 26.7614, lng: -80.0728 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-561-616-6500',
      email: 'region3@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region3',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Mid-Atlantic and Southeast',
      states: ['DE', 'MD', 'PA', 'VA', 'WV', 'DC', 'FL', 'GA', 'KY', 'NC', 'SC', 'TN', 'AL', 'MS'],
      specialties: ['energy', 'chemical', 'nuclear']
    },
    sectors: ['energy', 'chemical', 'nuclear'],
    functions: ['inspection', 'regulation', 'incident_response'],
    capabilities: ['ot_ics_security', 'threat_hunting', 'industrial_control_systems'],
    icon: {
      primary: 'energy',
      iconSet: 'sector',
      fallbacks: ['chemical', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  },
  {
    id: 'cisa-region-4',
    name: 'CISA Region 4 (Atlanta)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '3003 Chamblee-Tucker Road, Building 2, Suite 240',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30341-4147',
      coordinates: { lat: 33.8659, lng: -84.2921 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-770-220-5200',
      email: 'region4@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region4',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Southeast States',
      states: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN'],
      specialties: ['transportation_systems', 'healthcare_public_health', 'emergency_services']
    },
    sectors: ['transportation_systems', 'healthcare_public_health', 'emergency_services'],
    functions: ['emergency_management', 'incident_response', 'outreach'],
    capabilities: ['incident_coordination', 'vulnerability_assessment', 'security_awareness'],
    icon: {
      primary: 'transportation_systems',
      iconSet: 'sector',
      fallbacks: ['emergency_services', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  },
  {
    id: 'cisa-region-5',
    name: 'CISA Region 5 (Chicago)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '536 South Clark Street, Room 1220',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60605-1521',
      coordinates: { lat: 41.8712, lng: -87.6315 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-312-353-2520',
      email: 'region5@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region5',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Great Lakes Region',
      states: ['IL', 'IN', 'MI', 'MN', 'OH', 'WI'],
      specialties: ['critical_manufacturing', 'food_agriculture', 'transportation_systems']
    },
    sectors: ['critical_manufacturing', 'food_agriculture', 'transportation_systems'],
    functions: ['regulation', 'inspection', 'incident_response'],
    capabilities: ['industrial_control_systems', 'ot_ics_security', 'supply_chain_security'],
    icon: {
      primary: 'critical_manufacturing',
      iconSet: 'sector',
      fallbacks: ['food_agriculture', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  }
];

// FBI Field Offices (Major Offices)
const fbiFieldOffices: FederalEntity[] = [
  {
    id: 'fbi-nyfo',
    name: 'FBI New York Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '26 Federal Plaza',
      city: 'New York',
      state: 'NY',
      zipCode: '10278-0004',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-212-384-1000',
      email: 'nyfo.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/newyork',
      emergencyPhone: '+1-212-384-1000'
    },
    jurisdiction: {
      coverage: 'New York City Metropolitan Area',
      states: ['NY'],
      specialties: ['cyber_forensics', 'financial_crimes', 'counterterrorism']
    },
    sectors: ['financial_services', 'information_technology', 'communications'],
    functions: ['law_enforcement', 'cyber_forensics', 'intelligence'],
    capabilities: ['cyber_forensics', 'malware_analysis', 'digital_forensics', 'threat_intelligence'],
    icon: {
      primary: 'law_enforcement',
      iconSet: 'function',
      fallbacks: ['cyber_forensics', 'fbi'],
      color: '#1e3d59',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  },
  {
    id: 'fbi-wfo',
    name: 'FBI Washington Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '601 4th Street NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20535-0002',
      coordinates: { lat: 38.8977, lng: -77.0365 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-202-278-2000',
      email: 'wfo.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/washington',
      emergencyPhone: '+1-202-278-2000'
    },
    jurisdiction: {
      coverage: 'Washington DC Metropolitan Area',
      states: ['DC', 'VA', 'MD'],
      specialties: ['counterterrorism', 'cyber_crimes', 'public_corruption']
    },
    sectors: ['government_facilities', 'financial_services', 'information_technology'],
    functions: ['law_enforcement', 'intelligence', 'cyber_forensics'],
    capabilities: ['cyber_forensics', 'threat_hunting', 'digital_forensics', 'incident_response'],
    icon: {
      primary: 'government_facilities',
      iconSet: 'sector',
      fallbacks: ['law_enforcement', 'fbi'],
      color: '#1e3d59',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  },
  {
    id: 'fbi-lavo',
    name: 'FBI Los Angeles Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '11000 Wilshire Boulevard, Suite 1700',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90024-3672',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      timezone: 'America/Los_Angeles'
    },
    contact: {
      phone: '+1-310-477-6565',
      email: 'lavo.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/losangeles',
      emergencyPhone: '+1-310-477-6565'
    },
    jurisdiction: {
      coverage: 'Southern California',
      states: ['CA'],
      specialties: ['cyber_crimes', 'organized_crime', 'white_collar_crime']
    },
    sectors: ['information_technology', 'commercial_facilities', 'communications'],
    functions: ['law_enforcement', 'cyber_forensics', 'intelligence'],
    capabilities: ['cyber_forensics', 'malware_analysis', 'threat_intelligence', 'digital_forensics'],
    icon: {
      primary: 'information_technology',
      iconSet: 'sector',
      fallbacks: ['law_enforcement', 'fbi'],
      color: '#1e3d59',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  }
];

// Secret Service Field Offices
const secretServiceOffices: FederalEntity[] = [
  {
    id: 'usss-wfo',
    name: 'Secret Service Washington Field Office',
    parentAgency: 'SECRET_SERVICE',
    type: 'field_office',
    location: {
      address: '1100 L Street NW, Suite 500',
      city: 'Washington',
      state: 'DC',
      zipCode: '20005-4113',
      coordinates: { lat: 38.9037, lng: -77.0286 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-202-406-5708',
      email: 'washington.fo@usss.dhs.gov',
      website: 'https://www.secretservice.gov/field-offices',
      emergencyPhone: '+1-202-406-5708'
    },
    jurisdiction: {
      coverage: 'Washington DC Metropolitan Area',
      states: ['DC', 'MD', 'VA'],
      specialties: ['financial_crimes', 'cyber_crimes', 'protective_intelligence']
    },
    sectors: ['financial_services', 'government_facilities', 'information_technology'],
    functions: ['law_enforcement', 'cyber_forensics', 'intelligence'],
    capabilities: ['cyber_forensics', 'digital_forensics', 'financial_crimes_investigation'],
    icon: {
      primary: 'financial_services',
      iconSet: 'sector',
      fallbacks: ['law_enforcement', 'secret_service'],
      color: '#2c5530',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  }
];

// DOE National Laboratories
const doeLabsAndFacilities: FederalEntity[] = [
  {
    id: 'doe-ornl',
    name: 'Oak Ridge National Laboratory',
    parentAgency: 'DOE',
    type: 'laboratory',
    location: {
      address: '1 Bethel Valley Road',
      city: 'Oak Ridge',
      state: 'TN',
      zipCode: '37830-6935',
      coordinates: { lat: 35.9318, lng: -84.3073 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-865-574-7199',
      email: 'ornlinfo@ornl.gov',
      website: 'https://www.ornl.gov',
      emergencyPhone: '+1-865-574-7004'
    },
    jurisdiction: {
      coverage: 'National Research Facility',
      states: ['TN'],
      specialties: ['research', 'cyber_security', 'nuclear_security']
    },
    sectors: ['energy', 'nuclear', 'information_technology'],
    functions: ['research', 'ot_ics_security', 'vulnerability_assessment'],
    capabilities: ['industrial_control_systems', 'ot_ics_security', 'cyber_forensics', 'threat_hunting'],
    icon: {
      primary: 'nuclear',
      iconSet: 'sector',
      fallbacks: ['energy', 'doe'],
      color: '#ff6b35',
      priority: 2
    },
    status: {
      operational: true,
      hours: 'Business Hours',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  },
  {
    id: 'doe-lanl',
    name: 'Los Alamos National Laboratory',
    parentAgency: 'DOE',
    type: 'laboratory',
    location: {
      address: 'Los Alamos, NM 87545',
      city: 'Los Alamos',
      state: 'NM',
      zipCode: '87545-0001',
      coordinates: { lat: 35.8811, lng: -106.3219 },
      timezone: 'America/Denver'
    },
    contact: {
      phone: '+1-505-667-5061',
      email: 'info@lanl.gov',
      website: 'https://www.lanl.gov',
      emergencyPhone: '+1-505-667-6211'
    },
    jurisdiction: {
      coverage: 'National Security Research',
      states: ['NM'],
      specialties: ['nuclear_security', 'cyber_security', 'advanced_computing']
    },
    sectors: ['nuclear', 'defense_industrial_base', 'information_technology'],
    functions: ['research', 'ot_ics_security', 'threat_hunting'],
    capabilities: ['advanced_cyber_analytics', 'threat_intelligence', 'malware_analysis'],
    icon: {
      primary: 'nuclear',
      iconSet: 'sector',
      fallbacks: ['defense_industrial_base', 'doe'],
      color: '#ff6b35',
      priority: 2
    },
    status: {
      operational: true,
      hours: 'Business Hours',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  }
];

// Fusion Centers (Sample)
const fusionCenters: FederalEntity[] = [
  {
    id: 'fusion-nctc',
    name: 'National Counterterrorism Center',
    parentAgency: 'FBI',
    type: 'fusion_center',
    location: {
      address: 'McLean, VA',
      city: 'McLean',
      state: 'VA',
      zipCode: '22102',
      coordinates: { lat: 38.9338, lng: -77.1772 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-703-733-8600',
      website: 'https://www.nctc.gov',
      emergencyPhone: '+1-703-733-8600'
    },
    jurisdiction: {
      coverage: 'National Intelligence Coordination',
      states: ['VA'],
      specialties: ['intelligence', 'counterterrorism', 'threat_analysis']
    },
    sectors: ['government_facilities', 'information_technology'],
    functions: ['intelligence', 'information_sharing', 'threat_hunting'],
    capabilities: ['threat_intelligence', 'information_sharing', 'threat_hunting'],
    icon: {
      primary: 'intelligence',
      iconSet: 'function',
      fallbacks: ['government_facilities', 'fbi'],
      color: '#8b5a3c',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false,
      securityClearanceRequired: true
    }
  }
];

// Import expanded entities
import { expandedFederalEntities } from './expandedFederalEntities';

// Compile all entities
export const federalEntitiesDatabase: FederalEntity[] = [
  ...cisaRegionalOffices,
  ...fbiFieldOffices,
  ...secretServiceOffices,
  ...doeLabsAndFacilities,
  ...fusionCenters,
  ...expandedFederalEntities
];

// Entity lookup helpers
export const getEntityById = (id: string): FederalEntity | undefined => {
  return federalEntitiesDatabase.find(entity => entity.id === id);
};

export const getEntitiesByAgency = (agency: FederalAgency): FederalEntity[] => {
  return federalEntitiesDatabase.filter(entity => entity.parentAgency === agency);
};

export const getEntitiesBySector = (sector: CriticalInfrastructureSector): FederalEntity[] => {
  return federalEntitiesDatabase.filter(entity => entity.sectors.includes(sector));
};

export const getEntitiesByFunction = (func: OperationalFunction): FederalEntity[] => {
  return federalEntitiesDatabase.filter(entity => entity.functions.includes(func));
};

export const getEntitiesByState = (state: string): FederalEntity[] => {
  return federalEntitiesDatabase.filter(entity => 
    entity.location.state === state || 
    entity.jurisdiction.states.includes(state)
  );
};

// Statistics
export const getDatabaseStats = () => {
  const stats = {
    totalEntities: federalEntitiesDatabase.length,
    byAgency: {} as Record<string, number>,
    bySector: {} as Record<string, number>,
    byFunction: {} as Record<string, number>,
    byState: {} as Record<string, number>
  };

  federalEntitiesDatabase.forEach(entity => {
    // Count by agency
    stats.byAgency[entity.parentAgency] = (stats.byAgency[entity.parentAgency] || 0) + 1;
    
    // Count by sectors
    entity.sectors.forEach(sector => {
      stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;
    });
    
    // Count by functions
    entity.functions.forEach(func => {
      stats.byFunction[func] = (stats.byFunction[func] || 0) + 1;
    });
    
    // Count by state
    stats.byState[entity.location.state] = (stats.byState[entity.location.state] || 0) + 1;
  });

  return stats;
};