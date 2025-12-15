// Content Manager Editor

const DRAFT_KEY = 'cms_draft';
const SETTINGS_KEY = 'cms_settings';

let sections = [];
let draft = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDraft();
    setupEventListeners();
    populateTemplates();
    updateMetadataLabels();
});

function setupEventListeners() {
    // Content type change
    document.getElementById('contentType').addEventListener('change', (e) => {
        updateMetadataLabels();
        autoSave();
    });

    // All metadata inputs
    document.querySelectorAll('#contentId, #titleDE, #titleEN, #descDE, #descEN, #tags, #author, #publishDate, #readTime').forEach(el => {
        el.addEventListener('input', autoSave);
        el.addEventListener('change', autoSave);
    });

    // Images
    document.getElementById('cardImage').addEventListener('change', (e) => handleImage(e, 'card'));
    document.getElementById('bgImage').addEventListener('change', (e) => handleImage(e, 'bg'));

    // Buttons
    document.getElementById('addSectionBtn').addEventListener('click', () => openModal('templateModal'));
    document.getElementById('settingsBtn').addEventListener('click', () => {
        loadSettings();
        openModal('settingsModal');
    });
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    document.getElementById('publishBtn').addEventListener('click', publishContent);
}

function updateMetadataLabels() {
    const type = document.getElementById('contentType').value;
    const conceptOnly = document.getElementById('conceptOnly');
    const blogOnly = document.getElementById('blogOnly');
    const descLabel = document.querySelector('[id="descLabel"]');

    if (type === 'blog') {
        conceptOnly.style.display = 'none';
        blogOnly.style.display = 'block';
        descLabel.textContent = 'Excerpt (DE)';
    } else {
        conceptOnly.style.display = 'block';
        blogOnly.style.display = 'none';
        descLabel.textContent = 'Description (DE)';
    }
}

function populateTemplates() {
    if (!window.TEMPLATES) return;

    const list = document.getElementById('templateList');
    list.innerHTML = '';

    Object.keys(window.TEMPLATES).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'template-option';
        btn.innerHTML = `<strong>${key}</strong><small>Add section</small>`;
        btn.onclick = (e) => {
            e.preventDefault();
            addSection(key);
        };
        list.appendChild(btn);
    });
}

function addSection(templateKey) {
    if (!window.TEMPLATES || !window.TEMPLATES[templateKey]) return;

    const template = window.TEMPLATES[templateKey];
    const newSection = {
        id: Date.now(),
        type: templateKey,
        data_de: {},
        data_en: {},
        shared: {}
    };

    // Initialize translatable fields
    template.translatable?.forEach(field => {
        newSection.data_de[field] = '';
        newSection.data_en[field] = '';
    });

    // Initialize shared fields
    template.shared?.forEach(field => {
        newSection.shared[field] = '';
    });

    sections.push(newSection);
    closeModal('templateModal');
    renderSections();
    autoSave();
}

function renderSections() {
    const container = document.getElementById('sectionsContainer');

    if (sections.length === 0) {
        container.innerHTML = '<div class="empty-state">Click "+ Add Section" to start</div>';
        return;
    }

    container.innerHTML = '';
    sections.forEach((section, index) => {
        const el = createSectionElement(section, index);
        container.appendChild(el);
    });
}

function createSectionElement(section, index) {
    const div = document.createElement('div');
    div.className = 'section-item';

    const fieldsHTML = generateFieldsHTML(section, index);

    div.innerHTML = `
        <div class="section-header">
            <div class="section-title">${section.type}</div>
            <button onclick="removeSection(${index})" class="btn btn-small\" style=\"background: rgba(255,0,51,0.1); color: var(--accent);\">Delete</button>
        </div>
        ${fieldsHTML}
    `;

    return div;
}

function generateFieldsHTML(section, index) {
    const template = window.TEMPLATES?.[section.type];
    if (!template) return '<p style="color: var(--text-light);">No template found</p>';

    const dataDE = section.data_de || {};
    const dataEN = section.data_en || {};
    const shared = section.shared || {};

    let html = '<div class="section-fields">';

    // Translatable fields (show DE/EN side by side)
    template.translatable?.forEach(key => {
        const value_de = dataDE[key] || '';
        const value_en = dataEN[key] || '';

        html += `
            <div>
                <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">${key}</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" value="${value_de}" placeholder="DE" 
                           onchange="updateSectionField(${index}, '${key}', this.value, 'de'); autoSave();"
                           style="flex: 1; padding: 0.5rem 0.8rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-dark);">
                    <input type="text" value="${value_en}" placeholder="EN" 
                           onchange="updateSectionField(${index}, '${key}', this.value, 'en'); autoSave();"
                           style="flex: 1; padding: 0.5rem 0.8rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-dark);">
                </div>
            </div>
        `;
    });

    // Shared fields (show once, language-independent)
    template.shared?.forEach(key => {
        const value = shared[key] || '';

        html += `
            <div>
                <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">${key}</label>
                <input type="text" value="${value}" placeholder="${key}" 
                       onchange="updateSectionField(${index}, '${key}', this.value, 'shared'); autoSave();"
                       style="width: 100%; padding: 0.5rem 0.8rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-dark);">
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function updateSectionField(index, key, value, lang) {
    if (!sections[index]) return;
    
    if (lang === 'shared') {
        sections[index].shared[key] = value;
    } else {
        const dataKey = `data_${lang}`;
        sections[index][dataKey][key] = value;
    }
    
    autoSave();
}

function removeSection(index) {
    sections.splice(index, 1);
    renderSections();
    autoSave();
}

function handleImage(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById(`${type}Preview`);
        preview.innerHTML = `<img src="${event.target.result}" alt="preview">`;
        preview.classList.add('has-image');

        draft.images = draft.images || {};
        draft.images[type] = event.target.result;
        autoSave();
    };
    reader.readAsDataURL(file);
}

function collectMetadata() {
    const type = document.getElementById('contentType').value;
    const meta = {
        id: document.getElementById('contentId').value,
        type: type,
        title_de: document.getElementById('titleDE').value,
        title_en: document.getElementById('titleEN').value,
        description_de: document.getElementById('descDE').value,
        description_en: document.getElementById('descEN').value
    };

    if (type === 'concept') {
        meta.tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t);
    } else {
        meta.author = document.getElementById('author').value || 'Leo Cucinelli';
        meta.publishDate = document.getElementById('publishDate').value || new Date().toISOString().split('T')[0];
        meta.readTime = document.getElementById('readTime').value || '5';
    }

    return meta;
}

function autoSave() {
    draft.metadata = collectMetadata();
    draft.sections = sections;
    draft.timestamp = Date.now();

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    const indicator = document.getElementById('autoSave');
    indicator.classList.add('show');
    setTimeout(() => indicator.classList.remove('show'), 2000);
}

function loadDraft() {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;

    try {
        draft = JSON.parse(saved);

        if (draft.metadata) {
            const m = draft.metadata;
            document.getElementById('contentId').value = m.id || '';
            document.getElementById('contentType').value = m.type || 'concept';
            document.getElementById('titleDE').value = m.title_de || '';
            document.getElementById('titleEN').value = m.title_en || '';
            document.getElementById('descDE').value = m.description_de || '';
            document.getElementById('descEN').value = m.description_en || '';

            if (m.type === 'concept') {
                document.getElementById('tags').value = (m.tags || []).join(', ');
            } else {
                document.getElementById('author').value = m.author || '';
                document.getElementById('publishDate').value = m.publishDate || '';
                document.getElementById('readTime').value = m.readTime || '';
            }
        }

        if (draft.sections) {
            sections = draft.sections;
            renderSections();
        }

        if (draft.images) {
            if (draft.images.card) {
                document.getElementById('cardPreview').innerHTML = `<img src="${draft.images.card}">`;
                document.getElementById('cardPreview').classList.add('has-image');
            }
            if (draft.images.bg) {
                document.getElementById('bgPreview').innerHTML = `<img src="${draft.images.bg}">`;
                document.getElementById('bgPreview').classList.add('has-image');
            }
        }
    } catch (e) {
        console.error('Failed to load draft:', e);
    }
}

function clearDraft() {
    if (confirm('Clear draft and start new?')) {
        localStorage.removeItem(DRAFT_KEY);
        location.reload();
    }
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function getContentFolder(meta) {
    if (meta.type === 'concept') return `concepts/concept-${meta.id}`;
    if (meta.type === 'blog') return `blog/${meta.id}`;
    return `${meta.type}s/${meta.id}`;
}

function showPreview() {
    const meta = collectMetadata();
    const folder = getContentFolder(meta);
    
    // Build data.json (metadata only) like live site
    const baseData = {
        id: meta.id,
        translationKey: `${meta.type}s.${meta.id}`,
        titleDE: meta.title_de,
        titleEN: meta.title_en,
        descriptionDE: meta.description_de,
        descriptionEN: meta.description_en,
        image: `${folder}/images/card.jpg`,
        tags: meta.tags || [],
        link: `${folder}/index.html`,
        hero_image: 'images/bg.jpg'
    };

    const dataJson = meta.type === 'blog'
        ? {
            ...baseData,
            author: meta.author,
            publishDate: meta.publishDate,
            readTime: meta.readTime,
            excerptDE: meta.description_de,
            excerptEN: meta.description_en
        }
        : baseData;

    // Merge shared + translatable data for each language
    const contentDE = { 
        sections: sections.map(s => ({ 
            type: s.type, 
            data: { ...s.shared, ...s.data_de }
        })) 
    };
    const contentEN = { 
        sections: sections.map(s => ({ 
            type: s.type, 
            data: { ...s.shared, ...s.data_en }
        })) 
    };
    const htmlPreview = generateIndexHTML(meta);
    
    // Store in window for tab switching
    window.previewData = {
        data: JSON.stringify(dataJson, null, 2),
        de: JSON.stringify(contentDE, null, 2),
        en: JSON.stringify(contentEN, null, 2),
        html: htmlPreview
    };
    
    // Show first tab
    switchPreviewTab('data');
    openModal('previewModal');
}

function switchPreviewTab(tab) {
    if (!window.previewData) return;
    
    // Update tab buttons
    document.querySelectorAll('.preview-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show content
    document.getElementById('previewContent').textContent = window.previewData[tab];
}

function generateIndexHTML(meta) {
    const titleEN = meta.title_en || '';
    const descEN = meta.description_en || '';
    const isBlog = meta.type === 'blog';

    if (isBlog) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleEN} - Blog</title>
    <link rel="stylesheet" href="../../assets/css/style-base.css?v=2">
    <link rel="stylesheet" href="../../assets/css/style-concepts.css?v=2">
    <link rel="stylesheet" href="../../assets/css/style-blog-post.css?v=2">
</head>
<body style="opacity: 0;">

    <div id="navbar-placeholder"></div>

    <div class="back-button-container">
        <a href="../../blog.html" class="back-button">← Back to Blog</a>
    </div>

    <section class="concept-detail">
        <div class="blog-hero">
            <img id="postHeroImage" alt="${titleEN}" class="blog-hero-image">
            <div class="blog-hero-overlay">
                <h1 id="postTitle">${titleEN}</h1>
                <p id="postExcerpt" class="concept-subtitle">${descEN}</p>
                <p class="concept-subtitle" id="postMeta"></p>
            </div>
        </div>

        <div class="container concept-content">
            <div class="concept-main">
                <div id="postContent"></div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Game Concept Portfolio. All rights reserved.</p>
        </div>
    </footer>

    <script src="../../assets/js/navbar-loader.js"><\/script>
    <script src="../../assets/js/i18n.js"><\/script>
    <script src="../../assets/js/blog.js"><\/script>
    <script src="../../assets/js/section-templates.js"><\/script>
    <script src="../../assets/js/blog-loader.js"><\/script>
    <script>
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        }, 100);
    <\/script>
    <script src="../../assets/js/script.js"><\/script>
    <script src="../../assets/js/parallax.js"><\/script>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleEN}</title>
    <link rel="stylesheet" href="../../assets/css/style-base.css?v=2">
    <link rel="stylesheet" href="../../assets/css/style-concepts.css?v=2">
</head>
<body>

    <!-- Navbar Placeholder (keeps layout stable until navbar loads) -->
    <nav id="navbarPlaceholder" class="navbar" style="min-height:77px; visibility:hidden;"></nav>

    <!-- Back Button -->
    <div class="back-button-container" style="opacity:0; transition: opacity 0.2s ease;">
        <a href="../../concepts.html" class="back-button" data-i18n="concept.back">← Back to Portfolio</a>
    </div>

    <!-- Concept Detail Page -->
    <section class="concept-detail">
        <div class="concept-hero">
            <img src="images/bg.jpg" alt="Concept Hero Image" class="concept-hero-image" id="conceptHeroImage" loading="eager">
            <div class="concept-hero-overlay">
                <h1 id="conceptTitle">${titleEN}</h1>
                <p class="concept-subtitle" id="conceptDescription">${descEN}</p>
            </div>
        </div>

        <div class="container concept-content">
            <div class="concept-main">
                <!-- Skeleton placeholder while content loads -->
                <div id="conceptSkeleton" class="skeleton-container">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-subtitle"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>

                <!-- Dynamic Content Sections -->
                <div id="conceptContentSections" style="opacity: 0; transition: opacity 0.3s ease;">
                    <!-- Dynamically loaded from translations -->
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Game Concept Portfolio. All rights reserved.</p>
        </div>
    </footer>

    <script src="../../assets/js/navbar-loader.js"><\/script>
    <script src="../../assets/js/i18n.js"><\/script>
    <script src="../../assets/js/script.js"><\/script>
    <script src="../../assets/js/portfolio.js"><\/script>
    <script src="../../assets/js/section-templates.js"><\/script>
    <script src="../../assets/js/concept-loader.js"><\/script>
    <script src="../../assets/js/parallax.js"><\/script>
    <!-- Cloudflare Web Analytics -->
    <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "7b30862445244605baa7504bb6f3fe37"}'><\/script>
    <!-- End Cloudflare Web Analytics -->
</body>
</html>`;
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    document.getElementById('githubToken').value = settings.token || '';
    document.getElementById('githubUser').value = settings.user || '';
    document.getElementById('githubRepo').value = settings.repo || '';
    document.getElementById('githubBranch').value = settings.branch || 'main';
}

function saveSettings() {
    const settings = {
        token: document.getElementById('githubToken').value,
        user: document.getElementById('githubUser').value,
        repo: document.getElementById('githubRepo').value,
        branch: document.getElementById('githubBranch').value
    };

    if (!settings.token || !settings.user || !settings.repo) {
        showStatus('Fill all fields', 'error');
        return;
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    showStatus('Settings saved!', 'success');
    setTimeout(() => closeModal('settingsModal'), 1000);
}

async function testGitHub() {
    const token = document.getElementById('githubToken').value;
    const user = document.getElementById('githubUser').value;
    const repo = document.getElementById('githubRepo').value;

    if (!token || !user || !repo) {
        showStatus('Fill all fields first', 'error');
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
            headers: { 'Authorization': `token ${token}` }
        });

        if (response.ok) {
            showStatus('✓ Connection successful!', 'success');
        } else {
            showStatus('✗ Invalid credentials', 'error');
        }
    } catch (error) {
        showStatus('✗ Network error', 'error');
    }
}

function showStatus(message, type) {
    const status = document.getElementById('settingsStatus');
    status.textContent = message;
    status.className = `status-message ${type}`;
    status.style.display = 'block';
}

async function publishContent() {
    const meta = collectMetadata();

    if (!meta.id || !meta.title_de || !meta.title_en) {
        alert('Fill in: ID, Title (DE), Title (EN)');
        return;
    }

    if (sections.length === 0) {
        alert('Add at least one section');
        return;
    }

    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    if (!settings.token || !settings.user || !settings.repo) {
        alert('Configure GitHub settings first');
        return;
    }

    if (!confirm(`Publish to GitHub?\n\n${sections.length} sections will be published`)) return;

    try {
        document.getElementById('publishBtn').disabled = true;
        document.getElementById('publishBtn').textContent = 'Publishing...';

        const folder = getContentFolder(meta);

        // Create data.json (metadata only, no sections)
        const baseData = {
            id: meta.id,
            translationKey: `${meta.type}s.${meta.id}`,
            titleDE: meta.title_de,
            titleEN: meta.title_en,
            descriptionDE: meta.description_de,
            descriptionEN: meta.description_en,
            image: `${folder}/images/card.jpg`,
            tags: meta.tags || [],
            link: `${folder}/index.html`,
            hero_image: 'images/bg.jpg'
        };

        const dataJson = meta.type === 'blog'
            ? {
                ...baseData,
                author: meta.author,
                publishDate: meta.publishDate,
                readTime: meta.readTime,
                excerptDE: meta.description_de,
                excerptEN: meta.description_en
            }
            : baseData;

        await uploadFile(settings, `${folder}/data.json`, JSON.stringify(dataJson, null, 2));

        // Create content-de.json and content-en.json (merge shared + bilingual data)
        const contentDE = { 
            sections: sections.map(s => ({ 
                type: s.type, 
                data: { ...s.shared, ...s.data_de }
            })) 
        };
        const contentEN = { 
            sections: sections.map(s => ({ 
                type: s.type, 
                data: { ...s.shared, ...s.data_en }
            })) 
        };

        await uploadFile(settings, `${folder}/content-de.json`, JSON.stringify(contentDE, null, 2));
        await uploadFile(settings, `${folder}/content-en.json`, JSON.stringify(contentEN, null, 2));

        alert('Published successfully!');
        localStorage.removeItem(DRAFT_KEY);

    } catch (error) {
        alert('Publish failed: ' + error.message);
    } finally {
        document.getElementById('publishBtn').disabled = false;
        document.getElementById('publishBtn').textContent = 'Publish';
    }
}

async function uploadFile(settings, path, content) {
    const url = `https://api.github.com/repos/${settings.user}/${settings.repo}/contents/${path}`;
    const encoded = btoa(content);

    // Get existing file SHA if it exists
    let sha = null;
    try {
        const getResponse = await fetch(url, {
            headers: { 'Authorization': `token ${settings.token}` }
        });
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }
    } catch (e) {}

    const body = {
        message: `Update ${path}`,
        content: encoded,
        branch: settings.branch
    };

    if (sha) body.sha = sha;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${settings.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }
}
