/**
 * BLOG SYSTEM - Blog Overview (blog.html)
 * Simple, clean implementation
 */

let blogData = [];
let blogInitialized = false;

async function loadBlogData() {
    blogData = [];
    try {
        // Fetch dynamic blog post list from server
        const res = await fetch('/api/blog-index');
        if (!res.ok) throw new Error('Failed to fetch blog index');
        
        const { posts } = await res.json();
        const lang = localStorage.getItem('language') || 'de';
        
        // Load each blog post's data.json
        for (const path of posts) {
            try {
                const postRes = await fetch(path);
                if (postRes.ok) {
                    const postData = await postRes.json();
                    
                    // Create translationKey dynamically for compatibility
                    postData.translationKey = `blog.posts.${postData.id}`;
                    
                    blogData.push(postData);
                    console.log('Loaded post:', postData);
                }
            } catch (e) {
                console.warn(`Error loading ${path}:`, e);
            }
        }
    } catch (e) {
        console.warn('Error loading blog data:', e);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const lang = localStorage.getItem('language') || 'de';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', options);
}

function getAllTags() {
    const tags = new Set();
    blogData.forEach(post => (post.tags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
}

function loadBlog(search = '', tags = []) {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    
    const lang = localStorage.getItem('language') || 'de';

    const filtered = blogData.filter(post => {
        // Get title and excerpt based on language
        const title = lang === 'de' ? (post.titleDE || '') : (post.titleEN || '');
        const excerpt = lang === 'de' ? (post.excerptDE || '') : (post.excerptEN || '');
        const postTags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
        
        const searchOk = !search || title.toLowerCase().includes(search.toLowerCase()) || excerpt.toLowerCase().includes(search.toLowerCase()) || postTags.includes(search.toLowerCase());
        const tagsOk = tags.length === 0 || (post.tags || []).some(tag => tags.includes(tag));
        
        return searchOk && tagsOk;
    });

    grid.innerHTML = filtered.length === 0 
        ? `<div style="text-align:center;padding:60px 20px;color:var(--text-light)">${t('blog.noResults')}</div>`
        : '';

    filtered.forEach(post => {
        const card = document.createElement('a');
        card.href = post.link;
        card.className = 'blog-card';
        const imgId = `img-${post.id}`;
        
        const title = lang === 'de' ? post.titleDE : post.titleEN;
        const excerpt = lang === 'de' ? post.excerptDE : post.excerptEN;
        
        card.innerHTML = `
            <div class="blog-card-image">
                <img id="${imgId}" alt="${title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <div>
                    <div style="display:flex;gap:15px;margin-bottom:10px;font-size:0.9rem">
                        <span class="blog-category">${post.category}</span>
                        <span class="blog-date">${formatDate(post.date)}</span>
                    </div>
                    <h3>${title}</h3>
                    <p>${excerpt}</p>
                </div>
                <div class="blog-card-meta">
                    <div class="blog-card-tags">${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                </div>
            </div>
        `;
        // Resolve image extension (.png or .jpg)
        const imgEl = card.querySelector(`#${imgId}`);
        const base = `blog/${post.id}/images/`;
        const filename = post.image?.replace(/\.(png|jpg)$/i, '');
        const candidates = [`${base}${filename || 'card'}.png`, `${base}${filename || 'card'}.jpg`];
        let idx = 0;
        const tryNext = () => {
            if (idx >= candidates.length) return;
            imgEl.src = candidates[idx++];
            imgEl.onerror = () => tryNext();
        };
        tryNext();
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
        grid.appendChild(card);
    });
}

function initTags() {
    const list = document.getElementById('tagDropdownList');
    if (!list) return;
    
    list.innerHTML = getAllTags().map(tag => `
        <label class="tag-checkbox-label">
            <input type="checkbox" class="tag-checkbox" value="${tag}">
            <span>${tag}</span>
        </label>
    `).join('');

    document.querySelectorAll('.tag-checkbox').forEach(cb => {
        cb.addEventListener('change', updateAll);
    });
}

function updateAll() {
    const search = document.getElementById('blogSearch')?.value || '';
    const selected = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
    loadBlog(search, selected);
}

function initSearch() {
    const search = document.getElementById('blogSearch');
    const clear = document.getElementById('blogClear');
    
    if (search) search.addEventListener('input', updateAll);
    if (clear) clear.addEventListener('click', () => {
        if (search) {
            search.value = '';
            search.focus();
            updateAll();
        }
    });
}

async function initBlogPage() {
    if (blogInitialized) return;
    blogInitialized = true;

    await loadBlogData();

    await new Promise(resolve => {
        const check = setInterval(() => {
            if (typeof t === 'function' && translations && Object.keys(translations).length > 0) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });

    initTags();
    initSearch();
    loadBlog();
}

if (document.getElementById('blogGrid')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogPage);
    } else {
        initBlogPage();
    }
}

