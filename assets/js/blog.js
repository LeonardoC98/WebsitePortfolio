// ===== BLOG DATA =====
const blogData = [
    {
        id: 'gameplay-loops',
        translationKey: 'blog.posts.gameplayLoops',
        image: 'concepts/concept-dungeon/images/dungeon.jpg',
        heroImage: 'concepts/concept-dungeon/images/dungeon.jpg',
        tags: ['RPG', 'Game Design', 'Mechanics'],
        date: '2025-01-15',
        category: 'Game Design',
        link: 'blog/gameplay-loops/index.html'
    },
    {
        id: 'card-game-balance',
        translationKey: 'blog.posts.cardBalance',
        image: 'concepts/concept-puzzle/images/card.jpg',
        heroImage: 'concepts/concept-puzzle/images/card.jpg',
        tags: ['Card Game', 'Balance', 'PVP'],
        date: '2025-01-10',
        category: 'Balance',
        link: 'blog/card-game-balance/index.html'
    },
    {
        id: 'progression-systems',
        translationKey: 'blog.posts.progression',
        image: 'concepts/concept-weapon-upgrades/images/weaponupgrade.jpg',
        heroImage: 'concepts/concept-weapon-upgrades/images/weaponupgrade.jpg',
        tags: ['Progression', 'System', 'RPG'],
        date: '2025-01-05',
        category: 'Systems',
        link: 'blog/progression-systems/index.html'
    }
];

// ===== BLOG GRID LADEN =====
function loadBlog(searchQuery = '', selectedTags = []) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    blogGrid.innerHTML = '';

    const q = (searchQuery || '').trim().toLowerCase();

    const items = blogData.filter(post => {
        const title = (t(`${post.translationKey}.title`) || '').toLowerCase();
        const excerpt = (t(`${post.translationKey}.excerpt`) || '').toLowerCase();
        const tags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
        
        let matchesSearch = true;
        if (q) {
            matchesSearch = title.includes(q) || excerpt.includes(q) || tags.includes(q);
        }

        let matchesTags = true;
        if (selectedTags.length > 0) {
            matchesTags = (post.tags || []).some(tag => selectedTags.includes(tag));
        }

        return matchesSearch && matchesTags;
    });

    if (items.length === 0) {
        blogGrid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-light);">
                ${t('blog.noResults')}
            </div>
        `;
        return;
    }

    items.forEach(post => {
        const card = document.createElement('a');
        card.href = post.link;
        card.className = 'blog-card';
        const tagsHTML = (post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        
        const title = t(`${post.translationKey}.title`);
        const excerpt = t(`${post.translationKey}.excerpt`);
        const dateFormatted = formatDate(post.date);
        
        card.innerHTML = `
            <div class="blog-card-image">
                <img src="${post.image}" alt="${title}">
            </div>
            <div class="blog-card-content">
                <div>
                    <div style="display: flex; gap: 15px; margin-bottom: 10px; font-size: 0.9rem;">
                        <span class="blog-category">${post.category}</span>
                        <span class="blog-date">${dateFormatted}</span>
                    </div>
                    <h3>${title}</h3>
                    <p>${excerpt}</p>
                </div>
                <div class="blog-card-meta">
                    <div class="blog-card-tags">${tagsHTML}</div>
                </div>
            </div>
        `;

        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        blogGrid.appendChild(card);
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const lang = localStorage.getItem('language') || 'de';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', options);
}

// ===== TAG SYSTEM =====
function getAllTags() {
    const allTags = new Set();
    blogData.forEach(post => {
        (post.tags || []).forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
}

function loadTagCheckboxes() {
    const tagList = document.getElementById('tagDropdownList');
    if (!tagList) return;

    tagList.innerHTML = '';
    const tags = getAllTags();

    tags.forEach(tag => {
        const checkbox = document.createElement('label');
        checkbox.className = 'tag-checkbox-label';
        checkbox.innerHTML = `
            <input type="checkbox" value="${tag}" class="tag-checkbox">
            <span>${tag}</span>
        `;
        tagList.appendChild(checkbox);

        checkbox.querySelector('input').addEventListener('change', onTagChange);
    });
}

let selectedTags = [];

function onTagChange() {
    const checkboxes = document.querySelectorAll('.tag-checkbox');
    selectedTags = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    updateSelectedTagsDisplay();
    loadBlog(document.getElementById('blogSearch')?.value || '', selectedTags);
}

function updateSelectedTagsDisplay() {
    const display = document.getElementById('selectedTagsDisplay');
    if (!display) return;

    if (selectedTags.length === 0) {
        display.innerHTML = '';
        display.style.display = 'none';
        return;
    }

    display.style.display = 'flex';
    display.innerHTML = selectedTags.map(tag => `
        <span class="selected-tag">
            ${tag}
            <button class="remove-tag" data-tag="${tag}">✕</button>
        </span>
    `).join('');

    display.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag');
            const checkbox = document.querySelector(`.tag-checkbox[value="${tag}"]`);
            if (checkbox) {
                checkbox.checked = false;
                onTagChange();
            }
        });
    });
}

// ===== SEARCH =====
const searchInput = document.getElementById('blogSearch');
const clearBtn = document.getElementById('blogClear');

if (searchInput) {
    searchInput.addEventListener('input', function() {
        loadBlog(this.value, selectedTags);
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        loadBlog('', selectedTags);
    });
}

// Tag Dropdown Toggle
const tagSelectBtn = document.getElementById('tagSelectBtn');
const tagDropdownList = document.getElementById('tagDropdownList');

if (tagSelectBtn && tagDropdownList) {
    tagSelectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        tagDropdownList.classList.toggle('active');
        this.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tag-dropdown-wrapper')) {
            tagDropdownList.classList.remove('active');
            tagSelectBtn.classList.remove('active');
        }
    });
}

// ===== INITIALIZATION =====
function initBlogPage() {
    const checkI18n = setInterval(() => {
        if (typeof t === 'function' && typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
            clearInterval(checkI18n);
            loadTagCheckboxes();
            loadBlog();
        }
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogPage);
} else {
    initBlogPage();
}
