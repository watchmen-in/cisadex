import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { federalEntitiesDatabase } from '../data/federalEntities';
import { determineEntityIcon, getIconInfo, getIconSize } from '../utils/federalEntityIcons';

const STYLE_URL = "/styles/dark.json";
const SRC_ID = "offices";
const LAYER_ID = "offices-circles";

function toFeature(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return { type: "Feature", geometry: { type: "Point", coordinates: [lon, lat] }, properties: d };
}

export default function MapView({ 
  data = [], 
  loading = false, 
  showFederalEntities = true,
  federalEntityFilter = null,
  onEntitySelect = null 
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [federalMarkers, setFederalMarkers] = useState(new Map());
  const [selectedEntity, setSelectedEntity] = useState(null);

  // 1) Init map
  useEffect(() => {
    if (!elRef.current) return;
    
    console.log('Initializing MapLibre GL map...');
    
    const map = new maplibregl.Map({
      container: elRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283],
      zoom: 3
    });
    
    mapRef.current = map;

    // Add event listeners for debugging
    map.on('load', () => {
      console.log('Map loaded successfully');
      map.resize();
      
      // Initialize federal entities if enabled
      if (showFederalEntities) {
        initializeFederalEntities();
      }
    });
    
    map.on('error', (e) => {
      console.error('Map error:', e);
    });
    
    map.on('styledata', () => {
      console.log('Map style loaded');
    });

    // Add zoom and move handlers
    map.on('zoom', () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      updateFederalMarkerSizes(zoom);
    });

    map.on('click', (e) => {
      // Clear selected entity when clicking empty area
      setSelectedEntity(null);
    });

    return () => {
      try { 
        console.log('Cleaning up map...');
        
        // Clear federal markers
        federalMarkers.forEach(({ marker }) => {
          try {
            marker.remove();
          } catch (e) {
            console.warn('Error removing federal marker:', e);
          }
        });
        setFederalMarkers(new Map());
        
        map.remove(); 
      } catch (e) {
        console.warn('Error removing map:', e);
      }
      mapRef.current = null;
    };
  }, []);

  // 2) Data layer add/update – only when style is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    const apply = () => {
      const features = (Array.isArray(data) ? data : []).map(toFeature).filter(Boolean);
      const geojson = { type: "FeatureCollection", features };

      const src = map.getSource(SRC_ID);
      if (!src) {
        map.addSource(SRC_ID, { type: "geojson", data: geojson });
        if (!map.getLayer(LAYER_ID)) {
          map.addLayer({
            id: LAYER_ID,
            type: "circle",
            source: SRC_ID,
            paint: {
              "circle-radius": 6,
              "circle-color": "#00d0ff",
              "circle-opacity": 0.9,
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.5
            }
          });
          
          // Add click interaction for office details
          map.on('click', LAYER_ID, (e) => {
            const office = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();
            
            // Create popup content
            const popupContent = `
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-gray-900 mb-2">${office.office_name}</h3>
                <div class="space-y-1 text-sm text-gray-600">
                  <div><strong>Agency:</strong> ${office.agency}</div>
                  <div><strong>Type:</strong> ${office.role_type}</div>
                  <div><strong>Location:</strong> ${office.city}, ${office.state}</div>
                  ${office.contact_public && office.contact_public !== 'null' ? `
                    <div class="mt-2 pt-2 border-t border-gray-200">
                      ${JSON.parse(office.contact_public).phone ? `<div><strong>Phone:</strong> ${JSON.parse(office.contact_public).phone}</div>` : ''}
                      ${JSON.parse(office.contact_public).website ? `<div><a href="${JSON.parse(office.contact_public).website}" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline">Visit Website →</a></div>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
            
            new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(map);
          });
          
          // Change cursor on hover
          map.on('mouseenter', LAYER_ID, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          
          map.on('mouseleave', LAYER_ID, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      } else {
        src.setData(geojson);
      }
    };

    if (map.isStyleLoaded()) {
      apply();
    } else {
      const onLoad = () => apply();
      map.once("load", onLoad);
      return () => map.off("load", onLoad);
    }
  }, [data, loading]);

  // Initialize federal entities on the map
  const initializeFederalEntities = useCallback(() => {
    if (!mapRef.current || loading) return;

    const map = mapRef.current;
    let entitiesToShow = federalEntitiesDatabase;

    // Apply filters if provided
    if (federalEntityFilter) {
      entitiesToShow = federalEntitiesDatabase.filter(entity => {
        if (federalEntityFilter.agency && !federalEntityFilter.agency.includes(entity.parentAgency)) {
          return false;
        }
        if (federalEntityFilter.state && entity.location.state !== federalEntityFilter.state) {
          return false;
        }
        if (federalEntityFilter.sectors && !entity.sectors.some(s => federalEntityFilter.sectors.includes(s))) {
          return false;
        }
        if (federalEntityFilter.functions && !entity.functions.some(f => federalEntityFilter.functions.includes(f))) {
          return false;
        }
        return true;
      });
    }

    // Create markers for federal entities
    const newFederalMarkers = new Map();
    
    entitiesToShow.forEach(entity => {
      const markerElement = createFederalEntityMarker(entity);
      
      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
        .addTo(map);

      newFederalMarkers.set(entity.id, {
        entity,
        element: markerElement,
        marker
      });
    });

    setFederalMarkers(newFederalMarkers);
  }, [loading, federalEntityFilter, showFederalEntities]);

  // Create marker element for federal entity
  const createFederalEntityMarker = (entity) => {
    const iconConfig = determineEntityIcon(entity);
    const iconInfo = getIconInfo(iconConfig);
    const iconSize = getIconSize(currentZoom, iconConfig.priority);

    const element = document.createElement('div');
    element.className = `federal-entity-marker ${iconConfig.iconSet}-marker priority-${iconConfig.priority}`;
    element.style.cssText = `
      width: ${iconSize.width}px;
      height: ${iconSize.height}px;
      background: linear-gradient(135deg, ${iconInfo.color}, ${iconInfo.color}dd);
      border: 2px solid #ffffff;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.max(iconSize.width * 0.5, 10)}px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      font-weight: bold;
      position: relative;
      z-index: ${iconConfig.priority === 1 ? '10' : '5'};
    `;

    // Add emoji icon
    element.textContent = iconInfo.emoji;

    // Add priority glow for high-priority entities
    if (iconConfig.priority === 1) {
      element.style.boxShadow = `0 0 12px ${iconInfo.color}aa, 0 2px 8px rgba(0,0,0,0.3)`;
    }

    // Event listeners for enhanced interactivity
    element.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      element.style.transform = 'scale(1.25)';
      element.style.zIndex = '20';
      showFederalEntityTooltip(entity, element);
    });

    element.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      element.style.transform = 'scale(1)';
      element.style.zIndex = iconConfig.priority === 1 ? '10' : '5';
      hideFederalEntityTooltip();
    });

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedEntity(entity);
      showFederalEntityDetailPopup(entity);
      
      if (onEntitySelect) {
        onEntitySelect(entity);
      }
    });

    return element;
  };

  // Show enhanced tooltip for federal entity
  const showFederalEntityTooltip = (entity, element) => {
    // Remove existing popup
    const existingPopup = document.querySelector('.maplibregl-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const capabilities = entity.capabilities.slice(0, 3).map(c => 
      c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'federal-entity-hover-tooltip',
      offset: [0, -10]
    })
      .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
      .setHTML(`
        <div class="p-4 min-w-72 max-w-80">
          <div class="border-b border-gray-200 pb-2 mb-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="text-lg">${getIconInfo(determineEntityIcon(entity)).emoji}</div>
              <h3 class="font-bold text-gray-900 text-sm">${entity.name}</h3>
            </div>
            <div class="text-xs text-gray-600">${entity.parentAgency} • ${entity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          </div>
          
          <div class="space-y-2 text-xs">
            <div class="flex items-start gap-2">
              <span class="text-gray-500">📍</span>
              <span class="text-gray-700">${entity.location.city}, ${entity.location.state}</span>
            </div>
            
            ${entity.contact.phone ? `
              <div class="flex items-center gap-2">
                <span class="text-gray-500">📞</span>
                <span class="text-gray-700">${entity.contact.phone}</span>
              </div>
            ` : ''}
            
            <div class="flex items-start gap-2">
              <span class="text-gray-500">🎯</span>
              <span class="text-gray-700">${entity.jurisdiction.coverage}</span>
            </div>
            
            <div class="flex items-start gap-2">
              <span class="text-gray-500">⚙️</span>
              <span class="text-gray-700">${capabilities}${entity.capabilities.length > 3 ? '...' : ''}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-gray-500">🕒</span>
              <span class="text-gray-700">${entity.status.hours}</span>
              ${entity.status.operational ? 
                '<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">●&nbsp;Active</span>' : 
                '<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">●&nbsp;Inactive</span>'
              }
            </div>
          </div>
          
          <div class="mt-3 pt-2 border-t border-gray-200 text-center">
            <div class="text-xs text-gray-500">Click for detailed information</div>
          </div>
        </div>
      `)
      .addTo(mapRef.current);
  };

  // Hide tooltip
  const hideFederalEntityTooltip = () => {
    const popup = document.querySelector('.federal-entity-hover-tooltip');
    if (popup) {
      popup.remove();
    }
  };

  // Show detailed popup for federal entity
  const showFederalEntityDetailPopup = (entity) => {
    // Remove existing popups
    const existingPopups = document.querySelectorAll('.maplibregl-popup');
    existingPopups.forEach(popup => popup.remove());

    const sectors = entity.sectors.map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
    const functions = entity.functions.map(f => f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
    const capabilities = entity.capabilities.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'federal-entity-detail-popup',
      maxWidth: '400px'
    })
      .setLngLat([entity.location.coordinates.lng, entity.location.coordinates.lat])
      .setHTML(`
        <div class="p-5 max-w-md">
          <div class="border-b border-gray-200 pb-4 mb-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="text-2xl">${getIconInfo(determineEntityIcon(entity)).emoji}</div>
              <div>
                <h3 class="font-bold text-lg text-gray-900">${entity.name}</h3>
                <div class="text-sm text-gray-600">${entity.parentAgency} • ${entity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4 text-sm">
            <div class="grid grid-cols-1 gap-3">
              <div>
                <strong class="text-gray-700">Contact Information:</strong>
                <div class="mt-1 space-y-1 text-gray-600">
                  <div class="flex items-center gap-2">
                    <span>📍</span>
                    <span>${entity.location.address}<br>${entity.location.city}, ${entity.location.state} ${entity.location.zipCode}</span>
                  </div>
                  ${entity.contact.phone ? `
                    <div class="flex items-center gap-2">
                      <span>📞</span>
                      <a href="tel:${entity.contact.phone}" class="text-blue-600 hover:underline">${entity.contact.phone}</a>
                    </div>
                  ` : ''}
                  ${entity.contact.emergencyPhone ? `
                    <div class="flex items-center gap-2">
                      <span>🚨</span>
                      <a href="tel:${entity.contact.emergencyPhone}" class="text-red-600 hover:underline">${entity.contact.emergencyPhone}</a>
                    </div>
                  ` : ''}
                  ${entity.contact.website ? `
                    <div class="flex items-center gap-2">
                      <span>🌐</span>
                      <a href="${entity.contact.website}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Official Website →</a>
                    </div>
                  ` : ''}
                </div>
              </div>

              <div>
                <strong class="text-gray-700">Jurisdiction & Coverage:</strong>
                <div class="mt-1 text-gray-600">
                  <div class="mb-1">${entity.jurisdiction.coverage}</div>
                  <div class="text-xs">States: ${entity.jurisdiction.states.join(', ')}</div>
                </div>
              </div>

              <div>
                <strong class="text-gray-700">Operational Status:</strong>
                <div class="mt-1 flex items-center gap-2">
                  ${entity.status.operational ? 
                    '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Operational</span>' : 
                    '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Non-Operational</span>'
                  }
                  <span class="text-gray-600 text-xs">${entity.status.hours}</span>
                </div>
              </div>

              <div>
                <strong class="text-gray-700">Critical Infrastructure Sectors:</strong>
                <div class="mt-1 flex flex-wrap gap-1">
                  ${entity.sectors.map(sector => 
                    `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${sector.replace(/_/g, ' ')}</span>`
                  ).join('')}
                </div>
              </div>

              <div>
                <strong class="text-gray-700">Operational Functions:</strong>
                <div class="mt-1 flex flex-wrap gap-1">
                  ${entity.functions.map(func => 
                    `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">${func.replace(/_/g, ' ')}</span>`
                  ).join('')}
                </div>
              </div>

              <div>
                <strong class="text-gray-700">Capabilities:</strong>
                <div class="mt-1 flex flex-wrap gap-1">
                  ${entity.capabilities.map(capability => 
                    `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">${capability.replace(/_/g, ' ')}</span>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button onclick="window.open('https://maps.google.com/maps?q=${entity.location.coordinates.lat},${entity.location.coordinates.lng}', '_blank')" 
                    class="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
              🗺️ Directions
            </button>
            ${entity.contact.phone ? `
              <button onclick="window.open('tel:${entity.contact.phone}', '_self')" 
                      class="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                📞 Call
              </button>
            ` : ''}
            ${entity.contact.website ? `
              <button onclick="window.open('${entity.contact.website}', '_blank')" 
                      class="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors">
                🌐 Website
              </button>
            ` : ''}
          </div>
        </div>
      `)
      .addTo(mapRef.current);

    popup.on('close', () => {
      setSelectedEntity(null);
    });
  };

  // Update marker sizes based on zoom
  const updateFederalMarkerSizes = useCallback((zoom) => {
    federalMarkers.forEach(({ entity, element }) => {
      const iconConfig = determineEntityIcon(entity);
      const iconSize = getIconSize(zoom, iconConfig.priority);
      
      element.style.width = `${iconSize.width}px`;
      element.style.height = `${iconSize.height}px`;
      element.style.fontSize = `${Math.max(iconSize.width * 0.5, 10)}px`;
    });
  }, [federalMarkers]);

  // Update federal entities when filter changes
  useEffect(() => {
    if (showFederalEntities && mapRef.current && !loading) {
      // Clear existing federal markers
      federalMarkers.forEach(({ marker }) => {
        marker.remove();
      });
      setFederalMarkers(new Map());
      
      // Add new markers with current filter
      setTimeout(() => {
        initializeFederalEntities();
      }, 100);
    }
  }, [federalEntityFilter, showFederalEntities, initializeFederalEntities]);

  return <div ref={elRef} className="w-full" style={{ height: '600px' }} />;
}
