// GitHub Integration Module

// Get GitHub settings
function getGitHubSettings() {
    const settings = localStorage.getItem('cms_github_settings');
    if (!settings) {
        throw new Error('GitHub settings not configured. Please go to Settings page.');
    }
    return JSON.parse(settings);
}

// Publish content to GitHub
async function publishToGitHub(metadata, sections, images) {
    const settings = getGitHubSettings();
    const { token, user, repo, branch } = settings;
    
    const folder = metadata.type === 'blog' ? 'blog' : 'concepts';
    const basePath = `${folder}/${metadata.type === 'blog' ? '' : 'concept-'}${metadata.id}`;
    
    // Files to create
    const files = [];
    
    // 1. data.json
    const dataJson = {
        id: metadata.id,
        translationKey: `${folder}.${metadata.id}`,
        titleDE: metadata.titleDE,
        titleEN: metadata.titleEN,
        descriptionDE: metadata.descriptionDE,
        descriptionEN: metadata.descriptionEN,
        image: `${basePath}/images/card.jpg`,
        hero_image: `images/bg.jpg`,
        tags: metadata.tags,
        date: new Date().toISOString().split('T')[0],
        link: `${basePath}/index.html`
    };
    
    files.push({
        path: `${basePath}/data.json`,
        content: JSON.stringify(dataJson, null, 2)
    });
    
    // 2. content-de.json
    files.push({
        path: `${basePath}/content-de.json`,
        content: JSON.stringify({ sections: sections.de.map(s => s.data) }, null, 2)
    });
    
    // 3. content-en.json
    files.push({
        path: `${basePath}/content-en.json`,
        content: JSON.stringify({ sections: sections.en.map(s => s.data) }, null, 2)
    });
    
    // 4. index.html
    const indexHTML = generateIndexHTML(metadata, folder);
    files.push({
        path: `${basePath}/index.html`,
        content: indexHTML
    });
    
    // 5. Images
    if (images.card) {
        files.push({
            path: `${basePath}/images/card.jpg`,
            content: images.card.data.split(',')[1], // base64 without prefix
            encoding: 'base64'
        });
    }
    
    if (images.bg) {
        files.push({
            path: `${basePath}/images/bg.jpg`,
            content: images.bg.data.split(',')[1],
            encoding: 'base64'
        });
    }
    
    // Upload all files to GitHub
    for (const file of files) {
        await uploadFileToGitHub(token, user, repo, branch, file.path, file.content, file.encoding);
    }
    
    // Update concept/blog list files if needed
    if (metadata.type === 'concept') {
        await updateConceptList(token, user, repo, branch, metadata.id);
    }
}

// Upload single file to GitHub
async function uploadFileToGitHub(token, user, repo, branch, path, content, encoding = 'utf-8') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
    
    // Check if file exists (to get SHA for update)
    let sha = null;
    try {
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (checkResponse.ok) {
            const data = await checkResponse.json();
            sha = data.sha;
        }
    } catch (e) {
        // File doesn't exist, that's fine
    }
    
    // Create/update file
    const body = {
        message: `CMS: ${sha ? 'Update' : 'Create'} ${path}`,
        content: encoding === 'base64' ? content : btoa(unescape(encodeURIComponent(content))),
        branch: branch
    };
    
    if (sha) {
        body.sha = sha;
    }
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to upload ${path}: ${error.message}`);
    }
    
    return await response.json();
}

// Generate index.html for concept/blog
function generateIndexHTML(metadata, folder) {
    const isConcept = folder === 'concepts';
    const backLink = isConcept ? '../../concepts.html' : '../../blog.html';
    const backText = isConcept ? 'concept.back' : 'blog.backToBlog';
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.titleEN} - ${isConcept ? 'Game Concepts' : 'Blog'}</title>
    <link rel="stylesheet" href="../../assets/css/style-base.css?v=2">
    <link rel="stylesheet" href="../../assets/css/style-concepts.css?v=2">
${isConcept ? '' : '    <link rel="stylesheet" href="../../assets/css/style-blog-post.css?v=2">\n'}
</head>
<body>

    <!-- Navbar Placeholder (keeps layout stable until navbar loads) -->
    <nav id="navbarPlaceholder" class="navbar" style="min-height:77px; visibility:hidden;"></nav>

    <!-- Back Button -->
    <div class="back-button-container" style="opacity:0; transition: opacity 0.2s ease;">
        <a href="${backLink}" class="back-button" data-i18n="${backText}">← Back to ${isConcept ? 'Portfolio' : 'Blog'}</a>
    </div>

    <!-- ${isConcept ? 'Concept' : 'Blog'} Detail Page -->
    <section class="${isConcept ? 'concept' : 'blog'}-detail">
        <div class="${isConcept ? 'concept' : 'blog'}-hero">
            <img src="images/bg.jpg" alt="${isConcept ? 'Concept' : 'Blog'} Hero Image" class="${isConcept ? 'concept' : 'blog'}-hero-image" id="${isConcept ? 'concept' : 'post'}HeroImage" loading="eager">
            <div class="${isConcept ? 'concept' : 'blog'}-hero-overlay">
                <h1 id="${isConcept ? 'concept' : 'post'}Title">${metadata.titleEN}</h1>
                <p class="${isConcept ? 'concept' : 'blog'}-subtitle" id="${isConcept ? 'concept' : 'post'}Description">${metadata.descriptionEN}</p>
${isConcept ? '' : '                <p class="concept-subtitle" id="postMeta"></p>\n'}
            </div>
        </div>

        <div class="container ${isConcept ? 'concept' : 'blog'}-content">
            <div class="${isConcept ? 'concept' : 'blog'}-main">
                <!-- Skeleton placeholder while content loads -->
                <div id="${isConcept ? 'concept' : 'post'}Skeleton" class="skeleton-container">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-subtitle"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>

                <!-- Dynamic Content Sections -->
                <div id="${isConcept ? 'conceptContentSections' : 'postContent'}" style="opacity: 0; transition: opacity 0.3s ease;">
                    <!-- Dynamically loaded from translations -->
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p data-i18n="footer.copyright">&copy; 2025 Game Concept Portfolio. All rights reserved.</p>
        </div>
    </footer>

    <script src="../../assets/js/navbar-loader.js"></script>
    <script src="../../assets/js/i18n.js"></script>
    <script src="../../assets/js/script.js"></script>
${isConcept ? `    <script src="../../assets/js/portfolio.js"></script>
    <script src="../../assets/js/concept-templates.js"></script>
    <script src="../../assets/js/concept-loader.js"></script>
` : `    <script src="../../assets/js/blog.js"></script>
    <script src="../../assets/js/concept-templates.js"></script>
    <script src="../../assets/js/blog-loader.js"></script>
`}    <script src="../../assets/js/parallax.js"></script>
    <!-- Cloudflare Web Analytics -->
    <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "7b30862445244605baa7504bb6f3fe37"}'></script>
    <!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}

// Update concept list (conceptlist.py equivalent)
async function updateConceptList(token, user, repo, branch, newConceptId) {
    // This would need to update the Python file or JSON index
    // For now, skip this - you'll need to manually update or create an API endpoint
    console.log('Note: You may need to manually update conceptlist.py to include:', newConceptId);
}
