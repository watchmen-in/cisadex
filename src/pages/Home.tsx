import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/map/SearchBox';

export default function Home() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [videoError, setVideoError] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyFilter = (type: string, value: string, targetPage: string = '/map') => {
    try {
      // Create comprehensive filter object
      const filterObj: Record<string, string[]> = {};
      
      // Map filter types to filter object keys
      const filterMap: Record<string, string> = {
        'agencies': 'agencies',
        'sectors': 'sectors', 
        'functions': 'functions',
        'states': 'states',
        'threatTypes': 'threatTypes',
        'severityLevels': 'severityLevels'
      };
      
      const filterKey = filterMap[type] || type;
      filterObj[filterKey] = [value];
      
      // Create URL with comprehensive filter state
      const f = encodeURIComponent(JSON.stringify(filterObj));
      const targetUrl = `${targetPage}?f=${f}`;
      
      navigate(targetUrl);
    } catch (error) {
      console.error('Filter navigation error:', error);
      // Fallback navigation
      navigate('/map');
    }
  };

  const applyQuickFilter = (filterType: string, filterValue: string) => {
    applyFilter(filterType, filterValue, '/dashboard#overview');
  };

  const handleBrowseClick = () => {
    try {
      navigate('/browse');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window location
      window.location.href = '/browse';
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={() => {
              console.error('Video failed to load');
              setVideoError(true);
            }}
          >
            <source src="/assets/cisadex-splash.mp4" type="video/mp4" />
            <source src="/cisadex-splash.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-black"></div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex items-center justify-between relative z-10">
        <h1 className="text-xl font-bold">CISAdex</h1>
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600 rounded-full text-sm">
            <span>⚠️</span>
            <span>Offline</span>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 px-4 relative z-10">
        {/* Hero section */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Cybersecurity Infrastructure Directory
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Explore federal cybersecurity offices, agencies, and critical infrastructure across the United States
          </p>
        </div>

        {/* Search and navigation */}
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <SearchBox 
              onSelect={(id) => {
                try {
                  navigate(`/entity/${id}`);
                } catch (error) {
                  console.error('Entity navigation error:', error);
                  window.location.href = `/entity/${id}`;
                }
              }} 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={handleBrowseClick}
              disabled={!isOnline}
              aria-label="Browse interactive map of cybersecurity entities"
            >
              {isOnline ? 'Browse Interactive Map' : 'Map Unavailable (Offline)'}
            </button>
            <button
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={() => navigate('/report-incident')}
              aria-label="Report a cybersecurity incident"
            >
              🚨 Report Incident
            </button>
          </div>
        </div>

        {/* Enhanced Quick Filters */}
        <div className="w-full max-w-6xl">
          <h3 className="text-center text-lg font-semibold mb-6 text-gray-300">
            Explore Federal Cybersecurity Infrastructure
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Priority Agencies */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-blue-400">🏛️</span>
                <p className="text-sm font-medium text-gray-300 text-center">Priority Agencies</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'CISA', icon: '🛡️', desc: 'Cybersecurity & Infrastructure' },
                  { name: 'FBI', icon: '🕵️', desc: 'Federal Bureau of Investigation' },
                  { name: 'SECRET_SERVICE', icon: '⭐', desc: 'US Secret Service' },
                  { name: 'DHS', icon: '🏠', desc: 'Homeland Security' }
                ].map((agency) => (
                  <button
                    key={agency.name}
                    onClick={() => applyFilter('agencies', agency.name)}
                    className="group px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-left"
                    disabled={!isOnline}
                    aria-label={`Filter by ${agency.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{agency.icon}</span>
                      <div>
                        <div className="font-medium">{agency.name}</div>
                        <div className="text-xs text-gray-300 group-hover:text-white">{agency.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Infrastructure */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-green-400">⚡</span>
                <p className="text-sm font-medium text-gray-300 text-center">Critical Infrastructure</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'energy', icon: '⚡', label: 'Energy Sector' },
                  { name: 'financial_services', icon: '🏦', label: 'Financial Services' },
                  { name: 'healthcare_public_health', icon: '🏥', label: 'Healthcare' },
                  { name: 'communications', icon: '📡', label: 'Communications' }
                ].map((sector) => (
                  <button
                    key={sector.name}
                    onClick={() => applyFilter('sectors', sector.name)}
                    className="group px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-left"
                    disabled={!isOnline}
                    aria-label={`Filter by ${sector.label}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sector.icon}</span>
                      <div>
                        <div className="font-medium">{sector.label}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Operational Functions */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-purple-400">🎯</span>
                <p className="text-sm font-medium text-gray-300 text-center">Key Functions</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'incident_response', icon: '🚨', label: 'Incident Response' },
                  { name: 'cyber_forensics', icon: '🔍', label: 'Cyber Forensics' },
                  { name: 'threat_hunting', icon: '🎯', label: 'Threat Hunting' },
                  { name: 'intelligence', icon: '🕵️', label: 'Intelligence' }
                ].map((func) => (
                  <button
                    key={func.name}
                    onClick={() => applyFilter('functions', func.name)}
                    className="group px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-left"
                    disabled={!isOnline}
                    aria-label={`Filter by ${func.label}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{func.icon}</span>
                      <div>
                        <div className="font-medium">{func.label}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Threat Intelligence */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-red-400">🚨</span>
                <p className="text-sm font-medium text-gray-300 text-center">Threat Intelligence</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'CRITICAL', icon: '🚨', label: 'Critical Threats', type: 'severityLevels' },
                  { name: 'Ransomware', icon: '🔒', label: 'Ransomware', type: 'threatTypes' },
                  { name: 'APT Activity', icon: '🕵️', label: 'APT Activity', type: 'threatTypes' },
                  { name: 'Data Breach', icon: '💾', label: 'Data Breaches', type: 'threatTypes' }
                ].map((threat) => (
                  <button
                    key={threat.name}
                    onClick={() => applyQuickFilter(threat.type, threat.name)}
                    className="group px-4 py-3 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-sm text-white rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-left border border-red-500/30"
                    disabled={!isOnline}
                    aria-label={`View ${threat.label}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{threat.icon}</span>
                      <div>
                        <div className="font-medium">{threat.label}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2000+</div>
                <div className="text-xs text-gray-300">Federal Entities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">16</div>
                <div className="text-xs text-gray-300">CI Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">50+</div>
                <div className="text-xs text-gray-300">States Covered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">24/7</div>
                <div className="text-xs text-gray-300">Operations</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-400 text-sm">
        <p>Federal cybersecurity infrastructure mapping and directory</p>
      </footer>
    </div>
  );
}
