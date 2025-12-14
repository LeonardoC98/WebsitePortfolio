// Map blog folder names to translation keys
const blogMapping = {
    'gameplay-loops': 'gameplayLoops',
    'card-game-balance': 'cardBalance',
    'progression-systems': 'progression'
};

// Load blog post data and populate the page
async function loadBlogPostData() {
    try {
        // Get blog ID from URL path
        const pathParts = window.location.pathname.split('/');
        const blogIndex = pathParts.indexOf('blog');
        const blogFolder = pathParts[blogIndex + 1];
        
        if (!blogFolder) return;
        
        // Get translation key for this blog post
        const translationKey = blogMapping[blogFolder];
        if (!translationKey) {
            console.error('No translation mapping for:', blogFolder);
            return;
        }
        
        // Find blog post data from blog.js
        const blogPost = typeof blogData !== 'undefined' ? blogData.find(post => post.id === blogFolder) : null;
        
        // Load post title from translations
        const titleEl = document.getElementById('postTitle');
        if (titleEl) {
            titleEl.textContent = t(`blog.posts.${translationKey}.title`);
        }
        
        // Load hero image
        const heroImageEl = document.getElementById('postHeroImage');
        if (heroImageEl && blogPost && blogPost.heroImage) {
            heroImageEl.src = '../../' + blogPost.heroImage;
        }
        
        // Load post meta (tags and date)
        const metaEl = document.getElementById('postMeta');
        if (metaEl && blogPost) {
            const tagsText = blogPost.tags.join(' • ');
            const lang = localStorage.getItem('language') || 'de';
            const locale = lang === 'de' ? 'de-DE' : 'en-US';
            const dateText = new Date(blogPost.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
            metaEl.textContent = `${tagsText} • ${dateText}`;
        }
        
        // Load dynamic content sections from local content files
        const contentContainer = document.getElementById('postContent');
        if (contentContainer) {
            const lang = localStorage.getItem('language') || 'de';
            const contentResponse = await fetch(`content-${lang}.json`);
            const contentData = await contentResponse.json();
            
            contentContainer.innerHTML = '';
            
            if (contentData.sections) {
                contentData.sections.forEach(section => {
                    renderSection(section, contentContainer);
                });
            }
        }
    } catch (error) {
        console.error('Error loading blog post data:', error);
    }
}

// Render a section based on its type
function renderSection(section, container) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'concept-section';
    
    switch(section.type) {
        case 'text':
            if (section.title) {
                const title = document.createElement('h2');
                title.textContent = section.title;
                sectionDiv.appendChild(title);
            }
            if (section.text) {
                const text = document.createElement('p');
                text.innerHTML = section.text;
                sectionDiv.appendChild(text);
            }
            break;
            
        case 'features':
            if (section.title) {
                const title = document.createElement('h2');
                title.textContent = section.title;
                sectionDiv.appendChild(title);
            }
            if (section.items && Array.isArray(section.items)) {
                section.items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'mechanic-item';
                    itemDiv.innerHTML = `
                        ${item.icon ? `<span style="font-size: 1.5rem; margin-right: 10px;">${item.icon}</span>` : ''}
                        <span>${item.text}</span>
                    `;
                    sectionDiv.appendChild(itemDiv);
                });
            }
            break;
            
        default:
            // For any other types, use concept-templates.js if available
            if (typeof window.renderSectionByType === 'function') {
                window.renderSectionByType(section, sectionDiv);
            }
    }
    
    container.appendChild(sectionDiv);
}

// Initialize when translations are ready
function initBlogPostPage() {
    const checkReady = setInterval(() => {
        if (typeof t === 'function' && typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
            clearInterval(checkReady);
            loadBlogPostData();
        }
    }, 50);
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogPostPage);
} else {
    initBlogPostPage();
}
