const apiBase = window.location.origin;

function $(sel) { return document.querySelector(sel); }
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  });
  for (const c of children) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}

async function api(path, opts = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Tabs
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const id = btn.dataset.tab;
  document.getElementById(id).classList.add('active');
});

// PEOPLE
const peopleList = $('#people-list');
async function loadPeople(search = '') {
  const data = await api(`/api/people${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  peopleList.innerHTML = '';
  for (const p of data.items) {
    const born = p.born ? ` (ur. ${p.born})` : '';
    peopleList.append(el('li', {}, `${p.name}${born}`));
  }
}
$('#add-person-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = { name: fd.get('name'), born: fd.get('born') ? Number(fd.get('born')) : undefined };
  await api('/api/people', { method: 'POST', body: JSON.stringify(payload) });
  e.target.reset();
  loadPeople();
});
$('#btn-search-person').addEventListener('click', () => loadPeople($('#search-person').value.trim()));

// MOVIES
const moviesList = $('#movies-list');
async function loadMovies(search = '') {
  const data = await api(`/api/movies${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  moviesList.innerHTML = '';
  for (const m of data.items) {
    const released = m.released ? ` (${m.released})` : '';
    moviesList.append(el('li', {}, `${m.title}${released}`));
  }
}
$('#add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = { title: fd.get('title'), released: fd.get('released') ? Number(fd.get('released')) : undefined };
  await api('/api/movies', { method: 'POST', body: JSON.stringify(payload) });
  e.target.reset();
  loadMovies();
});
$('#btn-search-movie').addEventListener('click', () => loadMovies($('#search-movie').value.trim()));

// ACTED_IN + GRAPH
$('#add-acted-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const roles = (fd.get('roles') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const payload = {
    personName: fd.get('personName'),
    movieTitle: fd.get('movieTitle'),
    roles: roles.length ? roles : undefined,
  };
  await api('/api/acted-in', { method: 'POST', body: JSON.stringify(payload) });
  e.target.reset();
  loadGraph();
});

let network;
async function loadGraph() {
  const limit = Number($('#graph-limit').value || 50);
  const data = await api(`/api/graph?limit=${limit}`);
  const container = document.getElementById('graph-container');
  const nodes = new vis.DataSet(data.nodes.map(n => ({ id: n.id, label: n.label, group: n.group })));
  const edges = new vis.DataSet(data.links.map(l => ({ from: l.source, to: l.target, label: l.label })));
  const options = {
    autoResize: true,
    nodes: { shape: 'dot', size: 12, font: { color: '#e5e7eb' } },
    edges: { arrows: 'to', color: '#64748b', font: { color: '#94a3b8' } },
    physics: { stabilization: true },
    groups: {
      Person: { color: { background: '#22c55e', border: '#16a34a' } },
      Movie: { color: { background: '#38bdf8', border: '#0284c7' } },
    },
  };
  network = new vis.Network(container, { nodes, edges }, options);
}
$('#btn-load-graph').addEventListener('click', loadGraph);

// initial load
loadPeople();
loadMovies();
loadGraph();

