// Berlin Barrierefrei PWA - App.js
// ===================================

// Globale Variablen
let locations = []; // Orte-Datenbank
let events = []; // Veranstaltungen
let elevatorStatus = []; // Aufzugsstatus
let isOnline = navigator.onLine;

// Beim Laden der Seite ausführen
document.addEventListener('DOMContentLoaded', () => {
    // Initialisiere App
    initApp();

    // Lade Daten
    loadData();

    // Setze Event Listener
    setupEventListeners();
});

/**
 * App initialisieren
 */
function initApp() {
    console.log('Berlin Barrierefrei PWA wird initialisiert...');

    // Prüfe Verbindungsstatus
    updateConnectionStatus();

    // Registeriere Service Worker
    registerServiceWorker();
}

/**
 * Service Worker registrieren
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registriert mit Scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker Registrierung fehlgeschlagen:', error);
            });
    }
}

/**
 * Event Listener einrichten
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Barrierefreiheits-Controls
    document.getElementById('contrast-toggle').addEventListener('click', toggleContrast);
    document.getElementById('font-size-toggle').addEventListener('click', toggleFontSize);

    // Filter-Controls
    document.getElementById('category-filter').addEventListener('change', filterLocations);
    document.getElementById('accessibility-filter').addEventListener('change', filterLocations);

    // Online/Offline-Status
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

/**
 * Navigation zwischen Sektionen
 */
function handleNavigation(event) {
    // Aktiven Button finden und Status entfernen
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Aktuellen Button aktivieren
    event.currentTarget.classList.add('active');

    // Aktive Sektion finden und ausblenden
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Gewählte Sektion anzeigen
    const sectionId = event.currentTarget.dataset.section;
    const targetSection = document.getElementById(sectionId + '-section');
    targetSection.classList.add('active');
    targetSection.style.display = 'block';

    // Fokus auf Überschrift setzen (für Screen Reader)
    const headingId = sectionId + '-heading';
    document.getElementById(headingId).focus();
}

/**
 * Hoher Kontrast Modus umschalten
 */
function toggleContrast() {
    document.body.classList.toggle('high-contrast');

    // Speichere Präferenz
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('high-contrast', isHighContrast);

    // Ankündigung für Screen Reader
    announceForScreenReader(isHighContrast ? 
        'Hoher Kontrast aktiviert' : 'Hoher Kontrast deaktiviert');
}

/**
 * Schriftgröße umschalten
 */
function toggleFontSize() {
    document.body.classList.toggle('large-text');

    // Speichere Präferenz
    const isLargeText = document.body.classList.contains('large-text');
    localStorage.setItem('large-text', isLargeText);

    // Ankündigung für Screen Reader
    announceForScreenReader(isLargeText ? 
        'Große Schrift aktiviert' : 'Normale Schrift aktiviert');
}

/**
 * Screen Reader Ankündigung
 */
function announceForScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('role', 'status');
    announcer.classList.add('sr-only');
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

/**
 * Online/Offline Status aktualisieren
 */
function updateConnectionStatus() {
    isOnline = navigator.onLine;
    const statusElement = document.getElementById('connection-status');

    if (isOnline) {
        statusElement.textContent = '🟢 Online';
        statusElement.style.color = 'var(--success-color)';
    } else {
        statusElement.textContent = '🔴 Offline';
        statusElement.style.color = 'var(--error-color)';
    }
}

/**
 * Daten laden
 */
async function loadData() {
    try {
        // Orte laden
        await loadLocations();

        // Veranstaltungen laden
        await loadEvents();

        // Aufzugsstatus laden (wenn online)
        if (isOnline) {
            await loadElevatorStatus();
        }

        // Benutzereinstellungen laden
        loadUserPreferences();
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        showErrorMessage('Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es später erneut.');
    }
}

/**
 * Barrierefreie Orte laden
 */
async function loadLocations() {
    try {
        let response;

        // Versuche, Daten vom Server zu laden (wenn online)
        if (isOnline) {
            try {
                response = await fetch('./data/locations.json');
                locations = await response.json();

                // Speichere in localStorage für Offline-Zugriff
                localStorage.setItem('locations', JSON.stringify(locations));
            } catch (error) {
                console.warn('Konnte Orte nicht online laden, nutze Cache:', error);
            }
        }

        // Nutze Cache wenn keine Serverdaten oder offline
        if (!locations || locations.length === 0) {
            const cachedLocations = localStorage.getItem('locations');
            if (cachedLocations) {
                locations = JSON.parse(cachedLocations);
                console.log('Orte aus Cache geladen');
            } else {
                // Fallback auf Beispieldaten
                locations = [
                    {
                        id: 1,
                        name: "Reichstagsgebäude",
                        description: "Vollständig barrierefrei mit Rollstuhlverleih und taktilen Modellen",
                        category: "sehenswuerdigkeiten",
                        accessibility: {
                            wheelchair: "full",
                            visual: "partial",
                            hearing: "full"
                        },
                        address: "Platz der Republik 1, 11011 Berlin",
                        url: "https://www.bundestag.de/besuche/architektur/reichstag"
                    },
                    {
                        id: 2,
                        name: "Restaurant Alvis",
                        description: "Barrierefrei zertifiziert mit stufenlosem Zugang",
                        category: "restaurants",
                        accessibility: {
                            wheelchair: "full",
                            visual: "none",
                            hearing: "partial"
                        },
                        address: "Große Hamburger Straße 25, 10115 Berlin",
                        url: "https://alvis-restaurant.de"
                    },
                    {
                        id: 3,
                        name: "Futurium",
                        description: "Das Haus der Zukünfte mit vollständiger Barrierefreiheit, taktilen Orientierungsplänen und Gebärdensprache-Videos",
                        category: "kultur",
                        accessibility: {
                            wheelchair: "full",
                            visual: "full",
                            hearing: "full"
                        },
                        address: "Alexanderufer 2, 10117 Berlin",
                        url: "https://futurium.de/de/barrierefreiheit"
                    }
                ];
                console.log('Beispieldaten geladen');
            }
        }

        // Render Orte
        renderLocations(locations);
    } catch (error) {
        console.error('Fehler beim Laden der Orte:', error);
        showErrorMessage('Die Orte konnten nicht geladen werden.');
    }
}

/**
 * Orte rendern
 */
function renderLocations(locationsData) {
    const container = document.getElementById('locations-container');

    // Leere Container
    container.innerHTML = '';

    // Wenn keine Orte, zeige Hinweis
    if (!locationsData || locationsData.length === 0) {
        container.innerHTML = '<p>Keine barrierefreien Orte gefunden.</p>';
        return;
    }

    // Rendere jede Location
    locationsData.forEach(location => {
        const card = document.createElement('article');
        card.className = 'location-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `location-title-${location.id}`);

        // Accessibility-Badges vorbereiten
        const wheelchairBadge = `<span class="accessibility-badge accessibility-${location.accessibility.wheelchair}">
            ${location.accessibility.wheelchair === 'full' ? '♿ Rollstuhlgerecht' : 
              location.accessibility.wheelchair === 'partial' ? '⚠️ Teilweise rollstuhlgerecht' : 
              '❌ Nicht rollstuhlgerecht'}
        </span>`;

        const visualBadge = location.accessibility.visual !== 'none' ? 
            `<span class="accessibility-badge accessibility-${location.accessibility.visual}">
                ${location.accessibility.visual === 'full' ? '👁️ Sehbehinderung' : '⚠️ Teilweise Sehbehinderung'}
            </span>` : '';

        const hearingBadge = location.accessibility.hearing !== 'none' ? 
            `<span class="accessibility-badge accessibility-${location.accessibility.hearing}">
                ${location.accessibility.hearing === 'full' ? '👂 Hörbehinderung' : '⚠️ Teilweise Hörbehinderung'}
            </span>` : '';

        // Card-Inhalt erstellen
        card.innerHTML = `
            <h3 id="location-title-${location.id}">${location.name}</h3>
            <p>${location.description}</p>
            <p>${location.address}</p>
            <div class="accessibility-info">
                ${wheelchairBadge}
                ${visualBadge}
                ${hearingBadge}
            </div>
            <button class="action-btn" onclick="window.open('${location.url || '#'}')" aria-label="Mehr Informationen zu ${location.name}">
                Mehr Infos
            </button>
        `;

        container.appendChild(card);
    });
}

/**
 * Orte filtern
 */
function filterLocations() {
    const categoryFilter = document.getElementById('category-filter').value;
    const accessibilityFilter = document.getElementById('accessibility-filter').value;

    let filteredLocations = [...locations];

    // Nach Kategorie filtern (wenn nicht "alle")
    if (categoryFilter !== 'alle') {
        filteredLocations = filteredLocations.filter(location => location.category === categoryFilter);
    }

    // Nach Barrierefreiheit filtern (wenn nicht "alle")
    if (accessibilityFilter !== 'alle') {
        filteredLocations = filteredLocations.filter(location => {
            const accessibilityValue = location.accessibility[accessibilityFilter];
            return accessibilityValue === 'full' || accessibilityValue === 'partial';
        });
    }

    // Zeige gefilterte Ergebnisse
    renderLocations(filteredLocations);
}

/**
 * Veranstaltungen laden
 */
async function loadEvents() {
    try {
        // Beispielveranstaltungen (in einer echten App würden diese vom Server geladen)
        events = [
            {
                id: 1,
                title: "Pop-Kultur Festival",
                date: "28.-30. August 2025",
                description: "Musikfestival in der Kulturbrauerei mit vollständiger Barrierefreiheit und Awareness-Team",
                location: "Kulturbrauerei, Schönhauser Allee 36, 10435 Berlin",
                accessibility: {
                    wheelchair: true,
                    hearing: true,
                    visual: true
                }
            },
            {
                id: 2,
                title: "Inklusions-Tage 2025",
                date: "12.-13. Mai 2025",
                description: "Konferenz im Cafe Moskau zum Thema 'Digitalisierung barrierefrei'",
                location: "Cafe Moskau, Karl-Marx-Allee 34, 10178 Berlin",
                accessibility: {
                    wheelchair: true,
                    hearing: true,
                    visual: false
                }
            },
            {
                id: 3,
                title: "Tag des barrierefreien Tourismus",
                date: "4. März 2026",
                description: "Im Rahmen der ITB Berlin mit Gebärdensprach-Dolmetschern",
                location: "Messe Berlin, Messedamm 22, 14055 Berlin",
                accessibility: {
                    wheelchair: true,
                    hearing: true,
                    visual: true
                }
            }
        ];

        // Rendere Veranstaltungen
        renderEvents(events);
    } catch (error) {
        console.error('Fehler beim Laden der Veranstaltungen:', error);
    }
}

/**
 * Veranstaltungen rendern
 */
function renderEvents(eventsData) {
    const container = document.getElementById('events-container');

    // Leere Container
    container.innerHTML = '';

    // Wenn keine Veranstaltungen, zeige Hinweis
    if (!eventsData || eventsData.length === 0) {
        container.innerHTML = '<p>Keine barrierefreien Veranstaltungen gefunden.</p>';
        return;
    }

    // Rendere jede Veranstaltung
    eventsData.forEach(event => {
        const card = document.createElement('article');
        card.className = 'event-card';

        // Accessibility-Badges vorbereiten
        const accessibilityIcons = [];
        if (event.accessibility.wheelchair) accessibilityIcons.push('♿');
        if (event.accessibility.hearing) accessibilityIcons.push('👂');
        if (event.accessibility.visual) accessibilityIcons.push('👁️');

        // Card-Inhalt erstellen
        card.innerHTML = `
            <span class="event-date">${event.date}</span>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <p>${event.location}</p>
            <div class="accessibility-info">
                <span class="accessibility-badge accessibility-full">
                    ${accessibilityIcons.join(' ')}
                </span>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Aufzugsstatus laden
 */
async function loadElevatorStatus() {
    try {
        // In einer echten App würde hier ein API-Call erfolgen
        // z.B. fetch('https://brokenlifts.org/api/v1/elevators')

        // Wir nutzen Beispieldaten
        elevatorStatus = [
            {
                id: 1,
                station: "U Alexanderplatz",
                line: "U2",
                status: "außer Betrieb",
                reason: "Technische Störung",
                expected_repair: "Unbekannt"
            },
            {
                id: 2,
                station: "S+U Hauptbahnhof",
                line: "S5",
                status: "außer Betrieb",
                reason: "Wartungsarbeiten",
                expected_repair: "3. Juni 2025"
            },
            {
                id: 3,
                station: "U Rosenthaler Platz",
                line: "U8",
                status: "außer Betrieb",
                reason: "Vandalismusschäden",
                expected_repair: "15. Juni 2025"
            }
        ];

        // Rendere Aufzugsstatus
        renderElevatorStatus(elevatorStatus);
    } catch (error) {
        console.error('Fehler beim Laden des Aufzugsstatus:', error);
    }
}

/**
 * Aufzugsstatus rendern
 */
function renderElevatorStatus(statusData) {
    const container = document.getElementById('elevator-status-container');

    // Leere Container
    container.innerHTML = '';

    // Wenn kein Status, zeige Hinweis
    if (!statusData || statusData.length === 0) {
        container.innerHTML = '<p>Keine Aufzugsstörungen gefunden.</p>';
        return;
    }

    // Erstelle Tabelle
    const table = document.createElement('table');
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Aktuelle Aufzugsstörungen');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Station</th>
                <th>Linie</th>
                <th>Status</th>
                <th>Reparatur</th>
            </tr>
        </thead>
        <tbody>
            ${statusData.map(elevator => `
                <tr>
                    <td>${elevator.station}</td>
                    <td>${elevator.line}</td>
                    <td>${elevator.status}</td>
                    <td>${elevator.expected_repair}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.appendChild(table);
}

/**
 * Benutzereinstellungen laden
 */
function loadUserPreferences() {
    // Hoher Kontrast Modus
    const isHighContrast = localStorage.getItem('high-contrast') === 'true';
    if (isHighContrast) {
        document.body.classList.add('high-contrast');
    }

    // Große Schrift
    const isLargeText = localStorage.getItem('large-text') === 'true';
    if (isLargeText) {
        document.body.classList.add('large-text');
    }
}

/**
 * Fehlermeldung anzeigen
 */
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;

    document.body.appendChild(errorElement);

    setTimeout(() => {
        document.body.removeChild(errorElement);
    }, 5000);
}