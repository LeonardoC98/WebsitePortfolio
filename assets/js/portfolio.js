// ===== PORTFOLIO DATA =====
// Diese JSON-Daten könnten auch von einem Server kommen
const portfolioData = [

    {
        id: 'concept-dungeon',
        title: 'Dungeon Game Concept',
        description: 'Replayability through hunting mastery for drops and level resets for skill mastery.',
        image: 'concepts/concept-dungeon/images/dungeon.jpg',
        tags: ['System', 'Progression', 'Enemy', 'PVM'],
        link: 'concepts/concept-dungeon/index.html',
        overview: 'Ein strategisches Dungeon-Konzept mit innovativen Mechaniken.',
        mechanics: [
            { name: 'Dungeon System', description: 'Dynamische Dungeons und Exploration' },
            { name: 'Ressourcenmanagement', description: 'Strategische Ressourcen-Verwaltung' }
        ]
    },
    {
        id: 'concept-puzzle',
        title: 'TCG Card Game',
        description: 'Ein innovatives Rätsel-Adventure mit physikalischen Interaktionen und Umweltpuzzles.',
        image: 'concepts/concept-puzzle/images/puzzle.jpg',
        tags: ['Game Concept', 'Card Game', 'PVP'],
        link: 'concepts/concept-puzzle/index.html',
        overview: 'Umweltbasierte Rätsel mit eleganten Lösungen.',
        mechanics: [
            { name: 'Physics Puzzles', description: 'Schwerkraft und Objekt-Interaktionen' },
            { name: 'Environmental Clues', description: 'Umwelt erzählt die Geschichte' }
        ]
    },
    {
        id: 'concept-weapon-upgrades',
        title: 'Weapon Upgrades System',
        description: 'A sophisticated weapon upgrade system with deep progression and extensive customization options.',
        description_de: 'Ein durchdachtes Upgrade-System für Waffen mit tiefgehender Progression und Anpassungsmöglichkeiten.',
        image: 'concepts/concept-weapon-upgrades/images/weaponupgrade.jpg',
        tags: ['System', 'Progression', 'Upgrade'],
        link: 'concepts/concept-weapon-upgrades/index.html',
        overview: 'An innovative weapon upgrade system with strategic depth.',
        overview_de: 'Ein innovatives Waffen-Upgrade-System mit strategischer Tiefe.',
        mechanics: [
            { name: 'Upgrade System', description: 'Tiered improvement system with multiple paths', description_de: 'Stufenweises Verbesserungs-System' },
            { name: 'Weapon Customization', description: 'Individual adaptation and specialization', description_de: 'Individuelle Anpassung und Spezialisierung' }
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

// ===== HILFSFUNKTION FÜR LOKALISIERUNG =====
function getLocalizedText(concept, field) {
    const lang = localStorage.getItem('language') || 'en';
    const localizedField = field + '_de';
    if (lang === 'de' && concept[localizedField]) {
        return concept[localizedField];
    }
    return concept[field] || '';
}

// ===== PORTFOLIO GRID LADEN =====
function loadPortfolio(searchQuery = '', selectedTags = []) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    const q = (searchQuery || '').trim().toLowerCase();

    const items = portfolioData.filter(c => {
        // Filter by search query
        let matchesSearch = true;
        if (q) {
            const title = (c.title || '').toLowerCase();
            const desc = (c.description || '').toLowerCase();
            const tags = (c.tags || []).map(t => t.toLowerCase()).join(' ');
            matchesSearch = title.includes(q) || desc.includes(q) || tags.includes(q);
        }

        // Filter by selected tags (concept must have at least one selected tag)
        let matchesTags = true;
        if (selectedTags.length > 0) {
            matchesTags = (c.tags || []).some(tag => selectedTags.includes(tag));
        }

        return matchesSearch && matchesTags;
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
        const tagsHTML = (concept.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        const description = getLocalizedText(concept, 'description');
        card.innerHTML = `
            <img src="${concept.image}" alt="${concept.title}" class="portfolio-card-image">
            <div class="portfolio-card-content">
                <h3>${concept.title}</h3>
                <p>${description || concept.subtitle || ''}</p>
                <div class="portfolio-card-meta">
                    <div class="portfolio-card-tags">${tagsHTML}</div>
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

// Get all unique tags from portfolio data
function getAllTags() {
    const allTags = new Set();
    portfolioData.forEach(concept => {
        (concept.tags || []).forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
}

// Initialize tag filter dropdown
function initTagFilter() {
    const btn = document.getElementById('tagSelectBtn');
    const list = document.getElementById('tagDropdownList');
    
    if (!btn || !list) return;

    const allTags = getAllTags();
    list.innerHTML = '';

    allTags.forEach(tag => {
        const option = document.createElement('div');
        option.className = 'tag-option';
        
        const label = document.createElement('label');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = tag;
        checkbox.id = 'tag_' + tag.replace(/\s/g, '_');
        
        const labelText = document.createElement('span');
        labelText.textContent = tag;
        
        checkbox.addEventListener('change', function() {
            updateSelectedTagsDisplay();
            updatePortfolioWithFilters();
        });
        
        label.appendChild(checkbox);
        label.appendChild(labelText);
        option.appendChild(label);
        list.appendChild(option);
    });

    // Toggle dropdown
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        list.classList.toggle('show');
        btn.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!list.contains(e.target) && !btn.contains(e.target)) {
            list.classList.remove('show');
            btn.classList.remove('active');
        }
    });
}

// Update display of selected tags
function updateSelectedTagsDisplay() {
    const display = document.getElementById('selectedTagsDisplay');
    const checkboxes = document.querySelectorAll('.tag-option input[type="checkbox"]:checked');
    
    if (!display) return;
    
    display.innerHTML = '';
    
    checkboxes.forEach(checkbox => {
        const badge = document.createElement('span');
        badge.className = 'selected-tag-badge';
        badge.textContent = checkbox.value;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-tag-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function() {
            checkbox.checked = false;
            updateSelectedTagsDisplay();
            updatePortfolioWithFilters();
        });
        
        badge.appendChild(removeBtn);
        display.appendChild(badge);
    });
}

// Update portfolio based on current filters
function updatePortfolioWithFilters() {
    const searchEl = document.getElementById('portfolioSearch');
    const selectedTags = Array.from(document.querySelectorAll('.tag-option input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    loadPortfolio(searchEl ? searchEl.value : '', selectedTags);
}

// Wire up search on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initTagFilter();
    loadPortfolio('', []);

    const searchEl = document.getElementById('portfolioSearch');
    const clearEl = document.getElementById('portfolioClear');

    if (searchEl) {
        const onInput = debounce(function(e) {
            updatePortfolioWithFilters();
        }, 200);

        searchEl.addEventListener('input', onInput);
        searchEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchEl.value = '';
                updatePortfolioWithFilters();
            }
        });
    }

    if (clearEl) {
        clearEl.addEventListener('click', function() {
            if (searchEl) {
                searchEl.value = '';
                searchEl.focus();
                updatePortfolioWithFilters();
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
    
    if (genreEl) genreEl.textContent = (concept.tags || []).join(', ');
    if (platformsEl) platformsEl.textContent = (concept.platforms || []).join(', ');
    if (typeEl) typeEl.textContent = concept.type || 'Single-Player';

    // Befülle Titel im Browser-Tab
    document.title = `${concept.title} - Game Concepts`;
}

document.addEventListener('DOMContentLoaded', loadConceptDetails);

// ===== ADD NEW CONCEPT HELPER FUNCTION =====
/**
 * Fügt ein neues Konzept zur Portfolio-Liste hinzu
 * Beispiel: addConcept('my-game', 'My Game Title', 'Subtitle', 'Description', ['RPG', 'Action'], 'path/to/image.jpg')
 */
function addConcept(id, title, subtitle, description, tags, image) {
    const newConcept = {
        id: id,
        title: title,
        subtitle: subtitle,
        description: description,
        image: image,
        tags: tags || [],
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
