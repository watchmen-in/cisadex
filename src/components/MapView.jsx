import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

export default function MapView({ data = [], loading = false }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

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
    });
    
    map.on('error', (e) => {
      console.error('Map error:', e);
    });
    
    map.on('styledata', () => {
      console.log('Map style loaded');
    });

    return () => {
      try { 
        console.log('Cleaning up map...');
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

  return <div ref={elRef} className="w-full" style={{ height: '600px' }} />;
}
