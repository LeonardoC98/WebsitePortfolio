// Template rendering functions for concept sections

function renderTextSection(section, container) {
    const textHTML = `
        <section class="concept-section">
            <h2>${section.title}</h2>
            <p style="white-space: pre-line;">${section.text}</p>
        </section>
    `;
    container.insertAdjacentHTML('beforeend', textHTML);
}

function renderGallerySection(section, container) {
    if (section.images && Array.isArray(section.images)) {
        const imagesHTML = section.images.map(img => 
            `<img src="${img.src}" alt="${img.alt}">`
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
    }
}

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

// Template registry - maps section types to render functions
const templateRenderers = {
    'text': renderTextSection,
    'gallery': renderGallerySection,
    'documents': renderDocumentsSection,
    'video': renderVideoSection
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
