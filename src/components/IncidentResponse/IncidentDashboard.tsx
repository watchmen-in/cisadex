import React, { useState, useEffect, useCallback } from 'react';

interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  type: 'MALWARE' | 'PHISHING' | 'BREACH' | 'DDOS' | 'INSIDER' | 'OTHER';
  timestamp: Date;
  assignee: string;
  affectedSystems: string[];
  estimatedImpact: string;
  responseTime: number; // in minutes
  lastUpdate: Date;
}

interface ResponseTeam {
  id: string;
  name: string;
  role: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentIncidents: number;
  contact: string;
}

export default function IncidentDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [alertSound, setAlertSound] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Simulate real-time incident data
  useEffect(() => {
    const mockIncidents: Incident[] = [
      {
        id: 'INC-2024-001',
        title: 'Ransomware Detection in Financial Sector',
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        type: 'MALWARE',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        assignee: 'SOC Team Alpha',
        affectedSystems: ['Exchange Server', 'Domain Controller', 'File Shares'],
        estimatedImpact: 'High - Critical business systems affected',
        responseTime: 3,
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 'INC-2024-002',
        title: 'Suspicious Network Activity - Energy Sector',
        severity: 'HIGH',
        status: 'OPEN',
        type: 'BREACH',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        assignee: 'SOC Team Bravo',
        affectedSystems: ['SCADA Systems', 'Control Networks'],
        estimatedImpact: 'Medium - Potential infrastructure disruption',
        responseTime: 8,
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'INC-2024-003',
        title: 'Mass Phishing Campaign Detected',
        severity: 'MEDIUM',
        status: 'CONTAINED',
        type: 'PHISHING',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignee: 'SOC Team Charlie',
        affectedSystems: ['Email Infrastructure', 'User Workstations'],
        estimatedImpact: 'Low - Email filtering active',
        responseTime: 12,
        lastUpdate: new Date(Date.now() - 10 * 60 * 1000)
      }
    ];

    const mockTeams: ResponseTeam[] = [
      {
        id: 'team-alpha',
        name: 'SOC Team Alpha',
        role: 'Critical Incident Response',
        status: 'BUSY',
        currentIncidents: 1,
        contact: 'alpha@cisa.dhs.gov'
      },
      {
        id: 'team-bravo',
        name: 'SOC Team Bravo',
        role: 'Infrastructure Protection',
        status: 'BUSY',
        currentIncidents: 1,
        contact: 'bravo@cisa.dhs.gov'
      },
      {
        id: 'team-charlie',
        name: 'SOC Team Charlie',
        role: 'Threat Analysis',
        status: 'AVAILABLE',
        currentIncidents: 0,
        contact: 'charlie@cisa.dhs.gov'
      },
      {
        id: 'team-delta',
        name: 'SOC Team Delta',
        role: 'Digital Forensics',
        status: 'AVAILABLE',
        currentIncidents: 0,
        contact: 'delta@cisa.dhs.gov'
      }
    ];

    setIncidents(mockIncidents);
    setResponseTeams(mockTeams);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate incident updates
      setIncidents(prev => prev.map(incident => ({
        ...incident,
        lastUpdate: new Date(),
        responseTime: incident.responseTime + Math.floor(Math.random() * 2)
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Emergency mode keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        setEmergencyMode(!emergencyMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [emergencyMode]);

  const handleCreateIncident = () => {
    const newIncident: Incident = {
      id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
      title: 'New Security Incident',
      severity: 'HIGH',
      status: 'OPEN',
      type: 'OTHER',
      timestamp: new Date(),
      assignee: 'Unassigned',
      affectedSystems: [],
      estimatedImpact: 'Under Investigation',
      responseTime: 0,
      lastUpdate: new Date()
    };
    setIncidents([newIncident, ...incidents]);
    setSelectedIncident(newIncident);
  };

  const handleEscalateIncident = (incident: Incident) => {
    const escalationMap = {
      'LOW': 'MEDIUM',
      'MEDIUM': 'HIGH',
      'HIGH': 'CRITICAL',
      'CRITICAL': 'CRITICAL'
    };
    
    setIncidents(prev => prev.map(inc => 
      inc.id === incident.id 
        ? { ...inc, severity: escalationMap[inc.severity] as any, lastUpdate: new Date() }
        : inc
    ));
    
    if (escalationMap[incident.severity] === 'CRITICAL' && alertSound) {
      // Play alert sound (would need actual audio implementation)
      console.log('🚨 CRITICAL ALERT SOUND');
    }
  };

  const handleStatusChange = (incident: Incident, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incident.id 
        ? { ...inc, status: newStatus, lastUpdate: new Date() }
        : inc
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-700';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-600';
      case 'MEDIUM': return 'bg-yellow-500 text-black border-yellow-600';
      case 'LOW': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800 border-red-200';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTAINED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeIncidents = incidents.filter(inc => inc.status !== 'RESOLVED');
  const criticalIncidents = incidents.filter(inc => inc.severity === 'CRITICAL');

  return (
    <div className={`p-6 space-y-6 ${emergencyMode ? 'bg-red-950 text-red-100' : ''}`}>
      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="bg-red-600 text-white p-4 rounded-lg border-2 border-red-400 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-bold text-lg">EMERGENCY MODE ACTIVE</h3>
                <p className="text-sm">High-priority incident response protocols in effect</p>
              </div>
            </div>
            <button
              onClick={() => setEmergencyMode(false)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm font-medium"
            >
              Exit Emergency Mode
            </button>
          </div>
        </div>
      )}

      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-t1 mb-1">Incident Response Dashboard</h2>
          <p className="text-sm text-t2">Real-time cybersecurity incident monitoring and response</p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alertSound}
              onChange={(e) => setAlertSound(e.target.checked)}
              className="rounded"
            />
            Alert sounds
          </label>
          
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              emergencyMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {emergencyMode ? '🚨 Emergency Active' : '⚠️ Emergency Mode'}
          </button>
          
          <button
            onClick={handleCreateIncident}
            className="px-4 py-2 bg-brand text-black rounded-lg text-sm font-medium hover:bg-brand/90"
          >
            + Create Incident
          </button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-t2">Active Incidents</span>
            <span className="text-2xl font-bold text-red-500">{activeIncidents.length}</span>
          </div>
          <div className="text-xs text-t2">
            {criticalIncidents.length} critical, {activeIncidents.length - criticalIncidents.length} other
          </div>
        </div>
        
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-t2">Avg Response Time</span>
            <span className="text-2xl font-bold text-orange-500">
              {Math.round(incidents.reduce((acc, inc) => acc + inc.responseTime, 0) / incidents.length)}m
            </span>
          </div>
          <div className="text-xs text-t2">Target: &lt;15 minutes</div>
        </div>
        
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-t2">Available Teams</span>
            <span className="text-2xl font-bold text-green-500">
              {responseTeams.filter(team => team.status === 'AVAILABLE').length}
            </span>
          </div>
          <div className="text-xs text-t2">
            {responseTeams.filter(team => team.status === 'BUSY').length} busy teams
          </div>
        </div>
        
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-t2">Resolved Today</span>
            <span className="text-2xl font-bold text-blue-500">
              {incidents.filter(inc => inc.status === 'RESOLVED').length}
            </span>
          </div>
          <div className="text-xs text-t2">94% resolution rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-bg1 border border-b1 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Quick Response Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <button className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            🚨 Declare Major Incident
          </button>
          <button className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
            📞 Contact CISA
          </button>
          <button className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
            🔒 Isolate Systems
          </button>
          <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            📋 Run Playbook
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Incidents List */}
        <div className="col-span-8">
          <div className="bg-bg1 border border-b1 rounded-lg">
            <div className="p-4 border-b border-b1">
              <h3 className="font-semibold">Active Incidents</h3>
            </div>
            <div className="divide-y divide-b1 max-h-96 overflow-y-auto">
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  className={`p-4 hover:bg-bg2 cursor-pointer transition-colors ${
                    selectedIncident?.id === incident.id ? 'bg-bg2' : ''
                  }`}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                    <div className="text-xs text-t2">
                      {incident.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-t1 mb-1">{incident.title}</h4>
                  <div className="text-sm text-t2 mb-2">ID: {incident.id} • Type: {incident.type}</div>
                  <div className="text-xs text-t2">
                    Assigned: {incident.assignee} • Response Time: {incident.responseTime}m
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEscalateIncident(incident);
                      }}
                      className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs hover:bg-orange-200"
                    >
                      Escalate
                    </button>
                    <select
                      value={incident.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(incident, e.target.value as Incident['status']);
                      }}
                      className="px-2 py-1 border border-b1 rounded text-xs bg-bg2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="OPEN">Open</option>
                      <option value="INVESTIGATING">Investigating</option>
                      <option value="CONTAINED">Contained</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Teams */}
        <div className="col-span-4">
          <div className="bg-bg1 border border-b1 rounded-lg">
            <div className="p-4 border-b border-b1">
              <h3 className="font-semibold">Response Teams</h3>
            </div>
            <div className="p-4 space-y-3">
              {responseTeams.map(team => (
                <div key={team.id} className="p-3 bg-bg2 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{team.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      team.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      team.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                  <div className="text-xs text-t2 mb-2">{team.role}</div>
                  <div className="text-xs text-t2">
                    Current incidents: {team.currentIncidents}
                  </div>
                  <button className="mt-2 w-full px-2 py-1 bg-brand/10 text-brand rounded text-xs hover:bg-brand/20">
                    Contact Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Updates Footer */}
      <div className="flex items-center justify-center text-xs text-t2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time monitoring active • Press Ctrl+Shift+E for Emergency Mode</span>
        </div>
      </div>
    </div>
  );
}