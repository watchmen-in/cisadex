
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const search = document.getElementById('search');
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
    const res = await fetch('https://www.cisa.gov/rss-feed.xml');
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

search.addEventListener('input', (e)=> onSearch(e.target.value));

load();
loadRss();
