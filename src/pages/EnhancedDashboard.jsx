import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FilterPanel from "../components/FilterPanel";
import AdvancedFilterPanel from "../components/filters/AdvancedFilterPanel";
import MapView from "../components/MapView";
import ResourcePanel from "../components/ResourcePanel";
import EnhancedFeedList from "../components/Feeds/EnhancedFeedList";
import IntelligencePanelReplacement from "../components/IntelligencePanelReplacement";
import EmergencyAccessibilityToolbar from "../components/accessibility/EmergencyAccessibilityToolbar";
import { loadOffices } from "../utils/dataLoader";
import useUrlState from "../hooks/useUrlState";
import { Filters } from "../constants/taxonomy";
import { 
  useThreatIntelligence, 
  useInfrastructureData, 
  usePerformanceMonitor,
  useMemoryOptimization 
} from "../hooks/usePerformanceOptimized";
import { 
  useAccessibility, 
  useLiveRegion, 
  useSkipLinks 
} from "../hooks/useAccessibility";
import { ARIA_ROLES } from "../utils/accessibility";

function TabBar({ tab, onChange }) {
  const tabs = [
    { id: "overview", label: "Threat Intel", icon: "🚨" },
    { id: "map", label: "Infrastructure", icon: "🗺️" },
    { id: "intelligence", label: "Feeds", icon: "🔍" },
    { id: "emergency", label: "Emergency", icon: "⚡" },
    { id: "resources", label: "Resources", icon: "📚" },
  ];
  
  return (
    <div className="sticky top-14 z-10 bg-bg1 border-b border-b1">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 px-4 py-3 text-sm focus-ring tab-transition flex items-center justify-center gap-2 ${
              tab === t.id
                ? "text-brand border-b-2 border-brand bg-bg2/30"
                : "text-t2 hover:text-t1 hover:bg-bg2/20"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ThreatLevelIndicator({ level, count }) {
  const levelConfig = {
    critical: { color: 'text-red-600 bg-red-100 border-red-300', icon: '🚨', label: 'Critical' },
    high: { color: 'text-orange-600 bg-orange-100 border-orange-300', icon: '⚠️', label: 'High' },
    medium: { color: 'text-yellow-600 bg-yellow-100 border-yellow-300', icon: '⚡', label: 'Medium' },
    low: { color: 'text-green-600 bg-green-100 border-green-300', icon: '✅', label: 'Low' }
  };
  
  const config = levelConfig[level] || levelConfig.low;
  
  return (
    <div className={`rounded-lg p-4 border-2 ${config.color} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{config.icon}</span>
        <div className="text-right">
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-xs font-medium uppercase tracking-wide">{config.label}</div>
        </div>
      </div>
      <div className="text-sm font-medium">Threat Level</div>
    </div>
  );
}

function RealTimeThreatFeed() {
  const [threats, setThreats] = useState([]);
  const [isLive, setIsLive] = useState(true);
  
  useEffect(() => {
    // Simulate real-time threat feed
    const generateThreat = () => {
      const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Data Breach', 'APT Activity'];
      const severities = ['critical', 'high', 'medium', 'low'];
      const sources = ['CISA', 'FBI IC3', 'DHS', 'NIST', 'Private Sector'];
      
      return {
        id: Date.now() + Math.random(),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        description: 'New threat detected in federal infrastructure',
        timestamp: new Date(),
        location: 'Washington DC Metro Area'
      };
    };
    
    // Add initial threats
    setThreats([
      {
        id: 1,
        type: 'APT Activity',
        severity: 'critical',
        source: 'CISA',
        description: 'Sophisticated persistent threat targeting federal agencies',
        timestamp: new Date(Date.now() - 300000),
        location: 'Multiple Locations'
      },
      {
        id: 2,
        type: 'Ransomware',
        severity: 'high',
        source: 'FBI IC3',
        description: 'New ransomware variant affecting critical infrastructure',
        timestamp: new Date(Date.now() - 600000),
        location: 'East Coast'
      }
    ]);
    
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        setThreats(prev => {
          const newThreat = generateThreat();
          return [newThreat, ...prev.slice(0, 9)]; // Keep only 10 most recent
        });
      }, 8000); // New threat every 8 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);
  
  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white'
    };
    return badges[severity] || badges.low;
  };
  
  return (
    <div className="border border-b1 rounded-lg overflow-hidden">
      <div className="bg-bg2 px-4 py-2 border-b border-b1 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span>🔴</span>
          Real-Time Threat Feed
        </h3>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            isLive 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLive ? 'LIVE' : 'PAUSED'}
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {threats.map((threat) => (
          <div key={threat.id} className="p-4 border-b border-b1 hover:bg-bg2/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(threat.severity)}`}>
                  {threat.severity.toUpperCase()}
                </span>
                <span className="font-medium">{threat.type}</span>
              </div>
              <span className="text-xs text-t2">
                {threat.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-t2 mb-2">{threat.description}</p>
            <div className="flex items-center justify-between text-xs text-t2">
              <span>Source: {threat.source}</span>
              <span>📍 {threat.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentResponseMetrics() {
  const [metrics, setMetrics] = useState({
    activeIncidents: 3,
    avgResponseTime: '14 min',
    resolvedToday: 8,
    escalated: 1,
    mttr: '2.4 hrs',
    teamUtilization: 78
  });
  
  const [responseTeams, setResponseTeams] = useState([
    { id: 1, name: 'SOC Team Alpha', status: 'available', incidents: 2, location: 'DC' },
    { id: 2, name: 'CERT Response', status: 'responding', incidents: 1, location: 'VA' },
    { id: 3, name: 'IR Team Bravo', status: 'available', incidents: 0, location: 'MD' },
    { id: 4, name: 'Cyber Defense', status: 'maintenance', incidents: 0, location: 'DC' }
  ]);
  
  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500',
      responding: 'bg-red-500 animate-pulse',
      maintenance: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-err">{metrics.activeIncidents}</div>
          <div className="text-sm text-t2">Active Incidents</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-brand">{metrics.avgResponseTime}</div>
          <div className="text-sm text-t2">Avg Response Time</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-success">{metrics.resolvedToday}</div>
          <div className="text-sm text-t2">Resolved Today</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-warn">{metrics.escalated}</div>
          <div className="text-sm text-t2">Escalated</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-t1">{metrics.mttr}</div>
          <div className="text-sm text-t2">Mean Time to Resolve</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-t1">{metrics.teamUtilization}%</div>
          <div className="text-sm text-t2">Team Utilization</div>
        </div>
      </div>
      
      {/* Response Teams Status */}
      <div className="border border-b1 rounded-lg overflow-hidden">
        <div className="bg-bg2 px-4 py-2 border-b border-b1">
          <h4 className="font-semibold flex items-center gap-2">
            <span>👥</span>
            Response Teams Status
          </h4>
        </div>
        <div className="p-4">
          <div className="grid gap-3">
            {responseTeams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-bg1 rounded-lg border border-b1">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`}></div>
                  <div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-t2">📍 {team.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{team.status.toUpperCase()}</div>
                  <div className="text-xs text-t2">{team.incidents} active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel() {
  const [stats, setStats] = useState({
    threats: { critical: 2, high: 8, medium: 23, low: 45 },
    alerts: 0,
    vulnerabilities: 0,
    incidents: 0,
    updates: 0
  });

  // Use performance-optimized threat intelligence
  const {
    data: threatData,
    loading: threatLoading,
    progress: threatProgress,
    error: threatError,
    lastUpdated: threatLastUpdated
  } = useThreatIntelligence({
    autoLoad: true,
    batchSize: 50,
    refreshInterval: 300000 // 5 minutes
  });

  // Performance monitoring
  const { startTimer, endTimer } = usePerformanceMonitor('OverviewPanel');

  useEffect(() => {
    const timerId = startTimer('calculateStats');
    
    // Calculate threat statistics from loaded data
    if (threatData.length > 0) {
      const threatCounts = threatData.reduce((acc, threat) => {
        const severity = threat.severity?.toLowerCase() || 'low';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});

      setStats(prev => ({
        ...prev,
        threats: {
          critical: threatCounts.critical || 0,
          high: threatCounts.high || 0,
          medium: threatCounts.medium || 0,
          low: threatCounts.low || 0
        }
      }));
    }

    // Simulate other stats with real-time updates
    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        alerts: 12 + Math.floor(Math.random() * 5),
        vulnerabilities: 47 + Math.floor(Math.random() * 10),
        incidents: 3 + Math.floor(Math.random() * 3),
        updates: 28 + Math.floor(Math.random() * 8)
      }));
    };
    
    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    
    endTimer(timerId);
    
    return () => clearInterval(interval);
  }, [threatData, startTimer, endTimer]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Cybersecurity Threat Intelligence Dashboard</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-t2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            SOC Status: OPERATIONAL
          </div>
          {threatLoading && (
            <div className="flex items-center gap-2 text-t2">
              <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
              Loading threats... ({threatProgress.loaded}/{threatProgress.total})
            </div>
          )}
          {threatLastUpdated && (
            <div className="text-xs text-t2">
              Last updated: {threatLastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Threat Level Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ThreatLevelIndicator level="critical" count={stats.threats.critical} />
        <ThreatLevelIndicator level="high" count={stats.threats.high} />
        <ThreatLevelIndicator level="medium" count={stats.threats.medium} />
        <ThreatLevelIndicator level="low" count={stats.threats.low} />
      </div>
      
      {/* Additional Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-err">{stats.alerts}</div>
          <div className="text-sm text-t2">Active Alerts</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-warn">{stats.vulnerabilities}</div>
          <div className="text-sm text-t2">Known Vulnerabilities</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-brand">{stats.incidents}</div>
          <div className="text-sm text-t2">Open Incidents</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-success">{stats.updates}</div>
          <div className="text-sm text-t2">Recent Updates</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Threat Feed */}
        <RealTimeThreatFeed />

        {/* CISA Advisories */}
        <div className="border border-b1 rounded-lg overflow-hidden">
          <div className="bg-bg2 px-4 py-2 border-b border-b1">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🏛️</span>
              CISA Advisories & Alerts
            </h3>
          </div>
          <EnhancedFeedList category="government" />
        </div>
      </div>
      
      {/* Incident Response Metrics */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🚨</span>
          Incident Response Metrics
        </h3>
        <IncidentResponseMetrics />
      </div>
    </div>
  );
}

function EmergencyResponsePanel() {
  const [alertLevel, setAlertLevel] = useState('normal');
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'CISA NCCIC', phone: '1-888-282-0870', type: 'primary', status: 'available' },
    { id: 2, name: 'FBI IC3', phone: '1-855-292-3937', type: 'primary', status: 'available' },
    { id: 3, name: 'US-CERT', phone: '1-888-282-0870', type: 'secondary', status: 'available' },
    { id: 4, name: 'DHS SOC', phone: '202-282-8000', type: 'primary', status: 'busy' }
  ]);
  
  const [activeIncidents, setActiveIncidents] = useState([
    {
      id: 'INC-2025-001',
      title: 'Suspected APT Activity',
      severity: 'critical',
      status: 'investigating',
      assignee: 'SOC Team Alpha',
      created: new Date(Date.now() - 1800000),
      location: 'Federal Agency Network'
    },
    {
      id: 'INC-2025-002', 
      title: 'Ransomware Detection',
      severity: 'high',
      status: 'contained',
      assignee: 'CERT Response',
      created: new Date(Date.now() - 3600000),
      location: 'Critical Infrastructure'
    }
  ]);
  
  const [escalationChain, setEscalationChain] = useState([
    { level: 1, role: 'SOC Analyst', contact: 'soc-l1@agency.gov', escalateAfter: '15 min' },
    { level: 2, role: 'SOC Senior Analyst', contact: 'soc-l2@agency.gov', escalateAfter: '30 min' },
    { level: 3, role: 'SOC Manager', contact: 'soc-mgr@agency.gov', escalateAfter: '45 min' },
    { level: 4, role: 'CISO', contact: 'ciso@agency.gov', escalateAfter: 'Manual' }
  ]);
  
  const getAlertLevelConfig = (level) => {
    const configs = {
      normal: { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅', label: 'NORMAL' },
      elevated: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️', label: 'ELEVATED' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🚨', label: 'HIGH' },
      critical: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🚨', label: 'CRITICAL' }
    };
    return configs[level] || configs.normal;
  };
  
  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white', 
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white'
    };
    return badges[severity] || badges.low;
  };
  
  const alertConfig = getAlertLevelConfig(alertLevel);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Emergency Response Command Center</h2>
        <div className={`px-4 py-2 rounded-lg border-2 ${alertConfig.color} font-bold flex items-center gap-2`}>
          <span>{alertConfig.icon}</span>
          <span>THREAT LEVEL: {alertConfig.label}</span>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          <div className="text-2xl mb-2">🚨</div>
          <div>Declare Incident</div>
        </button>
        <button className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          <div className="text-2xl mb-2">📞</div>
          <div>Contact CISA</div>
        </button>
        <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <div className="text-2xl mb-2">🔒</div>
          <div>Isolate Systems</div>
        </button>
        <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          <div className="text-2xl mb-2">📋</div>
          <div>Run Playbook</div>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <div className="border border-b1 rounded-lg overflow-hidden">
          <div className="bg-bg2 px-4 py-2 border-b border-b1">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🚨</span>
              Active Incidents
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="p-4 bg-bg1 rounded-lg border border-b1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="font-medium">{incident.id}</span>
                  </div>
                  <span className="text-xs text-t2">
                    {incident.created.toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="font-medium mb-2">{incident.title}</h4>
                <div className="text-sm text-t2 space-y-1">
                  <div>📍 {incident.location}</div>
                  <div>👤 Assigned: {incident.assignee}</div>
                  <div>Status: <span className="font-medium">{incident.status.toUpperCase()}</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Emergency Contacts */}
        <div className="border border-b1 rounded-lg overflow-hidden">
          <div className="bg-bg2 px-4 py-2 border-b border-b1">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📞</span>
              Emergency Contacts
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-bg1 rounded-lg border border-b1">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    contact.status === 'available' ? 'bg-green-500' : 
                    contact.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-t2">{contact.phone}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    Call
                  </button>
                  {contact.type === 'primary' && (
                    <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      Emergency
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Escalation Chain */}
      <div className="border border-b1 rounded-lg overflow-hidden">
        <div className="bg-bg2 px-4 py-2 border-b border-b1">
          <h3 className="font-semibold flex items-center gap-2">
            <span>⬆️</span>
            Escalation Chain
          </h3>
        </div>
        <div className="p-4">
          <div className="grid gap-3">
            {escalationChain.map((level, index) => (
              <div key={level.level} className="flex items-center p-3 bg-bg1 rounded-lg border border-b1">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-brand text-black rounded-full flex items-center justify-center font-bold text-sm">
                    {level.level}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{level.role}</div>
                    <div className="text-sm text-t2">{level.contact}</div>
                  </div>
                  <div className="text-sm text-t2">
                    Escalate after: {level.escalateAfter}
                  </div>
                </div>
                {index < escalationChain.length - 1 && (
                  <div className="ml-4 text-t2">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Threat Level Controls */}
      <div className="border border-b1 rounded-lg overflow-hidden">
        <div className="bg-bg2 px-4 py-2 border-b border-b1">
          <h3 className="font-semibold flex items-center gap-2">
            <span>🎯</span>
            Threat Level Management
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['normal', 'elevated', 'high', 'critical'].map((level) => {
              const config = getAlertLevelConfig(level);
              return (
                <button
                  key={level}
                  onClick={() => setAlertLevel(level)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    alertLevel === level 
                      ? config.color 
                      : 'bg-bg1 border-b1 hover:border-brand/50'
                  }`}
                >
                  <div className="text-lg">{config.icon}</div>
                  <div className="text-sm font-medium">{config.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelligencePanel({ advancedFilters = {} }) {
  const [feedCategory, setFeedCategory] = useState("all");
  const [localFilters, setLocalFilters] = useState({});

  // Combine advanced filters with local filters
  const combinedFilters = useMemo(() => {
    const combined = { ...localFilters };
    
    // Map advanced filters to feed filters
    if (advancedFilters.severityLevels?.length > 0) {
      combined.severity = advancedFilters.severityLevels[0]; // Use first severity for now
    }
    if (advancedFilters.threatTypes?.length > 0) {
      combined.threatType = advancedFilters.threatTypes;
    }
    if (advancedFilters.timeRange) {
      combined.timeRange = advancedFilters.timeRange;
    }
    
    return combined;
  }, [localFilters, advancedFilters]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Threat Intelligence Feeds</h2>
        
        {/* Active Filter Summary */}
        {Object.keys(advancedFilters).length > 0 && (
          <div className="mb-4 p-3 bg-brand/10 border border-brand/30 rounded-lg">
            <div className="text-sm font-medium text-brand mb-2">Applied Advanced Filters:</div>
            <div className="text-xs text-t2 space-y-1">
              {advancedFilters.severityLevels?.length > 0 && (
                <div>Severity: {advancedFilters.severityLevels.join(', ')}</div>
              )}
              {advancedFilters.threatTypes?.length > 0 && (
                <div>Threat Types: {advancedFilters.threatTypes.join(', ')}</div>
              )}
              {advancedFilters.timeRange && (
                <div>Time Range: {advancedFilters.timeRange}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All Feeds", icon: "📋" },
            { id: "government", label: "Government", icon: "🏛️" },
            { id: "threat_intel", label: "Threat Intel", icon: "🔍" },
            { id: "vendor", label: "Vendors", icon: "🏢" },
            { id: "news", label: "News", icon: "📰" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFeedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                feedCategory === cat.id
                  ? "bg-brand text-black border-brand"
                  : "bg-bg2 border-b1 hover:border-brand/50"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <label className="flex items-center gap-2 px-3 py-1 bg-bg2 rounded-lg border border-b1">
            <input
              type="checkbox"
              checked={localFilters.exploited || false}
              onChange={(e) => setLocalFilters({...localFilters, exploited: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Actively Exploited</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-1 bg-bg2 rounded-lg border border-b1">
            <input
              type="checkbox"
              checked={localFilters.has_cve || false}
              onChange={(e) => setLocalFilters({...localFilters, has_cve: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Has CVE</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-1 bg-bg2 rounded-lg border border-b1">
            <input
              type="checkbox"
              checked={localFilters.high_priority || false}
              onChange={(e) => setLocalFilters({...localFilters, high_priority: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">High Priority</span>
          </label>
        </div>
      </div>

      <div className="border border-b1 rounded-lg overflow-hidden">
        <EnhancedFeedList category={feedCategory} filters={combinedFilters} />
      </div>
    </div>
  );
}

export default function EnhancedDashboard() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hashTab = location.hash.replace("#", "");
  const [tab, setTab] = useState(hashTab || "overview");
  
  // Enhanced URL state management
  const [urlState, updateUrlState] = useUrlState();
  const [advancedFilters, setAdvancedFilters] = useState(urlState.f || {});
  
  // Performance monitoring and optimization
  const { startTimer, endTimer, getMetrics } = usePerformanceMonitor('EnhancedDashboard');
  const { memoryUsage, forceGarbageCollection } = useMemoryOptimization();
  
  // Accessibility features
  const { isHighContrast, isScreenReaderActive, announce } = useAccessibility();
  const { announceDataLoad, announceFilterChange } = useLiveRegion();
  const { addSkipLink } = useSkipLinks();
  
  // Performance-optimized infrastructure data
  const {
    data: infrastructureData,
    loading: infrastructureLoading,
    progress: infrastructureProgress
  } = useInfrastructureData({
    filters: advancedFilters,
    virtualizedView: true,
    viewportSize: 100,
    autoLoad: true
  });
  
  useEffect(() => {
    if (hashTab && hashTab !== tab) setTab(hashTab);
  }, [hashTab]);
  
  useEffect(() => {
    // Update advanced filters when URL state changes
    if (urlState.f) {
      setAdvancedFilters(urlState.f);
    }
  }, [urlState.f]);
  
  const changeTab = (t) => {
    setTab(t);
    navigate({ pathname: "/dashboard", hash: t });
  };

  const handleAdvancedFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
    updateUrlState({ f: newFilters });
    
    // Announce filter changes for accessibility
    const filterCount = Object.keys(newFilters).length;
    announceFilterChange('Advanced Filters', `${filterCount} filter categories applied`);
  };

  // Set up skip links for accessibility
  useEffect(() => {
    const removeSkipLinks = [
      addSkipLink('main-content', 'Skip to main dashboard content'),
      addSkipLink('filter-panel', 'Skip to filter panel'),
      addSkipLink('threat-overview', 'Skip to threat overview')
    ];

    return () => {
      removeSkipLinks.forEach(remove => remove());
    };
  }, [addSkipLink]);

  // Announce data loading for screen readers
  useEffect(() => {
    if (infrastructureData.length > 0) {
      announceDataLoad(infrastructureData.length, 'infrastructure');
    }
  }, [infrastructureData, announceDataLoad]);

  const [offices, setOffices] = useState([]);
  const [legacyFilters, setLegacyFilters] = useState({ agency: [], role_type: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadOffices().then((data) => {
      setOffices(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const agencies = useMemo(
    () => [...new Set(offices.map((o) => o.agency))],
    [offices]
  );
  const roles = useMemo(
    () => [...new Set(offices.map((o) => o.role_type))],
    [offices]
  );

  const filteredData = useMemo(() => {
    const agencyActive = legacyFilters.agency.length > 0;
    const roleActive = legacyFilters.role_type.length > 0;
    return offices.filter((o) => {
      const okAgency = !agencyActive || legacyFilters.agency.includes(o.agency);
      const okRole = !roleActive || legacyFilters.role_type.includes(o.role_type);
      return okAgency && okRole;
    });
  }, [offices, legacyFilters]);

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      {/* Emergency Accessibility Toolbar */}
      <EmergencyAccessibilityToolbar position="top" />
      
      <Header />
      <main 
        id="main-content"
        className="mx-auto max-w-[1600px] px-2 sm:px-4"
        role={ARIA_ROLES.MAIN}
        aria-label="Cybersecurity Dashboard Main Content"
      >
        {/* Performance Status Bar (Dev Mode) */}
        {import.meta.env.DEV && memoryUsage && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
            <div className="flex items-center justify-between">
              <span>
                Memory: {Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024)}MB / 
                {Math.round(memoryUsage.jsHeapSizeLimit / 1024 / 1024)}MB
              </span>
              <div className="flex gap-2">
                <span>Infrastructure: {infrastructureData.length} items</span>
                {infrastructureLoading && <span>Loading...</span>}
                <button 
                  onClick={forceGarbageCollection}
                  className="px-2 py-1 bg-yellow-600 text-white rounded text-xs"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-2 sm:gap-4">
          <div className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2">
            <Sidebar open={open} onClose={() => setOpen(false)}>
              <div 
                id="filter-panel"
                role={ARIA_ROLES.FILTER_PANEL}
                aria-label="Advanced Threat Intelligence Filters"
              >
                <AdvancedFilterPanel
                  filters={advancedFilters}
                  onChange={handleAdvancedFiltersChange}
                  showThreatFilters={true}
                  showTimeRange={true}
                />
              </div>
              <div className="mt-6 pt-6 border-t border-b1">
                <h4 className="font-medium text-t1 mb-4">Legacy Filters</h4>
                <FilterPanel
                  agencies={agencies}
                  roles={roles}
                  filters={legacyFilters}
                  onChange={setLegacyFilters}
                />
              </div>
              
              {/* Performance Metrics (Dev Mode) */}
              {import.meta.env.DEV && (
                <div className="mt-6 pt-6 border-t border-b1">
                  <h4 className="font-medium text-t1 mb-4 text-xs">Performance Metrics</h4>
                  <div className="space-y-2 text-xs text-t2">
                    <div>Infrastructure Load: {infrastructureProgress.loaded}/{infrastructureProgress.total}</div>
                    <div>Cache Status: Active</div>
                    <div>Render Mode: Optimized</div>
                  </div>
                </div>
              )}
            </Sidebar>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-10">
            <div className="relative rounded-xl border border-b1 bg-bg1 shadow-e1 overflow-hidden">
              <TabBar tab={tab} onChange={changeTab} />
              <div className="h-full">
                {tab === "overview" && (
                  <div 
                    id="threat-overview"
                    className="fade-enter"
                    role={ARIA_ROLES.THREAT_MONITOR}
                    aria-label="Real-time threat intelligence overview"
                  >
                    <OverviewPanel />
                  </div>
                )}
                {tab === "map" && (
                  <div className="relative fade-enter">
                    <MapView data={filteredData} loading={loading} />
                    <div className="absolute bottom-4 left-4 bg-bg2 border border-b1 text-xs px-2 py-1 rounded transition-smooth">
                      Federal cybersecurity offices
                    </div>
                  </div>
                )}
                {tab === "intelligence" && (
                  <div className="fade-enter">
                    <IntelligencePanelReplacement advancedFilters={advancedFilters} />
                  </div>
                )}
                {tab === "emergency" && (
                  <div className="fade-enter">
                    <EmergencyResponsePanel />
                  </div>
                )}
                {tab === "resources" && (
                  <div className="fade-enter">
                    <ResourcePanel />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring md:hidden fixed bottom-4 right-4 rounded-full px-4 py-2 bg-brand text-black font-medium shadow-e2"
      >
        Filters
      </button>
    </div>
  );
}