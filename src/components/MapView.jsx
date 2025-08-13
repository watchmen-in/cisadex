import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";
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
    properties: d
  };
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
      zoom: 3
    });
    mapRef.current = map;

    // If this map is inside a panel that might be hidden initially,
    // ensure it gets a resize after load.
    map.once("load", () => map.resize());

    return () => { try { map.remove(); } catch {} mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    const update = () => {
      // Build GeoJSON
      const features = (Array.isArray(data) ? data : [])
        .map(toFeature)
        .filter(Boolean);
      const geojson = { type: "FeatureCollection", features };

      const src = map.getSource(SRC_ID);
      if (!src) {
        // Only add when style is fully loaded
        if (!map.isStyleLoaded()) return;
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
        }
      } else {
        src.setData(geojson);
      }
    };

    if (map.isStyleLoaded()) {
      update();
    } else {
      // Wait exactly once for style to be ready
      const onLoad = () => update();
      map.once("load", onLoad);
      return () => map.off("load", onLoad);
    }
  }, [data, loading]);

  return <div ref={containerRef} className="w-full h-[100vh]" />;
}
