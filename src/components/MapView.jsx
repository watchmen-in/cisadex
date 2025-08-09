import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView({ data = [], loading = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    let map;
    try {
      map = new maplibregl.Map({
        container: ref.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [-98.5795, 39.8283],
        zoom: 3
      });

      map.on("load", () => {
        // TODO: add sources/layers defensively
      });
    } catch (e) {
      console.error("Map initialization failed:", e);
      // Re-throw so ErrorBoundary shows details (temporarily)
      throw e;
    }
    return () => { try { map && map.remove(); } catch {} };
  }, []);

  return (
    <div className="map-container" style={{ height: "100vh", width: "100%" }}>
      <div ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
