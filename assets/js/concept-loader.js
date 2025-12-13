// Map concept folder names to translation keys
const conceptMapping = {
    'concept-dungeon': 'dungeon',
    'concept-puzzle': 'puzzle',
    'concept-weapon-upgrades': 'weaponUpgrades'
};

// Load concept data from data.json and populate the page
async function loadConceptData() {
    try {
        // Get concept ID from URL path
        const pathParts = window.location.pathname.split('/');
        const conceptIndex = pathParts.indexOf('concepts');
        const conceptFolder = pathParts[conceptIndex + 1];
        
        if (!conceptFolder) return;
        
        // Get translation key for this concept
        const translationKey = conceptMapping[conceptFolder];
        if (!translationKey) {
            console.error('No translation mapping for:', conceptFolder);
            return;
        }
        
        // Fetch concept data for hero image and technical details
        const response = await fetch(`../../concepts/${conceptFolder}/data.json`);
        const concept = await response.json();
        
        // Load hero image
        const heroImage = document.getElementById('conceptHeroImage');
        if (heroImage) {
            heroImage.src = concept.hero_image;
        }
        
        // Load concept title from translations
        const titleEl = document.getElementById('conceptTitle');
        if (titleEl) {
            titleEl.textContent = t(`concepts.${translationKey}.title`);
        }
        
        // Load concept subtitle from translations
        const subtitleEl = document.getElementById('conceptSubtitle');
        if (subtitleEl) {
            const subtitle = t(`concepts.${translationKey}.subtitle`);
            subtitleEl.textContent = subtitle !== `concepts.${translationKey}.subtitle` ? subtitle : t(`concepts.${translationKey}.description`);
        }
        
        // Load dynamic content sections from local content files
        const contentContainer = document.getElementById('conceptContentSections');
        if (contentContainer) {
            const lang = currentLanguage || localStorage.getItem('language') || 'en';
            try {
                const contentResponse = await fetch(`content-${lang}.json`);
                if (contentResponse.ok) {
                    const contentData = await contentResponse.json();
                    contentContainer.innerHTML = '';
                    
                    if (contentData.sections && Array.isArray(contentData.sections)) {
                        contentData.sections.forEach(section => {
                            // Render section using template system
                            renderSection(section, contentContainer);
                        });
                    }
                }
            } catch (error) {
                console.log('No content file found for this concept');
            }
        }
        
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
    // Wait for i18n to be loaded with translations
    const checkI18n = setInterval(() => {
        if (typeof t === 'function' && typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
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
