// Load concept data from data.json and populate the page
async function loadConceptData() {
    try {
        // Get concept ID from URL path (same as blog system)
        const pathParts = window.location.pathname.split('/');
        const conceptIndex = pathParts.indexOf('concepts');
        const conceptFolder = pathParts[conceptIndex + 1];
        
        if (!conceptFolder) return;
        
        // Fetch concept data for hero image and technical details
        const response = await fetch(`../../concepts/${conceptFolder}/data.json`);
        const concept = await response.json();
        
        // Get current language
        const lang = localStorage.getItem('language') || 'de';
        
        // Load hero image
        const heroImage = document.getElementById('conceptHeroImage');
        if (heroImage) {
            heroImage.src = concept.hero_image;
        }
        
        // Load concept title directly from data.json based on language
        const titleEl = document.getElementById('conceptTitle');
        if (titleEl) {
            titleEl.textContent = lang === 'de' ? concept.titleDE : concept.titleEN;
        }
        
        // Load concept description directly from data.json based on language
        const descriptionEl = document.getElementById('conceptDescription');
        if (descriptionEl) {
            descriptionEl.textContent = lang === 'de' ? concept.descriptionDE : concept.descriptionEN;
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
            
            // Listen for language changes
            window.addEventListener('languageChanged', loadConceptData);
        }
    }, 50);
}

// Load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConceptPage);
} else {
    initConceptPage();
}
