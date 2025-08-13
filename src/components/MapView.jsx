import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Configure style via env; fallback to public demo
const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  "https://demotiles.maplibre.org/style.json";

const SRC_ID = "offices";
const LAYER_CLUSTERS = "offices-clusters";
const LAYER_COUNT = "offices-cluster-count";
const LAYER_POINTS = "offices-points";

// Coerce lon/lat from multiple field names and sanity-check ranges
function coerceCoords(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

async function waitForStyleIdle(map) {
  if (map.isStyleLoaded?.()) return;
  await new Promise((resolve) => {
    const onIdle = () => {
      map.off("idle", onIdle);
      resolve();
    };
    map.once("load", () => map.once("idle", onIdle));
  });
}

function toFeatureCollection(rows = []) {
  const features = rows
    .map((d) => {
      const coords = coerceCoords(d);
      return coords
        ? {
            type: "Feature",
            geometry: { type: "Point", coordinates: coords },
            properties: d,
          }
        : null;
    })
    .filter(Boolean);
  return { type: "FeatureCollection", features };
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283],
      zoom: 3,
      attributionControl: true,
      preserveDrawingBuffer: false,
      hash: false,
    });

    // Resize when container becomes visible (e.g., tabs/drawers)
    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch {}
    });
    ro.observe(containerRef.current);

    mapRef.current = map;
    return () => {
      try { ro.disconnect(); } catch {}
      try { map.remove(); } catch {}
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    let cancelled = false;

    (async () => {
      try {
        // Ensure style is fully ready before adding sources/layers
        await waitForStyleIdle(map);
        if (cancelled) return;

        // Ensure/refresh the clustered source
        const fc = toFeatureCollection(data);
        const existing = map.getSource(SRC_ID);
        if (!existing) {
          map.addSource(SRC_ID, {
            type: "geojson",
            data: fc,
            cluster: true,
            clusterMaxZoom: 12,
            clusterRadius: 40,
          });

          // Clusters
          if (!map.getLayer(LAYER_CLUSTERS)) {
            map.addLayer({
              id: LAYER_CLUSTERS,
              type: "circle",
              source: SRC_ID,
              filter: ["has", "point_count"],
              paint: {
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#2dd4bf",
                  25,
                  "#60a5fa",
                  100,
                  "#c084fc",
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  14,
                  25,
                  20,
                  100,
                  28,
                ],
                "circle-stroke-color": "#0b0f14",
                "circle-stroke-width": 1.5,
              },
            });
          }

          // Cluster counts
          if (!map.getLayer(LAYER_COUNT)) {
            map.addLayer({
              id: LAYER_COUNT,
              type: "symbol",
              source: SRC_ID,
              filter: ["has", "point_count"],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
              },
              paint: {
                "text-color": "#e5e7eb",
              },
            });
          }

          // Individual points
          if (!map.getLayer(LAYER_POINTS)) {
            map.addLayer({
              id: LAYER_POINTS,
              type: "circle",
              source: SRC_ID,
              filter: ["!", ["has", "point_count"]],
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
          // Update existing source data
          existing.setData(fc);
        }

        // Auto-fit
        const features = fc.features || [];
        if (features.length > 0) {
          const lons = features.map((f) => f.geometry.coordinates[0]);
          const lats = features.map((f) => f.geometry.coordinates[1]);
          const west = Math.min(...lons),
            east = Math.max(...lons),
            south = Math.min(...lats),
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
        // Swallow transient style load errors to prevent error-boundary crashes
        if (!/Style is not done loading/i.test(String(e))) {
          // but still log real problems
          console.error("[MapView] update failed:", e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, loading]);

  return (
    <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
