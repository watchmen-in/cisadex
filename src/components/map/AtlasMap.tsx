import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { STYLE_URL } from '../../map/config';
import { MapReadyQueue } from '../../map/readyQueue';
import { debounce } from '../../utils/debounce';

interface Props {
  entities: any[];
  selectedId?: string;
  onSelect: (id: string) => void;
  viewportState: { longitude: number; latitude: number; zoom: number };
  onViewportChange: (v: { longitude: number; latitude: number; zoom: number }) => void;
}

export default function AtlasMap({
  entities,
  selectedId,
  onSelect,
  viewportState,
  onViewportChange,
}: Props) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readyQueueRef = useRef<MapReadyQueue | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  // Debounced viewport change handler
  const debouncedViewportChange = useCallback(
    debounce((viewport: { longitude: number; latitude: number; zoom: number }) => {
      onViewportChange(viewport);
    }, 300),
    [onViewportChange]
  );

  // initialize map with proper error handling
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    
    try {
      setMapLoading(true);
      setMapError(null);

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [viewportState.longitude, viewportState.latitude],
        zoom: viewportState.zoom,
        attributionControl: true,
      });

      mapRef.current = map;
      readyQueueRef.current = new MapReadyQueue(map);

      // Error handling for map loading
      map.on('error', (e) => {
        const errorMsg = e.error?.message || String(e.error) || 'Map loading error';
        if (!errorMsg.includes('Style is not done loading')) {
          console.error('[Map Error]', errorMsg);
          setMapError(`Map error: ${errorMsg}`);
        }
      });

      // Map loading success
      map.once('load', () => {
        setMapLoading(false);
        try {
          map.resize();
        } catch (error) {
          console.warn('Map resize failed:', error);
        }
      });

      // Handle viewport changes with debouncing
      map.on('moveend', () => {
        try {
          const center = map.getCenter();
          const zoom = map.getZoom();
          debouncedViewportChange({
            longitude: center.lng,
            latitude: center.lat,
            zoom: zoom,
          });
        } catch (error) {
          console.warn('Viewport change error:', error);
        }
      });

      // Cleanup function
      return () => {
        try {
          if (readyQueueRef.current) {
            readyQueueRef.current = null;
          }
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
          }
        } catch (error) {
          console.warn('Map cleanup error:', error);
        }
      };
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMapLoading(false);
    }
  }, [viewportState.longitude, viewportState.latitude, viewportState.zoom, debouncedViewportChange]);

  // update data source with MapReadyQueue
  useEffect(() => {
    const map = mapRef.current;
    const readyQueue = readyQueueRef.current;
    if (!map || !readyQueue) return;

    try {
      // Validate entity data
      const validEntities = entities.filter((e) => {
        if (!e || typeof e.lng !== 'number' || typeof e.lat !== 'number') {
          console.warn('Invalid entity coordinates:', e);
          return false;
        }
        if (e.lng < -180 || e.lng > 180 || e.lat < -90 || e.lat > 90) {
          console.warn('Entity coordinates out of bounds:', e);
          return false;
        }
        return true;
      });

      const features = validEntities.map((e) => ({
        type: 'Feature',
        properties: { 
          id: e.id,
          agency: e.agency,
          office_name: e.office_name,
          city: e.city,
          state: e.state 
        },
        geometry: { 
          type: 'Point', 
          coordinates: [e.lng, e.lat] 
        },
      }));

      const geojson = { type: 'FeatureCollection', features } as any;

      readyQueue.run((map) => {
        try {
          const existingSource = map.getSource('entities');
          
          if (existingSource) {
            // Update existing source
            (existingSource as any).setData(geojson);
          } else {
            // Create new source and layers
            map.addSource('entities', {
              type: 'geojson',
              data: geojson,
              cluster: true,
              clusterRadius: 40,
              clusterMaxZoom: 14,
            });

            // Cluster circles
            map.addLayer({
              id: 'clusters',
              type: 'circle',
              source: 'entities',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#22d3ee', // small clusters
                  10, '#0ea5e9', // medium clusters  
                  25, '#3b82f6', // large clusters
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  15, // small
                  10, 20, // medium
                  25, 30, // large
                ],
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2,
                'circle-opacity': 0.9,
              },
            });

            // Cluster count labels
            map.addLayer({
              id: 'cluster-count',
              type: 'symbol',
              source: 'entities',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12,
              },
              paint: { 
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
              },
            });

            // Individual points
            map.addLayer({
              id: 'unclustered',
              type: 'circle',
              source: 'entities',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': '#0ea5e9',
                'circle-radius': 8,
                'circle-stroke-width': [
                  'case', 
                  ['==', ['get', 'id'], selectedId || ''], 
                  3, 
                  1
                ],
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.9,
              },
            });

            // Add click handlers only once
            if (!map.hasEventListeners('click')) {
              // Cluster click handler
              map.on('click', 'clusters', (e) => {
                try {
                  const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                  const clusterId = features[0]?.properties?.cluster_id;
                  if (!clusterId) return;
                  
                  const source = map.getSource('entities') as any;
                  source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
                    if (err) {
                      console.warn('Cluster expansion error:', err);
                      return;
                    }
                    map.easeTo({
                      center: (features[0].geometry as any).coordinates,
                      zoom: Math.min(zoom, 18), // Limit max zoom
                      duration: 500,
                    });
                  });
                } catch (error) {
                  console.warn('Cluster click error:', error);
                }
              });

              // Individual point click handler
              map.on('click', 'unclustered', (e) => {
                try {
                  const feature = e.features?.[0];
                  const id = feature?.properties?.id;
                  if (id) onSelect(id);
                } catch (error) {
                  console.warn('Point click error:', error);
                }
              });

              // Add hover effects
              map.on('mouseenter', 'clusters', () => {
                map.getCanvas().style.cursor = 'pointer';
              });
              map.on('mouseleave', 'clusters', () => {
                map.getCanvas().style.cursor = '';
              });
              map.on('mouseenter', 'unclustered', () => {
                map.getCanvas().style.cursor = 'pointer';
              });
              map.on('mouseleave', 'unclustered', () => {
                map.getCanvas().style.cursor = '';
              });
            }
          }
        } catch (error) {
          console.error('Map data update error:', error);
        }
      });
    } catch (error) {
      console.error('Entity processing error:', error);
    }
  }, [entities, selectedId, onSelect]);

  // update selection highlight
  useEffect(() => {
    const map = mapRef.current;
    const readyQueue = readyQueueRef.current;
    if (!map || !readyQueue) return;

    readyQueue.run((map) => {
      try {
        if (map.getLayer('unclustered')) {
          map.setPaintProperty(
            'unclustered',
            'circle-stroke-width',
            ['case', ['==', ['get', 'id'], selectedId || ''], 3, 1]
          );
        }
      } catch (error) {
        console.warn('Selection highlight error:', error);
      }
    });
  }, [selectedId]);

  // Show map error state
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Loading Failed</h3>
          <p className="text-gray-600 text-sm mb-4">{mapError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Reload Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {mapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        role="application"
        aria-label="Interactive map showing cybersecurity entities"
        tabIndex={0}
      />
      {!mapLoading && entities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📍</div>
            <p>No entities to display</p>
          </div>
        </div>
      )}
    </div>
  );
}
