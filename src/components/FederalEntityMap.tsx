/**
 * Interactive Federal Entity Map Component
 * Comprehensive map with clustering, filtering, and detailed entity display
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map, NavigationControl, Popup, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  FederalEntity, 
  SearchCapabilities, 
  EntitySearchResponse,
  HoverTooltip,
  DetailPopup,
  MapCluster
} from '../types/federalEntity';
import { searchFederalEntities, getEntitiesByProximity } from '../utils/federalEntitySearch';
import { determineEntityIcon, getIconInfo, getClusterIcon, getIconSize } from '../utils/federalEntityIcons';
import { federalEntitiesDatabase } from '../data/federalEntities';

interface FederalEntityMapProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  searchCriteria?: SearchCapabilities;
  onEntitySelect?: (entity: FederalEntity) => void;
  onSearchUpdate?: (results: EntitySearchResponse) => void;
  className?: string;
}

interface MapMarkerData {
  entity: FederalEntity;
  element: HTMLElement;
  marker: Marker;
}

export default function FederalEntityMap({
  initialCenter = { lat: 39.8283, lng: -98.5795 }, // Geographic center of US
  initialZoom = 4,
  searchCriteria,
  onEntitySelect,
  onSearchUpdate,
  className = ''
}: FederalEntityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [searchResults, setSearchResults] = useState<EntitySearchResponse | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<FederalEntity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<FederalEntity | null>(null);
  const [markers, setMarkers] = useState<Map<string, MapMarkerData>>(new Map());
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [showClusters, setShowClusters] = useState(true);
  const popup = useRef<Popup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-light': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© CartoDB © OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'carto-light-layer',
            type: 'raster',
            source: 'carto-light'
          }
        ]
      },
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom
    });

    // Add navigation controls
    map.current.addControl(new NavigationControl(), 'top-right');

    // Map event listeners
    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(map.current.getZoom());
      }
    });

    map.current.on('move', () => {
      updateVisibleEntities();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update search results when criteria changes
  useEffect(() => {
    if (!isMapLoaded) return;

    const results = searchFederalEntities(searchCriteria || {});
    setSearchResults(results);
    
    if (onSearchUpdate) {
      onSearchUpdate(results);
    }

    updateMapMarkers(results);
  }, [searchCriteria, isMapLoaded]);

  // Update visible entities based on map viewport
  const updateVisibleEntities = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    
    // Determine if we should show clusters or individual markers
    const shouldCluster = zoom < 8;
    setShowClusters(shouldCluster);

    // Update marker visibility based on zoom
    markers.forEach((markerData) => {
      const { lng, lat } = markerData.entity.location.coordinates;
      const isVisible = bounds.contains([lng, lat]);
      
      if (isVisible && (!shouldCluster || zoom > 6)) {
        markerData.marker.getElement().style.display = 'block';
      } else {
        markerData.marker.getElement().style.display = 'none';
      }
    });
  }, [markers, isMapLoaded]);

  // Update map markers based on search results
  const updateMapMarkers = useCallback((results: EntitySearchResponse) => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markers.forEach((markerData) => {
      markerData.marker.remove();
    });
    setMarkers(new Map());

    // Add new markers for entities
    const newMarkers = new Map<string, MapMarkerData>();

    results.entities.forEach((entity) => {
      const markerElement = createMarkerElement(entity);
      
      const marker = new Marker({ element: markerElement })
        .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
        .addTo(map.current!);

      newMarkers.set(entity.id, {
        entity,
        element: markerElement,
        marker
      });
    });

    setMarkers(newMarkers);

    // Update clusters if we have them
    if (results.clusters) {
      setClusters(results.clusters);
      updateClusterMarkers(results.clusters);
    }

    // Fit map to show all entities if we have results
    if (results.entities.length > 0) {
      const bounds = results.entities.reduce((bounds, entity) => {
        return bounds.extend([
          entity.location.coordinates.lng,
          entity.location.coordinates.lat
        ]);
      }, new map.current.constructor.LngLatBounds());

      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [isMapLoaded]);

  // Create marker element for an entity
  const createMarkerElement = (entity: FederalEntity): HTMLElement => {
    const iconConfig = determineEntityIcon(entity);
    const iconInfo = getIconInfo(iconConfig);
    const iconSize = getIconSize(currentZoom, iconConfig.priority);

    const element = document.createElement('div');
    element.className = `federal-entity-marker ${iconConfig.iconSet}-marker priority-${iconConfig.priority}`;
    element.style.cssText = `
      width: ${iconSize.width}px;
      height: ${iconSize.height}px;
      background-color: ${iconInfo.color};
      border: 2px solid #ffffff;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.max(iconSize.width * 0.6, 12)}px;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      font-weight: bold;
      position: relative;
      z-index: 1;
    `;

    // Add emoji icon
    element.textContent = iconInfo.emoji;

    // Add priority indicator for high-priority entities
    if (iconConfig.priority === 1) {
      element.style.boxShadow = `0 0 8px ${iconInfo.color}`;
    }

    // Event listeners
    element.addEventListener('mouseenter', () => {
      setHoveredEntity(entity);
      element.style.transform = 'scale(1.2)';
      element.style.zIndex = '10';
      showTooltip(entity, element);
    });

    element.addEventListener('mouseleave', () => {
      setHoveredEntity(null);
      element.style.transform = 'scale(1)';
      element.style.zIndex = '1';
      hideTooltip();
    });

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedEntity(entity);
      showDetailPopup(entity);
      
      if (onEntitySelect) {
        onEntitySelect(entity);
      }
    });

    return element;
  };

  // Create cluster marker elements
  const updateClusterMarkers = (clusterData: MapCluster[]) => {
    // Remove existing cluster markers
    // (Implementation would go here)
    
    clusterData.forEach((cluster) => {
      if (currentZoom < 8) {
        const clusterElement = createClusterElement(cluster);
        
        new Marker({ element: clusterElement })
          .setLngLat([cluster.coordinates.lng, cluster.coordinates.lat])
          .addTo(map.current!);
      }
    });
  };

  // Create cluster marker element
  const createClusterElement = (cluster: MapCluster): HTMLElement => {
    const entities = cluster.entities.map(id => 
      federalEntitiesDatabase.find(e => e.id === id)!
    ).filter(Boolean);
    
    const iconConfig = getClusterIcon(entities);
    const iconInfo = getIconInfo(iconConfig);

    const element = document.createElement('div');
    element.className = 'federal-entity-cluster';
    element.style.cssText = `
      width: ${Math.min(cluster.count * 4 + 30, 60)}px;
      height: ${Math.min(cluster.count * 4 + 30, 60)}px;
      background-color: ${iconInfo.color};
      border: 3px solid #ffffff;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      font-weight: bold;
      position: relative;
      z-index: 2;
    `;

    element.innerHTML = `
      <div style="font-size: 16px;">${iconInfo.emoji}</div>
      <div style="font-size: 12px; margin-top: 2px;">${cluster.count}</div>
    `;

    element.addEventListener('click', () => {
      // Zoom to cluster area
      if (map.current) {
        const bounds = entities.reduce((bounds, entity) => {
          return bounds.extend([
            entity.location.coordinates.lng,
            entity.location.coordinates.lat
          ]);
        }, new map.current.constructor.LngLatBounds());

        map.current.fitBounds(bounds, { padding: 100, maxZoom: 10 });
      }
    });

    return element;
  };

  // Show hover tooltip
  const showTooltip = (entity: FederalEntity, element: HTMLElement) => {
    if (popup.current) {
      popup.current.remove();
    }

    const tooltipData: HoverTooltip = {
      name: entity.name,
      agency: entity.parentAgency,
      type: entity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      address: `${entity.location.city}, ${entity.location.state}`,
      phone: entity.contact.phone,
      jurisdiction: entity.jurisdiction.coverage
    };

    popup.current = new Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'federal-entity-tooltip'
    })
      .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
      .setHTML(`
        <div class="p-3 min-w-64">
          <div class="font-semibold text-sm mb-1">${tooltipData.name}</div>
          <div class="text-xs text-gray-600 mb-2">${tooltipData.agency} • ${tooltipData.type}</div>
          <div class="text-xs text-gray-700">
            <div class="mb-1">📍 ${tooltipData.address}</div>
            ${tooltipData.phone ? `<div class="mb-1">📞 ${tooltipData.phone}</div>` : ''}
            <div>🗺️ ${tooltipData.jurisdiction}</div>
          </div>
        </div>
      `)
      .addTo(map.current!);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }
  };

  // Show detailed popup
  const showDetailPopup = (entity: FederalEntity) => {
    if (popup.current) {
      popup.current.remove();
    }

    const sectors = entity.sectors.map(s => s.replace(/_/g, ' ')).join(', ');
    const functions = entity.functions.map(f => f.replace(/_/g, ' ')).join(', ');
    const capabilities = entity.capabilities.map(c => c.replace(/_/g, ' ')).join(', ');

    popup.current = new Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'federal-entity-detail-popup'
    })
      .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
      .setHTML(`
        <div class="p-4 max-w-sm">
          <div class="border-b pb-3 mb-3">
            <h3 class="font-bold text-lg mb-1">${entity.name}</h3>
            <div class="text-sm text-gray-600">${entity.parentAgency} • ${entity.type.replace(/_/g, ' ')}</div>
          </div>
          
          <div class="space-y-3 text-sm">
            <div>
              <strong>Contact:</strong>
              <div class="mt-1 text-gray-700">
                <div>📍 ${entity.location.address}</div>
                <div>🏙️ ${entity.location.city}, ${entity.location.state} ${entity.location.zipCode}</div>
                ${entity.contact.phone ? `<div>📞 ${entity.contact.phone}</div>` : ''}
                ${entity.contact.website ? `<div>🌐 <a href="${entity.contact.website}" target="_blank" class="text-blue-600 hover:underline">Website</a></div>` : ''}
              </div>
            </div>
            
            <div>
              <strong>Jurisdiction:</strong>
              <div class="mt-1 text-gray-700">${entity.jurisdiction.coverage}</div>
              <div class="text-xs text-gray-600 mt-1">States: ${entity.jurisdiction.states.join(', ')}</div>
            </div>
            
            <div>
              <strong>Sectors:</strong>
              <div class="mt-1 text-gray-700 text-xs">${sectors}</div>
            </div>
            
            <div>
              <strong>Functions:</strong>
              <div class="mt-1 text-gray-700 text-xs">${functions}</div>
            </div>
            
            <div>
              <strong>Capabilities:</strong>
              <div class="mt-1 text-gray-700 text-xs">${capabilities}</div>
            </div>
            
            <div>
              <strong>Status:</strong>
              <div class="mt-1">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  entity.status.operational ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                  ${entity.status.operational ? '✅ Operational' : '❌ Non-Operational'}
                </span>
                <div class="text-xs text-gray-600 mt-1">Hours: ${entity.status.hours}</div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4 pt-3 border-t">
            <button onclick="window.open('https://maps.google.com/maps?q=${entity.location.coordinates.lat},${entity.location.coordinates.lng}', '_blank')" 
                    class="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
              🗺️ Directions
            </button>
            ${entity.contact.phone ? `
              <button onclick="window.open('tel:${entity.contact.phone}', '_self')" 
                      class="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                📞 Call
              </button>
            ` : ''}
            ${entity.contact.website ? `
              <button onclick="window.open('${entity.contact.website}', '_blank')" 
                      class="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                🌐 Website
              </button>
            ` : ''}
          </div>
        </div>
      `)
      .addTo(map.current!);
  };

  // Map controls component
  const MapControls = () => (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
      <div className="space-y-2">
        <div className="text-sm font-semibold">Map Controls</div>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="rounded"
          />
          <span>Show Clusters</span>
        </label>
        <div className="text-xs text-gray-600">
          Zoom: {currentZoom.toFixed(1)}
        </div>
        {searchResults && (
          <div className="text-xs text-gray-600">
            Showing: {searchResults.entities.length} entities
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <MapControls />
      
      {/* Custom styles for popups */}
      <style jsx>{`
        :global(.federal-entity-tooltip .maplibregl-popup-content) {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        :global(.federal-entity-detail-popup .maplibregl-popup-content) {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          max-width: 400px;
        }
        
        :global(.federal-entity-marker:hover) {
          filter: brightness(1.1);
        }
        
        :global(.federal-entity-cluster:hover) {
          filter: brightness(1.1);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}