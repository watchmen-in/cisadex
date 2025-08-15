/**
 * Expanded Federal Entity Inventory - Complete Database
 * Extended dataset with additional CISA regions, FBI offices, and other critical entities
 */

import { FederalEntity } from '../types/federalEntity';

// Complete CISA Regional Offices (All 10 Regions)
export const completeCisaRegions: FederalEntity[] = [
  // Regions 6-10 to complete the set
  {
    id: 'cisa-region-6',
    name: 'CISA Region 6 (Dallas)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '350 N St. Paul Street, Suite 200',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201-3116',
      coordinates: { lat: 32.7767, lng: -96.7970 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-214-655-9800',
      email: 'region6@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region6',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'South Central States',
      states: ['AR', 'LA', 'NM', 'OK', 'TX'],
      specialties: ['energy', 'chemical', 'critical_manufacturing']
    },
    sectors: ['energy', 'chemical', 'critical_manufacturing'],
    functions: ['regulation', 'inspection', 'incident_response'],
    capabilities: ['ot_ics_security', 'chemical_security', 'energy_security'],
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
    id: 'cisa-region-7',
    name: 'CISA Region 7 (Kansas City)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '11224 Holmes Road',
      city: 'Kansas City',
      state: 'MO',
      zipCode: '64131-3012',
      coordinates: { lat: 38.9517, lng: -94.7077 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-816-283-2300',
      email: 'region7@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region7',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Central Plains States',
      states: ['IA', 'KS', 'MO', 'NE'],
      specialties: ['food_agriculture', 'transportation_systems', 'communications']
    },
    sectors: ['food_agriculture', 'transportation_systems', 'communications'],
    functions: ['inspection', 'regulation', 'outreach'],
    capabilities: ['supply_chain_security', 'food_safety', 'agricultural_security'],
    icon: {
      primary: 'food_agriculture',
      iconSet: 'sector',
      fallbacks: ['transportation_systems', 'cisa'],
      color: '#1f5582',
      priority: 1
    },
    status: {
      operational: true,
      hours: 'Business Hours',
      lastVerified: '2024-08-14',
      publicAccess: true
    }
  },
  {
    id: 'cisa-region-8',
    name: 'CISA Region 8 (Denver)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '12445 E 39th Avenue',
      city: 'Denver',
      state: 'CO',
      zipCode: '80239-3154',
      coordinates: { lat: 39.7391, lng: -104.9847 },
      timezone: 'America/Denver'
    },
    contact: {
      phone: '+1-303-235-4800',
      email: 'region8@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region8',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Mountain and Plains States',
      states: ['CO', 'MT', 'ND', 'SD', 'UT', 'WY'],
      specialties: ['energy', 'mining', 'transportation_systems']
    },
    sectors: ['energy', 'critical_manufacturing', 'transportation_systems'],
    functions: ['inspection', 'incident_response', 'vulnerability_assessment'],
    capabilities: ['energy_security', 'mining_security', 'pipeline_security'],
    icon: {
      primary: 'energy',
      iconSet: 'sector',
      fallbacks: ['critical_manufacturing', 'cisa'],
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
    id: 'cisa-region-9',
    name: 'CISA Region 9 (San Francisco)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '1111 Broadway, Suite 1400',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607-4003',
      coordinates: { lat: 37.8044, lng: -122.2712 },
      timezone: 'America/Los_Angeles'
    },
    contact: {
      phone: '+1-510-637-1463',
      email: 'region9@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region9',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Pacific States and Territories',
      states: ['AZ', 'CA', 'HI', 'NV', 'AS', 'GU', 'MP'],
      specialties: ['information_technology', 'defense_industrial_base', 'transportation_systems']
    },
    sectors: ['information_technology', 'defense_industrial_base', 'transportation_systems'],
    functions: ['cyber_forensics', 'vulnerability_assessment', 'incident_response'],
    capabilities: ['cyber_forensics', 'threat_hunting', 'aerospace_security'],
    icon: {
      primary: 'information_technology',
      iconSet: 'sector',
      fallbacks: ['defense_industrial_base', 'cisa'],
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
    id: 'cisa-region-10',
    name: 'CISA Region 10 (Seattle)',
    parentAgency: 'CISA',
    type: 'regional_office',
    location: {
      address: '1301 2nd Avenue, Suite 2900',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101-2084',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      timezone: 'America/Los_Angeles'
    },
    contact: {
      phone: '+1-206-553-0150',
      email: 'region10@cisa.dhs.gov',
      website: 'https://www.cisa.gov/region10',
      emergencyPhone: '+1-888-282-0870'
    },
    jurisdiction: {
      coverage: 'Pacific Northwest',
      states: ['AK', 'ID', 'OR', 'WA'],
      specialties: ['transportation_systems', 'energy', 'information_technology']
    },
    sectors: ['transportation_systems', 'energy', 'information_technology'],
    functions: ['incident_response', 'vulnerability_assessment', 'outreach'],
    capabilities: ['maritime_security', 'aviation_security', 'cyber_forensics'],
    icon: {
      primary: 'transportation_systems',
      iconSet: 'sector',
      fallbacks: ['energy', 'cisa'],
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

// Additional Major FBI Field Offices
export const additionalFbiOffices: FederalEntity[] = [
  {
    id: 'fbi-chicago',
    name: 'FBI Chicago Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '2111 W Roosevelt Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60608-1128',
      coordinates: { lat: 41.8559, lng: -87.6745 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-312-421-6700',
      email: 'chicago.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/chicago',
      emergencyPhone: '+1-312-421-6700'
    },
    jurisdiction: {
      coverage: 'Northern Illinois',
      states: ['IL'],
      specialties: ['organized_crime', 'cyber_crimes', 'public_corruption']
    },
    sectors: ['financial_services', 'critical_manufacturing', 'information_technology'],
    functions: ['law_enforcement', 'cyber_forensics', 'intelligence'],
    capabilities: ['cyber_forensics', 'financial_crimes_investigation', 'organized_crime_investigation'],
    icon: {
      primary: 'law_enforcement',
      iconSet: 'function',
      fallbacks: ['financial_services', 'fbi'],
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
    id: 'fbi-miami',
    name: 'FBI Miami Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '16320 NW 2nd Avenue',
      city: 'North Miami Beach',
      state: 'FL',
      zipCode: '33169-6508',
      coordinates: { lat: 25.9315, lng: -80.1534 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-754-703-2000',
      email: 'miami.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/miami',
      emergencyPhone: '+1-754-703-2000'
    },
    jurisdiction: {
      coverage: 'South Florida',
      states: ['FL'],
      specialties: ['international_crime', 'terrorism', 'cyber_crimes']
    },
    sectors: ['transportation_systems', 'commercial_facilities', 'financial_services'],
    functions: ['law_enforcement', 'intelligence', 'cyber_forensics'],
    capabilities: ['international_investigations', 'maritime_security', 'cyber_forensics'],
    icon: {
      primary: 'law_enforcement',
      iconSet: 'function',
      fallbacks: ['transportation_systems', 'fbi'],
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
    id: 'fbi-atlanta',
    name: 'FBI Atlanta Field Office',
    parentAgency: 'FBI',
    type: 'field_office',
    location: {
      address: '3000 Flowers Road South',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30341-5101',
      coordinates: { lat: 33.8659, lng: -84.2921 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-770-216-3000',
      email: 'atlanta.media@fbi.gov',
      website: 'https://www.fbi.gov/contact-us/field-offices/atlanta',
      emergencyPhone: '+1-770-216-3000'
    },
    jurisdiction: {
      coverage: 'Northern Georgia',
      states: ['GA'],
      specialties: ['domestic_terrorism', 'cyber_crimes', 'civil_rights']
    },
    sectors: ['transportation_systems', 'government_facilities', 'healthcare_public_health'],
    functions: ['law_enforcement', 'intelligence', 'cyber_forensics'],
    capabilities: ['domestic_terrorism_investigation', 'cyber_forensics', 'civil_rights_investigation'],
    icon: {
      primary: 'law_enforcement',
      iconSet: 'function',
      fallbacks: ['transportation_systems', 'fbi'],
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

// Additional DOE National Laboratories
export const additionalDoeLabs: FederalEntity[] = [
  {
    id: 'doe-anl',
    name: 'Argonne National Laboratory',
    parentAgency: 'DOE',
    type: 'laboratory',
    location: {
      address: '9700 South Cass Avenue',
      city: 'Lemont',
      state: 'IL',
      zipCode: '60439-4832',
      coordinates: { lat: 41.7086, lng: -87.9823 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-630-252-2000',
      email: 'info@anl.gov',
      website: 'https://www.anl.gov',
      emergencyPhone: '+1-630-252-5731'
    },
    jurisdiction: {
      coverage: 'National Research Facility',
      states: ['IL'],
      specialties: ['advanced_computing', 'energy_research', 'materials_science']
    },
    sectors: ['energy', 'information_technology', 'critical_manufacturing'],
    functions: ['research', 'ot_ics_security', 'vulnerability_assessment'],
    capabilities: ['high_performance_computing', 'grid_security', 'materials_research'],
    icon: {
      primary: 'energy',
      iconSet: 'sector',
      fallbacks: ['information_technology', 'doe'],
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
    id: 'doe-llnl',
    name: 'Lawrence Livermore National Laboratory',
    parentAgency: 'DOE',
    type: 'laboratory',
    location: {
      address: '7000 East Avenue',
      city: 'Livermore',
      state: 'CA',
      zipCode: '94550-9234',
      coordinates: { lat: 37.6872, lng: -121.7658 },
      timezone: 'America/Los_Angeles'
    },
    contact: {
      phone: '+1-925-422-1100',
      email: 'info@llnl.gov',
      website: 'https://www.llnl.gov',
      emergencyPhone: '+1-925-422-7595'
    },
    jurisdiction: {
      coverage: 'National Security Research',
      states: ['CA'],
      specialties: ['national_security', 'nuclear_security', 'cyber_security']
    },
    sectors: ['nuclear', 'defense_industrial_base', 'information_technology'],
    functions: ['research', 'threat_hunting', 'vulnerability_assessment'],
    capabilities: ['nuclear_security', 'advanced_simulation', 'cyber_threat_analysis'],
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
  },
  {
    id: 'doe-bnl',
    name: 'Brookhaven National Laboratory',
    parentAgency: 'DOE',
    type: 'laboratory',
    location: {
      address: 'Upton, NY 11973',
      city: 'Upton',
      state: 'NY',
      zipCode: '11973-5000',
      coordinates: { lat: 40.8739, lng: -72.8806 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-631-344-8000',
      email: 'info@bnl.gov',
      website: 'https://www.bnl.gov',
      emergencyPhone: '+1-631-344-2222'
    },
    jurisdiction: {
      coverage: 'Basic Energy Sciences Research',
      states: ['NY'],
      specialties: ['nuclear_science', 'materials_research', 'environmental_science']
    },
    sectors: ['nuclear', 'energy', 'information_technology'],
    functions: ['research', 'ot_ics_security'],
    capabilities: ['nuclear_research', 'environmental_monitoring', 'accelerator_science'],
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
  }
];

// State and Major Urban Area Fusion Centers
export const fusionCenters: FederalEntity[] = [
  {
    id: 'fusion-nycic',
    name: 'New York State Intelligence Center',
    parentAgency: 'DHS',
    type: 'fusion_center',
    location: {
      address: '1220 Washington Avenue',
      city: 'Albany',
      state: 'NY',
      zipCode: '12226-2252',
      coordinates: { lat: 42.6803, lng: -73.8370 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-518-485-7669',
      website: 'https://www.nysic.ny.gov',
      emergencyPhone: '+1-518-485-7669'
    },
    jurisdiction: {
      coverage: 'New York State Intelligence Fusion',
      states: ['NY'],
      specialties: ['intelligence', 'threat_assessment', 'information_sharing']
    },
    sectors: ['government_facilities', 'transportation_systems', 'financial_services'],
    functions: ['intelligence', 'information_sharing', 'threat_hunting'],
    capabilities: ['threat_intelligence', 'situational_awareness', 'information_sharing'],
    icon: {
      primary: 'intelligence',
      iconSet: 'function',
      fallbacks: ['government_facilities', 'dhs'],
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
  },
  {
    id: 'fusion-ctac',
    name: 'California Threat Assessment Center',
    parentAgency: 'DHS',
    type: 'fusion_center',
    location: {
      address: '10000 Imperial Highway',
      city: 'Norwalk',
      state: 'CA',
      zipCode: '90650-6410',
      coordinates: { lat: 33.9164, lng: -118.0606 },
      timezone: 'America/Los_Angeles'
    },
    contact: {
      phone: '+1-916-227-4884',
      website: 'https://www.caloes.ca.gov/office-of-the-director/operations/intelligence-integration/cal-tac/',
      emergencyPhone: '+1-916-845-8911'
    },
    jurisdiction: {
      coverage: 'California State Intelligence Fusion',
      states: ['CA'],
      specialties: ['threat_assessment', 'intelligence', 'emergency_management']
    },
    sectors: ['government_facilities', 'energy', 'transportation_systems'],
    functions: ['intelligence', 'threat_hunting', 'emergency_management'],
    capabilities: ['threat_assessment', 'intelligence_analysis', 'emergency_coordination'],
    icon: {
      primary: 'intelligence',
      iconSet: 'function',
      fallbacks: ['government_facilities', 'dhs'],
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
  },
  {
    id: 'fusion-tic',
    name: 'Texas Intelligence Center',
    parentAgency: 'DHS',
    type: 'fusion_center',
    location: {
      address: '5805 N Lamar Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78752-4203',
      coordinates: { lat: 30.3321, lng: -97.7078 },
      timezone: 'America/Chicago'
    },
    contact: {
      phone: '+1-512-424-2208',
      website: 'https://www.txdps.state.tx.us/tic/',
      emergencyPhone: '+1-512-424-2208'
    },
    jurisdiction: {
      coverage: 'Texas State Intelligence Fusion',
      states: ['TX'],
      specialties: ['border_security', 'intelligence', 'threat_assessment']
    },
    sectors: ['government_facilities', 'energy', 'chemical'],
    functions: ['intelligence', 'law_enforcement', 'information_sharing'],
    capabilities: ['border_intelligence', 'threat_assessment', 'criminal_intelligence'],
    icon: {
      primary: 'intelligence',
      iconSet: 'function',
      fallbacks: ['government_facilities', 'dhs'],
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

// Additional Federal Agency Components
export const additionalFederalComponents: FederalEntity[] = [
  {
    id: 'uscg-d1',
    name: 'USCG District 1 (Boston)',
    parentAgency: 'USCG',
    type: 'regional_office',
    location: {
      address: '408 Atlantic Avenue',
      city: 'Boston',
      state: 'MA',
      zipCode: '02210-3350',
      coordinates: { lat: 42.3518, lng: -71.0520 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-617-223-8555',
      website: 'https://www.uscg.mil/d1/',
      emergencyPhone: '+1-617-223-8555'
    },
    jurisdiction: {
      coverage: 'Northeast Maritime Region',
      states: ['ME', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ'],
      specialties: ['maritime_security', 'port_security', 'search_rescue']
    },
    sectors: ['transportation_systems', 'water_wastewater', 'commercial_facilities'],
    functions: ['law_enforcement', 'emergency_management', 'inspection'],
    capabilities: ['maritime_security', 'port_security', 'marine_environmental_protection'],
    icon: {
      primary: 'transportation_systems',
      iconSet: 'sector',
      fallbacks: ['law_enforcement', 'uscg'],
      color: '#1e40af',
      priority: 1
    },
    status: {
      operational: true,
      hours: '24/7',
      lastVerified: '2024-08-14',
      publicAccess: false
    }
  },
  {
    id: 'fema-region-4',
    name: 'FEMA Region 4 (Atlanta)',
    parentAgency: 'FEMA',
    type: 'regional_office',
    location: {
      address: '3003 Chamblee-Tucker Road',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30341-4112',
      coordinates: { lat: 33.8659, lng: -84.2921 },
      timezone: 'America/New_York'
    },
    contact: {
      phone: '+1-770-220-5200',
      email: 'fema-r4-external-affairs@fema.dhs.gov',
      website: 'https://www.fema.gov/region/iv',
      emergencyPhone: '+1-800-621-3362'
    },
    jurisdiction: {
      coverage: 'Southeast Emergency Management',
      states: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN'],
      specialties: ['emergency_management', 'disaster_response', 'recovery_operations']
    },
    sectors: ['emergency_services', 'healthcare_public_health', 'transportation_systems'],
    functions: ['emergency_management', 'incident_response', 'outreach'],
    capabilities: ['disaster_coordination', 'emergency_communications', 'recovery_planning'],
    icon: {
      primary: 'emergency_services',
      iconSet: 'sector',
      fallbacks: ['emergency_management', 'fema'],
      color: '#dc2626',
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

// Compile all expanded entities
export const expandedFederalEntities: FederalEntity[] = [
  ...completeCisaRegions,
  ...additionalFbiOffices,
  ...additionalDoeLabs,
  ...fusionCenters,
  ...additionalFederalComponents
];

// Enhanced database statistics
export const getExpandedDatabaseStats = () => {
  return {
    totalEntities: expandedFederalEntities.length,
    byCisaRegions: completeCisaRegions.length,
    byFbiOffices: additionalFbiOffices.length,
    byDoeLabs: additionalDoeLabs.length,
    byFusionCenters: fusionCenters.length,
    byOtherComponents: additionalFederalComponents.length,
    coverage: {
      states: [...new Set(expandedFederalEntities.flatMap(e => e.jurisdiction.states))].length,
      agencies: [...new Set(expandedFederalEntities.map(e => e.parentAgency))].length,
      sectors: [...new Set(expandedFederalEntities.flatMap(e => e.sectors))].length,
      functions: [...new Set(expandedFederalEntities.flatMap(e => e.functions))].length
    }
  };
};