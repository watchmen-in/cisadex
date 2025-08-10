import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getStyleUrl } from "../lib/mapStyle";

const SRC_ID = "offices";
const LAYER_POINTS = "offices-points";
const LAYER_CLUSTERS = "offices-clusters";
const LAYER_COUNT = "offices-cluster-count";

function coerceCoords(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

function waitForIdle(map) {
  return new Promise((resolve) => {
    if (map.isStyleLoaded?.()) return map.once("idle", resolve);
    const onLoad = () => { map.off("load", onLoad); map.once("idle", resolve); };
    map.on("load", onLoad);
  });
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyleUrl(),
      center: [-98.5795, 39.8283],
      zoom: 3,
      attributionControl: true,
    });
    mapRef.current = map;

    // Ignore transient style race; log other errors
    map.on("error", (e) => {
      const msg = String(e?.error || e);
      if (msg.includes("Style is not done loading")) return;
      console.error("[MapLibre error]", msg);
    });

    (async () => {
      await waitForIdle(map);
      // Initialize empty clustered source + layers after style is really ready
      if (!map.getSource(SRC_ID)) {
        map.addSource(SRC_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterRadius: 40,
          clusterMaxZoom: 14,
        });
        if (!map.getLayer(LAYER_CLUSTERS)) {
          map.addLayer({
            id: LAYER_CLUSTERS,
            type: "circle",
            source: SRC_ID,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#00d0ff",
              "circle-opacity": 0.25,
              "circle-radius": ["step", ["get", "point_count"], 10, 10, 16, 30, 22],
              "circle-stroke-color": "#061017",
              "circle-stroke-width": 1.25,
            },
          });
        }
        if (!map.getLayer(LAYER_COUNT)) {
          map.addLayer({
            id: LAYER_COUNT,
            type: "symbol",
            source: SRC_ID,
            filter: ["has", "point_count"],
            layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12 },
            paint: { "text-color": "#a7b3c5" },
          });
        }
        if (!map.getLayer(LAYER_POINTS)) {
          map.addLayer({
            id: LAYER_POINTS,
            type: "circle",
            source: SRC_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "#00d0ff",
              "circle-opacity": 0.9,
              "circle-radius": 4,
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.25,
            },
          });
        }
      }
      map.resize(); // in case container was hidden
      setReady(true);
    })();

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      try { map.remove(); } catch {}
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Data updates (only after ready/idle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || loading) return;

    (async () => {
      await waitForIdle(map);

      const features = (Array.isArray(data) ? data : [])
        .map((d) => {
          const c = coerceCoords(d);
          return c
            ? { type: "Feature", geometry: { type: "Point", coordinates: c }, properties: d }
            : null;
        })
        .filter(Boolean);
      const geojson = { type: "FeatureCollection", features };

      const src = map.getSource?.(SRC_ID);
      if (src) src.setData(geojson);

      if (features.length) {
        const xs = features.map((f) => f.geometry.coordinates[0]);
        const ys = features.map((f) => f.geometry.coordinates[1]);
        map.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], {
          padding: 32, maxZoom: 10, duration: 0,
        });
      }
    })();
  }, [data, loading, ready]);

  return (
    <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
