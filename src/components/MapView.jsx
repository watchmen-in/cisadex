import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function isValidCoord(d) {
  const lon = Number(d?.lon), lat = Number(d?.lat);
  return Number.isFinite(lon) && Number.isFinite(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

async function waitForStyle(map) {
  if (map.isStyleLoaded?.()) return;
  await new Promise((resolve) => {
    const onIdle = () => { map.off("idle", onIdle); resolve(); };
    map.once("load", () => map.once("idle", onIdle));
  });
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-98.5795, 39.8283],
      zoom: 3
    });
    mapRef.current = map;
    return () => { try { map.remove(); } catch {} mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    let cancelled = false;
    (async () => {
      try {
        await waitForStyle(map);
        if (cancelled) return;

        const features = (Array.isArray(data) ? data : []).filter(isValidCoord).map(d => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(d.lon), Number(d.lat)] },
          properties: d
        }));
        const geojson = { type: "FeatureCollection", features };

        const srcId = "offices";
        const layerId = "offices-circles";

        const existing = map.getSource?.(srcId);
        if (!existing) {
          map.addSource(srcId, { type: "geojson", data: geojson });
          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "circle",
              source: srcId,
              paint: {
                "circle-radius": 6,
                "circle-color": "#00d0ff",
                "circle-opacity": 0.9,
                "circle-stroke-color": "#0b0f14",
                "circle-stroke-width": 1.5
              }
            });
          }
        } else {
          existing.setData(geojson);
        }

        if (features.length > 0) {
          const lons = features.map(f => f.geometry.coordinates[0]);
          const lats = features.map(f => f.geometry.coordinates[1]);
          const west = Math.min(...lons), east = Math.max(...lons);
          const south = Math.min(...lats), north = Math.max(...lats);
          if (Number.isFinite(west) && Number.isFinite(east) && Number.isFinite(south) && Number.isFinite(north)) {
            map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 10, duration: 0 });
          }
        }
      } catch (e) {
        console.error("[MapView] update failed:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [data, loading]);

  return (
    <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
