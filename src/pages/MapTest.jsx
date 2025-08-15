import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getStyleUrl } from '../lib/mapStyle';
import { runMapDiagnostics, debugMapEvents } from '../utils/mapDebug';
import { federalEntitiesDatabase } from '../data/federalEntities';

export default function MapTest() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('Initializing test map with style URL:', getStyleUrl());
    
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(),
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 3
    });

    mapRef.current = map;

    // Add comprehensive debugging
    debugMapEvents(map);
    
    // Add event listeners for debugging
    map.on('load', async () => {
      console.log('✅ Map loaded successfully');
      
      // Run diagnostics
      await runMapDiagnostics(map, federalEntitiesDatabase, getStyleUrl());
      
      // Add a simple test marker
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([-98.5795, 39.8283])
        .setPopup(new maplibregl.Popup().setHTML('<h3>Test Marker</h3><p>Map is working!</p>'))
        .addTo(map);
        
      // Add some federal entity markers as test
      federalEntitiesDatabase.slice(0, 5).forEach((entity, index) => {
        if (entity.location?.coordinates?.lat && entity.location?.coordinates?.lng) {
          new maplibregl.Marker({ color: 'blue' })
            .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
            .setPopup(new maplibregl.Popup().setHTML(`
              <h3>${entity.name}</h3>
              <p>${entity.parentAgency}</p>
              <p>${entity.location.city}, ${entity.location.state}</p>
            `))
            .addTo(map);
        }
      });
    });

    map.on('error', (e) => {
      console.error('❌ Map error:', e);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Map Loading Test</h1>
        <div className="bg-white rounded-lg shadow p-4">
          <div 
            ref={mapContainer} 
            className="w-full border border-gray-300 rounded"
            style={{ height: '500px' }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Style URL: {getStyleUrl()}</p>
          <p>Check browser console for debugging information</p>
        </div>
      </div>
    </div>
  );
}