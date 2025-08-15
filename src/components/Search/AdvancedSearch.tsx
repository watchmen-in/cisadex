import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { federalEntitiesDatabase } from '../../data/federalEntities';
import { feedManager } from '../../services/feedManager';

interface SearchResult {
  id: string;
  title: string;
  type: 'entity' | 'threat' | 'incident' | 'vulnerability';
  category: string;
  severity?: string;
  timestamp?: Date;
  description: string;
  source: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

interface SearchFilters {
  type: string[];
  severity: string[];
  timeRange: string;
  category: string[];
  source: string[];
  location: string;
  keywords: string[];
}

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    severity: [],
    timeRange: '24h',
    category: [],
    source: [],
    location: '',
    keywords: []
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<Array<{name: string, query: string, filters: SearchFilters}>>([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('cisadx-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    const saved = localStorage.getItem('cisadx-saved-searches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const entitySuggestions = federalEntitiesDatabase
      .filter(entity => 
        entity.name.toLowerCase().includes(query.toLowerCase()) ||
        entity.parentAgency.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(entity => entity.name);

    const threatSuggestions = [
      'ransomware attack',
      'phishing campaign',
      'data breach',
      'malware infection',
      'ddos attack',
      'insider threat',
      'supply chain attack',
      'zero-day exploit'
    ].filter(term => term.toLowerCase().includes(query.toLowerCase()));

    const combinedSuggestions = [...new Set([...entitySuggestions, ...threatSuggestions])];
    setSuggestions(combinedSuggestions.slice(0, 8));
  }, [query]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    setLoading(true);
    
    try {
      const results: SearchResult[] = [];
      
      // Search federal entities
      const entityResults = federalEntitiesDatabase
        .filter(entity => {
          const matchesQuery = searchQuery === '' || 
            entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entity.parentAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entity.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
          
          const matchesLocation = !searchFilters.location || 
            entity.location.state.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
            entity.location.city.toLowerCase().includes(searchFilters.location.toLowerCase());
          
          const matchesCategory = searchFilters.category.length === 0 ||
            searchFilters.category.some(cat => entity.sectors.includes(cat));
          
          return matchesQuery && matchesLocation && matchesCategory;
        })
        .map(entity => ({
          id: entity.id,
          title: entity.name,
          type: 'entity' as const,
          category: entity.parentAgency,
          description: `${entity.type.replace(/_/g, ' ')} in ${entity.location.city}, ${entity.location.state}`,
          source: 'Federal Entity Database',
          relevanceScore: calculateRelevance(searchQuery, entity.name),
          timestamp: new Date(),
          metadata: {
            location: entity.location,
            capabilities: entity.capabilities,
            status: entity.status
          }
        }));

      // Search threat intelligence
      const threatFeeds = await Promise.all([
        feedManager.fetchAllByCategory('government'),
        feedManager.fetchAllByCategory('threat_intel'),
        feedManager.fetchAllByCategory('news')
      ]);
      
      const threatResults = threatFeeds.flat()
        .filter(feed => {
          const matchesQuery = searchQuery === '' ||
            feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feed.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesSeverity = searchFilters.severity.length === 0 ||
            searchFilters.severity.includes(feed.severity || 'UNKNOWN');
          
          const matchesTimeRange = matchesTimeFilter(feed.date, searchFilters.timeRange);
          
          const matchesSource = searchFilters.source.length === 0 ||
            searchFilters.source.includes(feed.source);
          
          return matchesQuery && matchesSeverity && matchesTimeRange && matchesSource;
        })
        .map(feed => ({
          id: feed.id,
          title: feed.title,
          type: feed.category === 'government' ? 'incident' as const : 'threat' as const,
          category: feed.category,
          severity: feed.severity,
          timestamp: new Date(feed.date),
          description: feed.description.substring(0, 200) + '...',
          source: feed.source,
          relevanceScore: calculateRelevance(searchQuery, feed.title),
          metadata: {
            cve: feed.cve,
            exploited: feed.exploited,
            link: feed.link
          }
        }));

      // Combine and sort results
      const allResults = [...entityResults, ...threatResults]
        .filter(result => searchFilters.type.length === 0 || searchFilters.type.includes(result.type))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 50);

      setResults(allResults);
      
      // Save to search history
      if (searchQuery.trim()) {
        const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('cisadx-search-history', JSON.stringify(newHistory));
      }
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  // Helper functions
  const calculateRelevance = (query: string, text: string): number => {
    const normalizedQuery = query.toLowerCase();
    const normalizedText = text.toLowerCase();
    
    if (normalizedText === normalizedQuery) return 100;
    if (normalizedText.startsWith(normalizedQuery)) return 90;
    if (normalizedText.includes(normalizedQuery)) return 70;
    
    // Calculate word matches
    const queryWords = normalizedQuery.split(' ');
    const textWords = normalizedText.split(' ');
    const matches = queryWords.filter(word => textWords.some(textWord => textWord.includes(word)));
    
    return (matches.length / queryWords.length) * 50;
  };

  const matchesTimeFilter = (date: string | Date, timeRange: string): boolean => {
    const itemDate = new Date(date);
    const now = new Date();
    const ranges: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720,
      'all': Infinity
    };
    
    const hoursBack = ranges[timeRange] || 24;
    const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    
    return itemDate >= cutoff;
  };

  const handleSearch = () => {
    performSearch(query, filters);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (query) {
      performSearch(query, newFilters);
    }
  };

  const handleSaveSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      const newSavedSearches = [...savedSearches, { name, query, filters }];
      setSavedSearches(newSavedSearches);
      localStorage.setItem('cisadx-saved-searches', JSON.stringify(newSavedSearches));
    }
  };

  const handleLoadSavedSearch = (savedSearch: typeof savedSearches[0]) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch(savedSearch.query, savedSearch.filters);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'entity') {
      navigate(`/map?entity=${result.id}`);
    } else if (result.metadata.link) {
      window.open(result.metadata.link, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-t1 mb-2">Advanced Cybersecurity Search</h1>
        <p className="text-t2">Search federal entities, threat intelligence, incidents, and vulnerabilities</p>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search entities, threats, incidents, CVEs..."
              className="w-full px-4 py-3 pr-12 border border-b1 rounded-lg bg-bg1 text-t1 focus:ring-2 focus:ring-brand focus:border-brand"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-t2 hover:text-t1"
            >
              🔍
            </button>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-3 bg-bg2 border border-b1 rounded-lg text-t1 hover:bg-bg2/80"
          >
            {showAdvanced ? 'Hide' : 'Advanced'}
          </button>
          {query && (
            <button
              onClick={handleSaveSearch}
              className="px-4 py-3 bg-brand text-black rounded-lg hover:bg-brand/90"
            >
              Save Search
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && query && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg1 border border-b1 rounded-lg shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  setSuggestions([]);
                }}
                className="w-full px-4 py-2 text-left hover:bg-bg2 first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-bg1 border border-b1 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-t1 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Content Type</label>
              <div className="space-y-1">
                {['entity', 'threat', 'incident', 'vulnerability'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked 
                          ? [...filters.type, type]
                          : filters.type.filter(t => t !== type);
                        handleFilterChange('type', newTypes);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Severity Level</label>
              <div className="space-y-1">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => (
                  <label key={severity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.severity.includes(severity)}
                      onChange={(e) => {
                        const newSeverities = e.target.checked 
                          ? [...filters.severity, severity]
                          : filters.severity.filter(s => s !== severity);
                        handleFilterChange('severity', newSeverities);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg2 text-t1"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="State or city..."
                className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg2 text-t1"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Category</label>
              <select
                multiple
                value={filters.category}
                onChange={(e) => handleFilterChange('category', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg2 text-t1"
                size={4}
              >
                <option value="energy">Energy</option>
                <option value="financial_services">Financial Services</option>
                <option value="healthcare_public_health">Healthcare</option>
                <option value="communications">Communications</option>
                <option value="transportation">Transportation</option>
                <option value="water_wastewater">Water Systems</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-t2 mb-2">Source</label>
              <select
                multiple
                value={filters.source}
                onChange={(e) => handleFilterChange('source', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-b1 rounded-lg bg-bg2 text-t1"
                size={4}
              >
                <option value="CISA KEV">CISA KEV</option>
                <option value="US-CERT">US-CERT</option>
                <option value="FBI">FBI</option>
                <option value="Krebs on Security">Krebs on Security</option>
                <option value="The Hacker News">The Hacker News</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search History & Saved Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-bg1 border border-b1 rounded-lg p-4">
            <h3 className="font-semibold text-t1 mb-3">Recent Searches</h3>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(historyQuery);
                    performSearch(historyQuery, filters);
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="bg-bg1 border border-b1 rounded-lg p-4">
            <h3 className="font-semibold text-t1 mb-3">Saved Searches</h3>
            <div className="space-y-2">
              {savedSearches.map((savedSearch, index) => (
                <div key={index} className="flex items-center justify-between">
                  <button
                    onClick={() => handleLoadSavedSearch(savedSearch)}
                    className="text-left text-sm text-t2 hover:text-t1"
                  >
                    {savedSearch.name}
                  </button>
                  <button
                    onClick={() => {
                      const newSaved = savedSearches.filter((_, i) => i !== index);
                      setSavedSearches(newSaved);
                      localStorage.setItem('cisadx-saved-searches', JSON.stringify(newSaved));
                    }}
                    className="text-xs text-t2 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <p className="mt-2 text-t2">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-t1">Search Results ({results.length})</h3>
            <div className="text-sm text-t2">
              Sorted by relevance
            </div>
          </div>
          
          {results.map(result => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="bg-bg1 border border-b1 rounded-lg p-4 hover:bg-bg2 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.type === 'entity' ? 'bg-blue-100 text-blue-800' :
                    result.type === 'threat' ? 'bg-red-100 text-red-800' :
                    result.type === 'incident' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {result.type.toUpperCase()}
                  </span>
                  {result.severity && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      result.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      result.severity === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {result.severity}
                    </span>
                  )}
                </div>
                <div className="text-xs text-t2">
                  Score: {result.relevanceScore.toFixed(0)}%
                </div>
              </div>
              
              <h4 className="font-medium text-t1 mb-1">{result.title}</h4>
              <p className="text-sm text-t2 mb-2">{result.description}</p>
              
              <div className="flex items-center justify-between text-xs text-t2">
                <div>
                  Source: {result.source} • Category: {result.category}
                </div>
                {result.timestamp && (
                  <div>
                    {result.timestamp.toLocaleString()}
                  </div>
                )}
              </div>
              
              {/* Metadata Display */}
              {Object.keys(result.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.metadata.cve && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {result.metadata.cve}
                    </span>
                  )}
                  {result.metadata.exploited && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                      Actively Exploited
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : query && !loading ? (
        <div className="text-center py-8 text-t2">
          <p>No results found for "{query}"</p>
          <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
        </div>
      ) : null}
    </div>
  );
}