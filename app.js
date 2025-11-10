// ====== CONFIG ======
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ADMIN_EMAIL = 'mukeshkumarabc78@gmail.com';

// ====== STATE ======
let currentUserEmail = null;

// ====== DOM ======
const sectionTitle = document.getElementById('sectionTitle');
const grid = document.getElementById('grid');
const gridLoading = document.getElementById('gridLoading');
const gridError = document.getElementById('gridError');
const gridEmpty = document.getElementById('gridEmpty');

const searchQuery = document.getElementById('searchQuery');
const genreSelect = document.getElementById('genreSelect');
const yearInput = document.getElementById('yearInput');
const languageSelect = document.getElementById('languageSelect');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

const adminBtn = document.getElementById('adminBtn');
const loginBtn = document.getElementById('loginBtn');

// ====== HELPERS ======
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }
function setText(el, t) { el.textContent = t; }
function yearOf(d) { return d ? new Date(d).getFullYear() : 'N/A'; }
function imgUrl(path) { return path ? `https://image.tmdb.org/t/p/w500${path}` : ''; }

// ====== ADMIN VISIBILITY ======
function updateAdminVisibility() {
  if (currentUserEmail && currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    adminBtn.hidden = false;
  } else {
    adminBtn.hidden = true;
  }
}

loginBtn.addEventListener('click', () => {
  const email = prompt('Enter your email:');
  if (email) {
    currentUserEmail = email.trim();
    updateAdminVisibility();
    alert(`Logged in as ${currentUserEmail}`);
  }
});

// ====== API CALL ======
async function fetchMovies(endpoint, params = {}) {
  const url = new URL(endpoint);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ====== RENDER GRID ======
function renderGrid(items) {
  grid.innerHTML = '';
  if (!items || items.length === 0) {
    hide(gridLoading); hide(gridError); show(gridEmpty);
    return;
  }
  hide(gridEmpty);
  items.forEach((m) => {
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
    meta.textContent = `Rating: ${m.vote_average?.toFixed?.(1) ?? 'N/A'} • Year: ${yearOf(m.release_date)}`;

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener('click', () => openDetails(m.id));
    grid.appendChild(card);
  });
}

// ====== SECTION TITLE ======
function setSectionTitle(key) {
  const map = {
    trending: 'Trending',
    popular: 'Popular',
    now_playing: 'Now Playing',
    bollywood: 'Bollywood',
    hindi_dubbed: 'Hindi Dubbed (South + Hollywood)',
    thriller: 'Thriller (Hindi)',
    horror: 'Horror (Hindi)'
  };
  sectionTitle.textContent = map[key] || 'Movies';
}

// ====== LOAD SECTION ======
async function loadSection(key) {
  setSectionTitle(key);
  hide(gridError); hide(gridEmpty); show(gridLoading);
  try {
    let data;
    if (key === 'trending') {
      data = await fetchMovies(`${TMDB_BASE_URL}/trending/movie/day`, { region: 'IN' });
    } else if (key === 'popular') {
      data = await fetchMovies(`${TMDB_BASE_URL}/movie/popular`, { region: 'IN' });
    } else if (key === 'now_playing') {
      data = await fetchMovies(`${TMDB_BASE_URL}/movie/now_playing`, { region: 'IN' });
    } else if (key === 'bollywood') {
      data = await fetchMovies(`${TMDB_BASE_URL}/discover/movie`, {
        with_original_language: 'hi',
        sort_by: 'popularity.desc',
        region: 'IN'
      });
    } else if (key === 'thriller') {
      data = await fetchMovies(`${TMDB_BASE_URL}/discover/movie`, {
        with_original_language: 'hi',
        with_genres: '53',
        sort_by: 'popularity.desc',
        region: 'IN'
      });
    } else if (key === 'horror') {
      data = await fetchMovies(`${TMDB_BASE_URL}/discover/movie`, {
        with_original_language: 'hi',
        with_genres: '27',
        sort_by: 'popularity.desc',
        region: 'IN'
      });
    } else if (key === 'hindi_dubbed') {
      const [ta, te, kn, ml, en] = await Promise.all([
        fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { with_original_language: 'ta', region: 'IN' }),
        fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { with_original_language: 'te', region: 'IN' }),
        fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { with_original_language: 'kn', region: 'IN' }),
        fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { with_original_language: 'ml', region: 'IN' }),
        fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { with_original_language: 'en', region: 'IN' })
      ]);
      const combined = [...ta.results, ...te.results, ...kn.results, ...ml.results, ...en.results];
      data = { results: combined.slice(0, 40) };
    } else {
      data = await fetchMovies(`${TMDB_BASE_URL}/movie/popular`, { region: 'IN' });
    }

    hide(gridLoading);
    renderGrid(data.results);
  } catch (err) {
    hide(gridLoading);
    setText(gridError, `Failed to load: ${err.message}`);
    show(gridError);
  }
}

// ====== SEARCH ======
searchBtn.addEventListener('click', async () => {
  const q = searchQuery.value.trim();
  const genre = genreSelect.value.trim();
  const year = yearInput.value.trim();
  const lang = languageSelect.value.trim();

  hide(gridError); hide(gridEmpty); show(gridLoading);
  try {
    let baseResults = [];
    if (q) {
      const res = await fetchMovies(`${TMDB_BASE_URL}/search/movie`, { query: q, region: 'IN' });
      baseResults = res.results || [];
    } else {
      const res = await fetchMovies(`${TMDB_BASE_URL}/discover/movie`, { sort_by: 'popularity.desc', region: 'IN' });
      baseResults = res.results || [];
    }

    let filtered = baseResults;
    if (genre) filtered = filtered.filter(m => m.genre_ids.includes(Number(genre)));
    if (year) filtered = filtered.filter(m => (m.release_date || '').startsWith(year));
    if (lang) filtered = filtered.filter(m => m.original_language === lang);

    hide(gridLoading);
    renderGrid(filtered);
  } catch (err) {
    hide(gridLoading);
    setText(gridError, `Search failed: ${err.message}`);
    show(gridError);
  }
});

clearBtn.addEventListener('click', () => {
  searchQuery.value = '';
  genreSelect.value = '';
  yearInput.value = '';
  languageSelect.value = '';
  loadSection('trending');
});

// ====== NAVIGATION ======
document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => loadSection(btn.dataset.section))
);

// ====== INIT ======
updateAdminVisibility();
loadSection('trending');
