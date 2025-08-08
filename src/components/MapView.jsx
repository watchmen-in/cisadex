import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({ data = [] }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const tooltipRef = useRef(new maplibregl.Popup({ closeButton: false, closeOnClick: false }));

  // initialize map
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-98, 39],
      zoom: 4,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-left');
  }, []);

  // update data source
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('offices');
    const geojson = {
      type: 'FeatureCollection',
      features: data.map((o) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [o.lng, o.lat] },
        properties: {
          ...o,
          contact_public_phone: o.contact_public.phone,
          contact_public_email: o.contact_public.email,
          contact_public_website: o.contact_public.website,
        },
      })),
    };

    if (source) {
      source.setData(geojson);
      return;
    }

    mapRef.current.addSource('offices', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    mapRef.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'offices',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#1e3a8a',
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        'circle-opacity': 0.8,
      },
    });

    mapRef.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'offices',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: { 'text-color': '#fff' },
    });

    mapRef.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'offices',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#f87171',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    mapRef.current.on('click', 'clusters', (e) => {
      const features = mapRef.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      mapRef.current.getSource('offices').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        mapRef.current.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    mapRef.current.on('mouseenter', 'unclustered-point', (e) => {
      mapRef.current.getCanvas().style.cursor = 'pointer';
      const { agency, city, state } = e.features[0].properties;
      tooltipRef.current
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`<strong>${agency}</strong><br/>${city}, ${state}`)
        .addTo(mapRef.current);
    });

    mapRef.current.on('mouseleave', 'unclustered-point', () => {
      mapRef.current.getCanvas().style.cursor = '';
      tooltipRef.current.remove();
    });

    mapRef.current.on('click', 'unclustered-point', (e) => {
      const props = e.features[0].properties;
      const coord = e.features[0].geometry.coordinates.slice();
      const html = `
        <div class="text-sm">
          <h3 class="font-bold mb-1">${props.agency} - ${props.office_name}</h3>
          <p>${props.city}, ${props.state}</p>
          <p>${props.role_type}</p>
          <p>Phone: ${props.contact_public_phone}</p>
          <p>Email: ${props.contact_public_email}</p>
          <a class="text-blue-400 underline" href="${props.contact_public_website}" target="_blank">Website</a>
        </div>
      `;
      new maplibregl.Popup().setLngLat(coord).setHTML(html).addTo(mapRef.current);
    });
  }, [data]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
