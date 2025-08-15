import { useState, useEffect } from 'react';
import FeedList from '../components/Feeds/FeedList';
import FeedChips from '../components/Feeds/FeedChips';

export default function Feeds() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    source_type: '',
    exploited: '',
    has_cve: '',
    q: ''
  });

  const fetchItems = async (params = {}) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      Object.entries({ ...filters, ...params }).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
      
      const response = await fetch(`/api/items?${searchParams}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (query) => {
    const newFilters = { ...filters, q: query };
    setFilters(newFilters);
    fetchItems(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchItems(newFilters);
  };

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 slide-enter">
          <h1 className="text-3xl font-bold mb-4">Threat Intelligence Feeds</h1>
          <p className="text-t2 mb-6">
            Real-time cybersecurity alerts, advisories, and threat intelligence from government agencies, security vendors, and research organizations.
          </p>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search threat intelligence..."
                className="w-full px-4 py-3 bg-bg1 border border-b1 rounded-lg text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                value={filters.q}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <FeedChips
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <FeedList
          items={items}
          loading={loading}
        />
      </div>
    </div>
  );
}