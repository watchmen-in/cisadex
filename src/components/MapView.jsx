import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL } from "../map/config";
import { MapReadyQueue } from "../map/readyQueue";

const coerce = (d) => {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  return (Number.isFinite(lon) && Number.isFinite(lat) && lon>=-180 && lon<=180 && lat>=-90 && lat<=90) ? [lon,lat] : null;
};

export default function MapView({ data = [], loading = false }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: ref.current, style: STYLE_URL, center: [-98.5795,39.8283], zoom: 3 });
    mapRef.current = map;

    // Ignore transient style error
    map.on("error", (e) => {
      const msg = String(e?.error || e);
      if (!msg.includes("Style is not done loading")) console.error("[MapLibre error]", msg);
    });

    const q = new MapReadyQueue(map);
    setQueue(q);

    // After first idle, ensure the map fits the container
    map.once("idle", () => map.resize());

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); try { map.remove(); } catch {} mapRef.current = null; setQueue(null); };
  }, []);

  useEffect(() => {
    if (!queue || loading) return;

    const features = (Array.isArray(data) ? data : [])
      .map(coerce).filter(Boolean)
      .map((c,i)=>({ type:"Feature", geometry:{ type:"Point", coordinates:c }, properties:{ i } }));
    const geo = { type:"FeatureCollection", features };
    const src = "offices";

    // Create/Update source + layers
    queue.run((map) => {
      if (!map.getSource(src)) {
        map.addSource(src, { type:"geojson", data:geo, cluster:true, clusterRadius:40, clusterMaxZoom:14 });
        if (!map.getLayer("offices-clusters")) map.addLayer({
          id:"offices-clusters", type:"circle", source:src, filter:["has","point_count"],
          paint:{ "circle-color":"#00d0ff","circle-opacity":0.9,"circle-radius":["step",["get","point_count"],10,10,16,30,22],"circle-stroke-color":"#061017","circle-stroke-width":1.5 }
        });
        if (!map.getLayer("offices-count")) map.addLayer({
          id:"offices-count", type:"symbol", source:src, filter:["has","point_count"],
          layout:{ "text-field":["get","point_count_abbreviated"], "text-size":12 }, paint:{ "text-color":"#0b0f14" }
        });
        if (!map.getLayer("offices-points")) map.addLayer({
          id:"offices-points", type:"circle", source:src, filter:["!",["has","point_count"]],
          paint:{ "circle-color":"#00d0ff","circle-opacity":0.9,"circle-radius":4,"circle-stroke-color":"#0b0f14","circle-stroke-width":1.25 }
        });
        map.on("click","offices-clusters",(e)=> {
          const f = e.features?.[0]; const id = f?.properties?.cluster_id; if (id==null) return;
          map.getSource(src).getClusterExpansionZoom(id,(err,zoom)=>{ if (err) return; map.easeTo({ center: f.geometry.coordinates, zoom }); });
        });
      } else {
        map.getSource(src).setData(geo);
      }
    });

    // Fit bounds once per dataset change
    if (features.length) {
      const xs = features.map(f=>f.geometry.coordinates[0]);
      const ys = features.map(f=>f.geometry.coordinates[1]);
      queue.run((map) => {
        map.fitBounds([[Math.min(...xs), Math.min(...ys)],[Math.max(...xs), Math.max(...ys)]], { padding:32, maxZoom:10, duration:0 });
      });
    }
  }, [queue, data, loading]);

  return <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]"><div ref={ref} className="w-full h-full" /></div>;
}
