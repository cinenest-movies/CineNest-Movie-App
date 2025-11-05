// CineNest - Ultimate Professional PWA Movie Platform - UPDATED
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Global Variables
let currentCategory = 'trending';
let currentUser = null;
let deferredPrompt = null;

// Exclusive Admin Credentials - Sirf tumhare liye
const ADMIN_CREDENTIALS = {
    email: 'mukeshchaupalabc78@gmail.com',
    password: 'Mukesh@819704'
};

// Indian Movies Focus Configuration
const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'ml', 'kn']; // Hindi, Tamil, Telugu, Malayalam, Kannada
const INDIAN_GENRES = {
    'bollywood': { language: 'hi', genres: '' },
    'south_indian': { language: 'ta,te,ml', genres: '' },
    'hindi_dubbed': { language: 'hi', genres: '' },
    'action': { language: 'hi,ta,te,ml', genres: '28' },
    'comedy': { language: 'hi,ta,te,ml', genres: '35' }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 CineNest PWA Initialized - Indian Movies Focus');
    initializeApp();
    setupPWA();
    checkAuthStatus();
});

// Core Initialization
function initializeApp() {
    setupEventListeners();
    initializeBackgrounds();
    checkInstallPrompt();
    loadUserPreferences();
    hideAdminButtonFromUsers(); // Admin button sirf admin ko dikhega
}

// PWA Setup
function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }

    // Listen for app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchOverlayInput')?.addEventListener('keypress', handleOverlaySearch);
    
    // Modal close on outside click
    document.addEventListener('click', handleOutsideClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Handle back button for movie details
    window.addEventListener('popstate', handleBrowserBack);
}

// Hide Admin Button from Normal Users
function hideAdminButtonFromUsers() {
    const adminLoginLinks = document.querySelectorAll('a[onclick*="showAdminLogin"], button[onclick*="showAdminLogin"]');
    const userData = localStorage.getItem('cinenest_user');
    
    if (!userData || JSON.parse(userData).email !== ADMIN_CREDENTIALS.email) {
        adminLoginLinks.forEach(element => {
            element.style.display = 'none';
        });
    }
}

// Initialize Background Images with Indian Movies
function initializeBackgrounds() {
    const indianMovieBackgrounds = [
        'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', // Bollywood
        'https://image.tmdb.org/t/p/w1280/8GnWDLn2AhnmkQ7hlQ9NJUYobSS.jpg', // South Indian
        'https://image.tmdb.org/t/p/w1280/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg', // Indian Cinema
        'https://image.tmdb.org/t/p/w1280/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg'  // Bollywood
    ];
    
    const randomBg = indianMovieBackgrounds[Math.floor(Math.random() * indianMovieBackgrounds.length)];
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.backgroundImage = 
            `linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(229, 9, 20, 0.4) 50%, rgba(10, 10, 10, 0.9) 100%), url('${randomBg}')`;
    }
}

// Install Prompt Functions
function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt && deferredPrompt) {
        installPrompt.classList.remove('hidden');
        installPrompt.classList.add('visible');
    }
}

function closeInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.add('hidden');
        installPrompt.classList.remove('visible');
    }
}

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('App installed');
            showNotification('✅ CineNest app installed successfully!', 'success');
        }
        deferredPrompt = null;
        closeInstallPrompt();
    }
}

// Search Functionality
function showSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchOverlayInput');
    if (searchOverlay && searchInput) {
        searchOverlay.classList.remove('hidden');
        searchOverlay.classList.add('visible');
        searchInput.focus();
    }
}

function hideSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay) {
        searchOverlay.classList.add('hidden');
        searchOverlay.classList.remove('visible');
    }
}

function handleOverlaySearch(event) {
    if (event.key === 'Enter') {
        searchMoviesOverlay();
    }
}

// Search Movies Functions
async function searchMoviesOverlay() {
    const searchInput = document.getElementById('searchOverlayInput');
    const query = searchInput?.value.trim();
    
    if (!query) {
        showNotification('Please enter search term', 'info');
        return;
    }

    await performSearch(query);
    hideSearch();
}

async function performSearch(query) {
    try {
        showNotification('🔍 Searching Indian movies...', 'info');
        
        // Show loading in trending section
        document.getElementById('trendingMovies').innerHTML = '<div class="loading">Searching Indian movies...</div>';

        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=IN&language=hi-IN`
        );
        const data = await response.json();
        
        // Filter Indian movies specifically
        const indianMovies = data.results.filter(movie => 
            INDIAN_LANGUAGES.includes(movie.original_language) ||
            (movie.original_language === 'en' && movie.title.toLowerCase().includes('india')) ||
            (movie.overview && movie.overview.toLowerCase().includes('india'))
        );
        
        // Show results in trending section
        filterCategory('trending');
        displayMovies(indianMovies.length > 0 ? indianMovies.slice(0, 12) : data.results.slice(0, 12), 'trendingMovies');
        
        if (indianMovies.length > 0) {
            showNotification(`✅ Found ${indianMovies.length} Indian movies`, 'success');
        } else {
            showNotification('❌ No Indian movies found. Showing all results.', 'info');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('❌ Search failed. Please try again.', 'error');
        document.getElementById('trendingMovies').innerHTML = 
            '<div class="loading">Search failed. Please check connection.</div>';
    }
}

// Get Started Function
function getStarted() {
    document.querySelector('.professional-hero')?.classList.add('hidden');
    document.getElementById('mainApp')?.classList.remove('hidden');
    loadAllSections();
    showNotification('🎬 Welcome to CineNest! Explore Indian cinema.', 'success');
}

// Authentication Functions
function openLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('visible');
}

function closeLogin() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginModal').classList.remove('visible');
}

function showAdminLogin() {
    closeLogin();
    document.getElementById('adminLoginModal').classList.remove('hidden');
    document.getElementById('adminLoginModal').classList.add('visible');
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('hidden');
    document.getElementById('adminLoginModal').classList.remove('visible');
}

// Google Sign-in Simulation
function googleSignIn() {
    showNotification('🚀 Google Sign-In would open here', 'info');
    // In real implementation, this would integrate with Google OAuth
    simulateUserLogin('user@gmail.com', 'Google User');
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        simulateUserLogin(email, email.split('@')[0]);
    } else {
        showNotification('Please fill all fields', 'error');
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        currentUser = { 
            name: 'Admin', 
            email: email, 
            type: 'admin',
            avatar: '👑'
        };
        saveUserData();
        showNotification('🔐 Admin login successful! Redirecting...', 'success');
        closeAdminLogin();
        
        // Redirect to admin panel after delay
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        
    } else {
        showNotification('❌ Invalid admin credentials', 'error');
    }
}

function simulateUserLogin(email, name) {
    currentUser = { 
        name: name, 
        email: email, 
        type: 'user',
        avatar: '👤'
    };
    saveUserData();
    showNotification(`🎉 Welcome ${name}!`, 'success');
    closeLogin();
    
    // If main app is not visible, show it
    if (document.getElementById('mainApp').classList.contains('hidden')) {
        getStarted();
    }
    
    // Show admin button if admin logged in
    if (email === ADMIN_CREDENTIALS.email) {
        hideAdminButtonFromUsers();
    }
}

function checkAuthStatus() {
    const userData = localStorage.getItem('cinenest_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('User already logged in:', currentUser.name);
        
        // Show admin button if admin
        if (currentUser.email === ADMIN_CREDENTIALS.email) {
            hideAdminButtonFromUsers();
        }
    }
}

function saveUserData() {
    localStorage.setItem('cinenest_user', JSON.stringify(currentUser));
}

function loadUserPreferences() {
    const preferences = localStorage.getItem('cinenest_preferences');
    if (preferences) {
        const prefs = JSON.parse(preferences);
        if (prefs.lastCategory) {
            filterCategory(prefs.lastCategory);
        }
    }
}

// Category Filtering
function filterCategory(category) {
    if (!currentUser && category !== 'trending') {
        showNotification('Please login to access all categories', 'info');
        openLogin();
        return;
    }
    
    currentCategory = category;
    
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
    
    // Show selected section, hide others
    document.querySelectorAll('.movies-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    const sectionId = category + 'Section';
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    // Load category specific movies
    loadCategoryMovies(category);
    
    // Save user preference
    saveUserPreference('lastCategory', category);
}

function saveUserPreference(key, value) {
    let preferences = JSON.parse(localStorage.getItem('cinenest_preferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('cinenest_preferences', JSON.stringify(preferences));
}

// Movie Loading Functions - INDIAN MOVIES FOCUS
async function loadAllSections() {
    try {
        showNotification('🎬 Loading Indian movies...', 'info');
        
        await Promise.all([
            loadCategoryMovies('trending'),
            loadCategoryMovies('bollywood'),
            loadCategoryMovies('south_indian'),
            loadCategoryMovies('hindi_dubbed'),
            loadCategoryMovies('action'),
            loadCategoryMovies('comedy')
        ]);
        
        showNotification('✅ Indian movies loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
        showNotification('❌ Failed to load movies', 'error');
    }
}

async function loadCategoryMovies(category) {
    try {
        let url = '';
        
        switch(category) {
            case 'trending':
                url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&region=IN&language=hi-IN`;
                break;
            case 'bollywood':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&region=IN&language=hi-IN`;
                break;
            case 'south_indian':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ta,te,ml&sort_by=popularity.desc&region=IN&language=hi-IN`;
                break;
            case 'hindi_dubbed':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&region=IN&language=hi-IN`;
                break;
            case 'action':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&with_original_language=hi,ta,te,ml&sort_by=popularity.desc&region=IN&language=hi-IN`;
                break;
            case 'comedy':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&with_original_language=hi,ta,te,ml&sort_by=popularity.desc&region=IN&language=hi-IN`;
                break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Ensure we have movies
        if (!data.results || data.results.length === 0) {
            // Fallback to popular Indian movies
            const fallbackResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=IN&language=hi-IN`);
            const fallbackData = await fallbackResponse.json();
            displayMovies(fallbackData.results.slice(0, 12), category + 'Movies');
        } else {
            displayMovies(data.results.slice(0, 12), category + 'Movies');
        }
        
    } catch (error) {
        console.error(`Error loading ${category} movies:`, error);
        document.getElementById(category + 'Movies').innerHTML = 
            '<div class="loading">Unable to load Indian movies. Please check your internet connection.</div>';
    }
}

// Display Movies in Grid - Enhanced for Indian Movies
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="loading">No Indian movies found in this category</div>';
        return;
    }

    container.innerHTML = movies.map(movie => {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Poster';
            
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
        const language = getLanguageName(movie.original_language);
        
        return `
            <div class="movie-card" onclick="openMovieDetails(${movie.id})">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <p class="movie-rating">⭐ ${rating}/10</p>
                        <span class="movie-year">${year}</span>
                        <span class="movie-language">${language}</span>
                    </div>
                    <button class="watch-btn" onclick="event.stopPropagation(); openMovieDetails(${movie.id})">
                        <i class="fas fa-play"></i> Watch Options
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getLanguageName(code) {
    const languages = {
        'hi': 'Hindi',
        'en': 'English', 
        'ta': 'Tamil',
        'te': 'Telugu',
        'ml': 'Malayalam',
        'kn': 'Kannada',
        'bn': 'Bengali',
        'mr': 'Marathi'
    };
    return languages[code] || code.toUpperCase();
}

// Movie Details Functions - OPEN NEW PAGE
function openMovieDetails(movieId) {
    if (!currentUser) {
        showNotification('Please login to view movie details', 'info');
        openLogin();
        return;
    }
    
    // Redirect to movie details page
    window.location.href = `movie-details.html?id=${movieId}`;
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Event Handlers
function handleOutsideClick(event) {
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal.visible');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('visible');
            modal.classList.add('hidden');
        }
    });
    
    // Close search overlay when clicking outside
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay && searchOverlay.classList.contains('visible') && event.target === searchOverlay) {
        hideSearch();
    }
}

function handleKeyboardShortcuts(event) {
    // ESC key to close modals
    if (event.key === 'Escape') {
        const visibleModals = document.querySelectorAll('.modal.visible');
        if (visibleModals.length > 0) {
            visibleModals.forEach(modal => {
                modal.classList.remove('visible');
                modal.classList.add('hidden');
            });
        } else {
            hideSearch();
        }
    }
    
    // Ctrl+K for search
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        showSearch();
    }
}

function handleBrowserBack(event) {
    // Handle browser back button for movie details
    if (window.location.pathname.includes('movie-details.html')) {
        event.preventDefault();
        window.history.go(-1);
    }
}

// Error Handling
function showError() {
    const sections = document.querySelectorAll('.movies-grid');
    sections.forEach(section => {
        if (section.innerHTML.includes('loading')) {
            section.innerHTML = '<div class="loading">Unable to load movies. Please try again later.</div>';
        }
    });
}

// Legal Pages Functions
function showPrivacyPolicy() {
    showNotification('📄 Privacy Policy page would open here', 'info');
}

function showTerms() {
    showNotification('📄 Terms of Service page would open here', 'info');
}

function showDisclaimer() {
    showNotification('📄 Disclaimer page would open here', 'info');
}

function showCookiePolicy() {
    showNotification('🍪 Cookie Policy page would open here', 'info');
}

// Analytics Tracking
function trackUserInterest(movieId, action) {
    let analytics = JSON.parse(localStorage.getItem('cinenest_analytics') || '{}');
    if (!analytics.userInterests) {
        analytics.userInterests = [];
    }
    analytics.userInterests.push({
        movieId,
        action,
        timestamp: new Date().toISOString(),
        user: currentUser?.email || 'anonymous'
    });
    localStorage.setItem('cinenest_analytics', JSON.stringify(analytics));
}

// Export functions for global access
window.openMovieDetails = openMovieDetails;
window.showSearch = showSearch;
window.hideSearch = hideSearch;
window.searchMoviesOverlay = searchMoviesOverlay;
window.handleOverlaySearch = handleOverlaySearch;
window.getStarted = getStarted;
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.showAdminLogin = showAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.googleSignIn = googleSignIn;
window.handleLogin = handleLogin;
window.handleAdminLogin = handleAdminLogin;
window.filterCategory = filterCategory;
window.installApp = installApp;
window.closeInstallPrompt = closeInstallPrompt;
window.showPrivacyPolicy = showPrivacyPolicy;
window.showTerms = showTerms;
window.showDisclaimer = showDisclaimer;
window.showCookiePolicy = showCookiePolicy;

console.log('🎬 CineNest App.js Loaded Successfully!');
