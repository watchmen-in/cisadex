import React, { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { getStyleUrl } from '../../lib/mapStyle';

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

  // initialize map
  useEffect(() => {
    if (mapRef.current) return;
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
        container: containerRef.current,
        style: getStyleUrl(),
        center: [viewportState.longitude, viewportState.latitude],
        zoom: viewportState.zoom,
    });
    mapRef.current = map;

    map.on('moveend', () => {
      const c = map.getCenter();
      onViewportChange({ longitude: c.lng, latitude: c.lat, zoom: map.getZoom() });
    });
  }, [viewportState, onViewportChange]);

  // update data source
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const features = entities.map((e) => ({
      type: 'Feature',
      properties: { id: e.id },
      geometry: { type: 'Point', coordinates: [e.lng, e.lat] },
    }));
    const geojson = { type: 'FeatureCollection', features } as any;
    if (map.getSource('entities')) {
      (map.getSource('entities') as any).setData(geojson);
    } else {
      map.addSource('entities', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterRadius: 40,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'entities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#22d3ee',
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 25, 30],
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'entities',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count'],
          'text-size': 12,
        },
        paint: { 'text-color': '#000' },
      });
      map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'entities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0ea5e9',
          'circle-radius': 6,
          'circle-stroke-width': ['case', ['==', ['get', 'id'], selectedId], 3, 1],
          'circle-stroke-color': '#fff',
        },
      });

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        (map.getSource('entities') as any).getClusterExpansionZoom(
          clusterId,
          (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom,
            });
          }
        );
      });

      map.on('click', 'unclustered', (e) => {
        const feature = e.features && e.features[0];
        const id = feature?.properties?.id;
        if (id) onSelect(id);
      });
    }
  }, [entities, selectedId, onSelect]);

  // update selection highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer('unclustered')) {
      map.setPaintProperty(
        'unclustered',
        'circle-stroke-width',
        ['case', ['==', ['get', 'id'], selectedId], 3, 1]
      );
    }
  }, [selectedId]);

  return <div ref={containerRef} className="w-full h-full" />;
}
