// Load concept data from data.json and populate the page
async function loadConceptData() {
    try {
        // Get concept ID from URL path
        const pathParts = window.location.pathname.split('/');
        const conceptIndex = pathParts.indexOf('concepts');
        const conceptFolder = pathParts[conceptIndex + 1];
        
        if (!conceptFolder) return;
        
        // Fetch concept data
        const response = await fetch(`../../concepts/${conceptFolder}/data.json`);
        const concept = await response.json();
        
        // Load hero image
        const heroImage = document.getElementById('conceptHeroImage');
        if (heroImage) {
            heroImage.src = concept.hero_image;
        }
        
        // Load concept title
        const titleEl = document.getElementById('conceptTitle');
        if (titleEl) {
            titleEl.textContent = concept.title;
        }
        
        // Load concept subtitle
        const subtitleEl = document.getElementById('conceptSubtitle');
        if (subtitleEl) {
            subtitleEl.textContent = concept.subtitle;
        }
        
        // Load overview
        const overviewEl = document.getElementById('conceptOverview');
        if (overviewEl) {
            overviewEl.textContent = concept.overview;
        }
        
        // Load mechanics
        const mechanicsContainer = document.getElementById('mechanicsContainer');
        if (mechanicsContainer && concept.mechanics) {
            mechanicsContainer.innerHTML = '';
            concept.mechanics.forEach(mechanic => {
                const mechanicHTML = `
                    <div class="mechanic-item">
                        <h3>${mechanic.name}</h3>
                        <p>${mechanic.description}</p>
                    </div>
                `;
                mechanicsContainer.insertAdjacentHTML('beforeend', mechanicHTML);
            });
        }
        
        // Load technical details
        document.getElementById('conceptGenre').textContent = concept.genre;
        document.getElementById('conceptPlatforms').textContent = concept.platforms.join(', ');
        document.getElementById('conceptType').textContent = concept.type;
        document.getElementById('conceptAudience').textContent = concept.target_audience;
        
        // Update page language (translate i18n keys)
        if (typeof updatePageLanguage === 'function') {
            updatePageLanguage();
        }
        
    } catch (error) {
        console.error('Error loading concept data:', error);
    }
}

// Load when i18n is ready
function initConceptPage() {
    // Wait for i18n to be loaded
    const checkI18n = setInterval(() => {
        if (typeof t === 'function') {
            clearInterval(checkI18n);
            loadConceptData();
        }
    }, 50);
}

// Load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConceptPage);
} else {
    initConceptPage();
}
