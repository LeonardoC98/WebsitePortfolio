let conceptLoaderInitialized = false;
let conceptLoading = false;

// Load concept data from data.json and populate the page
async function loadConceptData() {
    // Prevent concurrent loads
    if (conceptLoading) return;
    conceptLoading = true;
    
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
        
        // Load hero image with eager loading (above the fold)
        const heroImage = document.getElementById('conceptHeroImage');
        if (heroImage) {
            heroImage.loading = 'eager';
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
        const skeleton = document.getElementById('conceptSkeleton');
        if (contentContainer) {
            if (skeleton) skeleton.style.display = 'grid';
            contentContainer.style.opacity = '0';
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

                    // Fade in once content is ready
                    if (skeleton) skeleton.style.display = 'none';
                    requestAnimationFrame(() => {
                        contentContainer.style.opacity = '1';
                    });
                }
            } catch (error) {
                console.log('No content file found for this concept');
                if (skeleton) skeleton.style.display = 'none';
            }
        }
        
        // Update page language (translate i18n keys)
        if (typeof updatePageLanguage === 'function') {
            updatePageLanguage();
        }
        
    } catch (error) {
        console.error('Error loading concept data:', error);
    } finally {
        conceptLoading = false;
    }
}

// Load when DOM is ready
function initConceptPage() {
    if (conceptLoaderInitialized) return;
    conceptLoaderInitialized = true;
    
    loadConceptData();
    
    // Listen for language changes
    window.addEventListener('languageChanged', loadConceptData);
}

// Load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConceptPage);
} else {
    initConceptPage();
}
