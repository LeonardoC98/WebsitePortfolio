// ===== PORTFOLIO DATA =====
// Diese JSON-Daten könnten auch von einem Server kommen
const portfolioData = [

    {
        id: 'concept-dungeon',
        title: 'Dungeon Game Concept',
        description: 'Replayability through hunting mastery for drops and level resets for skill mastery.',
        image: 'concepts/concept-dungeon/images/dungeon.jpg',
        genre: 'RPG',
        link: 'concepts/concept-dungeon/index.html',
        overview: 'Ein strategisches Dungeon-Konzept mit innovativen Mechaniken.',
        mechanics: [
            { name: 'Dungeon System', description: 'Dynamische Dungeons und Exploration' },
            { name: 'Ressourcenmanagement', description: 'Strategische Ressourcen-Verwaltung' }
        ]
    },
    {
        id: 'concept-puzzle',
        title: 'Puzzle Adventure',
        description: 'Ein innovatives Rätsel-Adventure mit physikalischen Interaktionen und Umweltpuzzles.',
        image: 'concepts/concept-puzzle/images/puzzle.jpg',
        genre: 'Puzzle',

        link: 'concepts/concept-puzzle/index.html',
        overview: 'Umweltbasierte Rätsel mit eleganten Lösungen.',
        mechanics: [
            { name: 'Physics Puzzles', description: 'Schwerkraft und Objekt-Interaktionen' },
            { name: 'Environmental Clues', description: 'Umwelt erzählt die Geschichte' }
        ]
    },

];

// Weitere Konzepte können hier hinzugefügt werden
// {
//     id: 'concept-2',
//     title: 'Another Concept',
//     description: 'Description',
//     subtitle: 'Subtitle',
//     image: 'concepts/concept-2/images/thumbnail.jpg',
//     genre: 'genre',
//     link: 'concepts/concept-2/index.html'
// },

// ===== PORTFOLIO GRID LADEN =====
function loadPortfolio(filter = '', searchQuery = '') {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    const q = (searchQuery || '').trim().toLowerCase();

    const items = portfolioData.filter(c => {
        if (!q) return true;

        const title = (c.title || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const genre = (c.genre || '').toLowerCase();

        // Filter based on selected filter type
        switch (filter) {
            case 'title':
                return title.includes(q);
            case 'description':
                return desc.includes(q);
            case 'genre':
                return genre.includes(q);
            case 'all':
            default:
                return title.includes(q) || desc.includes(q) || genre.includes(q);
        }
    });

    if (items.length === 0) {
        portfolioGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                Keine Ergebnisse gefunden.
            </div>
        `;
        return;
    }

    items.forEach(concept => {
        const card = document.createElement('a');
        card.href = concept.link;
        card.className = 'portfolio-card';
        card.innerHTML = `
            <img src="${concept.image}" alt="${concept.title}" class="portfolio-card-image">
            <div class="portfolio-card-content">
                <h3>${concept.title}</h3>
                <p>${concept.description || concept.subtitle || ''}</p>
                <div class="portfolio-card-meta">
                    <span>${concept.genre}</span>
                    <span class="portfolio-card-link">Mehr →</span>
                </div>
            </div>
        `;

        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        portfolioGrid.appendChild(card);
    });
}

// Debounce helper
function debounce(fn, delay = 250) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Wire up search on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolio('all', '');

    const searchEl = document.getElementById('portfolioSearch');
    const clearEl = document.getElementById('portfolioClear');
    const filterTabs = document.querySelectorAll('.filter-tab');

    let currentFilter = 'all';

    // Wire up filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            loadPortfolio(currentFilter, searchEl ? searchEl.value : '');
        });
    });

    if (searchEl) {
        const onInput = debounce(function(e) {
            loadPortfolio(currentFilter, e.target.value);
        }, 200);

        searchEl.addEventListener('input', onInput);
        searchEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchEl.value = '';
                loadPortfolio(currentFilter, '');
            }
        });
    }

    if (clearEl) {
        clearEl.addEventListener('click', function() {
            if (searchEl) {
                searchEl.value = '';
                searchEl.focus();
                loadPortfolio(currentFilter, '');
            }
        });
    }
});

// ===== LOAD CONCEPT DETAILS DYNAMICALLY =====
function loadConceptDetails() {
    // Extrahiere Konzept-ID aus URL
    const pathParts = window.location.pathname.split('/');
    const conceptId = pathParts[pathParts.length - 2];
    
    console.log('Loading concept:', conceptId);
    
    // Finde das Konzept
    const concept = portfolioData.find(c => c.id === conceptId);
    
    if (!concept) {
        console.log('Concept not found!');
        return;
    }

    console.log('Found concept:', concept);

    // Befülle Hero-Section mit IDs
    const titleEl = document.getElementById('conceptTitle');
    const subtitleEl = document.getElementById('conceptSubtitle');
    const imageEl = document.getElementById('conceptHeroImage');
    
    if (titleEl) {
        titleEl.textContent = concept.title;
        console.log('Title set to:', concept.title);
    }
    
    if (subtitleEl) {
        subtitleEl.textContent = concept.subtitle || concept.description;
        console.log('Subtitle set to:', concept.subtitle);
    }
    
    if (imageEl && concept.hero_image) {
        // Verwende das Bild aus data.json
        imageEl.src = './' + concept.hero_image;
        console.log('Image src set to:', './' + concept.hero_image);
        
        // Error-Handler falls Bild nicht lädt
        imageEl.onerror = function() {
            console.log('Image failed to load:', this.src);
            console.log('Trying absolute path from root...');
            // Fallback zu absolutem Pfad
            this.src = '/' + concept.image;
        };
    }

    // Befülle Overview
    const overviewEl = document.getElementById('conceptOverview');
    if (overviewEl) overviewEl.textContent = concept.overview || concept.description;

    // Befülle Spielmechaniken
    const mechanicsContainer = document.getElementById('mechanicsContainer');
    if (mechanicsContainer && concept.mechanics) {
        mechanicsContainer.innerHTML = '';
        concept.mechanics.forEach(mechanic => {
            const item = document.createElement('div');
            item.className = 'mechanic-card';
            item.innerHTML = `<h3>${mechanic.name}</h3><p>${mechanic.description}</p>`;
            mechanicsContainer.appendChild(item);
        });
    }

    // Befülle technische Details
    const genreEl = document.getElementById('conceptGenre');
    const platformsEl = document.getElementById('conceptPlatforms');
    const typeEl = document.getElementById('conceptType');
    const audienceEl = document.getElementById('conceptAudience');
    
    if (genreEl) genreEl.textContent = concept.genre;
    if (platformsEl) platformsEl.textContent = (concept.platforms || []).join(', ');
    if (typeEl) typeEl.textContent = concept.type || 'Single-Player';
    if (audienceEl) audienceEl.textContent = concept.target_audience || '13+';

    // Befülle Titel im Browser-Tab
    document.title = `${concept.title} - Game Concepts`;
}

document.addEventListener('DOMContentLoaded', loadConceptDetails);

// ===== ADD NEW CONCEPT HELPER FUNCTION =====
/**
 * Fügt ein neues Konzept zur Portfolio-Liste hinzu
 * Beispiel: addConcept('my-game', 'My Game Title', 'Subtitle', 'Description', 'Genre', 'path/to/image.jpg')
 */
function addConcept(id, title, subtitle, description, genre, image) {
    const newConcept = {
        id: id,
        title: title,
        subtitle: subtitle,
        description: description,
        image: image,
        genre: genre,
        link: `concepts/${id}/index.html`
    };
    
    portfolioData.push(newConcept);
    console.log(`Concept "${title}" added successfully!`);
}

// ===== EMPTY PORTFOLIO MESSAGE =====
function checkPortfolioEmpty() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    if (portfolioGrid && portfolioData.length === 0) {
        portfolioGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <p style="color: var(--text-light); font-size: 1.1rem;">
                    Noch keine Konzepte hinzugefügt. Verwende <code>addConcept()</code> um neue Konzepte zu erstellen.
                </p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', checkPortfolioEmpty);
