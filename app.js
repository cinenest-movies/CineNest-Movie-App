// CineNest Main JavaScript
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// DOM Elements
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadTrendingMovies();
    checkAuthStatus();
});

// Load Trending Movies from TMDb
async function loadTrendingMovies() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error loading movies:', error);
        document.getElementById('moviesGrid').innerHTML = '<div class="loading">Error loading movies. Please try again.</div>';
    }
}

// Display Movies in Grid
function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<div class="loading">No movies found.</div>';
        return;
    }

    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="showMovieDetails(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                 alt="${movie.title}" 
                 class="movie-poster"
                 onerror="this.src='https://via.placeholder.com/500x750/181818/FFFFFF?text=No+Image'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-rating">⭐ ${movie.vote_average}/10</p>
                <button class="btn-primary" onclick="event.stopPropagation(); addToFavorites(${movie.id})">
                    ❤️ Add to Favorites
                </button>
            </div>
        </div>
    `).join('');
}

// Search Movies
async function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        loadTrendingMovies();
        return;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

// Show Movie Details
function showMovieDetails(movieId) {
    alert(`Movie ID: ${movieId}\n\nThis will open detailed movie page with:\n- Full details\n- Cast information\n- Trailers\n- Where to watch options\n- YouTube links\n- Affiliate links`);
    
    // Yahan pe hum movie details page banayenge
    window.location.href = `movie-details.html?id=${movieId}`;
}

// Earning Platform Functions
function watchOnYouTube() {
    const earningOptions = `
    🎥 YOUTUBE EARNING OPTIONS:
    
    1. FREE Movies with Ads - You earn from ad revenue
    2. Movie Rentals - You get 30% commission
    3. YouTube Premium - Referral earnings
    4. Channel Memberships - Monthly income
    
    💰 Estimated Earnings: $5-50 per 1000 views
    `;
    alert(earningOptions);
}

function watchOnNetflix() {
    alert(`🎬 NETFLIX AFFILIATE PROGRAM
    
    • Earn 30% commission on new subscriptions
    • $15-45 per signup
    • Global affiliate program
    • Recurring commissions possible
    
    💵 Potential: $1000+ per month`);
}

function watchOnHotstar() {
    alert(`🔥 DISNEY+HOTSTAR REFERRAL
    
    • Indian market focus
    • High conversion rates
    • ₹200-500 per subscription
    • Seasonal offers boost earnings
    
    🇮🇳 Great for Indian users`);
}

function watchOnAmazon() {
    alert(`📦 AMAZON PRIME AFFILIATE
    
    • 5-10% commission on movie rentals
    • $2.50 per Prime signup
    • Worldwide program
    • 24-hour cookie tracking
    
    🛒 Multiple earning opportunities`);
}

// User Authentication
function openLogin() {
    const loginModal = `
    🔐 CINENEST LOGIN
    
    Email: _________
    Password: _________
    
    [Login] [Sign Up]
    
    Features:
    ✅ Save favorites
    ✅ Watch history
    ✅ Personal recommendations
    ✅ Earn money tracking
    `;
    alert(loginModal);
}

// Add to Favorites
function addToFavorites(movieId) {
    if (!currentUser) {
        alert('Please login to add favorites!');
        openLogin();
        return;
    }
    alert(`❤️ Movie added to favorites!\n\nYou can now:\n- Track your favorite movies\n- Get personalized recommendations\n- Earn rewards for watching`);
}

// Get Started Function
function getStarted() {
    alert('🚀 Welcome to CineNest!\n\nStart exploring thousands of movies and earn money while watching!');
}

// Learn More Function
function learnMore() {
    alert('📖 ABOUT CINENEST\n\n• Watch movies from multiple platforms\n• Earn money through affiliate programs\n• Free YouTube movies with ads\n• Personalized recommendations\n• No subscription required!');
}

// Check Auth Status
function checkAuthStatus() {
    // Yahan pe hum user login status check karenge
    console.log('Auth status checked');
}

// Enter Key Support for Search
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});
