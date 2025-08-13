import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Prefer an env var; fall back to MapLibre demo style.
const STYLE_URL =
  import.meta.env?.VITE_MAP_STYLE_URL ||
  "https://demotiles.maplibre.org/style.json";

const SRC_ID = "offices";
const LAYER_ID = "offices-circles";

function toFeature(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lon, lat] },
    properties: d,
  };
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // 1) Create / destroy map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283], // USA-ish
      zoom: 3,
      attributionControl: true,
    });

    // If this map ever renders in a panel that was hidden, a resize on first load helps.
    map.once("load", () => map.resize());

    mapRef.current = map;
    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, []);

  // 2) Add/update data ONLY after the style has completed a render pass
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;
    let cancelled = false;

    const update = () => {
      if (cancelled) return;

      const features = (Array.isArray(data) ? data : [])
        .map(toFeature)
        .filter(Boolean);
      const geojson = { type: "FeatureCollection", features };

      try {
        const existing = map.getSource(SRC_ID);
        if (!existing) {
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
                "circle-stroke-width": 1.5,
              },
            });
          }
        } else {
          existing.setData(geojson);
        }

        // Fit to data bounds (optional, no animation)
        if (features.length > 0) {
          const lons = features.map((f) => f.geometry.coordinates[0]);
          const lats = features.map((f) => f.geometry.coordinates[1]);
          const west = Math.min(...lons),
            east = Math.max(...lons);
          const south = Math.min(...lats),
            north = Math.max(...lats);
          if (
            Number.isFinite(west) &&
            Number.isFinite(east) &&
            Number.isFinite(south) &&
            Number.isFinite(north)
          ) {
            map.fitBounds(
              [
                [west, south],
                [east, north],
              ],
              { padding: 32, maxZoom: 10, duration: 0 }
            );
          }
        }
      } catch (e) {
        // If style toggled while updating, do nothing (prevents “style not done loading” crashes)
        console.warn("[MapView] update skipped:", e?.message || e);
      }
    };

    const ensureStyleThenUpdate = () => {
      if (map.isStyleLoaded?.()) {
        // Wait one render pass to be extra safe
        map.once("idle", update);
      } else {
        // Wait for the style to load, then for a first idle
        map.once("load", () => map.once("idle", update));
      }
    };

    ensureStyleThenUpdate();
    return () => {
      cancelled = true;
      try {
        map.off("idle", update);
      } catch {}
    };
  }, [data, loading]);

  return <div ref={containerRef} className="w-full h-[100vh]" />;
}
