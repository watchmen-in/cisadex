import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const SRC_ID = "offices";
const LAYER_POINTS = "offices-points";

function coerceCoords(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

async function waitForIdle(map) {
  if (map.isStyleLoaded?.()) {
    // MapLibre still needs an idle after load for safe addLayer in some cases.
    await new Promise((r) => map.once("idle", r));
    return;
  }
  await new Promise((r) => map.once("load", r));
  await new Promise((r) => map.once("idle", r));
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);

  const styleUrl = import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

  const features = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((d) => {
        const c = coerceCoords(d);
        return c
          ? { type: "Feature", geometry: { type: "Point", coordinates: c }, properties: d }
          : null;
      })
      .filter(Boolean);
  }, [data]);

  // Create / destroy map
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    // Helpful logging & error capture
    map.on("error", (e) => {
      // Swallow noisy style timing errors but log others
      const msg = String(e?.error || "");
      if (!msg.includes("Style is not done loading")) {
        console.error("[MapView] map error:", e);
      }
    });

    map.on("load", () => {
      // Ensure correct size if the map was hidden initially
      map.resize();
    });

    mapRef.current = map;
    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
      readyRef.current = false;
    };
  }, [styleUrl]);

  // Initialize sources/layers once style is really ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      try {
        await waitForIdle(map);
        if (cancelled) return;

        // Mark ready and set up sources/layers once
        if (!map.getSource(SRC_ID)) {
          map.addSource(SRC_ID, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
        }

        if (!map.getLayer(LAYER_POINTS)) {
          map.addLayer({
            id: LAYER_POINTS,
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

        readyRef.current = true;
      } catch (e) {
        console.error("[MapView] init failed:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Push data only after ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || loading) return;
    const src = map.getSource(SRC_ID);
    if (!src) return;

    const geojson = { type: "FeatureCollection", features };
    try {
      src.setData(geojson);

      // Fit bounds once data exists
      if (features.length) {
        const lons = features.map((f) => f.geometry.coordinates[0]);
        const lats = features.map((f) => f.geometry.coordinates[1]);
        const west = Math.min(...lons), east = Math.max(...lons);
        const south = Math.min(...lats), north = Math.max(...lats);
        if (Number.isFinite(west) && Number.isFinite(east) && Number.isFinite(south) && Number.isFinite(north)) {
          map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 10, duration: 0 });
        }
      }
    } catch (e) {
      const msg = String(e || "");
      if (!msg.includes("Style is not done loading")) {
        console.error("[MapView] setData/fit failed:", e);
      }
    }
  }, [features, loading]);

  return (
    <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
