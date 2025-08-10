// src/components/MapView.jsx
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL } from "../map/config"; // see config below

function coerceCoords(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

function waitForIdle(map) {
  return new Promise((resolve) => {
    if (map.isStyleLoaded?.()) {
      // still let one idle fire so sources/layers are attachable
      map.once("idle", resolve);
      return;
    }
    const onLoad = () => {
      map.off("load", onLoad);
      map.once("idle", resolve);
    };
    map.on("load", onLoad);
  });
}

export default function MapView({ data = [], loading = false, initialCenter = [-98.5795, 39.8283], initialZoom = 3 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const srcId = "offices";
  const ptLayer = "offices-points";
  const clusterLayer = "offices-clusters";
  const clusterCount = "offices-cluster-count";
  const haloLayer = "offices-halo";

  // Mount map once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
      maxPitch: 0
    });
    mapRef.current = map;

    const onLoad = async () => {
      try {
        await waitForIdle(map);
        setMapReady(true);
        // resize on first ready in case container changed size
        map.resize();
      } catch (e) {
        console.warn("[MapView] load wait failed", e);
      }
    };
    map.once("load", onLoad);

    // keep map sized
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);

    // defensive error log (don’t explode app)
    map.on("error", (e) => {
      if (String(e?.error || e).includes("Style is not done loading")) return;
      console.error("[MapLibre error]", e);
    });

    return () => {
      try { map.remove(); } catch {}
      window.removeEventListener("resize", onResize);
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Plot/update data when ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || loading) return;

    let cancelled = false;
    (async () => {
      try {
        await waitForIdle(map);
        if (cancelled) return;

        // Build GeoJSON
        const features = (Array.isArray(data) ? data : [])
          .map((d) => {
            const coords = coerceCoords(d);
            return coords
              ? { type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: d }
              : null;
          })
          .filter(Boolean);
        const geojson = { type: "FeatureCollection", features };

        // Ensure source exists (clustered)
        if (!map.getSource(srcId)) {
          map.addSource(srcId, {
            type: "geojson",
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 40
          });

          // Cluster bubbles
          if (!map.getLayer(clusterLayer)) {
            map.addLayer({
              id: clusterLayer,
              type: "circle",
              source: srcId,
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "#00d0ff",
                "circle-opacity": 0.9,
                "circle-radius": ["step", ["get", "point_count"], 10, 10, 16, 30, 22],
                "circle-stroke-color": "#061017",
                "circle-stroke-width": 1.5
              }
            });
          }
          // Cluster count labels
          if (!map.getLayer(clusterCount)) {
            map.addLayer({
              id: clusterCount,
              type: "symbol",
              source: srcId,
              filter: ["has", "point_count"],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12
              },
              paint: { "text-color": "#0b0f14" }
            });
          }
          // Halo (subtle glow for points)
          if (!map.getLayer(haloLayer)) {
            map.addLayer({
              id: haloLayer,
              type: "circle",
              source: srcId,
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "#00d0ff",
                "circle-radius": 6,
                "circle-blur": 0.7,
                "circle-opacity": 0.25
              }
            });
          }
          // Unclustered points on top
          if (!map.getLayer(ptLayer)) {
            map.addLayer({
              id: ptLayer,
              type: "circle",
              source: srcId,
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "#00d0ff",
                "circle-opacity": 0.9,
                "circle-radius": 4,
                "circle-stroke-color": "#0b0f14",
                "circle-stroke-width": 1.25
              }
            });
          }

          // Cluster click to expand
          map.on("click", clusterLayer, (e) => {
            const f = e.features?.[0];
            const clusterId = f && f.properties?.cluster_id;
            if (clusterId == null) return;
            map.getSource(srcId).getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              map.easeTo({ center: f.geometry.coordinates, zoom });
            });
          });
        } else {
          // Just update data
          map.getSource(srcId).setData(geojson);
        }

        // Fit bounds once when data appears
        if (features.length > 0) {
          const xs = features.map((f) => f.geometry.coordinates[0]);
          const ys = features.map((f) => f.geometry.coordinates[1]);
          const west = Math.min(...xs), east = Math.max(...xs);
          const south = Math.min(...ys), north = Math.max(...ys);
          if (Number.isFinite(west) && Number.isFinite(east) && Number.isFinite(south) && Number.isFinite(north)) {
            map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 10, duration: 0 });
          }
        }
      } catch (e) {
        // swallow the transient style error; we always re-run after idle anyway
        if (!String(e).includes("Style is not done loading")) {
          console.error("[MapView] update failed:", e);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [data, loading, mapReady]);

  return (
    <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
