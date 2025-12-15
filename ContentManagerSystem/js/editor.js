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

    Object.keys(window.TEMPLATES)
        .sort((a, b) => a.localeCompare(b))
        .forEach(key => {
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

    // Autosize code textareas after render
    applyCodeAutosize();
}

function createSectionElement(section, index) {
    const div = document.createElement('div');
    div.className = 'section-item';

    const fieldsHTML = generateFieldsHTML(section, index);

    const isFirst = index === 0;
    const isLast = index === sections.length - 1;
    const upDisabled = isFirst ? 'disabled' : '';
    const downDisabled = isLast ? 'disabled' : '';
    const disabledStyle = 'opacity:0.45; pointer-events:none;';

    div.innerHTML = `
        <div class="section-header">
            <div style="display:flex; gap:0.35rem; align-items:center;">
                <button ${upDisabled} onclick="moveSection(${index}, -1)" class="btn btn-primary btn-small" style="background: var(--primary-color); border-color: var(--primary-color); color: white; ${isFirst ? disabledStyle : ''}">Swap ↑</button>
                <button ${downDisabled} onclick="moveSection(${index}, 1)" class="btn btn-primary btn-small" style="background: var(--primary-color); border-color: var(--primary-color); color: white; ${isLast ? disabledStyle : ''}">Swap ↓</button>
                <div class="section-title">${section.type}</div>
            </div>
            <div style="display:flex; gap:0.35rem; align-items:center;">
                <button onclick="removeSection(${index})" class="btn btn-small" style="background: rgba(255,0,51,0.1); color: var(--accent);">Delete</button>
            </div>
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
        // Shared fields (show once, language-independent)
        template.shared?.forEach(key => {
            const value = shared[key] || '';

            // Special-case: Split imagePosition must be a toggle, handle before array/generic
            if (section.type === 'Split' && key === 'imagePosition') {
                const current = (value === 'right' ? 'right' : 'left');
                html += `
                    <div>
                        <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">Position</label>
                        <div style="display:flex; gap:0.5rem;">
                            <button type="button" tabindex="0"
                                style="padding:0.4rem 0.8rem; border:1px solid var(--border-color); border-radius:4px; cursor:pointer; ${current==='left'?'background: var(--bg-light); color: var(--text-dark);':'background: rgba(0,0,0,0.08); color: var(--text-light);'}"
                                    onclick="setSplitPosition(${index}, 'left')">Left</button>
                            <button type="button" tabindex="0"
                                style="padding:0.4rem 0.8rem; border:1px solid var(--border-color); border-radius:4px; cursor:pointer; ${current==='right'?'background: var(--bg-light); color: var(--text-dark);':'background: rgba(0,0,0,0.08); color: var(--text-light);'}"
                                    onclick="setSplitPosition(${index}, 'right')">Right</button>
                        </div>
                    </div>
                `;
                return; // Skip further handling for this key
            }

            // Check if this field expects an array (items, images, metrics, events, documents, etc.)
            const isArrayField = ['items', 'images', 'metrics', 'events', 'rows', 'columns', 'files', 'documents'].includes(key);

            if (isArrayField) {
                html += generateArrayFieldHTML(index, key, value, section.type);
            } else {
                // Special-case: Code content as larger textarea
                if (section.type === 'Code' && key === 'code') {
                    html += `
                        <div>
                            <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">${key}</label>
                            <textarea rows="6" placeholder="code" data-autosize="code"
                                      oninput="autoSizeCode(this); updateSectionField(${index}, '${key}', this.value, 'shared'); autoSave();"
                                      style="width: 100%; padding: 0.5rem 0.8rem; background: #e6ffe6; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-dark); font-family: monospace; font-size: 0.9rem; overflow:hidden; resize:none; min-height: 140px;">${value || ''}</textarea>
                        </div>
                    `;
                } else {
                    html += `
                        <div>
                            <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">${key}</label>
                            <input type="text" value="${value}" placeholder="${key}" 
                                   onchange="updateSectionField(${index}, '${key}', this.value, 'shared'); autoSave();"
                                   style="width: 100%; padding: 0.5rem 0.8rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-dark);">
                        </div>
                    `;
                }
            }
        });

    html += '</div>';
    return html;
}

function generateArrayFieldHTML(sectionIndex, key, value, sectionType) {
    let array = [];
    try {
        array = value ? JSON.parse(value) : [];
    } catch (e) {
        array = [];
    }
    
    let html = `
        <div style="margin-bottom: 1rem;">
            <label style="color: var(--text-light); font-size: 0.85rem; margin-bottom: 0.5rem; display: block;">${key}</label>
            <div id="array-${sectionIndex}-${key}" style="display: flex; flex-direction: column; gap: 0.5rem;">
    `;
    
    array.forEach((item, itemIndex) => {
        html += generateArrayItemHTML(sectionIndex, key, item, itemIndex, sectionType);
    });
    
    html += `
            </div>
            <button onclick="addArrayItem(${sectionIndex}, '${key}', '${sectionType}')" class="btn btn-secondary" style="margin-top: 0.5rem; width: 100%;">+ Add ${key.slice(0, -1)}</button>
        </div>
    `;
    
    return html;
}

function generateArrayItemHTML(sectionIndex, key, item, itemIndex, sectionType) {
    let fieldsHTML = '';
    
    // Generate individual fields based on item type
    if (key === 'items') {
         if (sectionType === 'Accordion') {
             // Accordion items: question + answer
             fieldsHTML = `
              <input type="text" value="${(item.question || '').replace(/"/g, '&quot;')}" placeholder="Question" 
                  onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'question', this.value)"
                  style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
              <textarea placeholder="Answer" rows="2"
                     onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'answer', this.value)"
                     style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem; resize: vertical;">${(item.answer || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
             `;
        } else {
            // Features items: icon + text
            fieldsHTML = `
                <input type="text" value="${(item.icon || '').replace(/"/g, '&quot;')}" placeholder="Icon (emoji)" 
                       onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'icon', this.value)"
                       style="width: 120px; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
                <input type="text" value="${(item.text || '').replace(/"/g, '&quot;')}" placeholder="Text" 
                       onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'text', this.value)"
                       style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            `;
         }
    } else if (key === 'images') {
        fieldsHTML = `
            <input type="text" value="${(item.src || '').replace(/"/g, '&quot;')}" placeholder="images/img1.jpg" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'src', this.value)"
                 style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
             <button type="button" class="btn btn-secondary" style="padding:0.35rem 0.6rem;" onclick="openGalleryUpload(${sectionIndex}, ${itemIndex})">Upload</button>
             <button type="button" class="btn btn-secondary" style="padding:0.35rem 0.6rem;" onclick="pickGalleryImage(${sectionIndex}, ${itemIndex})">Pick</button>
        `;
    } else if (key === 'metrics') {
        fieldsHTML = `
            <input type="text" value="${(item.label || '').replace(/"/g, '&quot;')}" placeholder="Label" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'label', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            <input type="text" value="${(item.value || '').replace(/"/g, '&quot;')}" placeholder="Value" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'value', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
        `;
    } else if (key === 'events') {
        fieldsHTML = `
            <input type="text" value="${(item.date || '').replace(/"/g, '&quot;')}" placeholder="Date" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'date', this.value)"
                   style="width: 100px; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            <input type="text" value="${(item.title || '').replace(/"/g, '&quot;')}" placeholder="Title" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'title', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            <input type="text" value="${(item.description || '').replace(/"/g, '&quot;')}" placeholder="Description" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'description', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
        `;
    } else if (key === 'documents' || key === 'files') {
         const sizeLabel = item.size ? item.size : '';
         const inputId = `docfile-${sectionIndex}-${key}-${itemIndex}`;
         fieldsHTML = `
             <input type="text" value="${(item.name || '').replace(/"/g, '&quot;')}" placeholder="File name" 
                 onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'name', this.value)"
                 style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
             <input type="text" value="${(item.src || '').replace(/"/g, '&quot;')}" placeholder="documents/file.pdf" 
                 onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'src', this.value)"
                 style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
             <span style="min-width: 100px; color: var(--text-light); font-size: 0.8rem;">${sizeLabel}</span>
             <input id="${inputId}" type="file" style="display:none" 
                 accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                 onchange="handleDocumentUpload(event, ${sectionIndex}, '${key}', ${itemIndex})">
             <button type="button" class="btn btn-secondary" onclick="document.getElementById('${inputId}').click()">Upload</button>
         `;
    } else if (key === 'slides') {
        fieldsHTML = `
            <input type="text" value="${(item.image || '').replace(/"/g, '&quot;')}" placeholder="images/slide1.jpg" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'image', this.value)"
                   style="flex: 2; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            <input type="text" value="${(item.caption || '').replace(/"/g, '&quot;')}" placeholder="Caption" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'caption', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
        `;
    } else if (key === 'rows') {
        fieldsHTML = `
            <input type="text" value="${(item.label || '').replace(/"/g, '&quot;')}" placeholder="Row label" 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'label', this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
            <input type="text" value="${JSON.stringify(item.values || []).replace(/"/g, '&quot;')}" placeholder='["value1", "value2"]' 
                   onchange="updateArrayItemField(${sectionIndex}, '${key}', ${itemIndex}, 'values', JSON.parse(this.value))"
                   style="flex: 2; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem; font-family: monospace;">
        `;
    } else if (key === 'columns') {
        // Columns is a simple string array
        const itemStr = typeof item === 'string' ? item : '';
        fieldsHTML = `
            <input type="text" value="${itemStr.replace(/"/g, '&quot;')}" placeholder="Column header" 
                   onchange="updateArrayItem(${sectionIndex}, '${key}', ${itemIndex}, JSON.stringify(this.value))"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
        `;
    } else {
        // Fallback for unknown types
        const itemStr = JSON.stringify(item).replace(/"/g, '&quot;');
        fieldsHTML = `
            <input type="text" value='${itemStr}' 
                   onchange="updateArrayItem(${sectionIndex}, '${key}', ${itemIndex}, this.value)"
                   style="flex: 1; padding: 0.4rem 0.6rem; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem;">
        `;
    }
    
    return `
        <div style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem; background: var(--bg-light); border-radius: 4px;">
            ${fieldsHTML}
            <button onclick="removeArrayItem(${sectionIndex}, '${key}', ${itemIndex})" class="btn btn-small" style="background: rgba(236,72,153,0.1); color: var(--accent-color);">×</button>
        </div>
    `;
}

// Allowed document MIME types and extensions
const ALLOWED_DOCUMENT_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
]);

function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const val = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${val} ${sizes[i]}`;
}

// Handle document upload, validate type, store base64 in draft for publish
function handleDocumentUpload(evt, sectionIndex, key, itemIndex) {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const typeOk = ALLOWED_DOCUMENT_TYPES.has(file.type) || /\.(pdf|doc|docx|ppt|pptx|txt)$/i.test(file.name);
    if (!typeOk) {
        alert('Unsupported document type. Allowed: PDF, DOC/DOCX, PPT/PPTX, TXT');
        evt.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result; // data:*/*;base64,....
        // Update section item fields: name, src, size
        updateArrayItemField(sectionIndex, key, itemIndex, 'name', file.name);
        updateArrayItemField(sectionIndex, key, itemIndex, 'src', `documents/${file.name}`);
        updateArrayItemField(sectionIndex, key, itemIndex, 'size', formatBytes(file.size));
        // Re-render to reflect changes immediately in the CMS UI
        renderSections();

        // Persist document data in draft
        try {
            const DRAFT_KEY = 'cms_draft';
            const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
            if (!savedDraft.documents) savedDraft.documents = {};
            savedDraft.documents[file.name] = base64; // include data URL prefix
            localStorage.setItem(DRAFT_KEY, JSON.stringify(savedDraft));
        } catch (e) {
            console.error('Failed to store document in draft', e);
        }
    };
    reader.readAsDataURL(file);
}

// Gallery image upload / pick
function openGalleryUpload(sectionIndex, itemIndex) {
    const inputId = `gallery-file-${sectionIndex}-${itemIndex}-${Date.now()}`;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.id = inputId;
    input.onchange = (evt) => {
        const file = evt.target.files && evt.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result; // data:image/...;base64,
            const fileName = file.name;
            // Update section item fields
            updateArrayItemField(sectionIndex, 'images', itemIndex, 'src', `images/${fileName}`);
            updateArrayItemField(sectionIndex, 'images', itemIndex, 'alt', fileName);
            renderSections();
            // Persist in draft.galleryImages
            try {
                const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
                if (!savedDraft.galleryImages) savedDraft.galleryImages = {};
                savedDraft.galleryImages[fileName] = base64;
                localStorage.setItem(DRAFT_KEY, JSON.stringify(savedDraft));
            } catch (e) {
                console.error('Failed to store gallery image', e);
            }
        };
        reader.readAsDataURL(file);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 0);
}

// Scrollable picker modal for existing gallery images
let galleryPickerState = null;

function pickGalleryImage(sectionIndex, itemIndex) {
    try {
        const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
        const images = savedDraft.galleryImages || {};
        const names = Object.keys(images);
        if (!names.length) {
            alert('No gallery images in draft yet. Upload one first.');
            return;
        }
        galleryPickerState = { sectionIndex, itemIndex, images };
        renderGalleryPicker(names, images);
    } catch (e) {
        console.error('Failed to pick gallery image', e);
    }
}

function renderGalleryPicker(names, images) {
    const existing = document.getElementById('galleryPickerOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'galleryPickerOverlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:9999;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-white,#fff); color:var(--text-dark,#111); border-radius:8px; padding:16px; width:520px; max-width:90vw; max-height:80vh; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.25);';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;';
    const title = document.createElement('div');
    title.textContent = 'Pick an image';
    title.style.cssText = 'font-weight:600; font-size:1rem;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'border:none; background:transparent; font-size:1.2rem; cursor:pointer;';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(title);
    header.appendChild(closeBtn);

    const list = document.createElement('div');
    list.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; overflow-y:auto; padding-right:4px; max-height:60vh;';

    names.forEach(name => {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid var(--border-color,#ddd); border-radius:6px; padding:6px; background:var(--bg-light,#f7f7f7); cursor:pointer; display:flex; flex-direction:column; gap:6px;';
        const img = document.createElement('img');
        img.src = images[name];
        img.alt = name;
        img.style.cssText = 'width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:4px;';
        const label = document.createElement('div');
        label.textContent = name;
        label.style.cssText = 'font-size:0.8rem; color:var(--text-dark,#111); word-break:break-all;';
        card.onclick = () => {
            applyGalleryPick(name);
            overlay.remove();
        };
        card.appendChild(img);
        card.appendChild(label);
        list.appendChild(card);
    });

    modal.appendChild(header);
    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function applyGalleryPick(name) {
    if (!galleryPickerState) return;
    const { sectionIndex, itemIndex } = galleryPickerState;
    updateArrayItemField(sectionIndex, 'images', itemIndex, 'src', `images/${name}`);
    renderSections();
    galleryPickerState = null;
}

function addArrayItem(sectionIndex, key, sectionType) {
    const section = sections[sectionIndex];
    if (!section) return;
    
    let array = [];
    try {
        array = section.shared[key] ? JSON.parse(section.shared[key]) : [];
    } catch (e) {
        array = [];
    }
    
    // Create default item based on key type
    let newItem = {};
    if (key === 'items') {
        if (sectionType === 'Accordion') {
            newItem = { question: '', answer: '' };
        } else {
            newItem = { icon: '', text: '' };
        }
    } else if (key === 'images') {
        newItem = { src: '', alt: '' };
    } else if (key === 'metrics') {
        newItem = { label: '', value: '' };
    } else if (key === 'events') {
        newItem = { date: '', title: '', description: '' };
    } else if (key === 'documents' || key === 'files') {
        newItem = { name: '', src: '', size: '' };
    } else if (key === 'rows') {
        newItem = { label: '', values: [] };
    } else if (key === 'columns') {
        newItem = '';
    } else if (key === 'slides') {
        newItem = { image: '', caption: '' };
    }
    
    array.push(newItem);
    section.shared[key] = JSON.stringify(array);
    renderSections();
    autoSave();
}

function removeArrayItem(sectionIndex, key, itemIndex) {
    const section = sections[sectionIndex];
    if (!section) return;
    
    let array = [];
    try {
        array = JSON.parse(section.shared[key] || '[]');
    } catch (e) {
        return;
    }
    
    array.splice(itemIndex, 1);
    section.shared[key] = JSON.stringify(array);
    renderSections();
    autoSave();
}

function updateArrayItemField(sectionIndex, key, itemIndex, field, value) {
    const section = sections[sectionIndex];
    if (!section) return;
    
    let array = [];
    try {
        array = JSON.parse(section.shared[key] || '[]');
        if (!array[itemIndex]) array[itemIndex] = {};
        array[itemIndex][field] = value;
        section.shared[key] = JSON.stringify(array);
        autoSave();
    } catch (e) {
        console.error('Error updating array item field');
    }
}

function updateArrayItem(sectionIndex, key, itemIndex, value) {
    const section = sections[sectionIndex];
    if (!section) return;
    
    let array = [];
    try {
        array = JSON.parse(section.shared[key] || '[]');
        array[itemIndex] = JSON.parse(value);
        section.shared[key] = JSON.stringify(array);
        autoSave();
    } catch (e) {
        console.error('Invalid JSON for array item');
    }
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

function moveSection(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[target];
    sections[target] = temp;
    renderSections();
    autoSave();
}

function autoSizeCode(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
}

function applyCodeAutosize() {
    const codes = document.querySelectorAll('textarea[data-autosize="code"]');
    codes.forEach(autoSizeCode);
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

// Helper to set Split section image position reliably and update UI
function setSplitPosition(sectionIndex, pos) {
    try {
        updateSectionField(sectionIndex, 'imagePosition', (pos === 'right' ? 'right' : 'left'), 'shared');
        autoSave();
        renderSections();
    } catch (e) {
        console.error('Failed to set split position', e);
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
    // Use lowercase type and flatten data to top level for template renderers
    const contentDE = { 
        sections: sections.map(s => ({ 
            type: s.type.toLowerCase(),
            ...s.shared,
            ...s.data_de
        })) 
    };
    const contentEN = { 
        sections: sections.map(s => ({ 
            type: s.type.toLowerCase(),
            ...s.shared,
            ...s.data_en
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
        const htmlPreview = generateIndexHTML(meta);

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
        await uploadFile(settings, `${folder}/index.html`, htmlPreview);

        // Upload images if they exist (check both input elements and draft storage)
        const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
        const cardImageData = savedDraft.images?.card;
        const bgImageData = savedDraft.images?.bg;
        
        if (cardImageData) {
            console.log('Uploading card image...');
            await uploadFile(settings, `${folder}/images/card.jpg`, cardImageData, true);
        } else {
            console.warn('No card image found - please upload one in the sidebar');
        }
        
        if (bgImageData) {
            console.log('Uploading background image...');
            await uploadFile(settings, `${folder}/images/bg.jpg`, bgImageData, true);
        } else {
            console.warn('No background image found - please upload one in the sidebar');
        }

        // Create content-de.json and content-en.json (merge shared + translatable data)
        // Use lowercase type and flatten data to top level for template renderers
        const contentDE = { 
            sections: sections.map(s => ({ 
                type: s.type.toLowerCase(),
                ...s.shared,
                ...s.data_de
            })) 
        };
        const contentEN = { 
            sections: sections.map(s => ({ 
                type: s.type.toLowerCase(),
                ...s.shared,
                ...s.data_en
            })) 
        };

        await uploadFile(settings, `${folder}/content-de.json`, JSON.stringify(contentDE, null, 2));
        await uploadFile(settings, `${folder}/content-en.json`, JSON.stringify(contentEN, null, 2));

        // Upload documents from draft (PDF, DOC/DOCX, PPT/PPTX, TXT)
        try {
            const savedDraft2 = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
            if (savedDraft2.documents) {
                for (const [name, dataUrl] of Object.entries(savedDraft2.documents)) {
                    const path = `${folder}/documents/${name}`;
                    await uploadFile(settings, path, dataUrl, true);
                }
            }
            // Upload gallery images from draft
            if (savedDraft2.galleryImages) {
                for (const [name, dataUrl] of Object.entries(savedDraft2.galleryImages)) {
                    const path = `${folder}/images/${name}`;
                    await uploadFile(settings, path, dataUrl, true);
                }
            }
        } catch (e) {
            console.error('Document upload failed', e);
        }

        alert('Published successfully!');
        localStorage.removeItem(DRAFT_KEY);

    } catch (error) {
        alert('Publish failed: ' + error.message);
    } finally {
        document.getElementById('publishBtn').disabled = false;
        document.getElementById('publishBtn').textContent = 'Publish';
    }
}

async function uploadFile(settings, path, content, isBase64 = false) {
    const url = `https://api.github.com/repos/${settings.user}/${settings.repo}/contents/${path}`;
    // UTF-8 safe encoding for text, or use base64 directly for images
    const encoded = isBase64 ? content.split(',')[1] : btoa(unescape(encodeURIComponent(content)));

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
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || response.statusText;
        throw new Error(`Upload failed for ${path}: ${errorMsg}`);
    }
}
