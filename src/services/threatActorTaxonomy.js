// Industry Taxonomy Crosswalk for Threat Actors
// Federal-grade threat actor attribution and mapping system

export class ThreatActorTaxonomy {
  constructor() {
    this.initializeTaxonomies();
    this.initializeCrosswalk();
    this.initializeActorDatabase();
  }

  initializeTaxonomies() {
    // Define industry standard taxonomies
    this.taxonomies = {
      // MITRE ATT&CK Groups
      'mitre_attack': {
        name: 'MITRE ATT&CK Groups',
        authority: 'MITRE Corporation',
        standardType: 'open_source',
        lastUpdated: '2024-01-15',
        idFormat: 'G[0-9]{4}',
        url: 'https://attack.mitre.org/groups/',
        compliance: ['NIST-800-53', 'FISMA']
      },

      // Mandiant Threat Intelligence
      'mandiant': {
        name: 'Mandiant Threat Groups',
        authority: 'Mandiant (Google Cloud)',
        standardType: 'commercial',
        lastUpdated: '2024-01-10',
        idFormat: 'APT[0-9]{1,2}|UNC[0-9]{1,4}|FIN[0-9]{1,2}',
        url: 'https://www.mandiant.com/resources/insights/apt-groups',
        compliance: ['FedRAMP', 'FISMA']
      },

      // CrowdStrike Adversary Universe
      'crowdstrike': {
        name: 'CrowdStrike Adversary Universe',
        authority: 'CrowdStrike',
        standardType: 'commercial',
        lastUpdated: '2024-01-08',
        idFormat: '[A-Z]+\\s(PANDA|BEAR|KITTEN|SPIDER|JACKAL|LYNX)',
        url: 'https://adversary.crowdstrike.com/',
        compliance: ['FedRAMP', 'SOC2']
      },

      // CISA/US-CERT Designations
      'cisa': {
        name: 'CISA Threat Actor Designations',
        authority: 'Cybersecurity and Infrastructure Security Agency',
        standardType: 'government',
        lastUpdated: '2024-01-12',
        idFormat: 'Various',
        url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        compliance: ['FISMA', 'NIST-800-53', 'Federal']
      },

      // Microsoft Threat Intelligence
      'microsoft': {
        name: 'Microsoft Threat Intelligence',
        authority: 'Microsoft Threat Intelligence Center',
        standardType: 'commercial',
        lastUpdated: '2024-01-05',
        idFormat: '[A-Z]+[0-9]{4}|ZINC|NICKEL|NOBELIUM',
        url: 'https://www.microsoft.com/en-us/security/business/security-intelligence/threat-actors',
        compliance: ['FedRAMP', 'SOC2']
      },

      // FireEye/Mandiant Legacy
      'fireeye': {
        name: 'FireEye Threat Groups (Legacy)',
        authority: 'FireEye (Now Mandiant)',
        standardType: 'commercial',
        lastUpdated: '2023-12-31',
        idFormat: 'APT[0-9]{1,2}',
        url: 'https://www.fireeye.com/current-threats/apt-groups.html',
        compliance: ['FedRAMP']
      },

      // Kaspersky Threat Intelligence
      'kaspersky': {
        name: 'Kaspersky Threat Intelligence',
        authority: 'Kaspersky Lab',
        standardType: 'commercial',
        lastUpdated: '2024-01-03',
        idFormat: '[A-Z]+[0-9]*',
        url: 'https://securelist.com/',
        compliance: []
      },

      // Symantec Threat Intelligence
      'symantec': {
        name: 'Symantec Threat Groups',
        authority: 'Broadcom (Symantec)',
        standardType: 'commercial',
        lastUpdated: '2024-01-01',
        idFormat: 'Various',
        url: 'https://symantec-enterprise-blogs.security.com/',
        compliance: ['SOC2']
      },

      // NIST Cybersecurity Framework
      'nist_csf': {
        name: 'NIST Cybersecurity Framework',
        authority: 'National Institute of Standards and Technology',
        standardType: 'government',
        lastUpdated: '2024-01-15',
        idFormat: 'CSF-[A-Z]{2}-[0-9]{3}',
        url: 'https://www.nist.gov/cyberframework',
        compliance: ['Federal', 'FISMA', 'NIST-800-53']
      }
    };
  }

  initializeCrosswalk() {
    // Comprehensive threat actor crosswalk mapping
    this.actorCrosswalk = {
      // APT1 / Comment Crew
      'apt1': {
        primary: {
          taxonomy: 'mandiant',
          id: 'APT1',
          name: 'APT1'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0006', name: 'APT1' },
          { taxonomy: 'crowdstrike', id: 'COMMENT_PANDA', name: 'Comment Panda' },
          { taxonomy: 'microsoft', id: 'ZINC', name: 'ZINC' },
          { taxonomy: 'kaspersky', id: 'Comment_Group', name: 'Comment Group' }
        ],
        attribution: {
          country: 'China',
          sponsor: 'PLA Unit 61398',
          confidence: 'high',
          first_seen: '2006',
          active: false
        },
        sectors: ['Defense', 'Energy', 'Finance', 'Technology'],
        ttp_summary: 'Spear phishing, RATs, data exfiltration'
      },

      // APT28 / Fancy Bear
      'apt28': {
        primary: {
          taxonomy: 'mandiant',
          id: 'APT28',
          name: 'APT28'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0007', name: 'APT28' },
          { taxonomy: 'crowdstrike', id: 'FANCY_BEAR', name: 'Fancy Bear' },
          { taxonomy: 'microsoft', id: 'STRONTIUM', name: 'STRONTIUM' },
          { taxonomy: 'kaspersky', id: 'Sofacy', name: 'Sofacy' },
          { taxonomy: 'symantec', id: 'Swallowtail', name: 'Swallowtail' }
        ],
        attribution: {
          country: 'Russia',
          sponsor: 'GRU Unit 26165',
          confidence: 'high',
          first_seen: '2007',
          active: true
        },
        sectors: ['Government', 'Military', 'Defense', 'Media'],
        ttp_summary: 'Spear phishing, zero-days, credential harvesting'
      },

      // APT29 / Cozy Bear
      'apt29': {
        primary: {
          taxonomy: 'mandiant',
          id: 'APT29',
          name: 'APT29'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0016', name: 'APT29' },
          { taxonomy: 'crowdstrike', id: 'COZY_BEAR', name: 'Cozy Bear' },
          { taxonomy: 'microsoft', id: 'NOBELIUM', name: 'NOBELIUM' },
          { taxonomy: 'kaspersky', id: 'CosmicDuke', name: 'CosmicDuke' },
          { taxonomy: 'fireeye', id: 'APT29', name: 'APT29' }
        ],
        attribution: {
          country: 'Russia',
          sponsor: 'SVR (Foreign Intelligence Service)',
          confidence: 'high',
          first_seen: '2008',
          active: true
        },
        sectors: ['Government', 'Healthcare', 'Technology', 'Education'],
        ttp_summary: 'Supply chain attacks, legitimate tools, steganography'
      },

      // Lazarus Group
      'lazarus': {
        primary: {
          taxonomy: 'kaspersky',
          id: 'Lazarus',
          name: 'Lazarus Group'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0032', name: 'Lazarus Group' },
          { taxonomy: 'crowdstrike', id: 'CHOLLIMA', name: 'Chollima' },
          { taxonomy: 'microsoft', id: 'ZINC', name: 'ZINC' },
          { taxonomy: 'mandiant', id: 'APT38', name: 'APT38' },
          { taxonomy: 'symantec', id: 'Hidden_Cobra', name: 'Hidden Cobra' }
        ],
        attribution: {
          country: 'North Korea',
          sponsor: 'RGB (Reconnaissance General Bureau)',
          confidence: 'high',
          first_seen: '2009',
          active: true
        },
        sectors: ['Financial', 'Cryptocurrency', 'Entertainment', 'Government'],
        ttp_summary: 'Destructive attacks, financial theft, supply chain'
      },

      // Chinese APT Groups
      'apt40': {
        primary: {
          taxonomy: 'mandiant',
          id: 'APT40',
          name: 'APT40'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0065', name: 'APT40' },
          { taxonomy: 'crowdstrike', id: 'LEVIATHAN', name: 'Leviathan' },
          { taxonomy: 'microsoft', id: 'GADOLINIUM', name: 'GADOLINIUM' }
        ],
        attribution: {
          country: 'China',
          sponsor: 'MSS Hainan State Security Department',
          confidence: 'high',
          first_seen: '2013',
          active: true
        },
        sectors: ['Maritime', 'Healthcare', 'Biomedical', 'Government'],
        ttp_summary: 'Spear phishing, web shells, credential theft'
      },

      // Iranian APT Groups
      'apt33': {
        primary: {
          taxonomy: 'mandiant',
          id: 'APT33',
          name: 'APT33'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0064', name: 'APT33' },
          { taxonomy: 'crowdstrike', id: 'REFINED_KITTEN', name: 'Refined Kitten' },
          { taxonomy: 'microsoft', id: 'HOLMIUM', name: 'HOLMIUM' },
          { taxonomy: 'kaspersky', id: 'Elfin', name: 'Elfin' }
        ],
        attribution: {
          country: 'Iran',
          sponsor: 'IRGC',
          confidence: 'medium-high',
          first_seen: '2013',
          active: true
        },
        sectors: ['Energy', 'Government', 'Technology'],
        ttp_summary: 'Spear phishing, droppers, persistence'
      },

      // Financial Crime Groups
      'fin7': {
        primary: {
          taxonomy: 'mandiant',
          id: 'FIN7',
          name: 'FIN7'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0046', name: 'FIN7' },
          { taxonomy: 'crowdstrike', id: 'CARBON_SPIDER', name: 'Carbon Spider' },
          { taxonomy: 'microsoft', id: 'GOLD_NIAGARA', name: 'Gold Niagara' }
        ],
        attribution: {
          country: 'Unknown',
          sponsor: 'Criminal Organization',
          confidence: 'medium',
          first_seen: '2015',
          active: true
        },
        sectors: ['Retail', 'Hospitality', 'Financial'],
        ttp_summary: 'Point-of-sale malware, credential theft, fraud'
      },

      // Ransomware Groups
      'conti': {
        primary: {
          taxonomy: 'crowdstrike',
          id: 'WIZARD_SPIDER',
          name: 'Wizard Spider'
        },
        aliases: [
          { taxonomy: 'mitre_attack', id: 'G0080', name: 'Wizard Spider' },
          { taxonomy: 'microsoft', id: 'DEV-0230', name: 'DEV-0230' },
          { taxonomy: 'mandiant', id: 'UNC1878', name: 'UNC1878' }
        ],
        attribution: {
          country: 'Russia',
          sponsor: 'Criminal Organization',
          confidence: 'medium-high',
          first_seen: '2018',
          active: false
        },
        sectors: ['Healthcare', 'Government', 'Critical Infrastructure'],
        ttp_summary: 'Ransomware, data exfiltration, double extortion'
      }
    };
  }

  initializeActorDatabase() {
    // Initialize comprehensive threat actor database
    this.actorDatabase = {
      total_actors: Object.keys(this.actorCrosswalk).length,
      last_updated: new Date().toISOString(),
      sources: Object.keys(this.taxonomies),
      attribution_confidence_levels: ['high', 'medium-high', 'medium', 'medium-low', 'low'],
      geographic_distribution: this.calculateGeographicDistribution(),
      sector_targeting: this.calculateSectorTargeting(),
      activity_status: this.calculateActivityStatus()
    };
  }

  calculateGeographicDistribution() {
    const distribution = {};
    Object.values(this.actorCrosswalk).forEach(actor => {
      const country = actor.attribution.country;
      distribution[country] = (distribution[country] || 0) + 1;
    });
    return distribution;
  }

  calculateSectorTargeting() {
    const sectors = {};
    Object.values(this.actorCrosswalk).forEach(actor => {
      actor.sectors.forEach(sector => {
        sectors[sector] = (sectors[sector] || 0) + 1;
      });
    });
    return sectors;
  }

  calculateActivityStatus() {
    const status = { active: 0, inactive: 0 };
    Object.values(this.actorCrosswalk).forEach(actor => {
      status[actor.attribution.active ? 'active' : 'inactive']++;
    });
    return status;
  }

  // Search and query functions
  searchActorByName(name) {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [actorKey, actor] of Object.entries(this.actorCrosswalk)) {
      // Check primary name
      if (actor.primary.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedName)) {
        return this.getActorDetails(actorKey);
      }
      
      // Check aliases
      for (const alias of actor.aliases) {
        if (alias.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedName)) {
          return this.getActorDetails(actorKey);
        }
      }
    }
    
    return null;
  }

  searchActorById(taxonomy, id) {
    for (const [actorKey, actor] of Object.entries(this.actorCrosswalk)) {
      if (actor.primary.taxonomy === taxonomy && actor.primary.id === id) {
        return this.getActorDetails(actorKey);
      }
      
      for (const alias of actor.aliases) {
        if (alias.taxonomy === taxonomy && alias.id === id) {
          return this.getActorDetails(actorKey);
        }
      }
    }
    
    return null;
  }

  getActorDetails(actorKey) {
    const actor = this.actorCrosswalk[actorKey];
    if (!actor) return null;

    return {
      actor_key: actorKey,
      primary_designation: actor.primary,
      all_designations: [actor.primary, ...actor.aliases],
      attribution: actor.attribution,
      targeted_sectors: actor.sectors,
      ttp_summary: actor.ttp_summary,
      taxonomy_count: actor.aliases.length + 1,
      confidence_score: this.calculateConfidenceScore(actor),
      last_updated: new Date().toISOString()
    };
  }

  calculateConfidenceScore(actor) {
    const confidenceMap = {
      'high': 95,
      'medium-high': 80,
      'medium': 65,
      'medium-low': 45,
      'low': 25
    };
    
    const baseScore = confidenceMap[actor.attribution.confidence] || 50;
    const aliasBonus = Math.min(actor.aliases.length * 5, 20); // Max 20 bonus points
    const activityPenalty = actor.attribution.active ? 0 : -10;
    
    return Math.max(0, Math.min(100, baseScore + aliasBonus + activityPenalty));
  }

  // Mapping and crosswalk functions
  mapActorAcrossTaxonomies(actorIdentifier) {
    let actor = null;
    
    // Try to find by name first
    actor = this.searchActorByName(actorIdentifier);
    
    if (!actor) {
      // Try to find by parsing identifier
      for (const [taxonomy, config] of Object.entries(this.taxonomies)) {
        if (new RegExp(config.idFormat).test(actorIdentifier)) {
          actor = this.searchActorById(taxonomy, actorIdentifier);
          if (actor) break;
        }
      }
    }
    
    return actor;
  }

  getActorsByCountry(country) {
    return Object.entries(this.actorCrosswalk)
      .filter(([_, actor]) => actor.attribution.country.toLowerCase() === country.toLowerCase())
      .map(([key, _]) => this.getActorDetails(key));
  }

  getActorsBySector(sector) {
    return Object.entries(this.actorCrosswalk)
      .filter(([_, actor]) => actor.sectors.some(s => s.toLowerCase().includes(sector.toLowerCase())))
      .map(([key, _]) => this.getActorDetails(key));
  }

  getActiveActors() {
    return Object.entries(this.actorCrosswalk)
      .filter(([_, actor]) => actor.attribution.active)
      .map(([key, _]) => this.getActorDetails(key));
  }

  // Export functions for federal reporting
  generateThreatLandscapeReport() {
    return {
      report_date: new Date().toISOString(),
      total_tracked_actors: Object.keys(this.actorCrosswalk).length,
      active_actors: this.getActiveActors().length,
      geographic_breakdown: this.actorDatabase.geographic_distribution,
      sector_targeting_analysis: this.actorDatabase.sector_targeting,
      high_confidence_attributions: Object.values(this.actorCrosswalk)
        .filter(actor => actor.attribution.confidence === 'high').length,
      federal_concerns: this.getFederalConcerns(),
      taxonomy_coverage: Object.keys(this.taxonomies).length,
      data_sources: this.taxonomies
    };
  }

  getFederalConcerns() {
    const concerns = [];
    
    // Nation-state actors targeting government
    const govTargeting = this.getActorsBySector('Government');
    concerns.push({
      type: 'Nation-State Targeting',
      count: govTargeting.length,
      actors: govTargeting.slice(0, 5).map(a => a.primary_designation.name)
    });
    
    // Critical infrastructure threats
    const infraTargeting = this.getActorsBySector('Energy')
      .concat(this.getActorsBySector('Healthcare'))
      .concat(this.getActorsBySector('Financial'));
    concerns.push({
      type: 'Critical Infrastructure Threats',
      count: infraTargeting.length,
      sectors: ['Energy', 'Healthcare', 'Financial']
    });
    
    return concerns;
  }

  exportForSTIX() {
    // Export in STIX format for federal threat intelligence sharing
    const stixObjects = [];
    
    Object.entries(this.actorCrosswalk).forEach(([key, actor]) => {
      stixObjects.push({
        type: 'threat-actor',
        id: `threat-actor--${key}`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: actor.primary.name,
        labels: ['nation-state', 'criminal', 'hacktivist'].filter(label => {
          if (actor.attribution.sponsor.includes('PLA') || actor.attribution.sponsor.includes('GRU')) return label === 'nation-state';
          if (actor.attribution.sponsor.includes('Criminal')) return label === 'criminal';
          return false;
        }),
        aliases: actor.aliases.map(alias => alias.name),
        sophistication: actor.attribution.confidence === 'high' ? 'expert' : 'intermediate',
        resource_level: 'organization',
        primary_motivation: 'organizational-gain'
      });
    });
    
    return {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      objects: stixObjects
    };
  }
}

// Export singleton instance
export const threatActorTaxonomy = new ThreatActorTaxonomy();

// Convenience functions
export const ThreatIntel = {
  search: (identifier) => threatActorTaxonomy.mapActorAcrossTaxonomies(identifier),
  getByCountry: (country) => threatActorTaxonomy.getActorsByCountry(country),
  getBySector: (sector) => threatActorTaxonomy.getActorsBySector(sector),
  getActive: () => threatActorTaxonomy.getActiveActors(),
  generateReport: () => threatActorTaxonomy.generateThreatLandscapeReport(),
  exportSTIX: () => threatActorTaxonomy.exportForSTIX()
};