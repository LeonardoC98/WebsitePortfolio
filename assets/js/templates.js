// Template rendering functions for concept sections
// Each function takes a section object and a container element, then renders the appropriate HTML

/**
 * TEXT TEMPLATE
 * Purpose: Display formatted text content with title
 * Use case: Descriptions, explanations, story elements
 * Data structure: { type: "text", title: "...", text: "..." }
 */
function renderTextSection(section, container) {
    const textHTML = `
        <section class="concept-section">
            <h2>${section.title}</h2>
            <p style="white-space: pre-line;">${section.text}</p>
        </section>
    `;
    container.insertAdjacentHTML('beforeend', textHTML);
}

/**
 * GALLERY TEMPLATE
 * Purpose: Display image galleries in grid layout (max 3 columns)
 * Use case: Concept art, screenshots, visual references
 * Data structure: { type: "gallery", title: "...", images: [{src: "...", alt: "..."}] }
 */
function renderGallerySection(section, container) {
    if (section.images && Array.isArray(section.images)) {
        const imagesHTML = section.images.map(img => 
            `<img src="${img.src}" alt="${img.alt}" class="gallery-image-clickable">`
        ).join('');
        const galleryHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="concept-gallery">
                    ${imagesHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', galleryHTML);
        
        // Add click handlers for lightbox
        setTimeout(() => {
            const galleryImages = container.querySelectorAll('.gallery-image-clickable');
            galleryImages.forEach(img => {
                img.addEventListener('click', () => openLightbox(img.src, img.alt));
            });
        }, 0);
    }
}

/**
 * DOCUMENTS TEMPLATE
 * Purpose: Display downloadable files with icons (PDFs, docs, etc.)
 * Use case: Game design documents, pitches, technical specs
 * Data structure: { type: "documents", title: "...", files: [{name: "...", src: "...", size: "..."}] }
 */
function renderDocumentsSection(section, container) {
    if (section.files && Array.isArray(section.files)) {
        const filesHTML = section.files.map(file => `
            <a href="${file.src}" class="document-item" download target="_blank">
                <svg class="document-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <div class="document-info">
                    <span class="document-name">${file.name}</span>
                    ${file.size ? `<span class="document-size">${file.size}</span>` : ''}
                </div>
            </a>
        `).join('');
        const documentsHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="documents-list">
                    ${filesHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', documentsHTML);
    }
}

/**
 * VIDEO TEMPLATE
 * Purpose: Embed videos (local MP4 or YouTube/Vimeo)
 * Use case: Gameplay footage, trailers, dev logs
 * Data structure: { type: "video", title: "...", src: "...", description: "..." }
 */
function renderVideoSection(section, container) {
    if (section.src) {
        const isExternal = section.src.startsWith('http://') || section.src.startsWith('https://');
        let videoHTML;
        
        if (isExternal) {
            // External video (YouTube, Vimeo, etc.)
            const isYouTube = section.src.includes('youtube.com') || section.src.includes('youtu.be');
            const isVimeo = section.src.includes('vimeo.com');
            
            if (isYouTube || isVimeo) {
                // Embed iframe for YouTube/Vimeo
                let embedSrc = section.src;
                if (isYouTube) {
                    // Convert to embed URL
                    const videoId = section.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                    embedSrc = `https://www.youtube.com/embed/${videoId}`;
                } else if (isVimeo) {
                    const videoId = section.src.match(/vimeo\.com\/(\d+)/)?.[1];
                    embedSrc = `https://player.vimeo.com/video/${videoId}`;
                }
                videoHTML = `<iframe class="concept-video" src="${embedSrc}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
            } else {
                // Generic external video link
                videoHTML = `<a href="${section.src}" target="_blank" class="video-link">Watch Video</a>`;
            }
        } else {
            // Local video file
            videoHTML = `
                <video class="concept-video" controls>
                    <source src="${section.src}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }
        
        const videoSectionHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="video-container">
                    ${videoHTML}
                </div>
                ${section.description ? `<p class="video-description">${section.description}</p>` : ''}
            </section>
        `;
        container.insertAdjacentHTML('beforeend', videoSectionHTML);
    }
}

/**
 * FEATURES TEMPLATE
 * Purpose: Display bullet-point list with optional icons
 * Use case: Game mechanics, feature lists, key points
 * Data structure: { type: "features", title: "...", items: [{icon: "⚔️", text: "..."}] }
 */
function renderFeaturesSection(section, container) {
    if (section.items && Array.isArray(section.items)) {
        const itemsHTML = section.items.map(item => `
            <div class="feature-item">
                ${item.icon ? `<span class="feature-icon">${item.icon}</span>` : ''}
                <span class="feature-text">${item.text}</span>
            </div>
        `).join('');
        const featuresHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="features-list">
                    ${itemsHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', featuresHTML);
    }
}

/**
 * COMPARISON TEMPLATE
 * Purpose: Display comparison tables (e.g., character classes, difficulty modes)
 * Use case: Class comparison, system comparisons, feature matrices
 * Data structure: { type: "comparison", title: "...", columns: ["A", "B"], rows: [{label: "HP", values: ["100", "50"]}] }
 */
function renderComparisonSection(section, container) {
    if (section.columns && section.rows && Array.isArray(section.columns) && Array.isArray(section.rows)) {
        const headerHTML = section.columns.map(col => `<th>${col}</th>`).join('');
        const rowsHTML = section.rows.map(row => `
            <tr>
                <td class="comparison-label">${row.label}</td>
                ${row.values.map(val => `<td>${val}</td>`).join('')}
            </tr>
        `).join('');
        const comparisonHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="comparison-container">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th></th>
                                ${headerHTML}
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', comparisonHTML);
    }
}

/**
 * STATS TEMPLATE
 * Purpose: Display key metrics and numbers with labels
 * Use case: Game scope, player counts, content amounts
 * Data structure: { type: "stats", title: "...", metrics: [{label: "Hours", value: "20-30h"}] }
 */
function renderStatsSection(section, container) {
    if (section.metrics && Array.isArray(section.metrics)) {
        const metricsHTML = section.metrics.map(metric => `
            <div class="stat-item">
                <div class="stat-value">${metric.value}</div>
                <div class="stat-label">${metric.label}</div>
            </div>
        `).join('');
        const statsHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="stats-grid">
                    ${metricsHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', statsHTML);
    }
}

/**
 * TIMELINE TEMPLATE
 * Purpose: Display chronological events or roadmap
 * Use case: Development roadmap, story timeline, milestones
 * Data structure: { type: "timeline", title: "...", events: [{date: "Q1 2024", title: "...", description: "..."}] }
 */
function renderTimelineSection(section, container) {
    if (section.events && Array.isArray(section.events)) {
        const eventsHTML = section.events.map(event => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${event.date}</div>
                    <h3 class="timeline-title">${event.title}</h3>
                    ${event.description ? `<p class="timeline-description">${event.description}</p>` : ''}
                </div>
            </div>
        `).join('');
        const timelineHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="timeline-container">
                    ${eventsHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', timelineHTML);
    }
}

/**
 * QUOTE TEMPLATE
 * Purpose: Display highlighted quotes or design philosophy
 * Use case: Design pillars, player testimonials, key insights
 * Data structure: { type: "quote", text: "...", author: "..." }
 */
function renderQuoteSection(section, container) {
    if (section.text) {
        const quoteHTML = `
            <section class="concept-section">
                <div class="quote-container">
                    <blockquote class="concept-quote">
                        <p class="quote-text">"${section.text}"</p>
                        ${section.author ? `<footer class="quote-author">— ${section.author}</footer>` : ''}
                    </blockquote>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', quoteHTML);
    }
}

/**
 * CODE TEMPLATE
 * Purpose: Display code snippets or formulas with syntax highlighting
 * Use case: Damage calculations, AI logic, technical explanations
 * Data structure: { type: "code", title: "...", language: "javascript", code: "..." or code: ["line1", "line2"] }
 */
function renderCodeSection(section, container) {
    if (section.code) {
        // Support both string and array formats for code
        const codeText = Array.isArray(section.code) 
            ? section.code.join('\n') 
            : section.code;
        
        const codeHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="code-container">
                    <pre class="code-block"><code class="language-${section.language || 'text'}">${escapeHtml(codeText)}</code></pre>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', codeHTML);
    }
}

/**
 * EMBED TEMPLATE
 * Purpose: Embed external content via iframe (playable prototypes, etc.)
 * Use case: Itch.io games, interactive demos, external tools
 * Data structure: { type: "embed", title: "...", src: "...", height: "600px" }
 */
function renderEmbedSection(section, container) {
    if (section.src) {
        const embedHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="embed-container" style="height: ${section.height || '600px'};">
                    <iframe class="concept-embed" src="${section.src}" frameborder="0" allowfullscreen></iframe>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', embedHTML);
    }
}

/**
 * SPLIT TEMPLATE
 * Purpose: Display image and text side-by-side in two columns
 * Use case: Level design explanations, concept art with description
 * Data structure: { type: "split", title: "...", image: "...", text: "...", imagePosition: "left" }
 */
function renderSplitSection(section, container) {
    if (section.image && section.text) {
        const isImageLeft = section.imagePosition !== 'right';
        const splitHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="split-container ${isImageLeft ? 'image-left' : 'image-right'}">
                    <div class="split-image">
                        <img src="${section.image}" alt="${section.title}" class="split-image-clickable">
                    </div>
                    <div class="split-text">
                        <p style="white-space: pre-line;">${section.text}</p>
                    </div>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', splitHTML);
        
        // Add click handler for lightbox
        setTimeout(() => {
            const splitImage = container.querySelector('.split-image-clickable');
            if (splitImage) {
                splitImage.addEventListener('click', () => openLightbox(splitImage.src, splitImage.alt));
            }
        }, 0);
    }
}

/**
 * ACCORDION TEMPLATE
 * Purpose: Display collapsible sections for FAQs or long content
 * Use case: FAQ, detailed mechanics, spoiler-hidden content
 * Data structure: { type: "accordion", title: "...", items: [{question: "...", answer: "..."}] }
 */
function renderAccordionSection(section, container) {
    if (section.items && Array.isArray(section.items)) {
        const itemsHTML = section.items.map((item, index) => `
            <div class="accordion-item">
                <button class="accordion-header" data-index="${index}">
                    <span>${item.question}</span>
                    <span class="accordion-icon">▼</span>
                </button>
                <div class="accordion-content">
                    <p style="white-space: pre-line;">${item.answer}</p>
                </div>
            </div>
        `).join('');
        const accordionHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="accordion-container">
                    ${itemsHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', accordionHTML);
        
        // Add click handlers for accordion
        setTimeout(() => {
            const accordionHeaders = container.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const item = this.parentElement;
                    const wasActive = item.classList.contains('active');
                    
                    // Close all accordion items
                    container.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
                    
                    // Toggle current item
                    if (!wasActive) {
                        item.classList.add('active');
                    }
                });
            });
        }, 0);
    }
}

/**
 * SLIDER TEMPLATE
 * Purpose: Display before/after image comparison with slider
 * Use case: Art evolution, iteration comparisons, visual improvements
 * Data structure: { type: "slider", title: "...", before: "...", after: "...", beforeLabel: "...", afterLabel: "..." }
 */
function renderSliderSection(section, container) {
    if (section.before && section.after) {
        const sliderId = `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const sliderHTML = `
            <section class="concept-section">
                <h2>${section.title}</h2>
                <div class="slider-container" id="${sliderId}">
                    <div class="slider-image-container">
                        <img src="${section.before}" alt="${section.beforeLabel || 'Before'}" class="slider-image slider-before">
                        <div class="slider-overlay">
                            <img src="${section.after}" alt="${section.afterLabel || 'After'}" class="slider-image slider-after">
                        </div>
                        <div class="slider-handle">
                            <div class="slider-line"></div>
                        </div>
                    </div>
                    <div class="slider-labels">
                        <span class="slider-label-before">${section.beforeLabel || 'Before'}</span>
                        <span class="slider-label-after">${section.afterLabel || 'After'}</span>
                    </div>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', sliderHTML);
        
        // Add slider functionality
        setTimeout(() => {
            const sliderContainer = document.getElementById(sliderId);
            const handle = sliderContainer.querySelector('.slider-handle');
            const overlay = sliderContainer.querySelector('.slider-overlay');
            let isDragging = false;
            
            function updateSlider(x) {
                const rect = sliderContainer.querySelector('.slider-image-container').getBoundingClientRect();
                const position = Math.max(0, Math.min(x - rect.left, rect.width));
                const percentage = (position / rect.width) * 100;
                
                overlay.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
                handle.style.left = `${percentage}%`;
            }
            
            handle.addEventListener('mousedown', () => isDragging = true);
            document.addEventListener('mouseup', () => isDragging = false);
            document.addEventListener('mousemove', (e) => {
                if (isDragging) updateSlider(e.clientX);
            });
            
            sliderContainer.querySelector('.slider-image-container').addEventListener('click', (e) => {
                updateSlider(e.clientX);
            });
        }, 0);
    }
}

// Helper function to escape HTML in code blocks
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * EXAMPLE TEMPLATE
 * Purpose: Display highlighted examples in colored box (e.g., "Example: Diablo Series")
 * Use case: Case studies, game examples, practical demonstrations
 * Data structure: { type: "example", title: "...", content: "..." }
 */
function renderExampleSection(section, container) {
    if (section.content) {
        const exampleHTML = `
            <section class="concept-section">
                ${section.title ? `<h2>${section.title}</h2>` : ''}
                <div style="background: var(--bg-light); padding: 25px; border-left: 4px solid var(--accent-color); margin: 1.5rem 0; border-radius: 8px;">
                    <p style="color: var(--text-light); line-height: 1.8; margin: 0;">${section.content}</p>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', exampleHTML);
    }
}

/**
 * MISTAKES TEMPLATE
 * Purpose: Display common mistakes/errors with X icons (red theme)
 * Use case: Anti-patterns, things to avoid, common errors
 * Data structure: { type: "mistakes", title: "...", items: ["mistake1", "mistake2"] }
 */
function renderMistakesSection(section, container) {
    if (section.items && Array.isArray(section.items)) {
        const itemsHTML = section.items.map(item => `
            <div class="mistake-item" style="display: flex; gap: 15px; align-items: flex-start; padding: 15px; background: rgba(255, 0, 51, 0.05); border-radius: 8px; margin-bottom: 12px;">
                <span style="color: var(--primary-color); font-size: 1.5rem; flex-shrink: 0;">❌</span>
                <span style="color: var(--text-light); line-height: 1.6;">${item}</span>
            </div>
        `).join('');
        const mistakesHTML = `
            <section class="concept-section">
                ${section.title ? `<h2>${section.title}</h2>` : ''}
                <div class="mistakes-container">
                    ${itemsHTML}
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', mistakesHTML);
    }
}

/**
 * BULLETPOINTS TEMPLATE
 * Purpose: Display simple bullet points without icons (clean list)
 * Use case: Key points, summaries, requirements
 * Data structure: { type: "bulletpoints", title: "...", items: ["point1", "point2"] }
 */
function renderBulletpointsSection(section, container) {
    if (section.items && Array.isArray(section.items)) {
        const itemsHTML = section.items.map(item => `<li>${item}</li>`).join('');
        const bulletpointsHTML = `
            <section class="concept-section">
                ${section.title ? `<h2>${section.title}</h2>` : ''}
                <ul style="color: var(--text-light); line-height: 2; margin: 1rem 0 1rem 2rem; list-style-type: disc;">
                    ${itemsHTML}
                </ul>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', bulletpointsHTML);
    }
}

/**
 * LIST TEMPLATE
 * Purpose: Display numbered or unnumbered lists with custom styling
 * Use case: Steps, instructions, ordered points
 * Data structure: { type: "list", title: "...", ordered: true/false, items: [{label: "...", text: "..."}] }
 */
function renderListSection(section, container) {
    if (section.items && Array.isArray(section.items)) {
        const listTag = section.ordered ? 'ol' : 'ul';
        const itemsHTML = section.items.map(item => {
            if (typeof item === 'string') {
                return `<li style="margin-bottom: 12px;">${item}</li>`;
            } else if (item.label && item.text) {
                return `<li style="margin-bottom: 12px;"><strong style="color: var(--primary-color);">${item.label}:</strong> ${item.text}</li>`;
            }
            return '';
        }).join('');
        
        const listHTML = `
            <section class="concept-section">
                ${section.title ? `<h2>${section.title}</h2>` : ''}
                <${listTag} style="color: var(--text-light); line-height: 2; margin: 1rem 0 1rem 2rem;">
                    ${itemsHTML}
                </${listTag}>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', listHTML);
    }
}

// Template registry - maps section types to render functions
const templateRenderers = {
    'text': renderTextSection,
    'gallery': renderGallerySection,
    'documents': renderDocumentsSection,
    'video': renderVideoSection,
    'features': renderFeaturesSection,
    'comparison': renderComparisonSection,
    'stats': renderStatsSection,
    'timeline': renderTimelineSection,
    'quote': renderQuoteSection,
    'code': renderCodeSection,
    'embed': renderEmbedSection,
    'split': renderSplitSection,
    'accordion': renderAccordionSection,
    'slider': renderSliderSection,
    'example': renderExampleSection,
    'mistakes': renderMistakesSection,
    'bulletpoints': renderBulletpointsSection,
    'list': renderListSection
};

// Main render function - calls appropriate template renderer based on section.type
function renderSection(section, container) {
    // Get the type from section (e.g., 'text', 'gallery', 'video', 'documents')
    const sectionType = section.type;
    const renderer = templateRenderers[sectionType];
    
    if (renderer) {
        renderer(section, container);
    } else {
        console.warn('Unknown section type:', sectionType);
    }
}
// Lightbox functionality for gallery images
function openLightbox(imageSrc, imageAlt) {
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <img src="" alt="" class="lightbox-image">
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Close on overlay click
        lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
        
        // Close on image click
        lightbox.querySelector('.lightbox-content').addEventListener('click', closeLightbox);
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }
    
    // Set image and show lightbox
    const img = lightbox.querySelector('.lightbox-image');
    img.src = imageSrc;
    img.alt = imageAlt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}