/**
 * Topic Detection Service for Cybersecurity Feed Clustering
 * Analyzes feed content to automatically group related items by topics,
 * threat types, and cybersecurity domains.
 */

export interface FeedTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  icon: string;
  color: string;
}

export interface ClusteredFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  date: Date;
  source: string;
  category: string;
  topics: string[];
  topicScores: Record<string, number>;
  severity?: string;
  cve?: string;
  threats?: string[];
  similarity?: number;
}

export interface FeedCluster {
  topicId: string;
  topic: FeedTopic;
  items: ClusteredFeedItem[];
  totalItems: number;
  latestUpdate: Date;
  avgSeverity: string;
  sources: string[];
  trends: {
    increasing: boolean;
    changePercent: number;
  };
}

class TopicDetectionService {
  private topics: FeedTopic[] = [];
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'among', 'that', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'shall'
  ]);

  constructor() {
    this.initializeTopics();
  }

  private initializeTopics(): void {
    this.topics = [
      {
        id: 'ransomware',
        name: 'Ransomware & Extortion',
        description: 'Ransomware attacks, file encryption, and extortion campaigns',
        keywords: ['ransomware', 'encryption', 'extortion', 'double extortion', 'leak site', 'ransom', 'crypto', 'lockbit', 'ryuk', 'conti', 'revil'],
        patterns: [/ransomware/i, /ransom[\s-]?ware/i, /file[\s-]?encrypt/i, /crypto[\s-]?lock/i],
        severity: 'CRITICAL',
        category: 'malware',
        icon: '🔒',
        color: 'red'
      },
      {
        id: 'apt-campaigns',
        name: 'APT & Nation-State',
        description: 'Advanced Persistent Threat groups and nation-state campaigns',
        keywords: ['apt', 'nation state', 'state sponsored', 'espionage', 'cyber warfare', 'attribution', 'campaign', 'persistent', 'lazarus', 'fancy bear', 'cozy bear'],
        patterns: [/apt[\s-]?\d+/i, /nation[\s-]?state/i, /state[\s-]?sponsored/i, /(lazarus|fancy|cozy)[\s-]?bear/i],
        severity: 'HIGH',
        category: 'threat_actors',
        icon: '🕵️',
        color: 'purple'
      },
      {
        id: 'critical-infrastructure',
        name: 'Critical Infrastructure',
        description: 'Attacks targeting critical infrastructure and industrial systems',
        keywords: ['scada', 'ics', 'ot', 'industrial', 'power grid', 'water treatment', 'transportation', 'energy', 'utilities', 'plc', 'hmi'],
        patterns: [/scada/i, /\bics\b/i, /industrial[\s-]?control/i, /operational[\s-]?technology/i, /\bot\b/i],
        severity: 'CRITICAL',
        category: 'infrastructure',
        icon: '⚡',
        color: 'orange'
      },
      {
        id: 'zero-day',
        name: 'Zero-Day Vulnerabilities',
        description: 'Newly discovered vulnerabilities and zero-day exploits',
        keywords: ['zero day', 'zero-day', '0day', 'rce', 'remote code execution', 'privilege escalation', 'memory corruption', 'buffer overflow'],
        patterns: [/zero[\s-]?day/i, /0[\s-]?day/i, /remote[\s-]?code[\s-]?execution/i, /\brce\b/i],
        severity: 'CRITICAL',
        category: 'vulnerabilities',
        icon: '💥',
        color: 'red'
      },
      {
        id: 'supply-chain',
        name: 'Supply Chain Attacks',
        description: 'Software supply chain compromises and third-party risks',
        keywords: ['supply chain', 'dependency', 'npm', 'pypi', 'software update', 'backdoor', 'solarwinds', 'codecov', 'third party'],
        patterns: [/supply[\s-]?chain/i, /software[\s-]?update/i, /dependency[\s-]?confusion/i, /backdoor/i],
        severity: 'HIGH',
        category: 'supply_chain',
        icon: '🔗',
        color: 'yellow'
      },
      {
        id: 'phishing-bec',
        name: 'Phishing & Social Engineering',
        description: 'Phishing campaigns, business email compromise, and social engineering',
        keywords: ['phishing', 'bec', 'business email compromise', 'social engineering', 'credential harvesting', 'spear phishing', 'vishing', 'smishing'],
        patterns: [/phishing/i, /business[\s-]?email[\s-]?compromise/i, /\bbec\b/i, /social[\s-]?engineering/i],
        severity: 'MEDIUM',
        category: 'social_engineering',
        icon: '🎣',
        color: 'blue'
      },
      {
        id: 'malware-families',
        name: 'Malware Families',
        description: 'New malware families, trojans, and malicious software analysis',
        keywords: ['malware', 'trojan', 'backdoor', 'rat', 'stealer', 'loader', 'botnet', 'banking trojan', 'infostealer'],
        patterns: [/malware/i, /trojan/i, /backdoor/i, /\brat\b/i, /botnet/i, /stealer/i],
        severity: 'HIGH',
        category: 'malware',
        icon: '🦠',
        color: 'red'
      },
      {
        id: 'cloud-security',
        name: 'Cloud Security',
        description: 'Cloud infrastructure attacks and misconfigurations',
        keywords: ['aws', 'azure', 'gcp', 'cloud', 's3 bucket', 'misconfiguration', 'container', 'kubernetes', 'docker'],
        patterns: [/cloud[\s-]?security/i, /s3[\s-]?bucket/i, /misconfiguration/i, /kubernetes/i, /container[\s-]?escape/i],
        severity: 'MEDIUM',
        category: 'cloud',
        icon: '☁️',
        color: 'blue'
      },
      {
        id: 'data-breach',
        name: 'Data Breaches',
        description: 'Data breaches, data leaks, and privacy incidents',
        keywords: ['data breach', 'data leak', 'personal data', 'pii', 'gdpr', 'privacy', 'exposed database', 'customer data'],
        patterns: [/data[\s-]?breach/i, /data[\s-]?leak/i, /exposed[\s-]?database/i, /\bpii\b/i],
        severity: 'HIGH',
        category: 'data_security',
        icon: '💾',
        color: 'purple'
      },
      {
        id: 'mobile-security',
        name: 'Mobile Security',
        description: 'Mobile malware, app security, and device threats',
        keywords: ['mobile', 'android', 'ios', 'smartphone', 'app security', 'mobile malware', 'banking app', 'play store'],
        patterns: [/mobile[\s-]?malware/i, /android[\s-]?malware/i, /app[\s-]?security/i, /play[\s-]?store/i],
        severity: 'MEDIUM',
        category: 'mobile',
        icon: '📱',
        color: 'green'
      },
      {
        id: 'iot-security',
        name: 'IoT & Device Security',
        description: 'Internet of Things security, smart devices, and embedded systems',
        keywords: ['iot', 'smart device', 'embedded', 'firmware', 'router', 'camera', 'smart home', 'connected device'],
        patterns: [/\biot\b/i, /smart[\s-]?device/i, /embedded[\s-]?system/i, /firmware/i],
        severity: 'MEDIUM',
        category: 'iot',
        icon: '🏠',
        color: 'teal'
      },
      {
        id: 'financial-security',
        name: 'Financial Sector',
        description: 'Banking security, financial malware, and payment fraud',
        keywords: ['banking', 'financial', 'payment', 'atm', 'pos', 'swift', 'cryptocurrency', 'defi', 'fintech'],
        patterns: [/banking[\s-]?trojan/i, /financial[\s-]?malware/i, /payment[\s-]?fraud/i, /\bswift\b/i],
        severity: 'HIGH',
        category: 'financial',
        icon: '🏦',
        color: 'green'
      },
      {
        id: 'healthcare-security',
        name: 'Healthcare Security',
        description: 'Healthcare cybersecurity, medical device security, and HIPAA incidents',
        keywords: ['healthcare', 'medical', 'hospital', 'hipaa', 'patient data', 'medical device', 'ehr', 'telemedicine'],
        patterns: [/healthcare/i, /medical[\s-]?device/i, /\bhipaa\b/i, /patient[\s-]?data/i],
        severity: 'HIGH',
        category: 'healthcare',
        icon: '🏥',
        color: 'red'
      },
      {
        id: 'government-alerts',
        name: 'Government & CISA Alerts',
        description: 'Official government cybersecurity alerts and advisories',
        keywords: ['cisa', 'fbi', 'nsa', 'dhs', 'government', 'federal', 'advisory', 'alert', 'guidance'],
        patterns: [/\bcisa\b/i, /\bfbi\b/i, /\bnsa\b/i, /\bdhs\b/i, /government[\s-]?alert/i],
        severity: 'HIGH',
        category: 'government',
        icon: '🛡️',
        color: 'blue'
      },
      {
        id: 'threat-hunting',
        name: 'Threat Hunting & IOCs',
        description: 'Threat hunting techniques, indicators of compromise, and threat intelligence',
        keywords: ['threat hunting', 'ioc', 'indicators', 'yara', 'sigma', 'hunting', 'detection', 'siem'],
        patterns: [/threat[\s-]?hunting/i, /indicators[\s-]?of[\s-]?compromise/i, /\bioc\b/i, /yara[\s-]?rule/i],
        severity: 'MEDIUM',
        category: 'threat_intel',
        icon: '🎯',
        color: 'purple'
      }
    ];
  }

  /**
   * Analyze feed content and detect relevant topics
   */
  public detectTopics(item: Partial<ClusteredFeedItem>): string[] {
    const content = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const detectedTopics: string[] = [];

    for (const topic of this.topics) {
      let score = 0;

      // Check keyword matches
      for (const keyword of topic.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      // Check pattern matches
      for (const pattern of topic.patterns) {
        if (pattern.test(content)) {
          score += 3;
        }
      }

      // If score is above threshold, add topic
      if (score >= 2) {
        detectedTopics.push(topic.id);
      }
    }

    return detectedTopics;
  }

  /**
   * Calculate topic relevance scores for feed item
   */
  public calculateTopicScores(item: Partial<ClusteredFeedItem>): Record<string, number> {
    const content = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const scores: Record<string, number> = {};

    for (const topic of this.topics) {
      let score = 0;
      const maxScore = topic.keywords.length * 2 + topic.patterns.length * 3;

      // Keyword scoring
      for (const keyword of topic.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }

      // Pattern scoring
      for (const pattern of topic.patterns) {
        if (pattern.test(content)) {
          score += 3;
        }
      }

      // Normalize score (0-100)
      scores[topic.id] = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    }

    return scores;
  }

  /**
   * Group feed items by detected topics
   */
  public clusterFeedsByTopics(feedItems: any[]): FeedCluster[] {
    const clusters: Map<string, FeedCluster> = new Map();

    // Process each feed item
    for (const item of feedItems) {
      const detectedTopics = this.detectTopics(item);
      const topicScores = this.calculateTopicScores(item);

      const clusteredItem: ClusteredFeedItem = {
        id: item.id || `item-${Date.now()}-${Math.random()}`,
        title: item.title || '',
        description: item.description || item.contentSnippet || '',
        link: item.link || '',
        date: item.date ? new Date(item.date) : new Date(),
        source: item.source || '',
        category: item.category || '',
        topics: detectedTopics,
        topicScores,
        severity: item.severity,
        cve: item.cve,
        threats: item.threats
      };

      // Add to clusters
      for (const topicId of detectedTopics) {
        if (!clusters.has(topicId)) {
          const topic = this.topics.find(t => t.id === topicId);
          if (topic) {
            clusters.set(topicId, {
              topicId,
              topic,
              items: [],
              totalItems: 0,
              latestUpdate: new Date(0),
              avgSeverity: 'LOW',
              sources: [],
              trends: { increasing: false, changePercent: 0 }
            });
          }
        }

        const cluster = clusters.get(topicId);
        if (cluster) {
          cluster.items.push(clusteredItem);
          cluster.totalItems++;
          
          if (clusteredItem.date > cluster.latestUpdate) {
            cluster.latestUpdate = clusteredItem.date;
          }

          if (!cluster.sources.includes(clusteredItem.source)) {
            cluster.sources.push(clusteredItem.source);
          }
        }
      }
    }

    // Calculate aggregate metrics for clusters
    for (const cluster of clusters.values()) {
      cluster.avgSeverity = this.calculateAverageSeverity(cluster.items);
      cluster.trends = this.calculateTrends(cluster.items);
      
      // Sort items by date (newest first)
      cluster.items.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    // Convert to array and sort by priority
    return Array.from(clusters.values()).sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const aPriority = priorityOrder[a.topic.severity as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.topic.severity as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Secondary sort by number of items
      return b.totalItems - a.totalItems;
    });
  }

  /**
   * Calculate content similarity between feed items
   */
  public calculateSimilarity(item1: ClusteredFeedItem, item2: ClusteredFeedItem): number {
    const text1 = this.tokenize(`${item1.title} ${item1.description}`);
    const text2 = this.tokenize(`${item2.title} ${item2.description}`);

    const intersection = text1.filter(token => text2.includes(token));
    const union = [...new Set([...text1, ...text2])];

    return union.length > 0 ? intersection.length / union.length : 0;
  }

  /**
   * Get topic by ID
   */
  public getTopic(topicId: string): FeedTopic | undefined {
    return this.topics.find(t => t.id === topicId);
  }

  /**
   * Get all available topics
   */
  public getAllTopics(): FeedTopic[] {
    return [...this.topics];
  }

  /**
   * Search topics by keyword
   */
  public searchTopics(query: string): FeedTopic[] {
    const lowerQuery = query.toLowerCase();
    return this.topics.filter(topic => 
      topic.name.toLowerCase().includes(lowerQuery) ||
      topic.description.toLowerCase().includes(lowerQuery) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token));
  }

  private calculateAverageSeverity(items: ClusteredFeedItem[]): string {
    const severityWeights = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const validItems = items.filter(item => item.severity && severityWeights[item.severity as keyof typeof severityWeights]);
    
    if (validItems.length === 0) return 'MEDIUM';

    const avgWeight = validItems.reduce((sum, item) => {
      return sum + (severityWeights[item.severity as keyof typeof severityWeights] || 2);
    }, 0) / validItems.length;

    if (avgWeight >= 3.5) return 'CRITICAL';
    if (avgWeight >= 2.5) return 'HIGH';
    if (avgWeight >= 1.5) return 'MEDIUM';
    return 'LOW';
  }

  private calculateTrends(items: ClusteredFeedItem[]): { increasing: boolean; changePercent: number } {
    if (items.length < 2) return { increasing: false, changePercent: 0 };

    const now = new Date();
    const last24h = items.filter(item => (now.getTime() - item.date.getTime()) <= 24 * 60 * 60 * 1000);
    const previous24h = items.filter(item => {
      const diffMs = now.getTime() - item.date.getTime();
      return diffMs > 24 * 60 * 60 * 1000 && diffMs <= 48 * 60 * 60 * 1000;
    });

    const currentCount = last24h.length;
    const previousCount = previous24h.length;

    if (previousCount === 0) return { increasing: currentCount > 0, changePercent: 0 };

    const changePercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
    return {
      increasing: currentCount > previousCount,
      changePercent: Math.abs(changePercent)
    };
  }
}

export const topicDetectionService = new TopicDetectionService();
export default topicDetectionService;