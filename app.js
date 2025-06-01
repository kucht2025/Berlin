// Berlin Barrierefrei PWA - Main Application JavaScript

// Application Data
const placesData = [
    {
        id: 1,
        name: "Brandenburger Tor",
        category: "Sehenswürdigkeit",
        address: "Pariser Platz, 10117 Berlin",
        accessibility: {
            wheelchair: "full",
            visual: true,
            hearing: true
        },
        description: "Vollständig barrierefrei zugänglich mit taktilen Elementen",
        transport: "S-Bahn Brandenburger Tor (barrierefrei)",
        hours: "24/7 zugänglich"
    },
    {
        id: 2,
        name: "Reichstagsgebäude",
        category: "Sehenswürdigkeit", 
        address: "Platz der Republik 1, 11011 Berlin",
        accessibility: {
            wheelchair: "full",
            visual: true,
            hearing: true
        },
        description: "Vollständig barrierefrei mit Aufzügen und Audioguides",
        transport: "U-Bahn Bundestag (barrierefrei)",
        hours: "8:00-24:00, Anmeldung erforderlich"
    },
    {
        id: 3,
        name: "Benedict Berlin",
        category: "Restaurant",
        address: "Uhlandstraße 49, 10719 Berlin",
        accessibility: {
            wheelchair: "full",
            visual: false,
            hearing: true
        },
        description: "Zertifiziert nach 'Reisen für Alle', stufenloser Zugang",
        transport: "U-Bahn Uhlandstraße (teilweise barrierefrei)",
        hours: "Mo-So 8:00-1:00"
    },
    {
        id: 4,
        name: "Waldorf Astoria Berlin",
        category: "Hotel",
        address: "Hardenbergstraße 28, 10623 Berlin",
        accessibility: {
            wheelchair: "full",
            visual: true,
            hearing: true
        },
        description: "Luxushotel mit zertifizierten barrierefreien Zimmern",
        transport: "U-Bahn Zoologischer Garten (barrierefrei)",
        hours: "24/7 Check-in"
    },
    {
        id: 5,
        name: "Humboldt Forum",
        category: "Museum",
        address: "Schloßplatz, 10178 Berlin", 
        accessibility: {
            wheelchair: "full",
            visual: true,
            hearing: true
        },
        description: "Modellprojekt für Barrierefreiheit mit taktilem Bodenleitsystem",
        transport: "U-Bahn Museumsinsel (barrierefrei)",
        hours: "Mi-Mo 10:30-18:30"
    }
];

// PWA Installation
let deferredPrompt;
let isInstalled = false;

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerSW();
    });
}

async function registerSW() {
    try {
        // Create inline service worker
        const swCode = `
            const CACHE_NAME = 'berlin-barrierefrei-v1';
            const urlsToCache = [
                '/',
                '/index.html',
                '/style.css',
                '/app.js'
            ];

            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request)
                        .then((response) => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        }
                    )
                );
            });
        `;
        
        const swBlob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);
        
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('SW registered: ', registration);
        
        // Clean up the blob URL
        URL.revokeObjectURL(swUrl);
    } catch (error) {
        console.log('SW registration failed: ', error);
    }
}

// PWA Install Event Handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    isInstalled = true;
    hideInstallButton();
});

function showInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn && !isInstalled) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', installApp);
    }
}

function hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        hideInstallButton();
    }
}

// Online/Offline Status
function updateOnlineStatus() {
    const onlineIndicator = document.getElementById('online-indicator');
    const offlineIndicator = document.getElementById('offline-indicator');
    
    if (navigator.onLine) {
        onlineIndicator.style.display = 'block';
        offlineIndicator.style.display = 'none';
    } else {
        onlineIndicator.style.display = 'none';
        offlineIndicator.style.display = 'block';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Application State Management
class AppState {
    constructor() {
        this.currentSection = 'welcome';
        this.searchTerm = '';
        this.categoryFilter = '';
        this.userSettings = this.loadSettings();
        this.favorites = this.loadFavorites();
    }

    loadSettings() {
        const saved = localStorage.getItem('berlin-barrierefrei-settings');
        return saved ? JSON.parse(saved) : {
            wheelchair: false,
            visual: false,
            hearing: false,
            language: 'de',
            theme: 'auto'
        };
    }

    saveSettings() {
        localStorage.setItem('berlin-barrierefrei-settings', JSON.stringify(this.userSettings));
    }

    loadFavorites() {
        const saved = localStorage.getItem('berlin-barrierefrei-favorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('berlin-barrierefrei-favorites', JSON.stringify(this.favorites));
    }

    addFavorite(placeId) {
        if (!this.favorites.includes(placeId)) {
            this.favorites.push(placeId);
            this.saveFavorites();
        }
    }

    removeFavorite(placeId) {
        this.favorites = this.favorites.filter(id => id !== placeId);
        this.saveFavorites();
    }
}

const appState = new AppState();

// Navigation Management
class NavigationManager {
    constructor() {
        this.sections = ['welcome', 'places', 'navigation', 'services', 'profile'];
        this.init();
    }

    init() {
        // Navigation buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showSection('welcome');
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section, .welcome-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            appState.currentSection = sectionName;
            
            // Initialize section-specific functionality
            switch(sectionName) {
                case 'places':
                    this.initPlacesSection();
                    break;
                case 'navigation':
                    this.initNavigationSection();
                    break;
                case 'profile':
                    this.initProfileSection();
                    break;
            }

            // Focus management for accessibility
            const heading = targetSection.querySelector('h2');
            if (heading) {
                heading.focus();
            }
        }
    }

    initPlacesSection() {
        placesManager.renderPlaces();
        placesManager.initSearch();
    }

    initNavigationSection() {
        navigationManager.init();
    }

    initProfileSection() {
        profileManager.init();
    }
}

// Places Management
class PlacesManager {
    constructor() {
        this.filteredPlaces = [...placesData];
    }

    renderPlaces() {
        const container = document.getElementById('places-list');
        if (!container) return;

        if (this.filteredPlaces.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card__body">
                        <p>Keine Orte gefunden. Versuchen Sie eine andere Suche.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredPlaces.map(place => this.createPlaceCard(place)).join('');
        
        // Add favorite functionality
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const placeId = parseInt(e.currentTarget.dataset.placeId);
                this.toggleFavorite(placeId, e.currentTarget);
            });
        });
    }

    createPlaceCard(place) {
        const isFavorite = appState.favorites.includes(place.id);
        const wheelchairStatus = this.getAccessibilityStatus(place.accessibility.wheelchair);
        const visualStatus = place.accessibility.visual ? 'available' : 'unavailable';
        const hearingStatus = place.accessibility.hearing ? 'available' : 'unavailable';

        return `
            <article class="place-card" role="listitem">
                <div class="place-header">
                    <h3 class="place-name">${place.name}</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="place-category">${place.category}</span>
                        <button class="favorite-btn btn btn--outline btn--sm" 
                                data-place-id="${place.id}"
                                aria-label="${isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
                <p class="place-address">📍 ${place.address}</p>
                <p class="place-description">${place.description}</p>
                
                <div class="accessibility-indicators" role="group" aria-label="Barrierefreiheitsinformationen">
                    <div class="accessibility-indicator accessibility-indicator--${wheelchairStatus}">
                        <span aria-hidden="true">♿</span>
                        <span>Rollstuhl: ${this.getWheelchairText(place.accessibility.wheelchair)}</span>
                    </div>
                    <div class="accessibility-indicator accessibility-indicator--${visualStatus}">
                        <span aria-hidden="true">👁️</span>
                        <span>Sehbehinderung: ${place.accessibility.visual ? 'Unterstützt' : 'Nicht unterstützt'}</span>
                    </div>
                    <div class="accessibility-indicator accessibility-indicator--${hearingStatus}">
                        <span aria-hidden="true">👂</span>
                        <span>Hörbehinderung: ${place.accessibility.hearing ? 'Unterstützt' : 'Nicht unterstützt'}</span>
                    </div>
                </div>
                
                <div class="place-details">
                    <div>
                        <strong>🚇 Transport:</strong><br>
                        ${place.transport}
                    </div>
                    <div>
                        <strong>🕒 Öffnungszeiten:</strong><br>
                        ${place.hours}
                    </div>
                </div>
            </article>
        `;
    }

    getAccessibilityStatus(wheelchair) {
        switch(wheelchair) {
            case 'full': return 'available';
            case 'partial': return 'partial';
            default: return 'unavailable';
        }
    }

    getWheelchairText(wheelchair) {
        switch(wheelchair) {
            case 'full': return 'Vollständig';
            case 'partial': return 'Teilweise';
            default: return 'Nicht verfügbar';
        }
    }

    toggleFavorite(placeId, button) {
        const isFavorite = appState.favorites.includes(placeId);
        
        if (isFavorite) {
            appState.removeFavorite(placeId);
            button.innerHTML = '🤍';
            button.setAttribute('aria-label', 'Zu Favoriten hinzufügen');
        } else {
            appState.addFavorite(placeId);
            button.innerHTML = '❤️';
            button.setAttribute('aria-label', 'Aus Favoriten entfernen');
        }
    }

    initSearch() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                appState.searchTerm = e.target.value.toLowerCase();
                this.filterPlaces();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                appState.categoryFilter = e.target.value;
                this.filterPlaces();
            });
        }
    }

    filterPlaces() {
        this.filteredPlaces = placesData.filter(place => {
            const matchesSearch = !appState.searchTerm || 
                place.name.toLowerCase().includes(appState.searchTerm) ||
                place.category.toLowerCase().includes(appState.searchTerm) ||
                place.description.toLowerCase().includes(appState.searchTerm);

            const matchesCategory = !appState.categoryFilter || 
                place.category === appState.categoryFilter;

            return matchesSearch && matchesCategory;
        });

        this.renderPlaces();
    }
}

// Navigation/Route Planning Manager
class RouteNavigationManager {
    init() {
        const planRouteBtn = document.getElementById('plan-route');
        if (planRouteBtn) {
            planRouteBtn.addEventListener('click', () => {
                this.planRoute();
            });
        }
    }

    planRoute() {
        const fromInput = document.getElementById('route-from');
        const toInput = document.getElementById('route-to');
        const resultsDiv = document.getElementById('route-results');

        const from = fromInput?.value.trim();
        const to = toInput?.value.trim();

        if (!from || !to) {
            alert('Bitte geben Sie Start- und Zieladresse ein.');
            return;
        }

        // Simulate route planning
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <h4>Routenergebnis</h4>
            <p><strong>Von:</strong> ${from}</p>
            <p><strong>Nach:</strong> ${to}</p>
            <p>Eine barrierefreie Route wurde für Sie geplant. Alle gewählten Optionen wurden berücksichtigt.</p>
            <div class="route-options">
                <p><strong>Optionen berücksichtigt:</strong></p>
                <ul>
                    ${document.getElementById('wheelchair-route')?.checked ? '<li>✅ Rollstuhlgerechte Route</li>' : ''}
                    ${document.getElementById('elevator-info')?.checked ? '<li>✅ Aufzug-Status wird angezeigt</li>' : ''}
                    ${document.getElementById('audio-signals')?.checked ? '<li>✅ Akustische Signale aktiviert</li>' : ''}
                </ul>
            </div>
        `;

        // Announce to screen readers
        resultsDiv.setAttribute('aria-live', 'polite');
    }
}

// Profile Manager
class ProfileManager {
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateFavoritesList();
    }

    loadSettings() {
        // Load accessibility needs
        document.getElementById('need-wheelchair').checked = appState.userSettings.wheelchair;
        document.getElementById('need-visual').checked = appState.userSettings.visual;
        document.getElementById('need-hearing').checked = appState.userSettings.hearing;
        
        // Load language and theme
        document.getElementById('language-select').value = appState.userSettings.language;
        document.getElementById('theme-select').value = appState.userSettings.theme;
    }

    setupEventListeners() {
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Theme change listener
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    saveSettings() {
        // Save accessibility needs
        appState.userSettings.wheelchair = document.getElementById('need-wheelchair').checked;
        appState.userSettings.visual = document.getElementById('need-visual').checked;
        appState.userSettings.hearing = document.getElementById('need-hearing').checked;
        
        // Save language and theme
        appState.userSettings.language = document.getElementById('language-select').value;
        appState.userSettings.theme = document.getElementById('theme-select').value;
        
        appState.saveSettings();
        
        // Apply theme
        this.applyTheme(appState.userSettings.theme);
        
        // Show confirmation
        alert('Einstellungen gespeichert!');
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        switch(theme) {
            case 'light':
                html.setAttribute('data-color-scheme', 'light');
                break;
            case 'dark':
                html.setAttribute('data-color-scheme', 'dark');
                break;
            case 'auto':
            default:
                html.removeAttribute('data-color-scheme');
                break;
        }
    }

    updateFavoritesList() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;

        if (appState.favorites.length === 0) {
            favoritesList.innerHTML = '<p class="text-secondary">Noch keine Favoriten gespeichert.</p>';
            return;
        }

        const favoriteePlaces = placesData.filter(place => appState.favorites.includes(place.id));
        favoritesList.innerHTML = `
            <div class="favorites-grid">
                ${favoriteePlaces.map(place => `
                    <div class="favorite-item">
                        <strong>${place.name}</strong><br>
                        <small class="text-secondary">${place.category}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize managers
const navigationManager = new NavigationManager();
const placesManager = new PlacesManager();
const routeNavigationManager = new RouteNavigationManager();
const profileManager = new ProfileManager();

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Update online status
    updateOnlineStatus();
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        isInstalled = true;
        hideInstallButton();
    } else {
        // Show install button after a delay if not installed
        setTimeout(() => {
            if (!isInstalled && !deferredPrompt) {
                showInstallButton();
            }
        }, 3000);
    }

    // Apply saved theme
    profileManager.applyTheme(appState.userSettings.theme);

    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    console.log('Berlin Barrierefrei PWA initialized');
});

// Keyboard Navigation for Accessibility
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC key to go back
        if (e.key === 'Escape' && appState.currentSection !== 'welcome') {
            navigationManager.showSection('welcome');
        }
        
        // Enter/Space on buttons
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('action-btn')) {
            e.preventDefault();
            e.target.click();
        }
    });
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Export for global access if needed
window.BerlinBarrierefrei = {
    appState,
    navigationManager,
    placesManager,
    routeNavigationManager,
    profileManager
};