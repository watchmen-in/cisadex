
const tabs = document.querySelectorAll('nav.tabs .tab');
const panels = document.querySelectorAll('.panel[id]');
const tpl = document.getElementById('card-template');

let DATA = [];
let filtered = [];

function setActive(id){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.panel === id));
  panels.forEach(p => p.classList.toggle('active', p.id === id));
}

tabs.forEach(t => t.addEventListener('click', () => setActive(t.dataset.panel)));

async function load(){
  try{
    const res = await fetch('data/index.json');
    DATA = await res.json();
    filtered = DATA.items;
    renderAll();
    document.getElementById('status').textContent = `Loaded ${DATA.items.length} items`;
  }catch(e){
    console.error(e);
    document.getElementById('status').textContent = 'Failed to load data';
  }
}

async function loadRss(){
  try{
    const url = encodeURIComponent('https://www.cisa.gov/rss-feed.xml');
    const res = await fetch(`/api/rss?url=${url}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const items = [...doc.querySelectorAll('item')].map(item => ({
      title: item.querySelector('title')?.textContent || '',
      url: item.querySelector('link')?.textContent || '',
      date: item.querySelector('pubDate')?.textContent || ''
    }));
    renderPublications(items.slice(0, 10));
  }catch(e){
    console.error(e);
  }
}

function makeCard(item){
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.href = item.url;
  node.querySelector('.card-title').textContent = item.title;
  node.querySelector('.card-meta').textContent = item.meta ?? item.category;
  return node;
}

function renderAll(list = filtered){
  const byCat = panels;
  panels.forEach(p => {
    const grid = p.querySelector('.grid');
    if(!grid) return;
    const cat = grid.dataset.category;
    grid.innerHTML = '';
    list.filter(x => x.category === cat).forEach(x => grid.appendChild(makeCard(x)));
  });
}

function renderPublications(list){
  const feed = document.getElementById('publications-feed');
  if(!feed) return;
  feed.innerHTML = '';
  list.forEach(item => {
    const a = document.createElement('a');
    a.className = 'feed-item';
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title;
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = item.date ? new Date(item.date).toLocaleDateString() : '';
    a.appendChild(title);
    a.appendChild(date);
    feed.appendChild(a);
  });
}

function onSearch(q){
  const query = q.trim().toLowerCase();
  if(!query){ filtered = DATA.items; renderAll(); return; }
  filtered = DATA.items.filter(x =>
    (x.title + ' ' + (x.meta||'') + ' ' + x.tags.join(' ')).toLowerCase().includes(query)
  );
  renderAll(filtered);
}

window.addEventListener('global-search', e => onSearch(e.detail.q));

window.addEventListener('csf-filter', e => {
  const code = e.detail.csf;
  if(!code){ filtered = DATA.items; renderAll(); return; }
  filtered = DATA.items.filter(x => (x.csf||[]).includes(code));
  renderAll(filtered);
});

// ---------- Config ----------
const FEEDS = {
  news: "https://www.cisa.gov/news-events/news.xml",
  alerts: "https://www.cisa.gov/news-events/cybersecurity-advisories.xml",
  updates: "https://www.cisa.gov/news-events/cisa-updates.xml"
};

// Sectors quick data (icon = emoji for now; swap to SVG later)
const SECTORS = [
  { key:"Energy", icon:"⚡", url:"https://www.cisa.gov/energy-sector", blurb:"Electricity, oil & gas operations." },
  { key:"Water & Wastewater", icon:"💧", url:"https://www.cisa.gov/water-and-wastewater-systems-sector", blurb:"Treatment & distribution." },
  { key:"Communications", icon:"📡", url:"https://www.cisa.gov/communications-sector", blurb:"Telecom & broadcast." },
  { key:"Information Technology", icon:"💻", url:"https://www.cisa.gov/information-technology-sector", blurb:"IT providers & platforms." },
  { key:"Transportation Systems", icon:"🚆", url:"https://www.cisa.gov/transportation-systems-sector", blurb:"Aviation, rail, maritime, pipeline." },
  { key:"Chemical", icon:"🧪", url:"https://www.cisa.gov/chemical-sector", blurb:"Production & storage." },
  { key:"Critical Manufacturing", icon:"🏭", url:"https://www.cisa.gov/critical-manufacturing-sector", blurb:"Industrial production." },
  { key:"Healthcare & Public Health", icon:"🏥", url:"https://www.cisa.gov/healthcare-and-public-health-sector", blurb:"Hospitals & labs." },
  { key:"Financial Services", icon:"💳", url:"https://www.cisa.gov/financial-services-sector", blurb:"Banking & markets." },
  { key:"Food & Agriculture", icon:"🌾", url:"https://www.cisa.gov/food-and-agriculture-sector", blurb:"Farms & processing." },
  { key:"Dams", icon:"🏞️", url:"https://www.cisa.gov/dams-sector", blurb:"Reservoirs & flood control." },
  { key:"Nuclear", icon:"☢️", url:"https://www.cisa.gov/nuclear-reactors-materials-and-waste-sector", blurb:"Nuclear facilities." },
  { key:"Government Facilities", icon:"🏛️", url:"https://www.cisa.gov/government-facilities-sector", blurb:"Federal & SLTT." },
  { key:"Commercial Facilities", icon:"🏬", url:"https://www.cisa.gov/commercial-facilities-sector", blurb:"Malls, venues, offices." },
  { key:"Defense Industrial Base", icon:"🛡️", url:"https://www.cisa.gov/defense-industrial-base-sector", blurb:"DoD supply chain." },
  { key:"Emergency Services", icon:"🚒", url:"https://www.cisa.gov/emergency-services-sector", blurb:"Police, fire, EMS, PSAPs." }
];

const SERVICES = [
  { k:"Service", t:"Cyber Hygiene (Free)", p:"External attack surface scanning & vuln reporting.", url:"https://www.cisa.gov/cyber-hygiene-services" },
  { k:"Service", t:"KEV Catalog", p:"Patch first: vulnerabilities known to be exploited.", url:"https://www.cisa.gov/kev" },
  { k:"Service", t:"Shields Up", p:"Heightened posture guidance & time-bound actions.", url:"https://www.cisa.gov/shields-up" },
  { k:"Service", t:"CPGs", p:"Prioritized goals for critical infrastructure risk reduction.", url:"https://www.cisa.gov/cpg" },
  { k:"Service", t:"CTEP Tabletop Kits", p:"Plug-and-play exercise materials to test readiness.", url:"https://www.cisa.gov/resources-tools/resources/tabletop-exercises" },
  { k:"Service", t:"Stop Ransomware", p:"Prevention, response, and recovery resources.", url:"https://www.stopransomware.gov/" }
];

// ---------- DOM Helpers ----------
const el = (sel) => document.querySelector(sel);
const list = (sel) => document.querySelectorAll(sel);

function tileHTML(item, variant="sector"){
  if (variant === "sector") {
    return `<a class="tile" href="${item.url}" target="_blank" rel="noopener">
      <div class="k"><span class="icon">${item.icon}</span>${item.key}</div>
      <div class="p">${item.blurb}</div></a>`;
  }
  return `<a class="tile" href="${item.url}" target="_blank" rel="noopener">
      <div class="k">${item.k}</div>
      <div class="t">${item.t}</div>
      <div class="p">${item.p}</div></a>`;
}

// ---------- Render static tiles ----------
function renderSectors(){
  el("#sectorsGrid").innerHTML = SECTORS.map(s => tileHTML(s,"sector")).join("");
}
function renderServices(){
  el("#servicesGrid").innerHTML = SERVICES.map(s => tileHTML(s,"service")).join("");
}

// ---------- RSS (client parses XML) ----------
async function loadFeed(kind="news"){
  const rssUrl = FEEDS[kind];
  if (!rssUrl) return;
  const endpoint = `/api/rss?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(endpoint);
  const xml = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const items = [...doc.querySelectorAll("item")];
  const entries = items.length ? items : [...doc.querySelectorAll("entry")];

  const max = 8;
  const out = entries.slice(0,max).map(n => {
    const title = (n.querySelector("title")?.textContent || "").trim();
    const link = (n.querySelector("link")?.textContent || n.querySelector("link")?.getAttribute("href") || "#").trim();
    const pubRaw = (n.querySelector("pubDate")?.textContent || n.querySelector("updated")?.textContent || "").trim();
    const date = pubRaw ? new Date(pubRaw) : null;
    const nice = date ? date.toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"}) : "";
    const source = kind === "alerts" ? "Advisory" : (kind === "updates" ? "Update" : "News");

    return `<li class="rss-item">
      <a href="${link}" target="_blank" rel="noopener">${escapeHTML(title)}</a>
      <div class="rss-meta">${source}${nice ? ` • ${nice}` : ""}</div>
    </li>`;
  }).join("");

  el("#rssList").innerHTML = out || `<li class="rss-item">No items found.</li>`;
}

function escapeHTML(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[m])) }

// ---------- CSF chips -> filter your existing catalog ----------
function wireCSFChips(){
  const chips = list("#csfChips .chip");
  chips.forEach(ch => ch.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    ch.classList.add("active");
    const code = ch.dataset.csf;
    const ev = new CustomEvent("csf-filter", { detail: { csf: code }});
    window.dispatchEvent(ev);
  }));
}

// ---------- Tabs for feeds ----------
function wireFeedTabs(){
  const tabs = list(".feed-tabs .tab");
  tabs.forEach(t => t.addEventListener("click", async () => {
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    await loadFeed(t.dataset.feed);
  }));
}

// ---------- Search (simple hook) ----------
function wireSearch(){
  const q = el("#globalSearch");
  const btn = el("#searchBtn");
  const go = () => {
    const term = (q.value || "").trim();
    const ev = new CustomEvent("global-search", { detail: { q: term }});
    window.dispatchEvent(ev);
  };
  btn.addEventListener("click", go);
  q.addEventListener("keydown", e => (e.key === "Enter") && go());
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  renderSectors();
  renderServices();
  wireFeedTabs();
  wireCSFChips();
  wireSearch();
  await loadFeed("news");
});

load();
loadRss();
