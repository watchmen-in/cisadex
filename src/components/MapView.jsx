import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

async function waitForStyle(map) {
  if (map.isStyleLoaded?.()) return;
  await new Promise((resolve) => {
    const onIdle = () => { map.off("idle", onIdle); resolve(); };
    // 'load' fires once; 'idle' ensures all style resources are ready
    map.once("load", () => map.once("idle", onIdle));
  });
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // 1) Create/remove map
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-98.5795, 39.8283],
      zoom: 3,
    });
    mapRef.current = map;

    return () => { try { map.remove(); } catch {} mapRef.current = null; };
  }, []);

  // 2) Add or update data AFTER style is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    let cancelled = false;
    (async () => {
      try {
        await waitForStyle(map);
        if (cancelled) return;

        // Ensure source exists or (re)create it
        const srcId = "offices";
        const existing = map.getSource?.(srcId);
        const geojson = {
          type: "FeatureCollection",
          features: (data || []).map((d) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [d.lon, d.lat] },
            properties: d,
          })),
        };

        if (!existing) {
          // First time: add source + layers
          map.addSource(srcId, { type: "geojson", data: geojson });

          // Circle layer example
          if (!map.getLayer("offices-circles")) {
            map.addLayer({
              id: "offices-circles",
              type: "circle",
              source: srcId,
              paint: {
                "circle-radius": 5,
                "circle-color": "#0ea5e9",
                "circle-opacity": 0.8,
              },
            });
          }
        } else {
          // Subsequent updates: just set data
          existing.setData(geojson);
        }

        // Fit bounds (only after style load & when we have points)
        if (geojson.features.length > 0) {
          const lons = geojson.features.map(f => f.geometry.coordinates[0]);
          const lats = geojson.features.map(f => f.geometry.coordinates[1]);
          const west = Math.min(...lons), east = Math.max(...lons);
          const south = Math.min(...lats), north = Math.max(...lats);
          if (isFinite(west) && isFinite(east) && isFinite(south) && isFinite(north)) {
            map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 10, duration: 0 });
          }
        }
      } catch (e) {
        console.error("Map data/update failed:", e);
        // Don’t rethrow; we’ve handled it so the app doesn’t white-screen
      }
    })();

    return () => { cancelled = true; };
  }, [data, loading]);

  return (
    <div className="map-container" style={{ height: "100vh", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
