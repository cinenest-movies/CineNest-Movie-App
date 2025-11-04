// CineNest - Ultimate Professional PWA Movie Platform
const TMDB_API_KEY = '30b603a755d767e948c61a7ae751fbb3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Global Variables
let currentCategory = 'trending';
let currentUser = null;
let deferredPrompt = null;
let adminEmail = 'admin@cinenest.com'; // Tumhara email yahan dalo
let adminPassword = 'admin123'; // Tumhara password

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 CineNest PWA Initialized');
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
    document.getElementById('searchInput')?.addEventListener('keypress', handleSearch);
    document.getElementById('searchOverlayInput')?.addEventListener('keypress', handleOverlaySearch);
    
    // Modal close on outside click
    document.addEventListener('click', handleOutsideClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Initialize Background Images
function initializeBackgrounds() {
    const indianMovieBackgrounds = [
        'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        'https://image.tmdb.org/t/p/w1280/8GnWDLn2AhnmkQ7hlQ9NJUYobSS.jpg',
        'https://image.tmdb.org/t/p/w1280/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg',
        'https://image.tmdb.org/t/p/w1280/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg'
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
    }
}

function closeInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.add('hidden');
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

function handleSearch(event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
}

function handleOverlaySearch(event) {
    if (event.key === 'Enter') {
        searchMoviesOverlay();
    }
}

// Search Movies Functions
async function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput?.value.trim();
    
    if (!query) {
        showNotification('Please enter search term', 'info');
        return;
    }

    await performSearch(query);
}

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
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=IN&with_original_language=hi,en,ta,te,ml`
        );
        const data = await response.json();
        
        // Filter Indian movies
        const indianMovies = data.results.filter(movie => 
            movie.original_language === 'hi' || 
            movie.original_language === 'ta' ||
            movie.original_language === 'te' ||
            movie.original_language === 'ml' ||
            movie.original_language === 'en' // Including English for Hollywood dubbed
        );
        
        // Show results in trending section
        filterCategory('trending');
        displayMovies(indianMovies.length > 0 ? indianMovies : data.results, 'trendingMovies');
        
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
    
    if (email === adminEmail && password === adminPassword) {
        currentUser = { 
            name: 'Admin', 
            email: email, 
            type: 'admin',
            avatar: '👑'
        };
        saveUserData();
        showNotification('🔐 Admin login successful!', 'success');
        closeAdminLogin();
        openAdminPanel();
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
}

function checkAuthStatus() {
    const userData = localStorage.getItem('cinenest_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('User already logged in:', currentUser.name);
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

// Movie Loading Functions
async function loadAllSections() {
    try {
        showNotification('🎬 Loading Indian movies...', 'info');
        
        await Promise.all([
            loadCategoryMovies('trending'),
            loadCategoryMovies('bollywood'),
            loadCategoryMovies('south_indian'),
            loadCategoryMovies('hindi_dubbed'),
            loadCategoryMovies('hollywood'),
            loadCategoryMovies('action'),
            loadCategoryMovies('comedy')
        ]);
        
        showNotification('✅ Movies loaded successfully!', 'success');
        
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
                url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&region=IN`;
                break;
            case 'bollywood':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&region=IN`;
                break;
            case 'south_indian':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ta,te,ml&sort_by=popularity.desc&region=IN`;
                break;
            case 'hindi_dubbed':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&region=IN`;
                break;
            case 'hollywood':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc&region=IN`;
                break;
            case 'action':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc&region=IN`;
                break;
            case 'comedy':
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc&region=IN`;
                break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Ensure we have movies
        if (!data.results || data.results.length === 0) {
            // Fallback to popular movies
            const fallbackResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=IN`);
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
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 5px;">
                        <p class="movie-rating">⭐ ${rating}/10</p>
                        <span style="color: #ccc; font-size: 12px;">${year}</span>
                        <span style="color: #e50914; font-size: 12px; font-weight: 600;">${language}</span>
                    </div>
                    <button class="search-btn" onclick="event.stopPropagation(); showMovieDetails(${movie.id})" style="padding: 12px 20px; margin-top: 10px; width: 100%;">
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
        'kn': 'Kannada'
    };
    return languages[code] || code;
}

// Movie Details Functions
function showMovieDetails(movieId) {
    if (!currentUser) {
        showNotification('Please login to view movie details', 'info');
        openLogin();
        return;
    }
    
    // In real implementation, this would fetch detailed movie info
    const movieTitle = `Movie #${movieId}`;
    showMovieDetailsModal(movieId, movieTitle);
}

function showMovieDetailsModal(movieId, movieTitle) {
    const streamingOptions = `
🎬 **${movieTitle} - Streaming Options**

**Available on Indian Platforms:**

🎥 **YouTube Movies**
• Watch FREE with ads
• Earn ₹2-10 per 1000 views
• No subscription needed
• Direct link: youtube.com/movies

🔥 **Disney+ Hotstar** 
• Bollywood & South Indian library
• Subscription: ₹299-1499/year
• Commission: ₹200-500 per signup
• Official partner

📦 **Amazon Prime Video**
• Rent: ₹89-249 per movie
• Buy: ₹299-699 per movie
• Commission: 5-10% on rentals
• Prime membership benefits

🅱 **Netflix**
• Premium streaming
• Subscription plans available
• Partnership program
• 4K Ultra HD content

💰 **Your Potential Earnings:**
• Ad revenue: ₹5,000-50,000/month
• Affiliate commissions: ₹10,000-1,00,000/month
• Sponsorship: ₹50,000-5,00,000/month

🎯 **Recommendation:**
Start with YouTube for maximum earning potential!

    `;
    
    if (confirm(`Show streaming options for "${movieTitle}"?\n\nYou'll see available platforms and earning opportunities.`)) {
        alert(streamingOptions);
        
        // Track user interest for analytics
        trackUserInterest(movieId, 'details_viewed');
    }
}

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

// Admin Panel Functions
function openAdminPanel() {
    const adminPanelHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 4000; padding: 20px; color: white; overflow-y: auto;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 30px;">
                <h1 style="color: #e50914;">🔧 CineNest Admin Panel</h1>
                <button onclick="closeAdminPanel()" style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #e50914;">
                    <h3>📊 Platform Statistics</h3>
                    <p>Total Users: 1,234</p>
                    <p>Active Today: 567</p>
                    <p>Total Movies: 10,000+</p>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #00ff88;">
                    <h3>💰 Revenue Dashboard</h3>
                    <p>Today: ₹2,567</p>
                    <p>This Month: ₹45,678</p>
                    <p>Total: ₹2,34,567</p>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #4488ff;">
                    <h3>🎬 Content Management</h3>
                    <button style="background: #e50914; color: white; border: none; padding: 10px; margin: 5px; border-radius: 5px; cursor: pointer; width: 100%;">Add New Movie</button>
                    <button style="background: #4488ff; color: white; border: none; padding: 10px; margin: 5px; border-radius: 5px; cursor: pointer; width: 100%;">Manage Users</button>
                </div>
            </div>
            
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>📈 Earning Sources</h3>
                <p>YouTube Ads: ₹45,670</p>
                <p>Hotstar Referrals: ₹34,567</p>
                <p>Amazon Affiliate: ₹23,456</p>
                <p>Netflix Partnerships: ₹19,763</p>
            </div>
            
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px;">
                <h3>⚙️ Quick Actions</h3>
                <button style="background: #e50914; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">View Analytics</button>
                <button style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">Manage Ads</button>
                <button style="background: #00ff88; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer;">User Reports</button>
            </div>
        </div>
    `;
    
    const adminDiv = document.createElement('div');
    adminDiv.innerHTML = adminPanelHTML;
    adminDiv.id = 'adminPanel';
    document.body.appendChild(adminDiv);
}

function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.remove();
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

// Utility Functions
function handleOutsideClick(event) {
    // Close modals when clicking outside
    const loginModal = document.getElementById('loginModal');
    const adminModal = document.getElementById('adminLoginModal');
    const searchOverlay = document.getElementById('searchOverlay');
    
    if (loginModal?.classList.contains('visible') && event.target === loginModal) {
        closeLogin();
    }
    if (adminModal?.classList.contains('visible') && event.target === adminModal) {
        closeAdminLogin();
    }
    if (searchOverlay?.classList.contains('visible') && event.target === searchOverlay) {
        hideSearch();
    }
}

function handleKeyboardShortcuts(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        closeLogin();
        closeAdminLogin();
        hideSearch();
        closeAdminPanel();
    }
    // Ctrl+K for search
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        showSearch();
    }
}

function checkInstallPrompt() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is running in standalone mode');
    }
}

function showSignup() {
    showNotification('Signup feature coming soon! Use Google Sign-In for now.', 'info');
}

function showPrivacyPolicy() {
    alert(`🔒 Privacy Policy

At CineNest, we value your privacy. We collect:
• Basic profile information
• Movie preferences for recommendations
• Watch history for personalization
• No sensitive data is stored

Your data is secure with us!`);
}

function showTerms() {
    alert(`📄 Terms of Service

By using CineNest, you agree to:
• Use the platform for personal entertainment
• Respect copyright laws
• Not misuse the affiliate system
• Follow community guidelines

Happy streaming!`);
}

function showDisclaimer() {
    alert(`⚠️ Disclaimer

CineNest is a movie discovery platform:
• We don't host any movies
• We provide links to legal streaming platforms
• Users must have valid subscriptions
• We earn through affiliate partnerships

Stream responsibly!`);
}

function showCookiePolicy() {
    alert(`🍪 Cookie Policy

We use cookies to:
• Remember your login session
• Save your movie preferences
• Improve user experience
• Analyze platform usage

You can disable cookies in browser settings.`);
}

function showError() {
    const containers = [
        'trendingMovies', 'bollywoodMovies', 'southIndianMovies',
        'hindiDubbedMovies', 'hollywoodMovies', 'actionMovies', 'comedyMovies'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Unable to load Indian movies. Please check your internet connection and try again.</div>';
        }
    });
}

// Initialize first category
function initializeAppCategory() {
    filterCategory('trending');
}

console.log('🎬 CineNest Ultra Professional PWA Loaded Successfully!');
