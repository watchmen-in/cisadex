
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

function makeCard(item){
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.href = item.url;
  if(item.icon){
    const img = document.createElement('img');
    img.src = `assets/${item.icon}`;
    img.alt = '';
    img.className = 'card-icon';
    node.appendChild(img);
  }
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
