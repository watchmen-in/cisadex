import React, { useEffect, useState } from 'react';
import AtlasMap from '../components/map/AtlasMap';
import DetailDrawer from '../components/map/DetailDrawer';
import SearchBox from '../components/map/SearchBox';
import ResultsPane from '../components/results/ResultsPane';
import FilterChips from '../components/filters/FilterChips';
import useUrlState from '../hooks/useUrlState';
import { Filters } from '../constants/taxonomy';
import { validateEntities } from '../utils/validateEntity';

export default function Browse() {
  const [summary, setSummary] = useState<any[]>([]);
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

  // load data
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/summary.json`)
      .then((r) => r.json())
      .then((data) => {
        validateEntities(data);
        setSummary(data);
      });
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

  return (
  <div className="h-screen flex flex-col">
    <header className="p-2 shadow flex items-center gap-4">
      <h1 className="font-semibold">CISAdex</h1>
      <div className="flex-1"><SearchBox onSelect={(id) => setSelectedId(id)} /></div>
    </header>
    <div className="flex flex-1 overflow-hidden">
      {showFilters && (
        <aside className="w-64 border-r overflow-y-auto">
          <FilterChips value={filters} onChange={setFilters} />
        </aside>
      )}
      <main className="flex-1 grid md:grid-cols-2">
        <div className="relative">
          <AtlasMap
            entities={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewportState={viewport}
            onViewportChange={setViewport}
          />
        </div>
        <ResultsPane
          entities={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </main>
    </div>
    <DetailDrawer entity={drawerEntity} onClose={() => setSelectedId(undefined)} />
  </div>
  );
}
