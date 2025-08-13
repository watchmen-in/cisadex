import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapReadyQueue } from "../map/readyQueue";

// Configure style via env; fallback to public demo style
const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

// Source & layer IDs
const SRC_ID = "offices";
const LAYER_CLUSTERS = "offices-clusters";
const LAYER_COUNT = "offices-cluster-count";
const LAYER_POINTS = "offices-points";

// Coerce lon/lat from various field names + sanity checks
function coerceCoords(d) {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

// Build a FeatureCollection from incoming rows
function asFeatureCollection(rows = []) {
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

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-98.5795, 39.8283], // USA
      zoom: 3,
      attributionControl: true,
    });

    mapRef.current = map;

    // Ensure resize after the first full style load (fixes hidden container issues)
    map.once("load", () => {
      // Wait until idle to guarantee style is complete
      map.once("idle", () => {
        try {
          map.resize();
        } catch {}
      });
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, []);

  // Create or update sources/layers when data changes (and only when style is ready)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    let cancelled = false;

    MapReadyQueue.whenReady(map, async () => {
      if (cancelled) return;

      const fc = asFeatureCollection(Array.isArray(data) ? data : []);

      // Create the clustered source if missing; otherwise update data
      const existing = map.getSource(SRC_ID);
      if (!existing) {
        map.addSource(SRC_ID, {
          type: "geojson",
          data: fc,
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 14,
        });

        // Clustered circles
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
                "#2dd4bf", // small clusters
                25,
                "#22d3ee", // medium
                100,
                "#a78bfa", // large
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                14,
                25,
                20,
                100,
                26,
              ],
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.5,
              "circle-opacity": 0.9,
            },
          });
        }

        // Cluster count labels
        if (!map.getLayer(LAYER_COUNT)) {
          map.addLayer({
            id: LAYER_COUNT,
            type: "symbol",
            source: SRC_ID,
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-size": 12,
            },
            paint: {
              "text-color": "#0b0f14",
            },
          });
        }

        // Unclustered points
        if (!map.getLayer(LAYER_POINTS)) {
          map.addLayer({
            id: LAYER_POINTS,
            type: "circle",
            source: SRC_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-radius": 6,
              "circle-color": "#00d0ff",
              "circle-opacity": 0.95,
              "circle-stroke-color": "#0b0f14",
              "circle-stroke-width": 1.5,
            },
          });
        }

        // Optional: zoom into clusters on click
        if (!map.__cisadexClusterClickBound) {
          map.__cisadexClusterClickBound = true;
          map.on("click", LAYER_CLUSTERS, (e) => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: [LAYER_CLUSTERS],
            });
            const clusterId = features?.[0]?.properties?.cluster_id;
            if (!clusterId) return;
            const src = map.getSource(SRC_ID);
            src.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom,
              });
            });
          });
          map.on("mouseenter", LAYER_CLUSTERS, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", LAYER_CLUSTERS, () => {
            map.getCanvas().style.cursor = "";
          });
        }
      } else {
        // Update data on existing source
        try {
          existing.setData(fc);
        } catch (e) {
          // If we hit a transient style reload, queue again
          console.warn("[MapView] setData failed; re-queueing after idle", e);
          MapReadyQueue.whenReady(map, () => {
            try {
              const src = map.getSource(SRC_ID);
              if (src) src.setData(fc);
            } catch {}
          });
        }
      }

      // Fit bounds once when we have features
      try {
        const features = fc.features || [];
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
      } catch {}
    });

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
