import React, { useEffect, useState } from 'react';
import AtlasMap from '../components/map/AtlasMap';
import DetailDrawer from '../components/map/DetailDrawer';
import SearchBox from '../components/map/SearchBox';
import ResultsPane from '../components/results/ResultsPane';
import FilterChips from '../components/filters/FilterChips';
import useUrlState from '../hooks/useUrlState';
import { Filters } from '../constants/taxonomy';
import { validateEntities } from '../utils/validateEntity';
import { fetchWithCache } from '../utils/cache';

export default function Browse() {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [drawerEntity, setDrawerEntity] = useState<any | null>(null);
  const [viewport, setViewport] = useState({
    longitude: -98.5,
    latitude: 39.8,
    zoom: 3,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [urlState, setUrlState] = useUrlState();

  // load data with caching and proper error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchWithCache<any[]>(
          `${import.meta.env.BASE_URL}data/summary.json`,
          {
            cacheTtl: 10 * 60 * 1000, // Cache for 10 minutes
            retries: 3,
            retryDelay: 1000,
          }
        );
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected array');
        }
        
        const validation = validateEntities(data);
        if (!validation.valid) {
          if (import.meta.env.DEV) {
            console.warn('Data validation warnings:', validation.errors);
          } else {
            // In production, log validation issues but don't fail
            console.warn(`Data validation found ${validation.errors.length} issues`);
          }
        }
        
        setSummary(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Data loading error:', err);
        
        // Attempt to use stale cache data as fallback
        try {
          const { cache } = await import('../utils/cache');
          const cacheKey = `fetch:${import.meta.env.BASE_URL}data/summary.json:${JSON.stringify({})}`;
          const staleData = cache.get<any[]>(cacheKey);
          if (staleData) {
            console.warn('Using stale cached data as fallback');
            setSummary(staleData);
            setError(`Using cached data: ${errorMessage}`);
          }
        } catch (cacheError) {
          console.warn('Failed to retrieve fallback data:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // apply URL state on first render
  useEffect(() => {
    if (urlState.f) setFilters(urlState.f);
    if (urlState.s) setSelectedId(urlState.s);
    if (urlState.z && urlState.c) {
      setViewport({ longitude: urlState.c[0], latitude: urlState.c[1], zoom: urlState.z });
    }
  }, []);

  // sync URL when filters or selection change
  useEffect(() => {
    setUrlState({ f: filters });
  }, [filters]);
  useEffect(() => {
    if (selectedId) setUrlState({ s: selectedId });
  }, [selectedId]);
  useEffect(() => {
    setUrlState({ z: viewport.zoom, c: [viewport.longitude, viewport.latitude] });
  }, [viewport]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      const ent = summary.find((x) => x.id === e.detail);
      setDrawerEntity(ent || null);
    };
    document.addEventListener('results:open', handleOpen);
    return () => document.removeEventListener('results:open', handleOpen);
  }, [summary]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f') setShowFilters((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = summary.filter((e) => {
    if (filters.sectors && !filters.sectors.some((s) => e.sectors.includes(s))) return false;
    if (filters.functions && !filters.functions.some((s) => e.functions.includes(s))) return false;
    if (filters.agencies && !filters.agencies.includes(e.agency)) return false;
    if (filters.states && !filters.states.includes(e.state)) return false;
    return true;
  });

  useEffect(() => {
    const ent = summary.find((e) => e.id === selectedId);
    setDrawerEntity(ent || null);
  }, [selectedId, summary]);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <header className="p-2 shadow flex items-center gap-4">
          <h1 className="font-semibold">CISAdex</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading cybersecurity data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <header className="p-2 shadow flex items-center gap-4">
          <h1 className="font-semibold">CISAdex</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen flex flex-col">
    <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
      Skip to main content
    </a>
    
    <header className="p-2 shadow flex items-center gap-4" role="banner">
      <h1 className="font-semibold">CISAdex</h1>
      <div className="flex-1">
        <SearchBox onSelect={(id) => setSelectedId(id)} />
      </div>
      <div className="text-sm text-gray-500" aria-live="polite">
        {filtered.length} of {summary.length} entities
      </div>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-3 py-1 text-sm border rounded mobile-only focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
        aria-expanded={showFilters}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
    </header>
    <div className="flex flex-1 overflow-hidden">
      {showFilters && (
        <aside 
          className={`w-64 border-r overflow-y-auto ${showFilters ? 'mobile:absolute mobile:inset-0 mobile:z-10 mobile:bg-white' : ''}`}
          role="complementary"
          aria-label="Search filters"
        >
          <FilterChips value={filters} onChange={setFilters} />
        </aside>
      )}
      <main 
        id="main-content"
        className="flex-1 grid md:grid-cols-2" 
        role="main"
      >
        <section 
          className="relative"
          aria-label="Interactive map view"
        >
          <AtlasMap
            entities={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewportState={viewport}
            onViewportChange={setViewport}
          />
        </section>
        <section aria-label="Search results">
          <ResultsPane
            entities={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
      </main>
    </div>
    <DetailDrawer entity={drawerEntity} onClose={() => setSelectedId(undefined)} />
  </div>
  );
}
