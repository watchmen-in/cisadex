import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL } from "../map/config";

const waitForIdle = (map) => new Promise((resolve) => {
  if (map.isStyleLoaded?.()) return map.once("idle", resolve);
  const onLoad = () => { map.off("load", onLoad); map.once("idle", resolve); };
  map.on("load", onLoad);
});

const coerce = (d) => {
  const lon = Number(d?.lon ?? d?.lng ?? d?.longitude ?? d?.long);
  const lat = Number(d?.lat ?? d?.latitude);
  return (Number.isFinite(lon) && Number.isFinite(lat) && lon>=-180 && lon<=180 && lat>=-90 && lat<=90) ? [lon,lat] : null;
};

export default function MapView({ data = [], loading = false }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({ container: ref.current, style: STYLE_URL, center: [-98.5795,39.8283], zoom: 3 });
    mapRef.current = map;
    map.on("error", (e) => {
      const msg = String(e?.error || e);
      if (msg.includes("Style is not done loading")) return;
      console.error("[MapLibre error]", e);
    });
    (async () => { await waitForIdle(map); setReady(true); map.resize(); })();
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); try { map.remove(); } catch {} mapRef.current = null; setReady(false); };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || loading) return;
    let cancelled = false;
    (async () => {
      await waitForIdle(map);
      if (cancelled) return;

      const features = (Array.isArray(data) ? data : [])
        .map(coerce).filter(Boolean)
        .map((c,i) => ({ type:"Feature", geometry:{ type:"Point", coordinates:c }, properties:{ i } }));
      const geo = { type:"FeatureCollection", features };

      const src = "offices";
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
        if (!map.getLayer("offices-halo")) map.addLayer({
          id:"offices-halo", type:"circle", source:src, filter:["!",["has","point_count"]],
          paint:{ "circle-color":"#00d0ff","circle-radius":6,"circle-blur":0.7,"circle-opacity":0.25 }
        });
        if (!map.getLayer("offices-points")) map.addLayer({
          id:"offices-points", type:"circle", source:src, filter:["!",["has","point_count"]],
          paint:{ "circle-color":"#00d0ff","circle-opacity":0.9,"circle-radius":4,"circle-stroke-color":"#0b0f14","circle-stroke-width":1.25 }
        });
        map.on("click","offices-clusters",(e)=> {
          const f = e.features?.[0]; const id = f?.properties?.cluster_id;
          if (id==null) return;
          map.getSource(src).getClusterExpansionZoom(id,(err,zoom)=>{
            if (err) return; map.easeTo({ center: f.geometry.coordinates, zoom });
          });
        });
      } else {
        map.getSource(src).setData(geo);
      }

      if (features.length) {
        const xs = features.map(f=>f.geometry.coordinates[0]);
        const ys = features.map(f=>f.geometry.coordinates[1]);
        map.fitBounds([[Math.min(...xs), Math.min(...ys)],[Math.max(...xs), Math.max(...ys)]], { padding:32, maxZoom:10, duration:0 });
      }
    })();
    return () => { cancelled = true; };
  }, [data, ready, loading]);

  return <div className="w-full h-[100vh] md:h-[calc(100vh-56px)]"><div ref={ref} className="w-full h-full" /></div>;
}
