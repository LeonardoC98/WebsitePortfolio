// Content Editor

let currentLanguage = 'de';
let sections = { de: [], en: [] };
let metadata = {};
let images = { card: null, bg: null };

// Get content type from URL
const urlParams = new URLSearchParams(window.location.search);
const contentType = urlParams.get('type') || 'concept';
document.getElementById('contentType').value = contentType;

// Language tab switcher
document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentLanguage = tab.dataset.lang;
        renderSections();
    });
});

// Add section button
document.getElementById('addSectionBtn')?.addEventListener('click', () => {
    showTemplateModal();
});

// Show template selector modal
function showTemplateModal() {
    const modal = document.getElementById('templateModal');
    const templateList = document.getElementById('templateList');
    
    // Get all available templates from concept-templates.js
    const templates = [
        { type: 'text', name: 'Text Section', icon: '📝', description: 'Title and paragraph' },
        { type: 'features', name: 'Features List', icon: '⭐', description: 'Feature items with icons' },
        { type: 'mechanics', name: 'Mechanics', icon: '⚙️', description: 'Game mechanics with descriptions' },
        { type: 'gallery', name: 'Image Gallery', icon: '🖼️', description: 'Grid of images' },
        { type: 'examples', name: 'Examples', icon: '💡', description: 'Example scenarios' },
        { type: 'video', name: 'Video Embed', icon: '🎥', description: 'YouTube video' },
        { type: 'quote', name: 'Quote', icon: '💬', description: 'Highlighted quote' },
        { type: 'list', name: 'Bullet List', icon: '📋', description: 'Simple list' }
    ];
    
    templateList.innerHTML = '<div class="template-grid">' +
        templates.map(t => `
            <div class="template-item" onclick="addSection('${t.type}')">
                <div style="font-size: 2rem; margin-bottom: 10px;">${t.icon}</div>
                <strong>${t.name}</strong>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 5px;">${t.description}</p>
            </div>
        `).join('') +
    '</div>';
    
    modal.style.display = 'flex';
}

// Close template modal
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
    });
});

// Add section to content
function addSection(type) {
    const sectionId = Date.now();
    
    const newSection = {
        id: sectionId,
        type: type,
        data: getDefaultDataForType(type)
    };
    
    sections[currentLanguage].push(newSection);
    document.getElementById('templateModal').style.display = 'none';
    renderSections();
}

// Get default data structure for section type
function getDefaultDataForType(type) {
    switch(type) {
        case 'text':
            return { title: '', text: '' };
        case 'features':
            return { title: '', items: [{ icon: '⭐', text: '' }] };
        case 'mechanics':
            return { title: '', items: [{ title: '', description: '' }] };
        case 'gallery':
            return { images: [] };
        case 'examples':
            return { title: '', items: [{ title: '', description: '' }] };
        case 'video':
            return { url: '', title: '' };
        case 'quote':
            return { text: '', author: '' };
        case 'list':
            return { title: '', items: [''] };
        default:
            return {};
    }
}

// Render all sections for current language
function renderSections() {
    const container = document.getElementById('editorContent');
    const currentSections = sections[currentLanguage];
    
    if (currentSections.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Click "+ Add Section" to start building your content</p></div>';
        return;
    }
    
    container.innerHTML = currentSections.map((section, index) => renderSectionEditor(section, index)).join('');
    attachSectionEvents();
}

// Render individual section editor
function renderSectionEditor(section, index) {
    const typeLabels = {
        text: '📝 Text', features: '⭐ Features', mechanics: '⚙️ Mechanics',
        gallery: '🖼️ Gallery', examples: '💡 Examples', video: '🎥 Video',
        quote: '💬 Quote', list: '📋 List'
    };
    
    let fieldsHTML = '';
    
    switch(section.type) {
        case 'text':
            fieldsHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="section-field" data-field="title" value="${section.data.title || ''}">
                </div>
                <div class="form-group">
                    <label>Text</label>
                    <textarea class="section-field" data-field="text" rows="4">${section.data.text || ''}</textarea>
                </div>
            `;
            break;
            
        case 'features':
            fieldsHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="section-field" data-field="title" value="${section.data.title || ''}">
                </div>
                <div class="form-group">
                    <label>Feature Items</label>
                    ${section.data.items.map((item, i) => `
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="text" placeholder="Icon" style="width: 60px;" class="section-field" data-field="items.${i}.icon" value="${item.icon || ''}">
                            <input type="text" placeholder="Feature text" class="section-field" data-field="items.${i}.text" value="${item.text || ''}" style="flex: 1;">
                            <button onclick="removeArrayItem(${index}, 'items', ${i})" style="padding: 5px 10px;">🗑️</button>
                        </div>
                    `).join('')}
                    <button onclick="addArrayItem(${index}, 'items', {icon: '⭐', text: ''})" class="btn-secondary" style="width: 100%; margin-top: 10px;">+ Add Feature</button>
                </div>
            `;
            break;
            
        case 'list':
            fieldsHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="section-field" data-field="title" value="${section.data.title || ''}">
                </div>
                <div class="form-group">
                    <label>List Items</label>
                    ${section.data.items.map((item, i) => `
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="text" class="section-field" data-field="items.${i}" value="${item}" style="flex: 1;">
                            <button onclick="removeArrayItem(${index}, 'items', ${i})" style="padding: 5px 10px;">🗑️</button>
                        </div>
                    `).join('')}
                    <button onclick="addArrayItem(${index}, 'items', '')" class="btn-secondary" style="width: 100%; margin-top: 10px;">+ Add Item</button>
                </div>
            `;
            break;
            
        case 'video':
            fieldsHTML = `
                <div class="form-group">
                    <label>YouTube URL</label>
                    <input type="text" class="section-field" data-field="url" value="${section.data.url || ''}" placeholder="https://www.youtube.com/watch?v=...">
                </div>
                <div class="form-group">
                    <label>Title (optional)</label>
                    <input type="text" class="section-field" data-field="title" value="${section.data.title || ''}">
                </div>
            `;
            break;
            
        case 'quote':
            fieldsHTML = `
                <div class="form-group">
                    <label>Quote Text</label>
                    <textarea class="section-field" data-field="text" rows="3">${section.data.text || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Author</label>
                    <input type="text" class="section-field" data-field="author" value="${section.data.author || ''}">
                </div>
            `;
            break;
            
        default:
            fieldsHTML = '<p class="text-muted">This section type is not yet fully implemented in the editor.</p>';
    }
    
    return `
        <div class="section-editor" data-section-index="${index}">
            <div class="section-header">
                <span class="section-type-badge">${typeLabels[section.type] || section.type}</span>
                <div class="section-controls">
                    <button onclick="moveSectionUp(${index})">↑</button>
                    <button onclick="moveSectionDown(${index})">↓</button>
                    <button onclick="duplicateSection(${index})">📋</button>
                    <button onclick="removeSection(${index})">🗑️</button>
                </div>
            </div>
            ${fieldsHTML}
        </div>
    `;
}

// Attach events to section fields
function attachSectionEvents() {
    document.querySelectorAll('.section-field').forEach(field => {
        field.addEventListener('input', (e) => {
            const sectionEl = e.target.closest('.section-editor');
            const index = parseInt(sectionEl.dataset.sectionIndex);
            const fieldPath = e.target.dataset.field;
            
            updateSectionData(index, fieldPath, e.target.value);
        });
    });
}

// Update section data
function updateSectionData(index, fieldPath, value) {
    const parts = fieldPath.split('.');
    let target = sections[currentLanguage][index].data;
    
    for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]];
    }
    
    target[parts[parts.length - 1]] = value;
}

// Section manipulation functions
window.removeSection = function(index) {
    if (confirm('Remove this section?')) {
        sections[currentLanguage].splice(index, 1);
        renderSections();
    }
};

window.moveSectionUp = function(index) {
    if (index > 0) {
        [sections[currentLanguage][index - 1], sections[currentLanguage][index]] = 
        [sections[currentLanguage][index], sections[currentLanguage][index - 1]];
        renderSections();
    }
};

window.moveSectionDown = function(index) {
    if (index < sections[currentLanguage].length - 1) {
        [sections[currentLanguage][index], sections[currentLanguage][index + 1]] = 
        [sections[currentLanguage][index + 1], sections[currentLanguage][index]];
        renderSections();
    }
};

window.duplicateSection = function(index) {
    const copy = JSON.parse(JSON.stringify(sections[currentLanguage][index]));
    copy.id = Date.now();
    sections[currentLanguage].splice(index + 1, 0, copy);
    renderSections();
};

window.addArrayItem = function(sectionIndex, arrayName, defaultValue) {
    sections[currentLanguage][sectionIndex].data[arrayName].push(defaultValue);
    renderSections();
};

window.removeArrayItem = function(sectionIndex, arrayName, itemIndex) {
    sections[currentLanguage][sectionIndex].data[arrayName].splice(itemIndex, 1);
    renderSections();
};

// Image upload handlers
document.getElementById('cardImage')?.addEventListener('change', (e) => {
    handleImageUpload(e, 'card', 'cardPreview');
});

document.getElementById('bgImage')?.addEventListener('change', (e) => {
    handleImageUpload(e, 'bg', 'bgPreview');
});

function handleImageUpload(event, type, previewId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        images[type] = {
            file: file,
            data: e.target.result
        };
        
        const preview = document.getElementById(previewId);
        preview.innerHTML = `<img src="${e.target.result}" alt="${type} preview">`;
        preview.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

// Collect metadata
function collectMetadata() {
    return {
        id: document.getElementById('contentId').value,
        type: document.getElementById('contentType').value,
        titleDE: document.getElementById('titleDE').value,
        titleEN: document.getElementById('titleEN').value,
        descriptionDE: document.getElementById('descriptionDE').value,
        descriptionEN: document.getElementById('descriptionEN').value,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t)
    };
}

// Preview button
document.getElementById('previewBtn')?.addEventListener('click', () => {
    const meta = collectMetadata();
    
    // Generate preview HTML
    const previewHTML = generatePreviewHTML(meta, sections, images);
    
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewFrame');
    
    iframe.srcdoc = previewHTML;
    modal.style.display = 'flex';
});

// Generate preview HTML
function generatePreviewHTML(meta, sections, images) {
    // TODO: Generate actual HTML preview similar to concept/blog pages
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #0a0a0a; color: #fff; }
                h1 { color: #ff0033; }
                .section { margin: 20px 0; padding: 20px; background: #141414; border-radius: 8px; }
            </style>
        </head>
        <body>
            <h1>${meta.titleEN} / ${meta.titleDE}</h1>
            <p>${meta.descriptionEN}</p>
            <hr>
            ${sections.de.map(s => `<div class="section"><strong>${s.type}</strong><pre>${JSON.stringify(s.data, null, 2)}</pre></div>`).join('')}
        </body>
        </html>
    `;
}

// Publish button
document.getElementById('publishBtn')?.addEventListener('click', async () => {
    const meta = collectMetadata();
    
    // Validate
    if (!meta.id || !meta.titleDE || !meta.titleEN) {
        alert('Please fill in at least ID and titles (DE/EN)');
        return;
    }
    
    if (sections.de.length === 0 || sections.en.length === 0) {
        alert('Please add content sections for both languages (DE and EN)');
        return;
    }
    
    if (confirm('Publish this content to GitHub?')) {
        try {
            document.getElementById('publishBtn').disabled = true;
            document.getElementById('publishBtn').textContent = '⏳ Publishing...';
            
            await publishToGitHub(meta, sections, images);
            
            alert('✓ Content published successfully!');
            document.getElementById('publishBtn').textContent = '🚀 Publish to GitHub';
        } catch (error) {
            alert('✗ Publish failed: ' + error.message);
            document.getElementById('publishBtn').textContent = '🚀 Publish to GitHub';
        } finally {
            document.getElementById('publishBtn').disabled = false;
        }
    }
});

// Initialize
renderSections();
