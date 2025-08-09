import { useEffect, useMemo, useState } from 'react';
import MapView from '../components/MapView';
import FilterPanel from '../components/FilterPanel';
// RssFeedPanel now fetches RSS feeds via a server-side function
// import RssFeedPanel from '../components/RssFeedPanel';
import { loadOffices } from '../utils/dataLoader';

export default function Home() {
  const [offices, setOffices] = useState([]);
  // Defaults: show everything until user picks something
  const [filters, setFilters] = useState({ agency: [], role_type: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOffices().then((data) => {
      setOffices(data);
      setLoading(false);
    });
  }, []);

  const agencies = useMemo(() => [...new Set(offices.map(o => o.agency))], [offices]);
  const roles = useMemo(() => [...new Set(offices.map(o => o.role_type))], [offices]);

  const filteredData = useMemo(() => {
    const agencyActive = filters.agency.length > 0;
    const roleActive = filters.role_type.length > 0;
    return offices.filter(o => {
      const okAgency = !agencyActive || filters.agency.includes(o.agency);
      const okRole = !roleActive || filters.role_type.includes(o.role_type);
      return okAgency && okRole;
    });
  }, [offices, filters]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }

  return (
    <div className="h-full flex">
      <div className="hidden md:block w-64 bg-gray-800 text-white pt-4 p-4 overflow-y-auto">
        <FilterPanel agencies={agencies} roles={roles} filters={filters} onChange={setFilters} />
      </div>
      <div className="flex-1 relative">
        <MapView data={filteredData} />
        <button
          className="md:hidden absolute bottom-4 left-4 z-10 bg-gray-800 text-white px-3 py-2 rounded"
          onClick={() => setShowFilters(true)}
        >
          Filters
        </button>
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-center items-end">
            <div className="bg-gray-800 text-white w-full p-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>Close</button>
              </div>
              <FilterPanel agencies={agencies} roles={roles} filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}
      </div>
    {/* <RssFeedPanel /> */}
    </div>
  );
}
