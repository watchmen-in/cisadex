import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { loadOffices } from '../utils/dataLoader';

export default function Map() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState('all');

  useEffect(() => {
    setLoading(true);
    loadOffices().then((data) => {
      setOffices(data);
      setLoading(false);
    });
  }, []);

  const agencies = ['all', ...new Set(offices.map(o => o.agency))];
  const filteredOffices = selectedAgency === 'all' 
    ? offices 
    : offices.filter(o => o.agency === selectedAgency);

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <Header />
      
      {/* Page Header */}
      <div className="bg-bg1 border-b border-b1">
        <div className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-t1 mb-2">
                Federal Cybersecurity Infrastructure Map
              </h1>
              <p className="text-t2 max-w-2xl">
                Interactive mapping of federal cybersecurity offices, field locations, and regional 
                coordination centers across CISA, FBI, DHS, and US-CERT facilities nationwide.
              </p>
            </div>
            
            {/* Agency Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-t2">Filter by Agency:</label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="bg-bg2 border border-b1 rounded-lg px-3 py-2 text-sm text-t1 focus:ring-2 focus:ring-brand focus:border-brand"
              >
                {agencies.map(agency => (
                  <option key={agency} value={agency}>
                    {agency === 'all' ? 'All Agencies' : agency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00d0ff]"></div>
              <span className="text-t2">
                {filteredOffices.length} office{filteredOffices.length !== 1 ? 's' : ''} displayed
              </span>
            </div>
            <div className="text-t2">
              Coverage: {agencies.length - 1} federal agencies
            </div>
            <div className="text-t2">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="bg-bg1 border border-b1 rounded-xl overflow-hidden shadow-e1 relative">
          <MapView data={filteredOffices} loading={loading} />
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-bg2/90 backdrop-blur-sm border border-b1 rounded-lg p-3 text-xs">
            <div className="font-medium text-t1 mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00d0ff]"></div>
                <span className="text-t2">Federal Cybersecurity Office</span>
              </div>
              <div className="text-t2 text-xs mt-2">
                Click markers for office details
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Office Directory */}
      <div className="mx-auto max-w-[1600px] px-4 pb-8">
        <div className="bg-bg1 border border-b1 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-t1 mb-4">Office Directory</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffices.map((office) => (
              <div key={office.id} className="bg-bg2 border border-b1 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-t1">{office.office_name}</h3>
                  <span className="px-2 py-1 text-xs bg-brand/20 text-brand rounded-full">
                    {office.agency}
                  </span>
                </div>
                <p className="text-sm text-t2 mb-2">
                  {office.city}, {office.state}
                </p>
                <div className="text-xs text-t2">
                  <div>Type: {office.role_type}</div>
                  {office.contact_public?.phone && (
                    <div>Phone: {office.contact_public.phone}</div>
                  )}
                  {office.contact_public?.website && (
                    <a 
                      href={office.contact_public.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
