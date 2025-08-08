let map;
let allFeatures = [];

function getSelected(id){
  const select = document.getElementById(id);
  return Array.from(select.selectedOptions).map(o => o.value);
}

function populateFilters(){
  const agencies = new Set();
  const roles = new Set();
  const sectors = new Set();
  const regions = new Set();
  allFeatures.forEach(f => {
    const p = f.properties;
    agencies.add(p.agency);
    roles.add(p.role_type);
    p.sectors.forEach(s => sectors.add(s));
    regions.add(p.region);
  });
  fillSelect('agency-filter', agencies);
  fillSelect('role-filter', roles);
  fillSelect('sector-filter', sectors);
  fillSelect('region-filter', regions);
}

function fillSelect(id, values){
  const select = document.getElementById(id);
  Array.from(values).sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', applyFilters);
}

function applyFilters(){
  const agencies = getSelected('agency-filter');
  const roles = getSelected('role-filter');
  const sectors = getSelected('sector-filter');
  const regions = getSelected('region-filter');

  const filtered = allFeatures.filter(f => {
    const p = f.properties;
    return (agencies.length ? agencies.includes(p.agency) : true) &&
           (roles.length ? roles.includes(p.role_type) : true) &&
           (sectors.length ? sectors.some(s => p.sectors.includes(s)) : true) &&
           (regions.length ? regions.includes(p.region) : true);
  });
  map.getSource('offices').setData({type: 'FeatureCollection', features: filtered});
}

async function loadData(){
  const res = await fetch('data/offices.json');
  const geojson = await res.json();
  allFeatures = geojson.features;
  map.addSource('offices', {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 6,
    clusterRadius: 40
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'offices',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#444',
      'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 25, 25]
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'offices',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: { 'text-color': '#fff' }
  });

  map.addLayer({
    id: 'unclustered',
    type: 'circle',
    source: 'offices',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#00bcd4',
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  const popup = new maplibregl.Popup({closeButton: false, closeOnClick: false});
  map.on('mouseenter', 'unclustered', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const p = e.features[0].properties;
    const html = `<strong>${p.office_name}</strong><br/>${p.agency} - ${p.city}, ${p.state}<br/>${p.role_type}`;
    popup.setLngLat(e.features[0].geometry.coordinates).setHTML(html).addTo(map);
  });
  map.on('mouseleave', 'unclustered', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {layers: ['clusters']});
    const clusterId = features[0].properties.cluster_id;
    map.getSource('offices').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({center: features[0].geometry.coordinates, zoom});
    });
  });

  map.on('click', 'unclustered', (e) => {
    const p = e.features[0].properties;
    const d = document.getElementById('details');
    d.innerHTML = `<h3>${p.office_name}</h3>`+
      `<p><strong>Agency:</strong> ${p.agency}</p>`+
      `<p><strong>Role:</strong> ${p.role_type}</p>`+
      `<p><strong>City:</strong> ${p.city}, ${p.state}</p>`+
      `<p><strong>Sectors:</strong> ${p.sectors.join(', ')}</p>`+
      `<p><strong>Region:</strong> ${p.region}</p>`;
    d.classList.add('open');
  });

  populateFilters();
}

async function geocode(q){
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const data = await res.json();
  if(data[0]){
    map.easeTo({center: [parseFloat(data[0].lon), parseFloat(data[0].lat)], zoom: 9});
  }
}

function setupSearch(){
  const s = document.getElementById('search');
  s.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') geocode(s.value);
  });
}

function init(){
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-98, 39],
    zoom: 3
  });
  map.on('load', loadData);
  setupSearch();
}

init();
