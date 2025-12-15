// ===== CONCEPT DATA =====
// Concept data wird dynamisch aus den data.json Dateien in den concept-Ordnern geladen
let conceptData = [];
let conceptInitialized = false;

/**
 * Lädt die Concept-Daten dynamisch aus allen concept-Ordnern
 * Jeder concept-Ordner sollte eine data.json mit den Concept-Metadaten enthalten
 */
async function loadConceptData() {
    try {
        // Erkenne den Kontext: Bin ich auf einer Detail-Seite oder auf der Übersicht?
        // Auf Detail-Seite: /concepts/concept-dungeon/index.html
        // Auf Übersicht: /concepts.html
        const isDetailPage = window.location.pathname.includes('/concepts/') && 
                            window.location.pathname !== '/concepts.html' &&
                            !window.location.pathname.endsWith('/concepts/');
        
        const pathPrefix = isDetailPage ? '../../' : '';

        conceptData = [];

        try {
            // Fetch dynamic concepts list from server
            const res = await fetch('/api/concepts-index');
            if (!res.ok) throw new Error('Failed to fetch concepts index');
            
            const { concepts } = await res.json();
            
            // Load each concept's data.json
            for (const path of concepts) {
                try {
                    // Add path prefix for detail pages
                    const fullPath = isDetailPage ? pathPrefix + path : path;
                    const response = await fetch(fullPath);
                    if (response.ok) {
                        const data = await response.json();
                        conceptData.push(data);
                        console.log(`Concept data loaded from ${fullPath}:`, data);
                    } else {
                        console.warn(`Failed to load ${fullPath}: ${response.status}`);
                    }
                } catch (error) {
                    console.warn(`Error loading ${path}:`, error);
                }
            }
        } catch (e) {
            console.warn('Error loading concepts index:', e);
        }

        console.log('Total concept items loaded:', conceptData.length);
        return conceptData;
    } catch (error) {
        console.error('Error loading concept data:', error);
        return [];
    }
}

// ===== CONCEPT GRID LADEN =====
function loadConcepts(searchQuery = '', selectedTags = []) {
    const conceptGrid = document.getElementById('conceptGrid');
    if (!conceptGrid) return;

    conceptGrid.innerHTML = '';

    const q = (searchQuery || '').trim().toLowerCase();
    const lang = localStorage.getItem('language') || 'de';

    const items = conceptData.filter(c => {
        // Get title and description directly from data based on language
        const title = (lang === 'de' ? c.titleDE : c.titleEN) || '';
        const desc = (lang === 'de' ? c.descriptionDE : c.descriptionEN) || '';
        const tags = (c.tags || []).map(t => t.toLowerCase()).join(' ');
        
        // Filter by search query
        let matchesSearch = true;
        if (q) {
            matchesSearch = title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || tags.includes(q);
        }

        // Filter by selected tags
        let matchesTags = true;
        if (selectedTags.length > 0) {
            matchesTags = (c.tags || []).some(tag => selectedTags.includes(tag));
        }

        return matchesSearch && matchesTags;
    });

    if (items.length === 0) {
        conceptGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-light);">
                ${t('concept.noResults')}
            </div>
        `;
        return;
    }

    items.forEach(concept => {
        const card = document.createElement('a');
        card.href = concept.link;
        // Use portfolio card classes so existing CSS applies
        card.className = 'portfolio-card';
        const tagsHTML = (concept.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Get title and description directly from data based on language
        const title = lang === 'de' ? concept.titleDE : concept.titleEN;
        const description = lang === 'de' ? concept.descriptionDE : concept.descriptionEN;
        
        card.innerHTML = `
            <img src="${concept.image}" alt="${title}" class="portfolio-card-image">
            <div class="portfolio-card-content">
                <h3>${title}</h3>
                <p>${description}</p>
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

        conceptGrid.appendChild(card);
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

// Get all unique tags from concept data
function getAllTags() {
    const allTags = new Set();
    conceptData.forEach(concept => {
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
            updateConceptWithFilters();
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
            updateConceptWithFilters();
        });
        
        badge.appendChild(removeBtn);
        display.appendChild(badge);
    });
}

// Update concept based on current filters
function updateConceptWithFilters() {
    const searchEl = document.getElementById('conceptSearch');
    const selectedTags = Array.from(document.querySelectorAll('.tag-option input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    loadConcepts(searchEl ? searchEl.value : '', selectedTags);
}

// Wire up search on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    // Verhindere mehrfaches Laden
    if (conceptInitialized) return;
    conceptInitialized = true;

    // Lade Concept-Daten zuerst
    await loadConceptData();
    // Wait for i18n to load
    await new Promise(resolve => {
        const checkI18n = setInterval(() => {
            if (typeof t === 'function' && typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
                clearInterval(checkI18n);
                resolve();
            }
        }, 50);
    });
    
    initTagFilter();
    loadConcepts('', []);

    const searchEl = document.getElementById('conceptSearch');
    const clearEl = document.getElementById('conceptClear');

    if (searchEl) {
        const onInput = debounce(function(e) {
            updateConceptWithFilters();
        }, 200);

        searchEl.addEventListener('input', onInput);
        searchEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchEl.value = '';
                updateConceptWithFilters();
            }
        });
    }

    if (clearEl) {
        clearEl.addEventListener('click', function() {
            if (searchEl) {
                searchEl.value = '';
                searchEl.focus();
                updateConceptWithFilters();
            }
        });
    }
});

// ===== LOAD CONCEPT DETAILS DYNAMICALLY =====
async function loadConceptDetails() {
    // Lade Concept-Daten zuerst falls noch nicht geladen
    if (conceptData.length === 0) {
        await loadConceptData();
    }

    // Wait for i18n to load
    await new Promise(resolve => {
        const checkI18n = setInterval(() => {
            if (typeof t === 'function' && typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
                clearInterval(checkI18n);
                resolve();
            }
        }, 50);
    });

    // Extrahiere Konzept-ID aus URL
    const pathParts = window.location.pathname.split('/');
    const conceptId = pathParts[pathParts.length - 2];
    
    console.log('Loading concept:', conceptId);
    
    // Finde das Konzept
    const concept = conceptData.find(c => c.id === conceptId);
    
    if (!concept) {
        console.log('Concept not found!');
        return;
    }

    console.log('Found concept:', concept);

    // Befülle Hero-Section mit IDs
    const titleEl = document.getElementById('conceptTitle');
    const subtitleEl = document.getElementById('conceptSubtitle');
    const imageEl = document.getElementById('conceptHeroImage');
    
    // Nutze translationKey wenn verfügbar, ansonsten fallback
    const translatedTitle = concept.translationKey ? t(`${concept.translationKey}.title`) : concept.title;
    const translatedDesc = concept.translationKey ? t(`${concept.translationKey}.description`) : concept.description;
    
    if (titleEl) {
        titleEl.textContent = translatedTitle;
        console.log('Title set to:', translatedTitle);
    }
    
    if (subtitleEl) {
        subtitleEl.textContent = concept.subtitle || translatedDesc;
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
    if (overviewEl) overviewEl.textContent = concept.overview || translatedDesc;

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
    document.title = `${translatedTitle} - Game Concepts`;
}

document.addEventListener('DOMContentLoaded', async function() {
    // Verhindere mehrfaches Laden
    if (conceptInitialized) return;
    conceptInitialized = true;

    loadConceptDetails();
});

