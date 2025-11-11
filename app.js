// app.js
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ADMIN_EMAIL = 'mukeshkumarabc78@gmail.com';

let currentUserEmail = null;

// DOM
const sectionTitle = document.getElementById('sectionTitle');
const grid = document.getElementById('grid');
const gridLoading = document.getElementById('gridLoading');
const gridError = document.getElementById('gridError');
const gridEmpty = document.getElementById('gridEmpty');

const searchQuery = document.getElementById('searchQuery');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

const tabs = document.querySelectorAll('.tab-btn');
const adminBtn = document.getElementById('adminBtn');

const loginModal = document.getElementById('loginModal');
const loginOpenBtn = document.getElementById('loginOpenBtn');
const loginCloseBtn = document.getElementById('loginCloseBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const emailLoginBtn = document.getElementById('emailLoginBtn');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const adminNotice = document.getElementById('adminNotice');

const getStartedBtn = document.getElementById('getStartedBtn');

// Helpers
function show(el){ el.hidden = false; }
function hide(el){ el.hidden = true; }
function setText(el,t){ el.textContent = t; }
function imgUrl(p){ return p ? `https://image.tmdb.org/t/p/w500${p}` : ''; }
function year(d){ return d ? new Date(d).getFullYear() : '—'; }

function updateAdminVisibility(){
  if(currentUserEmail && currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()){
    adminBtn.hidden = false;
    adminNotice.hidden = false;
  } else {
    adminBtn.hidden = true;
    adminNotice.hidden = true;
  }
}

adminBtn?.addEventListener('click', () => {
  window.location.href = 'admin.html';
});

// Modal open/close
loginOpenBtn.addEventListener('click', () => show(loginModal));
loginCloseBtn.addEventListener('click', () => hide(loginModal));
loginModal.addEventListener('click', (e) => {
  if(e.target === loginModal) hide(loginModal);
});

// Placeholder Google login
googleLoginBtn.addEventListener('click', () => {
  // Placeholder: set email as admin for demo
  currentUserEmail = ADMIN_EMAIL;
  updateAdminVisibility();
  hide(loginModal);
  alert('Signed in with Google (demo)');
});

// Email login
emailLoginBtn.addEventListener('click', () => {
  const email = (emailInput.value || '').trim();
  const pass = (passwordInput.value || '').trim();
  if(!email || !pass){ alert('Enter email and password'); return; }
  currentUserEmail = email;
  updateAdminVisibility();
  hide(loginModal);
  alert(`Signed in as ${email}`);
});

// API
async function fetchJSON(endpoint, params = {}){
  const url = new URL(endpoint);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([k,v]) => v !== undefined && v !== null && url.searchParams.set(k,v));
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function renderGrid(items){
  grid.innerHTML = '';
  if(!items || items.length === 0){
    hide(gridLoading); hide(gridError); show(gridEmpty);
    return;
  }
  hide(gridEmpty);
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = m.id;

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = imgUrl(m.poster_path);
    img.alt = m.title || 'Poster';

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = m.title || 'Untitled';

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = `⭐ ${(m.vote_average ?? 0).toFixed(1)}/10 • ${year(m.release_date)}`;

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const watch = document.createElement('button');
    watch.className = 'watch-btn';
    watch.textContent = 'Watch Online';

    actions.appendChild(watch);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener('click', () => {
      window.location.href = `movie-details.html?id=${m.id}`;
    });
    grid.appendChild(card);
  });
}

async function loadSection(key){
  setText(sectionTitle, ({
    bollywood:'Bollywood',
    new_releases:'New Releases',
    trending:'Trending',
    popular:'Popular'
  })[key] || 'Movies');

  hide(gridError); hide(gridEmpty); show(gridLoading);
  try{
    let data;
    if(key === 'bollywood'){
      data = await fetchJSON(`${TMDB_BASE_URL}/discover/movie`, {
        with_original_language:'hi', sort_by:'popularity.desc', region:'IN'
      });
    } else if(key === 'new_releases'){
      data = await fetchJSON(`${TMDB_BASE_URL}/discover/movie`, {
        sort_by:'release_date.desc', primary_release_year:new Date().getFullYear(), region:'IN'
      });
    } else if(key === 'trending'){
      data = await fetchJSON(`${TMDB_BASE_URL}/trending/movie/day`, { region:'IN' });
    } else if(key === 'popular'){
      data = await fetchJSON(`${TMDB_BASE_URL}/movie/popular`, { region:'IN' });
    } else {
      data = await fetchJSON(`${TMDB_BASE_URL}/movie/top_rated`, { region:'IN' });
    }
    hide(gridLoading);
    renderGrid(data.results);
  } catch(err){
    hide(gridLoading);
    gridError.hidden = false;
    gridError.textContent = `Failed to load: ${err.message}`;
  }
}

// Tabs
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSection(btn.dataset.section);
  });
});

// Search
searchBtn.addEventListener('click', async () => {
  const q = (searchQuery.value || '').trim();
  if(!q){ loadSection('bollywood'); return; }
  hide(gridError); hide(gridEmpty); show(gridLoading);
  try{
    const res = await fetchJSON(`${TMDB_BASE_URL}/search/movie`, { query:q, region:'IN' });
    hide(gridLoading); renderGrid(res.results);
  } catch(err){
    hide(gridLoading);
    gridError.hidden = false;
    gridError.textContent = `Search failed: ${err.message}`;
  }
});
clearBtn.addEventListener('click', () => {
  searchQuery.value = '';
  loadSection('bollywood');
});

// Get Started → load default section
getStartedBtn.addEventListener('click', () => {
  window.scrollTo({ top: document.querySelector('.search-wrap').offsetTop - 60, behavior:'smooth' });
  loadSection('bollywood');
});

// Init default view (show hero; no auto load)
updateAdminVisibility();
