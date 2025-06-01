// Berlin Barrierefrei PWA - Service Worker
// =========================================

const CACHE_NAME = 'berlin-barrierefrei-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Dateien, die beim ersten Besuch gecacht werden sollen
const STATIC_CACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './scripts/app.js',
    './images/icons/icon-192x192.png',
    './images/icons/icon-512x512.png'
];

// Dateien, die nur bei Bedarf gecacht werden
const DYNAMIC_CACHE_URLS = [
    './data/locations.json'
];

// URLs, die nie gecacht werden sollen (externe APIs)
const NETWORK_ONLY_URLS = [
    'https://brokenlifts.org/',
    'tel:',
    'mailto:'
];

/**
 * Service Worker Installation
 * Cached alle statischen Assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installation gestartet');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache geöffnet');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('[SW] Alle statischen Dateien gecacht');
                // Service Worker sofort aktivieren
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Fehler beim Caching:', error);
            })
    );
});

/**
 * Service Worker Aktivierung
 * Löscht alte Caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Aktivierung gestartet');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Lösche alte Cache-Versionen
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Lösche alten Cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker aktiviert');
                // Übernehme Kontrolle über alle offenen Tabs
                return self.clients.claim();
            })
    );
});

/**
 * Fetch-Event Handler
 * Implementiert verschiedene Caching-Strategien
 */
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Ignoriere chrome-extension und nicht-HTTP(S) Requests
    if (
        requestUrl.protocol !== 'http:' && 
        requestUrl.protocol !== 'https:' ||
        requestUrl.href.includes('chrome-extension')
    ) {
        return;
    }

    // Network-Only URLs (tel:, mailto:, APIs)
    if (NETWORK_ONLY_URLS.some(url => event.request.url.includes(url))) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Statische Assets: Cache-First-Strategie
    if (STATIC_CACHE_URLS.some(url => event.request.url.includes(url))) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // JSON-Daten: Stale-While-Revalidate-Strategie
    if (event.request.url.includes('.json')) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // Alle anderen Requests: Network-First-Strategie
    event.respondWith(networkFirst(event.request));
});

/**
 * Cache-First-Strategie
 * Lädt zuerst aus dem Cache, dann vom Netzwerk
 */
async function cacheFirst(request) {
    try {
        // Versuche aus Cache zu laden
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Wenn nicht im Cache, lade vom Netzwerk
        const networkResponse = await fetch(request);

        // Cache die Antwort für nächstes Mal
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-First Fehler:', error);

        // Fallback für HTML-Seiten
        if (request.destination === 'document') {
            return caches.match('./index.html');
        }

        throw error;
    }
}

/**
 * Network-First-Strategie
 * Lädt zuerst vom Netzwerk, dann aus dem Cache
 */
async function networkFirst(request) {
    try {
        // Versuche vom Netzwerk zu laden
        const networkResponse = await fetch(request);

        // Cache die Antwort
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('[SW] Network-First fällt auf Cache zurück:', error.message);

        // Fallback auf Cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Wenn auch kein Cache, zeige Offline-Seite
        if (request.destination === 'document') {
            return new Response(`
                <!DOCTYPE html>
                <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Offline - Berlin Barrierefrei</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 2rem;
                            background: #f5f5f5;
                        }
                        .offline-message {
                            max-width: 400px;
                            margin: 2rem auto;
                            background: white;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .emoji { font-size: 3rem; margin-bottom: 1rem; }
                        h1 { color: #1a237e; margin-bottom: 1rem; }
                        button {
                            background: #1a237e;
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-top: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-message">
                        <div class="emoji">📱</div>
                        <h1>Sie sind offline</h1>
                        <p>Die Berlin Barrierefrei App ist derzeit nicht verfügbar.</p>
                        <p>Bitte überprüfen Sie Ihre Internetverbindung.</p>
                        <button onclick="window.location.reload()">
                            Erneut versuchen
                        </button>
                    </div>
                </body>
                </html>
            `, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            });
        }

        throw error;
    }
}

/**
 * Stale-While-Revalidate-Strategie
 * Zeigt gecachte Version und aktualisiert im Hintergrund
 */
async function staleWhileRevalidate(request) {
    try {
        // Lade gleichzeitig aus Cache und Netzwerk
        const cachePromise = caches.match(request);
        const networkPromise = fetch(request);

        // Zeige gecachte Version sofort
        const cachedResponse = await cachePromise;

        // Aktualisiere Cache im Hintergrund
        networkPromise
            .then(async (networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
            })
            .catch((error) => {
                console.warn('[SW] Hintergrund-Update fehlgeschlagen:', error);
            });

        // Wenn gecachte Version vorhanden, nutze sie
        if (cachedResponse) {
            return cachedResponse;
        }

        // Ansonsten warte auf Netzwerk-Antwort
        return await networkPromise;
    } catch (error) {
        console.error('[SW] Stale-While-Revalidate Fehler:', error);
        throw error;
    }
}

/**
 * Push-Benachrichtigungen (für zukünftige Verwendung)
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push-Nachricht erhalten');

    const options = {
        body: event.data ? event.data.text() : 'Neue Informationen verfügbar',
        icon: './images/icons/icon-192x192.png',
        badge: './images/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'App öffnen',
                icon: './images/icons/icon-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Berlin Barrierefrei', options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Benachrichtigung geklickt');

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Background Sync (für zukünftige Verwendung)
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background Sync ausgelöst');

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Background Sync Funktion
 */
async function doBackgroundSync() {
    try {
        console.log('[SW] Führe Background Sync durch');

        // Hier könnten Daten synchronisiert werden
        // z.B. Aufzugsstatus, neue Orte, etc.

        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Background Sync fehlgeschlagen:', error);
        throw error;
    }
}

/**
 * Error Handler
 */
self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker Fehler:', event.error);
});

/**
 * Unhandled Rejection Handler
 */
self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unbehandelte Promise-Ablehnung:', event.reason);
    event.preventDefault();
});

// Zeige Installation im Log
console.log('[SW] Service Worker geladen');