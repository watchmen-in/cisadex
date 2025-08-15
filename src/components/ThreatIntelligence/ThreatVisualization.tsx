import React, { useState, useEffect, useMemo } from 'react';
import { feedManager } from '../../services/feedManager';

interface ThreatData {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  timestamp: Date;
  source: string;
  cve?: string;
  exploited?: boolean;
  affected_systems: string[];
  geographic_impact: string[];
  confidence_level: number;
}

export default function ThreatVisualization() {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>(['CRITICAL', 'HIGH']);
  const [viewMode, setViewMode] = useState<'timeline' | 'heatmap' | 'network'>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadThreatData = async () => {
      setLoading(true);
      try {
        const [govFeeds, intelFeeds] = await Promise.all([
          feedManager.fetchAllByCategory('government'),
          feedManager.fetchAllByCategory('threat_intel')
        ]);
        
        const combinedThreats = [...govFeeds, ...intelFeeds]
          .map(feed => ({
            id: feed.id,
            title: feed.title,
            severity: feed.severity || 'MEDIUM',
            category: feed.category,
            timestamp: new Date(feed.date),
            source: feed.source,
            cve: feed.cve,
            exploited: feed.exploited,
            affected_systems: ['Windows', 'Linux', 'Network Infrastructure'], // Mock data
            geographic_impact: ['US', 'EU', 'Global'], // Mock data
            confidence_level: Math.random() * 100
          }))
          .filter(threat => selectedSeverity.includes(threat.severity))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 50);
        
        setThreats(combinedThreats);
      } catch (error) {
        console.error('Failed to load threat data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThreatData();
    const interval = setInterval(loadThreatData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedSeverity]);

  const severityColors = {
    CRITICAL: 'bg-red-600 text-white',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-black',
    LOW: 'bg-blue-500 text-white'
  };

  const threatsByTime = useMemo(() => {
    const now = new Date();
    const ranges = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168
    };
    const hoursBack = ranges[timeRange as keyof typeof ranges] || 24;
    const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    
    return threats.filter(threat => threat.timestamp >= cutoff);
  }, [threats, timeRange]);

  const severityDistribution = useMemo(() => {
    const dist = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    threatsByTime.forEach(threat => {
      dist[threat.severity]++;
    });
    return dist;
  }, [threatsByTime]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-bg2 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-bg2 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-bg2 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-t1 mb-1">Threat Intelligence Visualization</h2>
          <p className="text-sm text-t2">Real-time cybersecurity threat monitoring and analysis</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-bg2 border border-b1 rounded-lg px-3 py-2 text-sm text-t1"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          {/* View Mode Selector */}
          <div className="flex bg-bg2 rounded-lg p-1">
            {['timeline', 'heatmap', 'network'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === mode 
                    ? 'bg-brand text-black' 
                    : 'text-t2 hover:text-t1'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Severity Distribution Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(severityDistribution).map(([severity, count]) => (
          <div key={severity} className="bg-bg1 border border-b1 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[severity as keyof typeof severityColors]}`}>
                {severity}
              </span>
              <span className="text-2xl font-bold text-t1">{count}</span>
            </div>
            <div className="text-xs text-t2">
              {count > 0 ? `${((count / threatsByTime.length) * 100).toFixed(1)}% of threats` : 'No threats'}
            </div>
          </div>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-t2">Filter by Severity:</span>
        {Object.keys(severityColors).map(severity => (
          <label key={severity} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSeverity.includes(severity)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSeverity([...selectedSeverity, severity]);
                } else {
                  setSelectedSeverity(selectedSeverity.filter(s => s !== severity));
                }
              }}
              className="rounded"
            />
            <span className={`px-2 py-1 rounded text-xs ${severityColors[severity as keyof typeof severityColors]}`}>
              {severity}
            </span>
          </label>
        ))}
      </div>

      {/* Threat Visualization */}
      {viewMode === 'timeline' && (
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Threat Timeline</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {threatsByTime.map(threat => (
              <div key={threat.id} className="flex items-start gap-3 p-3 bg-bg2 rounded-lg hover:bg-bg2/80 transition-colors">
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[threat.severity]}`}>
                    {threat.severity}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm text-t1 mb-1">{threat.title}</h4>
                    <span className="text-xs text-t2">{threat.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-t2 space-y-1">
                    <div>Source: {threat.source} • Category: {threat.category}</div>
                    {threat.cve && <div>CVE: {threat.cve}</div>}
                    {threat.exploited && <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Actively Exploited</span>}
                    <div>Confidence: {threat.confidence_level.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'heatmap' && (
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Geographic Impact Heatmap</h3>
          <div className="grid grid-cols-8 gap-1 h-48">
            {Array.from({ length: 64 }, (_, i) => {
              const intensity = Math.random();
              return (
                <div
                  key={i}
                  className="rounded transition-all hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: intensity > 0.7 ? '#dc2626' : 
                                   intensity > 0.4 ? '#ea580c' : 
                                   intensity > 0.2 ? '#ca8a04' : '#374151'
                  }}
                  title={`Threat Level: ${(intensity * 100).toFixed(0)}%`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-t2 mt-2">
            <span>Low Impact</span>
            <span>High Impact</span>
          </div>
        </div>
      )}

      {viewMode === 'network' && (
        <div className="bg-bg1 border border-b1 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Threat Network Analysis</h3>
          <div className="relative h-64 bg-bg2 rounded overflow-hidden">
            <svg className="w-full h-full">
              {/* Network visualization nodes and connections */}
              {threatsByTime.slice(0, 10).map((threat, i) => {
                const x = 50 + (i % 3) * 150;
                const y = 50 + Math.floor(i / 3) * 80;
                const radius = threat.severity === 'CRITICAL' ? 12 : 
                              threat.severity === 'HIGH' ? 10 : 8;
                
                return (
                  <g key={threat.id}>
                    {/* Connection lines */}
                    {i > 0 && (
                      <line
                        x1={x}
                        y1={y}
                        x2={50 + ((i-1) % 3) * 150}
                        y2={50 + Math.floor((i-1) / 3) * 80}
                        stroke="#4b5563"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    )}
                    {/* Threat node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={threat.severity === 'CRITICAL' ? '#dc2626' :
                            threat.severity === 'HIGH' ? '#ea580c' :
                            threat.severity === 'MEDIUM' ? '#ca8a04' : '#2563eb'}
                      className="cursor-pointer hover:opacity-80"
                    />
                    {/* Node label */}
                    <text
                      x={x}
                      y={y + radius + 15}
                      textAnchor="middle"
                      className="text-xs fill-current text-t2"
                    >
                      {threat.source.substring(0, 8)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="text-xs text-t2 mt-2">
            Node size indicates threat severity • Lines show potential correlations
          </div>
        </div>
      )}

      {/* Live Updates Indicator */}
      <div className="flex items-center justify-center text-xs text-t2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates active • Last refresh: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}