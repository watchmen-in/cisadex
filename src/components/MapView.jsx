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
    const map = new maplibregl.Map({
      container: elRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283],
      zoom: 3
    });
    mapRef.current = map;

    // If hidden initially, ensure a resize after first load
    map.once("load", () => map.resize());

    return () => {
      try { map.remove(); } catch {}
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

  return <div ref={elRef} className="w-full h-[100vh]" />;
}
