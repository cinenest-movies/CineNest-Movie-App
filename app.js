// CineNest Professional Movie App
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineNest Professional App Started');
    // App starts with landing page, main app hidden
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
        // Show admin section
        document.querySelector('.admin-section').classList.remove('hidden');
        getStarted();
    } else if (username && password) {
        alert('Welcome User! Enjoy streaming.');
        getStarted();
    } else {
        alert('Please login to access all features.');
    }
}

// Load All Movie Sections
async function loadAllSections() {
    try {
        // Load Trending Movies
        const trendingResponse = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const trendingData = await trendingResponse.json();
        displayMovies(trendingData.results.slice(0, 8), 'trendingMovies');

        // Load Bollywood Movies (Hindi)
        const bollywoodResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc`);
        const bollywoodData = await bollywoodResponse.json();
        displayMovies(bollywoodData.results.slice(0, 8), 'bollywoodMovies');

        // Load Hollywood Movies
        const hollywoodResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc`);
        const hollywoodData = await hollywoodResponse.json();
        displayMovies(hollywoodData.results.slice(0, 8), 'hollywoodMovies');

    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
    }
}

// Display Movies in Grid
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="loading">No movies found</div>';
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
                    <button class="btn-primary" onclick="event.stopPropagation(); addToFavorites(${movie.id})">
                        ❤️ Favorite
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
        document.getElementById('trendingMovies').innerHTML = '<div class="loading">Searching...</div>';
        document.getElementById('bollywoodMovies').innerHTML = '';
        document.getElementById('hollywoodMovies').innerHTML = '';
        
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        displayMovies(data.results, 'trendingMovies');
        document.getElementById('trending').scrollIntoView({ behavior: 'smooth' });
        
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
    alert(`🎬 Movie ID: ${movieId}\n\nFeatures Coming Soon:\n• Full Movie Details\n• Cast & Crew\n• Trailers\n• Streaming Options\n• Where to Watch`);
}

// Add to Favorites
function addToFavorites(movieId) {
    alert('❤️ Added to Favorites!\n\nMovie saved to your personal collection.');
}

// Admin Panel
function openAdminPanel() {
    alert('🔧 Admin Panel\n\nSecret Features:\n• Movie Management\n• User Analytics\n• Revenue Tracking\n• Content Moderation\n• Earning Reports');
}

// Error Handling
function showError() {
    const containers = ['trendingMovies', 'bollywoodMovies', 'hollywoodMovies'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Unable to load movies. Check internet connection.</div>';
        }
    });
}

// Background Images for Variety
const professionalBackgrounds = [
    'https://image.tmdb.org/t/p/w1280/8GnWDLn2AhnmkQ7hlQ9NJUYobSS.jpg',
    'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    'https://image.tmdb.org/t/p/w1280/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg'
];

function rotateBackground() {
    const randomBg = professionalBackgrounds[Math.floor(Math.random() * professionalBackgrounds.length)];
    document.querySelector('.professional-hero').style.backgroundImage = `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%), url('${randomBg}')`;
    document.querySelector('.professional-hero').style.backgroundSize = 'cover';
    document.querySelector('.professional-hero').style.backgroundPosition = 'center';
}

// Initialize background on load
window.addEventListener('load', rotateBackground);
