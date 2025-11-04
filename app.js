// CineNest Professional Movie App - Ultra Enhanced
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let currentCategory = 'trending';
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineNest Ultra Enhanced App Started');
    initializeBackgrounds();
});

// Initialize Background Images
function initializeBackgrounds() {
    const backgrounds = [
        'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        'https://image.tmdb.org/t/p/w1280/8GnWDLn2AhnmkQ7hlQ9NJUYobSS.jpg',
        'https://image.tmdb.org/t/p/w1280/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg',
        'https://image.tmdb.org/t/p/w1280/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg',
        'https://image.tmdb.org/t/p/w1280/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg'
    ];
    
    // Set random background
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.querySelector('.hero-background').style.backgroundImage = 
        `linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(229, 9, 20, 0.3) 50%, rgba(10, 10, 10, 0.9) 100%), url('${randomBg}')`;
}

// Get Started Function - Shows Main App
function getStarted() {
    document.querySelector('.professional-hero').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    loadAllSections();
}

// Professional Login Functions
function openLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('visible');
}

function closeLogin() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginModal').classList.remove('visible');
}

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email') || document.querySelector('.login-form input[type="email"]').value;
    const password = formData.get('password') || document.querySelector('.login-form input[type="password"]').value;
    
    // Simple authentication
    if (email && password) {
        if (email === 'admin@cinenest.com' && password === 'admin123') {
            currentUser = { name: 'Admin', email: email, type: 'admin' };
            showNotification('🔐 Admin login successful!', 'success');
            closeLogin();
            getStarted();
        } else {
            currentUser = { name: 'User', email: email, type: 'user' };
            showNotification('🎉 Welcome to CineNest!', 'success');
            closeLogin();
            getStarted();
        }
    } else {
        showNotification('Please fill all fields', 'error');
    }
}

function showSignup() {
    showNotification('Signup feature coming soon!', 'info');
}

// Filter Categories
function filterCategory(category) {
    currentCategory = category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
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
        showNotification('🎬 Loading movies...', 'info');
        
        await Promise.all([
            loadCategoryMovies('trending'),
            loadCategoryMovies('bollywood'),
            loadCategoryMovies('hollywood'),
            loadCategoryMovies('south'),
            loadCategoryMovies('hindi_dubbed'),
            loadCategoryMovies('action'),
            loadCategoryMovies('comedy'),
            loadCategoryMovies('thriller'),
            loadCategoryMovies('horror')
        ]);
        
        showNotification('✅ Movies loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
        showNotification('❌ Failed to load movies', 'error');
    }
}

// Load Category Specific Movies
async function loadCategoryMovies(category) {
    try {
        let url = '';
        let params = '';
        
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
            case 'thriller':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=53&sort_by=popularity.desc`;
                break;
            case 'horror':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc`;
                break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Ensure we have movies, if not try alternative
        if (!data.results || data.results.length === 0) {
            // Fallback to popular movies
            const fallbackResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
            const fallbackData = await fallbackResponse.json();
            displayMovies(fallbackData.results.slice(0, 12), category + 'Movies');
        } else {
            displayMovies(data.results.slice(0, 12), category + 'Movies');
        }
        
    } catch (error) {
        console.error(`Error loading ${category} movies:`, error);
        document.getElementById(category + 'Movies').innerHTML = 
            '<div class="loading">Unable to load movies. Please check your internet connection.</div>';
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
            
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
        
        return `
            <div class="movie-card" onclick="showMovieDetails(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <p class="movie-rating">⭐ ${rating}/10</p>
                        <span style="color: #ccc; font-size: 14px;">${year}</span>
                    </div>
                    <button class="search-btn" onclick="event.stopPropagation(); addToFavorites(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')" style="padding: 12px 20px; margin-top: 10px; width: 100%;">
                        <i class="fas fa-heart"></i> Add to Favorites
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
        showNotification('Please enter search term', 'info');
        return;
    }

    try {
        showNotification('🔍 Searching movies...', 'info');
        
        document.querySelectorAll('.movies-grid').forEach(container => {
            container.innerHTML = '<div class="loading">Searching...</div>';
        });
        
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Show search results in trending section
        filterCategory('trending');
        displayMovies(data.results, 'trendingMovies');
        
        if (data.results.length > 0) {
            showNotification(`✅ Found ${data.results.length} movies`, 'success');
        } else {
            showNotification('❌ No movies found', 'error');
        }
        
    } catch (error) {
        console.error('Error searching movies:', error);
        document.getElementById('trendingMovies').innerHTML = '<div class="loading">Search failed. Please try again.</div>';
        showNotification('❌ Search failed', 'error');
    }
}

// Enter Key Support
function handleSearch(event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
}

// Movie Details with Streaming Options
function showMovieDetails(movieId, movieTitle) {
    const streamingOptions = `
🎬 **${movieTitle}**

**Available on:**

🎥 **YouTube Movies**
• Watch FREE with ads
• Earn rewards points
• No subscription needed

🅱 **Netflix** 
• Stream with subscription
• 4K Ultra HD available
• Download for offline

🔥 **Disney+ Hotstar**
• Indian content library
• Affordable plans
• Live sports included

📦 **Amazon Prime Video**
• Rent or buy options
• Prime membership benefits
• X-Ray feature

💰 **Your Earnings:**
• YouTube: $2-10 per 1000 views
• Netflix: 30% commission on signups
• Hotstar: ₹200-500 per subscription
• Amazon: 5-10% on rentals

🎯 **Recommendation:**
Start with YouTube for free viewing and earn from ads!

    `;
    
    if (confirm(`Show streaming options for "${movieTitle}"?`)) {
        alert(streamingOptions);
    }
}

// Add to Favorites
function addToFavorites(movieId, movieTitle) {
    if (!currentUser) {
        showNotification('Please login to add favorites', 'info');
        openLogin();
        return;
    }
    
    // Simulate adding to favorites
    let favorites = JSON.parse(localStorage.getItem('cinenest_favorites') || '[]');
    if (!favorites.find(fav => fav.id === movieId)) {
        favorites.push({ id: movieId, title: movieTitle, addedAt: new Date().toISOString() });
        localStorage.setItem('cinenest_favorites', JSON.stringify(favorites));
        showNotification(`❤️ "${movieTitle}" added to favorites!`, 'success');
    } else {
        showNotification('⭐ Already in favorites!', 'info');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1a1a1a;
                border-left: 4px solid #e50914;
                border-radius: 10px;
                padding: 15px 20px;
                color: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            .notification-success { border-color: #00ff88; }
            .notification-error { border-color: #ff4444; }
            .notification-info { border-color: #4488ff; }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
            }
            .notification-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 16px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Error Handling
function showError() {
    const containers = [
        'trendingMovies', 'bollywoodMovies', 'hollywoodMovies',
        'southMovies', 'hindiDubbedMovies', 'actionMovies', 
        'comedyMovies', 'thrillerMovies', 'horrorMovies'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Unable to load movies. Please check your internet connection and try again.</div>';
        }
    });
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLogin();
    }
});

// Initialize first category
function initializeApp() {
    filterCategory('trending');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modal
    if (event.key === 'Escape') {
        closeLogin();
    }
    // Ctrl+K for search focus
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

console.log('CineNest Ultra Enhanced App Loaded Successfully!');
