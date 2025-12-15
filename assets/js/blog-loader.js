/**
 * BLOG SYSTEM - Blog Detail Page (blog/{id}/index.html)
 * Simple, clean implementation
 */

let blogLoaderInitialized = false;
let blogLoading = false;

async function loadBlogPost() {
    if (blogLoaderInitialized) return;
    
    // Prevent concurrent loads
    if (blogLoading) return;
    blogLoading = true;
    blogLoaderInitialized = true;

    try {
        // Get blog ID from URL
        const parts = window.location.pathname.split('/');
        const blogId = parts[parts.indexOf('blog') + 1];
        
        if (!blogId) throw new Error('No blog ID found');

        // Load blog metadata
        const dataRes = await fetch('data.json');
        if (!dataRes.ok) throw new Error('Failed to load data.json');
        const blogPost = await dataRes.json();

        // Function to render blog post (starts immediately, doesn't wait for i18n)
        const renderBlogPost = () => {
            const lang = localStorage.getItem('language') || 'de';
            
            // Get language and set title directly from blogPost data
            const titleEl = document.getElementById('postTitle');
            if (titleEl) {
                const title = lang === 'de' ? blogPost.titleDE : blogPost.titleEN;
                titleEl.textContent = title;
            }

            // Set excerpt
            const excerptEl = document.getElementById('postExcerpt');
            if (excerptEl) {
                const excerpt = lang === 'de' ? blogPost.excerptDE : blogPost.excerptEN;
                excerptEl.textContent = excerpt;
            }

            // Set hero image with PNG/JPG fallback and lazy loading
            const heroEl = document.getElementById('postHeroImage');
            if (heroEl && !heroEl.src) {
                const filename = (blogPost.heroImage || 'bg').replace(/\.(png|jpg)$/i, '');
                const candidates = [`images/${filename}.png`, `images/${filename}.jpg`];
                heroEl.loading = 'lazy';
                
                // Try to load first candidate, fallback to second
                heroEl.src = candidates[0];
                heroEl.onerror = () => {
                    if (candidates[1]) heroEl.src = candidates[1];
                };
            }

            // Set meta (tags and date)
            const metaEl = document.getElementById('postMeta');
            if (metaEl) {
                const dateStr = new Date(blogPost.date).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const tags = (blogPost.tags || []).join(' • ');
                metaEl.textContent = tags ? `${tags} • ${dateStr}` : dateStr;
            }

            // Load content
            const contentEl = document.getElementById('postContent');
            if (contentEl) {
                fetch(`content-${lang}.json`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load content-${lang}.json`);
                        return res.json();
                    })
                    .then(content => {
                        contentEl.innerHTML = '';

                        if (content.sections) {
                            content.sections.forEach(section => {
                                // Add lazy loading to images
                                if (section.images) {
                                    section.images.forEach(img => { img.loading = 'lazy'; });
                                }
                                
                                const rendererName = `render${section.type.charAt(0).toUpperCase() + section.type.slice(1)}Section`;
                                
                                if (typeof window[rendererName] === 'function') {
                                    window[rendererName](section, contentEl);
                                } else {
                                    renderFallback(section, contentEl);
                                }
                            });
                        }
                    })
                    .catch(error => console.error('Error loading content:', error));
            }
        };

        // Initial render
        renderBlogPost();

        // Listen for language changes
        window.addEventListener('languageChanged', renderBlogPost);
    } finally {
        blogLoading = false;
    }
}

function renderFallback(section, container) {
    const div = document.createElement('div');
    div.className = 'concept-section';

    if (section.type === 'text') {
        if (section.title) {
            const h = document.createElement('h2');
            h.textContent = section.title;
            div.appendChild(h);
        }
        if (section.text) {
            const p = document.createElement('p');
            p.innerHTML = section.text;
            div.appendChild(p);
        }
    } else if (section.type === 'heading') {
        const level = section.level || 2;
        const h = document.createElement(`h${level}`);
        h.textContent = section.text;
        div.appendChild(h);
    } else if (section.type === 'paragraph') {
        const p = document.createElement('p');
        p.innerHTML = section.text;
        div.appendChild(p);
    } else if (section.type === 'list') {
        const ul = document.createElement('ul');
        (section.items || []).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            ul.appendChild(li);
        });
        div.appendChild(ul);
    } else if (section.type === 'features') {
        if (section.title) {
            const h = document.createElement('h2');
            h.textContent = section.title;
            div.appendChild(h);
        }
        if (section.items) {
            section.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'mechanic-item';
                itemDiv.innerHTML = `
                    ${item.icon ? `<span style="font-size:1.5rem;margin-right:10px">${item.icon}</span>` : ''}
                    <span>${item.text}</span>
                `;
                div.appendChild(itemDiv);
            });
        }
    }

    container.appendChild(div);
}

// Init on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPost);
} else {
    loadBlogPost();
}

