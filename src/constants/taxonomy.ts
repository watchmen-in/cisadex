export const SECTORS = [
  'Law Enforcement', 'Cross-sector', 'Water', 'Energy', 'Financial Services', 
  'Healthcare', 'Communications', 'Transportation', 'Defense Industrial Base',
  'Information Technology', 'Chemical', 'Food and Agriculture', 'Government Facilities',
  'Manufacturing', 'Dams', 'Commercial Facilities'
];

export const FUNCTIONS = [
  'IR', 'Regulator', 'Research', 'Incident Response', 'Cyber Forensics', 
  'Threat Hunting', 'Intelligence', 'Vulnerability Assessment', 'Risk Management',
  'Policy Development', 'Training', 'Coordination'
];

export const AGENCIES = [
  'FBI', 'FEMA', 'EPA', 'CISA', 'DHS', 'SECRET_SERVICE', 'NSA', 'DOD',
  'DOE', 'DOT', 'HHS', 'TREASURY', 'COMMERCE', 'JUSTICE', 'STATE'
];

export const STATES = [
  'MA', 'NY', 'DC', 'VA', 'MD', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 
  'GA', 'NC', 'MI', 'NJ', 'WA', 'AZ', 'TN', 'IN', 'MO', 'CO', 'WI',
  'MN', 'LA', 'AL', 'KY', 'SC', 'OR', 'OK', 'CT', 'IA', 'MS', 'AR',
  'KS', 'UT', 'NV', 'NM', 'WV', 'NE', 'ID', 'HI', 'NH', 'ME', 'MT',
  'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'
];

export const THREAT_TYPES = [
  'Malware', 'Phishing', 'Ransomware', 'DDoS', 'Data Breach', 'APT Activity',
  'Insider Threat', 'Supply Chain Attack', 'Zero-Day Exploit', 'Social Engineering',
  'Man-in-the-Middle', 'SQL Injection', 'Cross-Site Scripting', 'Privilege Escalation'
];

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];

export const TIME_RANGES = [
  { id: '1h', label: 'Last Hour', hours: 1 },
  { id: '6h', label: 'Last 6 Hours', hours: 6 },
  { id: '24h', label: 'Last 24 Hours', hours: 24 },
  { id: '7d', label: 'Last 7 Days', hours: 168 },
  { id: '30d', label: 'Last 30 Days', hours: 720 },
  { id: 'all', label: 'All Time', hours: null }
];

export const INCIDENT_STATUS = [
  'New', 'Investigating', 'Contained', 'Mitigated', 'Resolved', 'Closed'
];

export const BADGES = [
  'Cross-sector', 'Law Enforcement', 'IR', 'Regulator', 'Research',
  'Critical Infrastructure', 'Federal Agency', 'Emergency Response',
  'Cyber Defense', 'Intelligence'
];

export type Filters = {
  sectors?: string[];
  functions?: string[];
  agencies?: string[];
  states?: string[];
  threatTypes?: string[];
  severityLevels?: string[];
  timeRange?: string;
  incidentStatus?: string[];
  lastUpdated?: string;
};
