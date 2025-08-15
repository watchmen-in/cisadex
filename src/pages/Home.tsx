import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/map/SearchBox';

export default function Home() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const applyFilter = (type: string, value: string) => {
    try {
      const f = encodeURIComponent(JSON.stringify({ [type]: [value] }));
      navigate(`/browse?f=${f}`);
    } catch (error) {
      console.error('Filter navigation error:', error);
      // Fallback to basic navigation
      navigate('/browse');
    }
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
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">CISAdex</h1>
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600 rounded-full text-sm">
            <span>⚠️</span>
            <span>Offline</span>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 px-4">
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

        {/* Quick filters */}
        <div className="w-full max-w-4xl">
          <h3 className="text-center text-lg font-semibold mb-4 text-gray-300">
            Quick Filters
          </h3>
          <div className="flex gap-4 flex-wrap justify-center">
            {/* Agency filters */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400 text-center">Agencies</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {['FBI', 'FEMA', 'DHS', 'CISA'].map((agency) => (
                  <button
                    key={agency}
                    onClick={() => applyFilter('agencies', agency)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    disabled={!isOnline}
                    aria-label={`Filter by ${agency}`}
                  >
                    {agency}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector filters */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400 text-center">Sectors</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {['Water', 'Law Enforcement', 'Energy', 'Transportation'].map((sector) => (
                  <button
                    key={sector}
                    onClick={() => applyFilter('sectors', sector)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    disabled={!isOnline}
                    aria-label={`Filter by ${sector} sector`}
                  >
                    {sector}
                  </button>
                ))}
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
