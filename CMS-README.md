# 📝 Content Management System (CMS)

## 🚀 Übersicht

Dein Portfolio hat jetzt ein vollständiges Content Management System zum Erstellen und Veröffentlichen von Blog-Posts und Portfolio-Einträgen direkt im Browser!

## ✨ Features

- 🔐 **Passwort-geschützt** - Sicherer Admin-Zugang
- 📱 **Template-basiert** - 10+ vorgefertigte Content-Templates
- 🌍 **Zweisprachig** - DE/EN Unterstützung für alle Inhalte
- 📤 **GitHub Integration** - Automatisches Speichern ins Repository
- 🎨 **Drag & Drop** - Einfaches Hochladen von Bildern
- 📋 **Live Preview** - Vorschau vor Veröffentlichung

## 🔧 Setup

### 1. Admin-Passwort ändern

Öffne `assets/js/admin-editor.js` und ändere das Passwort:

```javascript
const ADMIN_PASSWORD = 'admin123'; // Ändere dies zu einem sicheren Passwort!
```

### 2. GitHub Personal Access Token erstellen

1. Gehe zu: https://github.com/settings/tokens
2. Klicke auf **"Generate new token (classic)"**
3. Gebe dem Token einen Namen (z.B. "Portfolio CMS")
4. Wähle **"repo"** Scope (voller Zugriff auf Repositories)
5. Klicke **"Generate token"**
6. **Kopiere den Token sofort** (wird nur einmal angezeigt!)

### 3. GitHub Settings konfigurieren

1. Öffne https://deine-domain.com/admin.html
2. Gib das Passwort ein
3. Klicke auf **"⚙️ Settings"**
4. Fülle aus:
   - **GitHub Personal Access Token**: Dein Token von Schritt 2
   - **Repository Owner**: Dein GitHub Username
   - **Repository Name**: Name des Repos (z.B. "portfolio-website")
   - **Branch**: `main` (oder dein Haupt-Branch)
5. Klicke **"Save Settings"**

## 📝 Neuen Content erstellen

### Blog Post erstellen

1. Öffne Admin Panel über den **[+]** Button in der Navbar
2. Gib Passwort ein
3. Wähle **"📰 Blog Post"**
4. Fülle Basic Information aus:
   - **ID**: Eindeutiger Identifier (z.B. `my-new-post`)
   - **Title**: Titel in DE und EN
   - **Excerpt**: Kurzbeschreibung in DE und EN
   - **Date**: Veröffentlichungsdatum
   - **Category**: Kategorie (z.B. "Game Design")
   - **Tags**: Komma-getrennt (z.B. "RPG, Mechanics, Balance")
   - **Hero Image**: Titelbild hochladen

5. **Content Sections hinzufügen**:
   - Klicke **"+ Add Section"**
   - Wähle ein Template
   - Fülle die Felder aus

6. **Speichern**:
   - Klicke **"💾 Save to GitHub"**
   - Warte auf Bestätigung
   - Content wird automatisch ins Repository committed

### Portfolio Item erstellen

Gleicher Prozess wie Blog Post, wähle nur **"🎮 Portfolio Item"** statt Blog Post.

## 📦 Verfügbare Templates

### 1. 📝 Text
Einfacher Text mit Titel
- Ideal für: Beschreibungen, Erklärungen

### 2. ✨ Features
Liste mit Icons und Text
- Ideal für: Mechaniken, Features, Key Points

### 3. 💡 Example
Hervorgehobene Beispiel-Box
- Ideal für: Case Studies (z.B. "Beispiel: Diablo Series")

### 4. ❌ Mistakes
Fehler-Liste mit roten X-Icons
- Ideal für: Häufige Fehler, Anti-Patterns

### 5. 📋 List
Nummerierte oder unnummerierte Liste mit Labels
- Ideal für: Design-Prinzipien, Schritte

### 6. • Bulletpoints
Einfache Aufzählungsliste
- Ideal für: Quick Facts, Zusammenfassungen

### 7. 🖼️ Gallery
Bild-Galerie
- Ideal für: Screenshots, Concept Art

### 8. 🎥 Video
Video-Einbettung (YouTube oder MP4)
- Ideal für: Trailers, Tutorials

### 9. 💬 Quote
Zitat mit Autor
- Ideal für: Design-Philosophie, Testimonials

### 10. 💻 Code
Code-Snippet mit Syntax-Highlighting
- Ideal für: Formeln, Berechnungen

## 🎯 Best Practices

### Content-IDs
- Nur Kleinbuchstaben
- Bindestriche statt Leerzeichen
- Keine Sonderzeichen
- Beispiel: `gameplay-loops-mmorpgs`

### Bilder
- **Hero Images**: 1920x1080px (16:9)
- **Gallery Images**: 1200x800px
- Format: JPG oder PNG
- Dateigröße: < 1MB pro Bild

### Text
- Kurze Absätze (3-5 Sätze)
- Klare Überschriften
- HTML erlaubt: `<strong>`, `<br>`, `<em>`

## 🔄 Workflow

```
1. Admin öffnen → Passwort eingeben
2. Content-Type wählen (Blog/Portfolio)
3. Basic Info ausfüllen
4. Sections hinzufügen
   ├─ Template wählen
   ├─ Felder ausfüllen (DE + EN)
   └─ Weitere Sections hinzufügen
5. Preview prüfen (optional)
6. Save to GitHub
7. ✅ Automatisches Deployment
```

## 🚨 Troubleshooting

### "GitHub API error"
- Token überprüfen (noch gültig?)
- Repository-Namen überprüfen
- Branch-Namen überprüfen

### "Incorrect password"
- Passwort in `admin-editor.js` überprüfen
- Browser-Cache leeren

### Bilder werden nicht angezeigt
- Dateigröße < 1MB?
- Format JPG/PNG?
- GitHub Token hat "repo" Scope?

## 📄 Datei-Struktur

Nach dem Speichern werden folgende Dateien erstellt:

```
blog/
  my-new-post/
    ├─ index.html          (Generiert)
    ├─ content-de.json     (Deutsche Inhalte)
    ├─ content-en.json     (Englische Inhalte)
    └─ hero.jpg           (Hero Image)
```

## 🔐 Sicherheit

- **Passwort ändern**: Ändere `ADMIN_PASSWORD` in `admin-editor.js`
- **Token-Sicherheit**: GitHub Token niemals öffentlich teilen
- **Token-Scope**: Nur "repo" Scope, keine weiteren Berechtigungen
- **Token erneuern**: Alle 90 Tage neuen Token erstellen

## 🌟 Tipps

1. **Template-Reihenfolge**: Templates können per ↑↓ verschoben werden
2. **Vorschau**: Nutze Preview-Funktion vor dem Speichern
3. **Backup**: GitHub versioniert alles automatisch
4. **Revert**: Bei Fehler über GitHub History zurücksetzen

## 📞 Support

Bei Problemen:
1. Browser-Konsole öffnen (F12)
2. Fehlermeldungen kopieren
3. GitHub Issues erstellen

---

**Version 1.0** - Erstellt am 14. Dezember 2025
