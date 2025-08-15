/**
 * Sophisticated Icon and Visual System for Federal Entities
 * Comprehensive icon precedence logic with sector, function, and agency icons
 */

import { 
  FederalEntity, 
  CriticalInfrastructureSector, 
  OperationalFunction, 
  FederalAgency,
  IconConfig,
  IconSet 
} from '../types/federalEntity';

// Icon definitions and colors
export const SECTOR_ICONS: Record<CriticalInfrastructureSector, { icon: string; color: string; emoji: string }> = {
  chemical: { icon: 'chemical-hazard', color: '#FF6B35', emoji: '⚗️' },
  commercial_facilities: { icon: 'commercial-building', color: '#4ECDC4', emoji: '🏢' },
  communications: { icon: 'radio-tower', color: '#45B7D1', emoji: '📡' },
  critical_manufacturing: { icon: 'factory', color: '#96CEB4', emoji: '🏭' },
  dams: { icon: 'dam-structure', color: '#FFEAA7', emoji: '🏔️' },
  defense_industrial_base: { icon: 'military-shield', color: '#6C5CE7', emoji: '🛡️' },
  emergency_services: { icon: 'emergency-light', color: '#FD79A8', emoji: '🚨' },
  energy: { icon: 'power-line', color: '#FDCB6E', emoji: '⚡' },
  financial_services: { icon: 'bank-building', color: '#55A3FF', emoji: '🏦' },
  food_agriculture: { icon: 'wheat-field', color: '#00B894', emoji: '🌾' },
  government_facilities: { icon: 'government-building', color: '#1f5582', emoji: '🏛️' },
  healthcare_public_health: { icon: 'medical-cross', color: '#E17055', emoji: '🏥' },
  information_technology: { icon: 'server-rack', color: '#74B9FF', emoji: '💻' },
  nuclear: { icon: 'nuclear-symbol', color: '#FF7675', emoji: '☢️' },
  transportation_systems: { icon: 'transport-hub', color: '#A29BFE', emoji: '🚅' },
  water_wastewater: { icon: 'water-drop', color: '#00CEC9', emoji: '💧' }
};

export const FUNCTION_ICONS: Record<OperationalFunction, { icon: string; color: string; emoji: string }> = {
  law_enforcement: { icon: 'police-badge', color: '#1e3d59', emoji: '👮' },
  intelligence: { icon: 'intelligence-eye', color: '#8b5a3c', emoji: '🕵️' },
  incident_response: { icon: 'emergency-response', color: '#d63031', emoji: '🚨' },
  regulation: { icon: 'regulation-book', color: '#00b894', emoji: '📋' },
  research: { icon: 'laboratory', color: '#6c5ce7', emoji: '🔬' },
  emergency_management: { icon: 'emergency-mgmt', color: '#e17055', emoji: '🆘' },
  information_sharing: { icon: 'data-share', color: '#0984e3', emoji: '📊' },
  outreach: { icon: 'megaphone', color: '#fd79a8', emoji: '📢' },
  inspection: { icon: 'magnifying-glass', color: '#fdcb6e', emoji: '🔍' },
  ot_ics_security: { icon: 'industrial-control', color: '#a29bfe', emoji: '⚙️' },
  cyber_forensics: { icon: 'cyber-forensics', color: '#74b9ff', emoji: '🔍' },
  threat_hunting: { icon: 'threat-hunter', color: '#55a3ff', emoji: '🎯' },
  vulnerability_assessment: { icon: 'vulnerability-scan', color: '#fd79a8', emoji: '🛡️' }
};

export const AGENCY_ICONS: Record<FederalAgency, { icon: string; color: string; emoji: string }> = {
  DHS: { icon: 'dhs-seal', color: '#1f5582', emoji: '🏠' },
  CISA: { icon: 'cisa-logo', color: '#1f5582', emoji: '🛡️' },
  FBI: { icon: 'fbi-seal', color: '#1e3d59', emoji: '🕵️' },
  SECRET_SERVICE: { icon: 'usss-star', color: '#2c5530', emoji: '⭐' },
  TSA: { icon: 'tsa-eagle', color: '#0c4a6e', emoji: '🛫' },
  USCG: { icon: 'uscg-anchor', color: '#1e40af', emoji: '⚓' },
  FEMA: { icon: 'fema-logo', color: '#dc2626', emoji: '🆘' },
  ICE: { icon: 'ice-badge', color: '#1e3a8a', emoji: '❄️' },
  CBP: { icon: 'cbp-badge', color: '#166534', emoji: '🛂' },
  DOE: { icon: 'doe-atom', color: '#ff6b35', emoji: '⚛️' },
  EPA: { icon: 'epa-leaf', color: '#16a34a', emoji: '🌿' },
  DOT: { icon: 'dot-shield', color: '#2563eb', emoji: '🛣️' },
  FAA: { icon: 'faa-wings', color: '#0891b2', emoji: '✈️' },
  FRA: { icon: 'fra-train', color: '#7c2d12', emoji: '🚂' },
  MARAD: { icon: 'marad-anchor', color: '#0f766e', emoji: '🚢' },
  PHMSA: { icon: 'phmsa-pipeline', color: '#b45309', emoji: '🛢️' },
  TREASURY: { icon: 'treasury-eagle', color: '#facc15', emoji: '🦅' },
  IRS: { icon: 'irs-eagle', color: '#4338ca', emoji: '💰' },
  FINCEN: { icon: 'fincen-shield', color: '#7c3aed', emoji: '💳' },
  HHS: { icon: 'hhs-eagle', color: '#dc2626', emoji: '🏥' },
  ASPR: { icon: 'aspr-cross', color: '#e11d48', emoji: '🚑' },
  FDA: { icon: 'fda-shield', color: '#059669', emoji: '💊' },
  USDA: { icon: 'usda-shield', color: '#65a30d', emoji: '🌾' },
  FSIS: { icon: 'fsis-check', color: '#84cc16', emoji: '✅' },
  APHIS: { icon: 'aphis-plant', color: '#22c55e', emoji: '🌱' },
  DOJ: { icon: 'doj-scales', color: '#1f2937', emoji: '⚖️' },
  ATF: { icon: 'atf-badge', color: '#92400e', emoji: '🔫' },
  DEA: { icon: 'dea-eagle', color: '#7c2d12', emoji: '💊' },
  USMS: { icon: 'usms-star', color: '#6b7280', emoji: '⭐' },
  NRC: { icon: 'nrc-atom', color: '#dc2626', emoji: '☢️' },
  FEDERAL_RESERVE: { icon: 'fed-eagle', color: '#166534', emoji: '🏦' },
  NTSB: { icon: 'ntsb-wing', color: '#1e40af', emoji: '🛩️' }
};

// Generic fallback icons
export const GENERIC_ICONS = {
  federal_generic: { icon: 'federal-seal', color: '#6b7280', emoji: '🏛️' },
  office_generic: { icon: 'office-building', color: '#9ca3af', emoji: '🏢' },
  law_enforcement_generic: { icon: 'badge-star', color: '#374151', emoji: '⭐' },
  emergency_generic: { icon: 'emergency-symbol', color: '#ef4444', emoji: '🚨' },
  research_generic: { icon: 'research-lab', color: '#8b5cf6', emoji: '🔬' }
};

/**
 * Determine the appropriate icon for an entity based on precedence logic
 */
export function determineEntityIcon(entity: FederalEntity): IconConfig {
  // Logic 1: Single sector = sector icon
  if (entity.sectors.length === 1) {
    const sector = entity.sectors[0];
    const sectorIcon = SECTOR_ICONS[sector];
    
    return {
      primary: sector,
      iconSet: 'sector',
      fallbacks: [
        entity.functions[0] || 'law_enforcement',
        entity.parentAgency.toLowerCase()
      ],
      color: sectorIcon.color,
      priority: 1
    };
  }

  // Logic 2: Multi-sector or cross-sector = function icon
  if (entity.sectors.length > 1 || entity.sectors.includes('government_facilities' as CriticalInfrastructureSector)) {
    const primaryFunction = getPrimaryFunction(entity.functions);
    const functionIcon = FUNCTION_ICONS[primaryFunction];
    
    return {
      primary: primaryFunction,
      iconSet: 'function',
      fallbacks: [
        getPrimarySector(entity.sectors),
        entity.parentAgency.toLowerCase()
      ],
      color: functionIcon?.color || '#6b7280',
      priority: 2
    };
  }

  // Logic 3: No clear sector/function = agency seal
  const agencyIcon = AGENCY_ICONS[entity.parentAgency];
  
  return {
    primary: entity.parentAgency.toLowerCase(),
    iconSet: 'agency',
    fallbacks: ['federal_generic'],
    color: agencyIcon?.color || '#6b7280',
    priority: 3
  };
}

/**
 * Get primary function based on operational priority
 */
function getPrimaryFunction(functions: OperationalFunction[]): OperationalFunction {
  // Priority order for functions
  const functionPriority: Record<OperationalFunction, number> = {
    law_enforcement: 1,
    incident_response: 2,
    cyber_forensics: 3,
    intelligence: 4,
    emergency_management: 5,
    threat_hunting: 6,
    vulnerability_assessment: 7,
    ot_ics_security: 8,
    regulation: 9,
    inspection: 10,
    research: 11,
    information_sharing: 12,
    outreach: 13
  };

  if (functions.length === 0) return 'law_enforcement';
  
  return functions.reduce((primary, current) => {
    const primaryPriority = functionPriority[primary] || 999;
    const currentPriority = functionPriority[current] || 999;
    return currentPriority < primaryPriority ? current : primary;
  });
}

/**
 * Get primary sector based on operational priority
 */
function getPrimarySector(sectors: CriticalInfrastructureSector[]): string {
  // Priority order for sectors
  const sectorPriority: Record<CriticalInfrastructureSector, number> = {
    government_facilities: 1,
    defense_industrial_base: 2,
    nuclear: 3,
    energy: 4,
    emergency_services: 5,
    financial_services: 6,
    information_technology: 7,
    communications: 8,
    transportation_systems: 9,
    healthcare_public_health: 10,
    water_wastewater: 11,
    chemical: 12,
    critical_manufacturing: 13,
    dams: 14,
    food_agriculture: 15,
    commercial_facilities: 16
  };

  if (sectors.length === 0) return 'government_facilities';
  
  return sectors.reduce((primary, current) => {
    const primaryPriority = sectorPriority[primary as CriticalInfrastructureSector] || 999;
    const currentPriority = sectorPriority[current] || 999;
    return currentPriority < primaryPriority ? current : primary;
  });
}

/**
 * Get icon information for display
 */
export function getIconInfo(iconConfig: IconConfig): { 
  icon: string; 
  color: string; 
  emoji: string; 
  label: string;
  fallbackEmoji: string;
} {
  let iconData;
  let label = '';
  
  switch (iconConfig.iconSet) {
    case 'sector':
      iconData = SECTOR_ICONS[iconConfig.primary as CriticalInfrastructureSector];
      label = iconConfig.primary.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      break;
    
    case 'function':
      iconData = FUNCTION_ICONS[iconConfig.primary as OperationalFunction];
      label = iconConfig.primary.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      break;
    
    case 'agency':
      iconData = AGENCY_ICONS[iconConfig.primary.toUpperCase() as FederalAgency];
      label = iconConfig.primary.toUpperCase();
      break;
    
    default:
      iconData = GENERIC_ICONS.federal_generic;
      label = 'Federal Entity';
  }

  // Fallback to generic if not found
  if (!iconData) {
    iconData = GENERIC_ICONS.federal_generic;
    label = 'Federal Entity';
  }

  return {
    icon: iconData.icon,
    color: iconConfig.color || iconData.color,
    emoji: iconData.emoji,
    label,
    fallbackEmoji: iconData.emoji
  };
}

/**
 * Get cluster icon based on predominant entities
 */
export function getClusterIcon(entities: FederalEntity[]): IconConfig {
  if (entities.length === 0) {
    return {
      primary: 'federal_generic',
      iconSet: 'generic',
      fallbacks: [],
      color: '#6b7280',
      priority: 999
    };
  }

  // Count sectors and functions
  const sectorCounts: Record<string, number> = {};
  const functionCounts: Record<string, number> = {};
  const agencyCounts: Record<string, number> = {};

  entities.forEach(entity => {
    entity.sectors.forEach(sector => {
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    
    entity.functions.forEach(func => {
      functionCounts[func] = (functionCounts[func] || 0) + 1;
    });
    
    agencyCounts[entity.parentAgency] = (agencyCounts[entity.parentAgency] || 0) + 1;
  });

  // Determine predominant characteristic
  const topSector = Object.keys(sectorCounts).reduce((a, b) => 
    sectorCounts[a] > sectorCounts[b] ? a : b, ''
  );
  
  const topFunction = Object.keys(functionCounts).reduce((a, b) => 
    functionCounts[a] > functionCounts[b] ? a : b, ''
  );
  
  const topAgency = Object.keys(agencyCounts).reduce((a, b) => 
    agencyCounts[a] > agencyCounts[b] ? a : b, ''
  );

  // If one sector dominates (>50%), use sector icon
  if (topSector && sectorCounts[topSector] / entities.length > 0.5) {
    const sectorIcon = SECTOR_ICONS[topSector as CriticalInfrastructureSector];
    return {
      primary: topSector,
      iconSet: 'sector',
      fallbacks: [topFunction, topAgency.toLowerCase()],
      color: sectorIcon?.color || '#6b7280',
      priority: 1
    };
  }

  // If one function dominates (>50%), use function icon
  if (topFunction && functionCounts[topFunction] / entities.length > 0.5) {
    const functionIcon = FUNCTION_ICONS[topFunction as OperationalFunction];
    return {
      primary: topFunction,
      iconSet: 'function',
      fallbacks: [topSector, topAgency.toLowerCase()],
      color: functionIcon?.color || '#6b7280',
      priority: 2
    };
  }

  // If one agency dominates (>60%), use agency icon
  if (topAgency && agencyCounts[topAgency] / entities.length > 0.6) {
    const agencyIcon = AGENCY_ICONS[topAgency as FederalAgency];
    return {
      primary: topAgency.toLowerCase(),
      iconSet: 'agency',
      fallbacks: [topFunction, topSector],
      color: agencyIcon?.color || '#6b7280',
      priority: 3
    };
  }

  // Mixed cluster - use generic federal icon
  return {
    primary: 'federal_generic',
    iconSet: 'generic',
    fallbacks: [topFunction, topSector],
    color: '#6b7280',
    priority: 999
  };
}

/**
 * Get icon size based on zoom level and entity priority
 */
export function getIconSize(zoomLevel: number, priority: number): { width: number; height: number } {
  const baseSizes = {
    1: { width: 16, height: 16 },  // Far zoom
    2: { width: 20, height: 20 },
    3: { width: 24, height: 24 },
    4: { width: 28, height: 28 },
    5: { width: 32, height: 32 },  // Medium zoom
    6: { width: 36, height: 36 },
    7: { width: 40, height: 40 },
    8: { width: 44, height: 44 },
    9: { width: 48, height: 48 },
    10: { width: 52, height: 52 }  // Close zoom
  };

  const baseSize = baseSizes[Math.min(zoomLevel, 10) as keyof typeof baseSizes] || baseSizes[5];
  
  // Adjust for priority (higher priority = larger)
  const priorityMultiplier = priority === 1 ? 1.2 : priority === 2 ? 1.1 : 1.0;
  
  return {
    width: Math.round(baseSize.width * priorityMultiplier),
    height: Math.round(baseSize.height * priorityMultiplier)
  };
}

/**
 * Generate CSS classes for icons
 */
export function getIconClasses(iconConfig: IconConfig, isHovered: boolean = false, isSelected: boolean = false): string {
  const baseClasses = [
    'federal-entity-icon',
    `icon-${iconConfig.iconSet}`,
    `priority-${iconConfig.priority}`
  ];

  if (isHovered) baseClasses.push('icon-hovered');
  if (isSelected) baseClasses.push('icon-selected');

  return baseClasses.join(' ');
}