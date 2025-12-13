# Game Concept Portfolio - Anleitung

## 📋 Projektstruktur

```
WebsitePortfolio/
├── index.html                 # Homepage
├── portfolio.html             # Portfolio-Übersicht
├── about.html                 # About Me Seite
├── assets/
│   ├── css/
│   │   └── style.css         # Hauptstyles
│   ├── js/
│   │   ├── script.js         # Globale Funktionen
│   │   └── portfolio.js      # Portfolio-Verwaltung
│   └── images/               # Allgemeine Bilder
└── concepts/
    ├── example-concept/      # Beispiel-Konzept
    │   ├── index.html        # Konzept-Detailseite
    │   ├── data.json         # Konzept-Metadaten
    │   └── images/
    │       ├── thumbnail.jpg # Thumbnail für Portfolio
    │       ├── hero.jpg      # Hero-Bild
    │       └── concept1.jpg  # Weitere Bilder
    └── [weitere-konzepte]/
```

## 🚀 Schnellstart

1. **Website öffnen**: Öffne `index.html` in deinem Browser
2. **Navigation testen**: Nutze die Menü-Links um zwischen den Seiten zu navigieren
3. **Portfolio anpassen**: Bearbeite `about.html` und ergänze deine Informationen

## ➕ Neues Konzept hinzufügen

### Option 1: Manuell über JavaScript

1. **Ordner erstellen**: Erstelle einen neuen Ordner unter `concepts/` (z.B. `concepts/mein-spiel/`)
2. **Dateien kopieren**: Kopiere die Struktur aus `example-concept/`:
   - `index.html` - Die Detailseite (anpassen)
   - `data.json` - Metadaten (ausfüllen)
   - `images/` - Ordner für Bilder
3. **Portfolio aktualisieren**: In `assets/js/portfolio.js` hinzufügen:

```javascript
addConcept(
    'mein-spiel',                          // ID (Ordnername)
    'Mein Spiel-Konzept',                  // Titel
    'Ein cooles Spielkonzept',             // Untertitel
    'Kurze Beschreibung...',               // Beschreibung
    'Genre',                               // Genre
    'concepts/mein-spiel/images/thumbnail.jpg'  // Bild-Pfad
);
```

### Option 2: Schnelle Kopier-Methode

1. Kopiere den gesamten `example-concept/` Ordner
2. Benennen um (z.B. zu `mein-spiel/`)
3. Bearbeite `index.html` und `data.json` im neuen Ordner
4. Füge den Concept mit `addConcept()` in `portfolio.js` hinzu

## 🎨 Bildanforderungen

- **Thumbnail**: 300x200px (Portfolio-Übersicht)
- **Hero-Bild**: mindestens 1200x400px (Detailseite)
- **Inhaltsbilder**: variabel, empfohlen mindestens 600px Breite

## ✏️ Anpassen & Personalisieren

### About Me Seite
Bearbeite `about.html`:
- Deine Biografie
- Fähigkeiten und Schwerpunkte
- Kontaktinformationen (Email, LinkedIn, GitHub)

### Farben & Design
In `assets/css/style.css` findest du die CSS-Variablen oben:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... weitere Farben ... */
}
```

### Navigation
Neue Links hinzufügen in den `<nav class="navbar">` Sektionen in den HTML-Dateien.

## 💡 Tipps & Tricks

### Responsive Design
- Die Website ist vollständig responsive (Mobile, Tablet, Desktop)
- Hamburger-Menü erscheint automatisch auf kleinen Bildschirmen

### Performance
- Komprimiere Bilder vor dem Hochladen
- Nutze moderne Bildformate (WEBP wenn möglich)

### SEO
- Ändere die Titel in `<title>` Tags
- Füge Meta-Beschreibungen hinzu
- Nutze aussagekräftige Alt-Texte für Bilder

## 🔧 Technologien

- **HTML5** - Struktur
- **CSS3** - Responsive Design mit Grid & Flexbox
- **JavaScript** - Interaktivität (vanilla JS, kein Framework)

## 📱 Browser-Support

- Chrome/Edge (neueste Versionen)
- Firefox (neueste Versionen)
- Safari (neueste Versionen)
- Mobile Browser (iOS Safari, Chrome Mobile)

## 🎯 Nächste Schritte

1. ✅ Homepage personalisieren
2. ✅ About Me Seite ausfüllen
3. ✅ Erstes Konzept hinzufügen
4. ✅ Bilder optimieren
5. ✅ Testing auf verschiedenen Geräten
6. 🚀 Website hosten (GitHub Pages, Vercel, Netlify, etc.)

---

Bei Fragen oder Verbesserungen: Kontaktiere mich!
