# Berlin Barrierefrei PWA

Eine vollständig barrierefreie Progressive Web App für die Navigation durch Berlin, speziell entwickelt für Menschen mit Mobilitätseinschränkungen.

## 🚀 Funktionen

### Hauptfunktionen
- **Barrierefreie Orte finden**: Umfassende Datenbank mit 12+ zertifizierten Orten
- **BVG Services**: Aktuelle Aufzugsstörungen und direkter Zugang zu BVG Muva Shuttle
- **Veranstaltungskalender**: Barrierefreie Kultur- und Freizeitangebote
- **Notfallkontakte**: Schnellzugriff auf wichtige Telefonnummern
- **Offline-Funktionalität**: Vollständige Nutzung ohne Internetverbindung

### Barrierefreiheits-Features (WCAG 2.2 AA-konform)
- ♿ **Rollstuhlgerecht**: Große Touch-Targets (min. 44px)
- 👁️ **Sehbehinderung**: Hoher Kontrast, vergrößerbare Schrift, Screen Reader-Optimierung
- 👂 **Hörbehinderung**: Visuelle Benachrichtigungen, Untertitel-Support
- ⌨️ **Motorische Einschränkungen**: Vollständige Tastaturnavigation
- 🧠 **Kognitive Unterstützung**: Einfache Navigation, klare Struktur

## 📱 Installation auf iPhone/iPad

### Schritt 1: PWA online stellen
1. **Webserver vorbereiten**: Die PWA muss auf einem HTTPS-Server gehostet werden
2. **Dateien hochladen**: Alle Projektdateien auf Ihren Webserver kopieren
3. **URL testen**: Stellen Sie sicher, dass die PWA über HTTPS erreichbar ist

### Schritt 2: Installation über Safari
1. **Safari öffnen** auf iPhone/iPad
2. **URL eingeben**: Navigieren Sie zur PWA-Adresse
3. **Teilen-Button tippen**: Symbol unten in Safari (Quadrat mit Pfeil)
4. **"Zum Home-Bildschirm hinzufügen"** auswählen
5. **App-Name bestätigen** und "Hinzufügen" tippen
6. **Native App-Erfahrung**: PWA startet im Vollbildmodus

## 🛠️ Technische Anforderungen

### Server-Anforderungen
- **HTTPS**: Zwingend erforderlich für PWA-Installation
- **Web Server**: Apache, Nginx, oder Cloud-Hosting
- **Dateigröße**: ~2MB für komplettes Projekt

### Browser-Support
- ✅ **Safari** (iOS 11.3+): Vollständige PWA-Unterstützung
- ✅ **Chrome** (iOS 16.4+): Eingeschränkte PWA-Features
- ✅ **Firefox** (iOS): Grundfunktionen
- ❌ **Chrome** (iOS <16.4): Keine PWA-Installation

### iOS-Funktionen
- 📲 **Home-Screen-Icon**: Wie native App
- 🖥️ **Vollbild-Modus**: Ohne Browser-Interface
- 💾 **Offline-Nutzung**: Service Worker mit Cache
- 🔔 **Push-Benachrichtigungen**: Ab iOS 16.4 (eingeschränkt)

## 📁 Projektstruktur

```
berlin-barrierefrei-pwa/
├── index.html              # Haupt-HTML-Datei
├── manifest.json           # Web App Manifest
├── service-worker.js       # Service Worker für Offline-Features
├── styles/
│   └── main.css            # Komplettes Stylesheet
├── scripts/
│   └── app.js              # JavaScript-Logik
├── data/
│   └── locations.json      # Datenbank mit 12 Orten
├── images/
│   └── icons/              # App-Icons (192x192, 512x512)
└── README.md               # Diese Datei
```

## 🔧 Hosting-Optionen

### Kostenlose Lösungen
1. **Netlify** (empfohlen)
   - Drag & Drop Deployment
   - Automatische HTTPS
   - URL: [netlify.com](https://netlify.com)

2. **Vercel**
   - PWA-optimiert
   - Edge-Funktionen
   - URL: [vercel.com](https://vercel.com)

3. **GitHub Pages**
   - Für Open Source Projekte
   - Jekyll-Support
   - URL: [pages.github.com](https://pages.github.com)

### Professionelle Lösungen
- **AWS S3 + CloudFront**: Globale CDN-Verteilung
- **Firebase Hosting**: Google-Integration
- **Azure Static Web Apps**: Microsoft-Ökosystem

## 🚀 Schnellstart mit Netlify

1. **Projektdateien zippen**: Alle Dateien in berlin-barrierefrei.zip
2. **Netlify öffnen**: [app.netlify.com/drop](https://app.netlify.com/drop)
3. **ZIP-Datei hochziehen**: Drag & Drop in Browser
4. **URL kopieren**: Wird automatisch generiert
5. **Safari öffnen**: URL eingeben und installieren

## 📊 Enthaltene Daten

### Barrierefreie Orte (12 Standorte)
- **Sehenswürdigkeiten**: Reichstagsgebäude, East Side Gallery, Humboldt Forum
- **Restaurants**: Restaurant Alvis, Café Sterntal, Benedict Berlin
- **Hotels**: Waldorf Astoria Berlin, relexa hotel Berlin
- **Kultur**: Futurium, Anne Frank Zentrum, Friedrichstadt-Palast

### Jeder Ort enthält:
- Vollständige Adresse und Kontaktdaten
- Detaillierte Barrierefreiheits-Bewertung
- GPS-Koordinaten
- Spezifische Features (Rampen, Aufzüge, etc.)
- Kategorisierung nach Zugänglichkeit

## ⚡ Performance-Features

- **Service Worker**: Intelligente Caching-Strategien
- **Offline-First**: Funktioniert ohne Internet
- **Lazy Loading**: Optimierte Ladezeiten
- **Komprimierung**: Minimale Dateigröße
- **Critical CSS**: Sofortige Darstellung

## 🔒 Sicherheit & Datenschutz

- **HTTPS-Only**: Sichere Datenübertragung
- **Keine Tracking**: Kein Google Analytics
- **Lokale Speicherung**: Daten bleiben auf Gerät
- **Open Source**: Transparenter Code

## 🛠️ Anpassungen & Erweiterungen

### Daten erweitern
1. **locations.json bearbeiten**: Neue Orte hinzufügen
2. **JSON-Format**: Bestehende Struktur beibehalten
3. **Cache leeren**: Service Worker-Cache aktualisieren

### Design anpassen
1. **CSS-Variablen**: In main.css definiert
2. **Farben ändern**: --primary-color, --secondary-color
3. **Typografie**: --font-size-* Variablen

### Features hinzufügen
- **GPS-Navigation**: Navigator.geolocation API
- **Push-Benachrichtigungen**: Service Worker erweitern
- **Mehrsprachigkeit**: i18n-System implementieren

## 📞 Support & Kontakt

### Technischer Support
- **GitHub Issues**: Für Bug-Reports
- **E-Mail**: support@berlin-barrierefrei.de
- **Dokumentation**: Siehe README und Code-Kommentare

### Feedback & Verbesserungen
- Ihre Erfahrungen helfen uns, die App zu verbessern
- Melden Sie Barrierefreiheits-Probleme
- Schlagen Sie neue Features vor

## 📝 Lizenz

MIT License - Freie Nutzung und Anpassung erlaubt.

## 🙏 Danksagungen

- **BVG Berlin**: Für öffentliche API-Daten
- **Reisen für Alle**: Für Zertifizierungsstandards
- **WCAG**: Für Barrierefreiheits-Richtlinien
- **PWA Community**: Für technische Standards

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: Juni 2025  
**Kompatibilität**: iOS 11.3+, Safari 12+

Für weitere Informationen besuchen Sie unsere Website oder kontaktieren Sie uns direkt.