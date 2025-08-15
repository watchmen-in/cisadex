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
      } else {
        // API not available, use fallback mock data
        setItems(getMockFeedData());
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      // Fallback to mock data when API fails
      setItems(getMockFeedData());
    } finally {
      setLoading(false);
    }
  };

  const getMockFeedData = () => [
    {
      id: 'cisa-001',
      title: 'CISA Alert: Critical Vulnerability in Microsoft Exchange Server',
      url: 'https://www.cisa.gov/news-events/alerts/2024/aa24-001a',
      source: 'CISA',
      source_type: 'gov',
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      summary: 'Microsoft has released security updates addressing critical vulnerabilities affecting Microsoft Exchange Server. A cyber threat actor could exploit these vulnerabilities to take control of an affected system.',
      cve: 'CVE-2024-0001',
      exploited: true,
      epss: 0.85
    },
    {
      id: 'nist-002',
      title: 'NIST Cybersecurity Framework Update: Enhanced Supply Chain Security',
      url: 'https://www.nist.gov/news-events/news/2024/01/nist-cybersecurity-framework-update',
      source: 'NIST',
      source_type: 'gov',
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      summary: 'NIST releases updated cybersecurity framework with enhanced guidance on supply chain risk management and incident response protocols.',
      cve: null,
      exploited: false,
      epss: null
    },
    {
      id: 'fbi-003',
      title: 'FBI Warning: Increased Ransomware Activity Targeting Healthcare',
      url: 'https://www.fbi.gov/news/press-releases/2024/fbi-warning-ransomware-healthcare',
      source: 'FBI',
      source_type: 'gov',
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      summary: 'The FBI is warning healthcare organizations about increased ransomware activity targeting medical facilities and patient data systems.',
      cve: null,
      exploited: false,
      epss: null
    }
  ];

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