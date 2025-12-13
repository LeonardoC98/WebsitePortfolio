// ===== INTERNATIONALIZATION (i18n) =====

let translations = {};
let currentLanguage = localStorage.getItem('language') || 'en';

// Determine the base path for language files
function getLanguageBasePath() {
    const isConceptPage = window.location.pathname.includes('/concepts/');
    return isConceptPage ? '../../languages/' : 'languages/';
}

// Load translation file
async function loadLanguage(lang) {
    try {
        const basePath = getLanguageBasePath();
        const response = await fetch(`${basePath}${lang}.json`);
        if (!response.ok) {
            console.error(`Failed to load language: ${lang}`);
            return false;
        }
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        return true;
    } catch (error) {
        console.error('Error loading language:', error);
        return false;
    }
}

// Get translation by key path (e.g., "nav.home")
function t(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }
    
    return value;
}

// Update all elements with data-i18n attribute
function updatePageLanguage() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Update current language button text
    const langCurrent = document.querySelector('.lang-current');
    if (langCurrent) {
        langCurrent.childNodes[0].textContent = currentLanguage.toUpperCase();
    }
    
    // Update active language in selector
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.getAttribute('data-lang') === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

// Change language
async function changeLanguage(lang) {
    const success = await loadLanguage(lang);
    if (success) {
        updatePageLanguage();
        initLanguageSelectorEvents();
        
        // Reload portfolio if on portfolio page
        if (typeof loadPortfolio === 'function') {
            loadPortfolio();
        }
        
        // Reload concept data if on concept page
        if (typeof loadConceptData === 'function') {
            loadConceptData();
        }
        
        // Reload recent projects on homepage
        if (typeof window.loadRecentProjects === 'function') {
            window.loadRecentProjects();
        }
    }
}

// Toggle language dropdown
function toggleLanguageDropdown() {
    const selector = document.querySelector('.language-selector');
    if (selector) {
        selector.classList.toggle('open');
    }
}

// Add language selector event listeners
function initLanguageSelectorEvents() {
    const langCurrent = document.querySelector('.lang-current');
    if (langCurrent) {
        // Remove old listener by cloning and replacing the element
        const newLangCurrent = langCurrent.cloneNode(true);
        langCurrent.parentNode.replaceChild(newLangCurrent, langCurrent);
        
        newLangCurrent.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLanguageDropdown();
        });
    }
    
    // Add language selector click handlers
    document.querySelectorAll('.lang-option').forEach(option => {
        // Remove old listener by cloning and replacing the element
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        newOption.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const lang = newOption.getAttribute('data-lang');
            changeLanguage(lang);
            
            // Close dropdown after selection
            document.querySelector('.language-selector')?.classList.remove('open');
        });
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const selector = document.querySelector('.language-selector');
    if (selector && !selector.contains(e.target)) {
        selector.classList.remove('open');
    }
});

// Load language immediately
let languageLoaded = false;
(async function() {
    await loadLanguage(currentLanguage);
    languageLoaded = true;
    window.dispatchEvent(new CustomEvent('languageLoaded'));
})();

// Initialize after both navbar and language are loaded
let navbarReady = false;
let domReady = false;

window.addEventListener('navbarLoaded', () => {
    navbarReady = true;
    tryInitialize();
});

document.addEventListener('DOMContentLoaded', () => {
    domReady = true;
    tryInitialize();
});

function tryInitialize() {
    if (navbarReady && domReady && languageLoaded) {
        updatePageLanguage();
        initLanguageSelectorEvents();
    }
}

// Also try after a delay in case events were missed
setTimeout(() => {
    if (languageLoaded) {
        updatePageLanguage();
        initLanguageSelectorEvents();
    }
}, 300);
