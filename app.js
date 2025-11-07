// CineNest - Ultimate Professional PWA Movie Platform - COMPLETELY UPDATED
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
const INDIAN_CONFIG = {
    languages: ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr'],
    regions: ['IN'],
    genres: {
        'bollywood': '10751,18,35,10402',
        'south_indian': '28,53,80,9648', 
        'hindi_dubbed': '12,14,16,10749',
        'action': '28',
        'comedy': '35'
    }
};

// Popular Indian Movies Fallback Data
const FALLBACK_MOVIES = {
    trending: [
        { id: 1, title: 'Animal', vote_average: 8.2, release_date: '2023-12-01', original_language: 'hi', overview: 'A father and son relationship story with intense drama and action.' },
        { id: 2, title: 'Salaar', vote_average: 8.1, release_date: '2023-12-22', original_language: 'te', overview: 'A gang leader tries to keep a promise made to his dying friend.' },
        { id: 3, title: 'Jawan', vote_average: 7.9, release_date: '2023-09-07', original_language: 'hi', overview: 'A man fights against corruption in the system.' },
        { id: 4, title: 'Leo', vote_average: 7.8, release_date: '2023-10-19', original_language: 'ta', overview: 'A cafe owner faces threats from gangsters.' },
        { id: 5, title: 'Gadar 2', vote_average: 7.5, release_date: '2023-08-11', original_language: 'hi', overview: 'Sequel to the iconic Gadar movie.' },
        { id: 6, title: 'OMG 2', vote_average: 7.6, release_date: '2023-08-11', original_language: 'hi', overview: 'Sequel to OMG - Oh My God addressing sex education.' }
    ],
    bollywood: [
        { id: 7, title: 'Pathaan', vote_average: 7.5, release_date: '2023-01-25', original_language: 'hi', overview: 'Spy thriller starring Shah Rukh Khan.' },
        { id: 8, title: 'Rocky Aur Rani', vote_average: 7.0, release_date: '2023-07-28', original_language: 'hi', overview: 'Family drama and romance story.' },
        { id: 9, title: 'Zara Hatke Zara Bachke', vote_average: 6.8, release_date: '2023-06-02', original_language: 'hi', overview: 'A married couple faces relationship challenges.' },
        { id: 10, title: 'Bholaa', vote_average: 6.5, release_date: '2023-03-30', original_language: 'hi', overview: 'Action thriller starring Ajay Devgn.' },
        { id: 11, title: 'Tu Jhoothi Main Makkaar', vote_average: 6.7, release_date: '2023-03-08', original_language: 'hi', overview: 'Romantic comedy about modern relationships.' },
        { id: 12, title: 'Selfiee', vote_average: 6.2, release_date: '2023-02-24', original_language: 'hi', overview: 'Comedy drama about a fan and superstar.' }
    ],
    south_indian: [
        { id: 13, title: 'Vikram', vote_average: 8.5, release_date: '2022-06-03', original_language: 'ta', overview: 'Action thriller starring Kamal Haasan.' },
        { id: 14, title: 'KGF Chapter 2', vote_average: 8.3, release_date: '2022-04-14', original_language: 'kn', overview: 'Sequel to the blockbuster KGF movie.' },
        { id: 15, title: 'RRR', vote_average: 8.0, release_date: '2022-03-25', original_language: 'te', overview: 'Epic action drama about Indian revolutionaries.' },
        { id: 16, title: 'Kantara', vote_average: 8.7, release_date: '2022-09-30', original_language: 'kn', overview: 'Mystical thriller about traditional folklore.' },
        { id: 17, title: 'Pushpa: The Rise', vote_average: 7.6, release_date: '2021-12-17', original_language: 'te', overview: 'Action drama about red sandalwood smuggling.' },
        { id: 18, title: 'Baahubali 2', vote_average: 8.2, release_date: '2017-04-28', original_language: 'te', overview: 'Epic conclusion to Baahubali saga.' }
    ],
    hindi_dubbed: [
        { id: 19, title: 'KGF Chapter 2 (Hindi)', vote_average: 8.3, release_date: '2022-04-14', original_language: 'hi', overview: 'Hindi dubbed version of KGF 2.' },
        { id: 20, title: 'RRR (Hindi)', vote_average: 8.0, release_date: '2022-03-25', original_language: 'hi', overview: 'Hindi dubbed version of RRR.' },
        { id: 21, title: 'Vikram (Hindi)', vote_average: 8.5, release_date: '2022-06-03', original_language: 'hi', overview: 'Hindi dubbed version of Vikram.' },
        { id: 22, title: 'Kantara (Hindi)', vote_average: 8.7, release_date: '2022-09-30', original_language: 'hi', overview: 'Hindi dubbed version of Kantara.' },
        { id: 23, title: 'Pushpa (Hindi)', vote_average: 7.6, release_date: '2021-12-17', original_language: 'hi', overview: 'Hindi dubbed version of Pushpa.' },
        { id: 24, title: 'Baahubali 2 (Hindi)', vote_average: 8.2, release_date: '2017-04-28', original_language: 'hi', overview: 'Hindi dubbed version of Baahubali 2.' }
    ],
    action: [
        { id: 25, title: 'War', vote_average: 7.2, release_date: '2019-10-02', original_language: 'hi', overview: 'Action thriller about two Indian agents.' },
        { id: 26, title: 'Singham', vote_average: 6.9, release_date: '2011-07-22', original_language: 'hi', overview: 'Action drama about an honest police officer.' },
        { id: 27, title: 'Dhoom 3', vote_average: 6.5, release_date: '2013-12-20', original_language: 'hi', overview: 'Action thriller about a circus entertainer turned thief.' },
        { id: 28, title: 'Bang Bang', vote_average: 6.1, release_date: '2014-10-02', original_language: 'hi', overview: 'Action romance thriller.' },
        { id: 29, title: 'Commando 3', vote_average: 6.3, release_date: '2019-11-29', original_language: 'hi', overview: 'Action thriller about an Indian commando.' },
        { id: 30, title: 'Baby', vote_average: 7.8, release_date: '2015-01-23', original_language: 'hi', overview: 'Action thriller about Indian intelligence agents.' }
    ],
    comedy: [
        { id: 31, title: 'Bhool Bhulaiyaa 2', vote_average: 6.9, release_date: '2022-05-20', original_language: 'hi', overview: 'Horror comedy sequel.' },
        { id: 32, title: 'Fukrey 3', vote_average: 6.5, release_date: '2023-09-28', original_language: 'hi', overview: 'Comedy about four friends and their misadventures.' },
        { id: 33, title: 'Dream Girl 2', vote_average: 6.3, release_date: '2023-08-25', original_language: 'hi', overview: 'Comedy about a man who impersonates a woman.' },
        { id: 34, title: 'Golmaal Again', vote_average: 6.7, release_date: '2017-10-20', original_language: 'hi', overview: 'Comedy horror film.' },
        { id: 35, title: 'Welcome', vote_average: 7.1, release_date: '2007-12-21', original_language: 'hi', overview: 'Comedy about a man marrying into a gangster family.' },
        { id: 36, title: 'Hera Pheri', vote_average: 8.2, release_date: '2000-03-31', original_language: 'hi', overview: 'Classic comedy about three tenants.' }
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 CineNest PWA Initialized - Indian Movies Focus');
    initializeApp();
    setupPWA();
    checkAuthStatus();
    hideAdminButton(); // Admin button immediately hide karo
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
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
}

// Hide Admin Button from Normal Users
function hideAdminButton() {
    const adminButtons = document.querySelectorAll('button[onclick*="showAdminLogin"], a[onclick*="showAdminLogin"]');
    const userData = localStorage.getItem('cinenest_user');
    
    let isAdmin = false;
    if (userData) {
        const user = JSON.parse(userData);
        isAdmin = user.email === ADMIN_CREDENTIALS.email;
    }
    
    adminButtons.forEach(button => {
        if (!isAdmin) {
            button.style.display = 'none';
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('searchOverlayInput')?.addEventListener('keypress', handleOverlaySearch);
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyboardShortcuts);
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
            showNotification('✅ CineNest app installed successfully!', 'success');
        }
        deferredPrompt = null;
        closeInstallPrompt();
    }
}

// Search Functionality - Professional Design
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
        
        document.getElementById('trendingMovies').innerHTML = '<div class="loading">Searching Indian movies...</div>';

        // Try TMDB API first
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=IN&language=hi-IN`
        );
        
        if (response.ok) {
            const data = await response.json();
            
            // Filter Indian movies
            const indianMovies = data.results ? data.results.filter(movie => 
                INDIAN_CONFIG.languages.includes(movie.original_language) ||
                isIndianMovie(movie.title) ||
                isIndianMovie(movie.overview)
            ) : [];

            if (indianMovies.length > 0) {
                displayMovies(indianMovies.slice(0, 12), 'trendingMovies');
                showNotification(`✅ Found ${indianMovies.length} Indian movies`, 'success');
            } else {
                // Show fallback search results
                showSearchFallback(query);
            }
        } else {
            throw new Error('API not available');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showSearchFallback(query);
    }
}

function showSearchFallback(query) {
    const allMovies = Object.values(FALLBACK_MOVIES).flat();
    const searchResults = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase()))
    );
    
    if (searchResults.length > 0) {
        displayMovies(searchResults.slice(0, 12), 'trendingMovies');
        showNotification(`🔍 Found ${searchResults.length} Indian movies`, 'success');
    } else {
        document.getElementById('trendingMovies').innerHTML = `
            <div class="loading">
                <i class="fas fa-search"></i>
                <p>No Indian movies found for "${query}"</p>
                <small>Try different keywords like "Bollywood", "Action", etc.</small>
            </div>
        `;
        showNotification('❌ No Indian movies found', 'info');
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
    
    // Check if admin and show/hide admin button
    if (email === ADMIN_CREDENTIALS.email) {
        hideAdminButton();
    }
    
    if (document.getElementById('mainApp').classList.contains('hidden')) {
        getStarted();
    }
}

function checkAuthStatus() {
    const userData = localStorage.getItem('cinenest_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('User already logged in:', currentUser.name);
        
        if (currentUser.email === ADMIN_CREDENTIALS.email) {
            hideAdminButton();
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
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
    
    document.querySelectorAll('.movies-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    const sectionId = category + 'Section';
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    loadCategoryMovies(category);
    saveUserPreference('lastCategory', category);
}

function saveUserPreference(key, value) {
    let preferences = JSON.parse(localStorage.getItem('cinenest_preferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('cinenest_preferences', JSON.stringify(preferences));
}

// Movie Loading Functions - COMPLETELY FIXED
async function loadAllSections() {
    try {
        showNotification('🎬 Loading Indian movies...', 'info');
        
        // Load trending first, then others
        await loadCategoryMovies('trending');
        
        // Load other categories with delay to avoid API limits
        const categories = ['bollywood', 'south_indian', 'hindi_dubbed', 'action', 'comedy'];
        for (let category of categories) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadCategoryMovies(category);
        }
        
        showNotification('✅ Indian movies loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading all sections:', error);
        showNotification('⚠️ Using fallback movie data', 'info');
        
        // Load fallback data for all sections
        Object.keys(FALLBACK_MOVIES).forEach(category => {
            displayMovies(FALLBACK_MOVIES[category], category + 'Movies');
        });
    }
}

async function loadCategoryMovies(category) {
    try {
        console.log(`Loading ${category} movies...`);
        
        let url = '';
        const baseParams = `api_key=${TMDB_API_KEY}&language=hi-IN&region=IN`;

        switch(category) {
            case 'trending':
                url = `${TMDB_BASE_URL}/trending/movie/week?${baseParams}`;
                break;
            case 'bollywood':
                url = `${TMDB_BASE_URL}/discover/movie?${baseParams}&with_original_language=hi&sort_by=popularity.desc&with_genres=10751,18,35`;
                break;
            case 'south_indian':
                url = `${TMDB_BASE_URL}/discover/movie?${baseParams}&with_original_language=ta,te,ml&sort_by=popularity.desc&with_genres=28,53,80`;
                break;
            case 'hindi_dubbed':
                url = `${TMDB_BASE_URL}/discover/movie?${baseParams}&with_original_language=hi&sort_by=popularity.desc&with_genres=12,14,16`;
                break;
            case 'action':
                url = `${TMDB_BASE_URL}/discover/movie?${baseParams}&with_genres=28&with_original_language=hi,ta,te,ml&sort_by=popularity.desc`;
                break;
            case 'comedy':
                url = `${TMDB_BASE_URL}/discover/movie?${baseParams}&with_genres=35&with_original_language=hi,ta,te,ml&sort_by=popularity.desc`;
                break;
            default:
                url = `${TMDB_BASE_URL}/movie/popular?${baseParams}`;
        }

        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Filter Indian movies
                const indianMovies = data.results.filter(movie => 
                    INDIAN_CONFIG.languages.includes(movie.original_language) ||
                    isIndianMovie(movie.title) ||
                    (movie.genre_ids && movie.genre_ids.some(genre => [10751, 18, 35, 28, 53].includes(genre)))
                );

                if (indianMovies.length > 0) {
                    displayMovies(indianMovies.slice(0, 12), category + 'Movies');
                    return;
                }
            }
        }
        
        // If API fails or no Indian movies found, use fallback
        throw new Error('No Indian movies found');
        
    } catch (error) {
        console.error(`Error loading ${category} movies:`, error);
        // Use fallback movies
        displayMovies(FALLBACK_MOVIES[category] || FALLBACK_MOVIES.trending, category + 'Movies');
    }
}

// Helper function to detect Indian movies
function isIndianMovie(text) {
    if (!text) return false;
    
    const indianKeywords = [
        'singh', 'khan', 'kumar', 'sharma', 'verma', 'reddy', 'naidu',
        'bhai', 'rao', 'dev', 'das', 'lal', 'baba', 'raja', 'mahal',
        'diwali', 'holi', 'puja', 'desh', 'hindustan', 'bharat', 'india',
        'bollywood', 'tollywood', 'kollywood', 'sandalwood', 'mollywood'
    ];
    
    const lowerText = text.toLowerCase();
    return indianKeywords.some(keyword => lowerText.includes(keyword));
}

// Display Movies in Grid - Enhanced with Indian focus
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-film"></i>
                <p>No Indian movies available</p>
                <small>Try another category</small>
            </div>
        `;
        return;
    }

    container.innerHTML = movies.map(movie => {
        const posterUrl = `https://via.placeholder.com/500x750/1a1a1a/e50914?text=${encodeURIComponent(movie.title.substring(0, 20))}`;
            
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '7.5';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '2023';
        const language = getLanguageName(movie.original_language);
        
        return `
            <div class="movie-card" onclick="openMovieDetails(${movie.id})">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-rating">⭐ ${rating}/10</span>
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
        'hi': 'Hindi', 'en': 'English', 'ta': 'Tamil', 'te': 'Telugu',
        'ml': 'Malayalam', 'kn': 'Kannada', 'bn': 'Bengali', 'mr': 'Marathi'
    };
    return languages[code] || 'Indian';
}

// Movie Details Functions
function openMovieDetails(movieId) {
    if (!currentUser) {
        showNotification('Please login to view movie details', 'info');
        openLogin();
        return;
    }
    
    window.location.href = `movie-details.html?id=${movieId}`;
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div>${message}</div>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Event Handlers
function handleOutsideClick(event) {
    const modals = document.querySelectorAll('.modal.visible');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('visible');
            modal.classList.add('hidden');
        }
    });
    
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay && searchOverlay.classList.contains('visible') && event.target === searchOverlay) {
        hideSearch();
    }
}

function handleKeyboardShortcuts(event) {
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
    
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        showSearch();
    }
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

console.log('🎬 CineNest App.js COMPLETELY UPDATED & FIXED!');
