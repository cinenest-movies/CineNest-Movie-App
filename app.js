// CineNest Professional Movie App - Enhanced
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let currentCategory = 'trending';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineNest Enhanced App Started');
});

// Get Started Function - Shows Main App
function getStarted() {
    document.querySelector('.professional-hero').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    loadAllSections();
}

// Login Function
function openLogin() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    
    if (username === 'admin' && password === 'admin123') {
        alert('🔐 Admin Login Successful!');
        getStarted();
    } else if (username && password) {
        alert('Welcome User! Enjoy streaming.');
        getStarted();
    } else {
        alert('Please login to access all features.');
    }
}

// Filter Categories
function filterCategory(category) {
    currentCategory = category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show selected section, hide others
    document.querySelectorAll('.movies-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    document.getElementById(category + 'Section').classList.add('active-section');
    
    // Load category specific movies
    loadCategoryMovies(category);
}

// Load All Movie Sections
async function loadAllSections() {
    try {
        await loadCategoryMovies('trending');
        await loadCategoryMovies('bollywood');
        await loadCategoryMovies('hollywood');
        await loadCategoryMovies('south');
        await loadCategoryMovies('hindi_dubbed');
        await loadCategoryMovies('action');
        await loadCategoryMovies('comedy');
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
    }
}

// Load Category Specific Movies
async function loadCategoryMovies(category) {
    try {
        let url = '';
        
        switch(category) {
            case 'trending':
                url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`;
                break;
            case 'bollywood':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc`;
                break;
            case 'hollywood':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc`;
                break;
            case 'south':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ta&sort_by=popularity.desc`;
                break;
            case 'hindi_dubbed':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc`;
                break;
            case 'action':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc`;
                break;
            case 'comedy':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`;
                break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), category + 'Movies');
        
    } catch (error) {
        console.error(`Error loading ${category} movies:`, error);
        document.getElementById(category + 'Movies').innerHTML = '<div class="loading">Unable to load movies</div>';
    }
}

// Display Movies in Grid
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="loading">No movies found in this category</div>';
        return;
    }

    container.innerHTML = movies.map(movie => {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Poster';
            
        return `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-rating">⭐ ${movie.vote_average}/10</p>
                    <button class="search-btn" onclick="event.stopPropagation(); addToFavorites(${movie.id})" style="padding: 10px 20px; margin-top: 10px;">
                        <i class="fas fa-heart"></i> Favorite
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Search Movies
async function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        loadAllSections();
        return;
    }

    try {
        document.querySelectorAll('.movies-grid').forEach(container => {
            container.innerHTML = '<div class="loading">Searching...</div>';
        });
        
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Show search results in trending section
        filterCategory('trending');
        displayMovies(data.results, 'trendingMovies');
        
    } catch (error) {
        console.error('Error searching movies:', error);
        document.getElementById('trendingMovies').innerHTML = '<div class="loading">Search failed. Please try again.</div>';
    }
}

// Enter Key Support
function handleSearch(event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
}

// Movie Details
function showMovieDetails(movieId) {
    const watchOptions = `
🎬 Movie Options Available:

🎥 YouTube: Watch FREE with ads
🅱 Netflix: Stream with subscription  
🔥 Hotstar: Indian content library
📦 Amazon: Rent or buy

💰 You earn commission on every watch!
    `;
    alert(watchOptions);
}

// Add to Favorites
function addToFavorites(movieId) {
    alert('❤️ Added to Favorites!\n\nMovie saved to your personal collection.');
}

// Error Handling
function showError() {
    const containers = [
        'trendingMovies', 'bollywoodMovies', 'hollywoodMovies',
        'southMovies', 'hindiDubbedMovies', 'actionMovies', 'comedyMovies'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Unable to load movies. Check internet connection.</div>';
        }
    });
}

// Initialize first category
function initializeApp() {
    filterCategory('trending');
}
