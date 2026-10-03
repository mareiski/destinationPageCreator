# Länder-Konfiguration Editor

Ein Vue.js-basierter Editor für die Verwaltung von Länder-Konfigurationen als JSON-Dateien.

## Features

- **Beautiful UI**: Modernes, benutzfreundliches Interface mit responsive Design
- **JSON Editor**: Einfache Bearbeitung von JSON-Konfigurationen mit Syntax-Highlighting
- **Dateiverwaltung**: Erstellen, Bearbeiten, Speichern und Löschen von Länder-Konfigurationen
- **Echtzeit-Validierung**: Automatische JSON-Validierung während der Eingabe
- **Template-System**: Automatische Erstellung von Vorlagen für neue Länder
- **Dateiliste**: Übersicht aller verfügbaren Länder-Konfigurationen

## Struktur

Das Projekt besteht aus:

- **Vue.js Frontend**: Benutzeroberfläche für die Bearbeitung
- **Express Server**: Backend für Dateioperationen
- **JSON-Dateien**: werden im `page-content` Ordner gespeichert

## Schnellstart

### Entwicklung

1. Installiere die Abhängigkeiten:
   ```bash
   cd destination-page-creator
   npm install
   ```

2. Starte die Entwicklungsumgebung:
   ```bash
   npm run dev-full
   ```

   oder separat:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run server
   ```

Die Anwendung ist dann unter `http://localhost:5173` (Frontend) erreichbar.

### Produktion

1. Baue die Anwendung:
   ```bash
   npm run build
   ```

2. Starte den Server:
   ```bash
   npm run build-and-start
   ```

   oder
   ```bash
   npm run server
   ```

## API Endpunkte

- `GET /api/countries` - Liste aller verfügbaren Länder
- `GET /api/country/:country` - Lädt die JSON-Datei eines bestimmten Landes
- `POST /api/save` - Speichert eine JSON-Datei
- `POST /api/new-country` - Erstellt ein neues Land mit Template
- `DELETE /api/country/:country` - Löscht eine JSON-Datei

## JSON-Struktur

Die JSON-Dateien folgen diesem Grundgerüst:

```json
{
  "country_name": "Ländername",
  "hero": {
    "eyebrow": "Kategorie",
    "title": "Titel",
    "description": "Beschreibung",
    "image": {
      "url": "Bild-URL",
      "alt": "Bild-Beschreibung"
    },
    "buttons": []
  },
  "intro": {
    "kicker": "Einleitung",
    "title": "Haupttitel",
    "paragraphs": [],
    "image": {}
  },
  "regions": {
    "kicker": "Reiseziele",
    "title": "Regionen-Titel",
    "description": "Beschreibung",
    "items": []
  },
  "community": {
    "kicker": "Community",
    "title": "Community-Titel",
    "description": "Beschreibung",
    "search": {}
  },
  "topics": {
    "kicker": "Reiseplanung",
    "title": "Themen-Titel",
    "description": "Beschreibung",
    "items": []
  },
  "destinations": {
    "kicker": "Beliebte Ziele",
    "title": "Ziele-Titel",
    "description": "Beschreibung",
    "items": []
  },
  "tips": {
    "kicker": "Reiseplanung",
    "title": "Tipps-Titel",
    "description": "Beschreibung",
    "items": []
  },
  "guide": {
    "kicker": "Reiseführer",
    "title": "Reiseführer-Titel",
    "content": []
  },
  "faq": {
    "kicker": "Häufige Fragen",
    "title": "FAQ-Titel",
    "description": "Beschreibung",
    "items": []
  },
  "breadcrumb": {
    "home_label": "Startseite"
  },
  "seo": {
    "description": "SEO-Beschreibung",
    "tourist_types": [],
    "same_as": []
  }
}
```

## Komponenten

- **CountryJsonEditor.vue**: Hauptkomponente mit allen Editor-Funktionen

## Technologien

- Vue.js 3
- TypeScript
- Express.js
- Vite
- Tailwind CSS-inspirierte Styles

## Lizenz

Privates Projekt
