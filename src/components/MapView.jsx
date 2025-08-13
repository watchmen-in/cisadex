import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ||
  "https://demotiles.maplibre.org/style.json";

const SRC_ID = "offices";
const L_CLUSTER = "offices-clusters";
const L_CLUSTER_COUNT = "offices-cluster-count";
const L_POINTS = "offices-points";

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

  // Create map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283],
      zoom: 3,
      attributionControl: true,
    });
    mapRef.current = map;

    // Ensure correct layout if container was hidden
    map.once("load", () => map.resize());

    // Basic controls
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
    };
  }, []);

  // Add/Update data whenever style is ready and data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    const update = () => {
      const features = (Array.isArray(data) ? data : []).map(toFeature).filter(Boolean);
      const geojson = { type: "FeatureCollection", features };

      const src = map.getSource(SRC_ID);
      if (!src) {
        // Add clustered source once
        map.addSource(SRC_ID, {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterRadius: 40,
          clusterMaxZoom: 12,
        });

        if (!map.getLayer(L_CLUSTER)) {
          map.addLayer({
            id: L_CLUSTER,
            type: "circle",
            source: SRC_ID,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#2dd4bf",   // <= 10
                10, "#22c55e", // <= 30
                30, "#ef4444", // > 30
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                14,
                10, 18,
                30, 24,
              ],
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.5,
            },
          });
        }

        if (!map.getLayer(L_CLUSTER_COUNT)) {
          map.addLayer({
            id: L_CLUSTER_COUNT,
            type: "symbol",
            source: SRC_ID,
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-size": 12,
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": "#0b0f14",
              "text-halo-width": 0.8,
            },
          });
        }

        if (!map.getLayer(L_POINTS)) {
          map.addLayer({
            id: L_POINTS,
            type: "circle",
            source: SRC_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-radius": 5.5,
              "circle-color": "#00d0ff",
              "circle-opacity": 0.9,
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.5,
            },
          });
        }
      } else {
        // Refresh data
        src.setData(geojson);
      }

      // Fit bounds if we have features
      if (features.length > 0) {
        const xs = features.map(f => f.geometry.coordinates[0]);
        const ys = features.map(f => f.geometry.coordinates[1]);
        const west = Math.min(...xs), south = Math.min(...ys);
        const east = Math.max(...xs), north = Math.max(...ys);
        if ([west, south, east, north].every(Number.isFinite)) {
          map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 9, duration: 0 });
        }
      }
    };

    // Gate addSource/addLayer until style is ready
    if (map.isStyleLoaded()) {
      try { update(); } catch (e) { console.error("[MapView] update failed:", e); }
    } else {
      const onLoad = () => {
        try { update(); } catch (e) { console.error("[MapView] update failed:", e); }
      };
      map.once("load", onLoad);
      return () => map.off("load", onLoad);
    }
  }, [data, loading]);

  return <div ref={containerRef} className="w-full h-[100vh]" />;
}
