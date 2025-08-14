import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function isValidCoord(d) {
  const lon = Number(d?.lon ?? d?.lng), lat = Number(d?.lat);
  return Number.isFinite(lon) && Number.isFinite(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

async function waitForStyle(map) {
  if (map.isStyleLoaded?.()) return;
  await new Promise((resolve) => {
    const onIdle = () => { map.off("idle", onIdle); resolve(); };
    map.once("load", () => map.once("idle", onIdle));
  });
}

export default function MapView({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // Debug: see what arrives
  useEffect(() => {
    console.log("[MapView] data length:", Array.isArray(data) ? data.length : "n/a", data?.slice?.(0,3));
  }, [data]);

  // Create map once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-98.5795, 39.8283],
      zoom: 3
    });
    mapRef.current = map;
    return () => { try { map.remove(); } catch {} mapRef.current = null; };
  }, []);

  // Add/update source+layer after style ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    const srcId = "offices";
    const layerId = "offices-circles";
    let clickHandler;
    let cancelled = false;

    (async () => {
      try {
        await waitForStyle(map);
        if (cancelled) return;

        const features = (Array.isArray(data) ? data : []).filter(isValidCoord).map(d => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(d.lon ?? d.lng), Number(d.lat)] },
          properties: d
        }));
        const geojson = { type: "FeatureCollection", features };

        const existing = map.getSource?.(srcId);
        if (!existing) {
          map.addSource(srcId, { type: "geojson", data: geojson });
          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "circle",
              source: srcId,
              paint: {
                "circle-radius": 6,
                "circle-color": [
                  "match",
                  ["get", "entity"],
                  "agency", "#1f78b4",
                  "field_office", "#33a02c",
                  "lab", "#e31a1c",
                  "isac", "#ff7f00",
                  "#ff0000"
                ],
                "circle-opacity": 0.9,
                "circle-stroke-color": "#111",
                "circle-stroke-width": 1
              }
            });
          }
        } else {
          existing.setData(geojson);
        }

        clickHandler = (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const props = feature.properties || {};
          const title = props.name || props.office_name || "";
          const desc = props.entity || "";
          const html = `<div><h3>${title}</h3><p>${desc}</p></div>`;
          new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        };
        map.on("click", layerId, clickHandler);

        // Fit bounds only when we have points
        if (features.length > 0) {
          const lons = features.map(f => f.geometry.coordinates[0]);
          const lats = features.map(f => f.geometry.coordinates[1]);
          const west = Math.min(...lons), east = Math.max(...lons);
          const south = Math.min(...lats), north = Math.max(...lats);
          if (Number.isFinite(west) && Number.isFinite(east) && Number.isFinite(south) && Number.isFinite(north)) {
            map.fitBounds([[west, south], [east, north]], { padding: 32, maxZoom: 10, duration: 0 });
          }
        }
      } catch (e) {
        console.error("[MapView] update failed:", e);
        // swallow to avoid ErrorBoundary crash
      }
    })();

    return () => {
      cancelled = true;
      if (clickHandler) map.off("click", layerId, clickHandler);
    };
  }, [data, loading]);

  return (
    <div className="map-container" style={{ height: "100vh", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
