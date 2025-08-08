
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const search = document.getElementById('search');
const tpl = document.getElementById('card-template');

let DATA = [];
let filtered = [];

function setActive(id){
  tabs.forEach(t => {
    const active = t.dataset.panel === id;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
    t.setAttribute('tabindex', active ? '0' : '-1');
  });
  panels.forEach(p => {
    const isActive = p.id === id;
    p.classList.toggle('active', isActive);
    p.toggleAttribute('hidden', !isActive);
  });
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
    const cat = grid.dataset.category;
    grid.innerHTML = '';
    list.filter(x => x.category === cat).forEach(x => grid.appendChild(makeCard(x)));
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
