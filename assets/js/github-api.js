// GitHub API Integration
// Handles pushing content to GitHub repository

async function saveToGitHub() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Saving...';

    try {
        // Get settings
        const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        console.log('🔍 Debug: Checking settings...');
        console.log('Token exists:', !!settings.githubToken);
        console.log('Owner:', settings.githubOwner);
        console.log('Repo:', settings.githubRepo);
        console.log('Branch:', settings.githubBranch);
        
        if (!settings.githubToken) {
            throw new Error('GitHub Token fehlt! Bitte in Settings konfigurieren.');
        }
        if (!settings.githubOwner) {
            throw new Error('Repository Owner fehlt! Bitte in Settings konfigurieren.');
        }
        if (!settings.githubRepo) {
            throw new Error('Repository Name fehlt! Bitte in Settings konfigurieren.');
        }

        // Collect form data
        const contentData = collectFormData();
        console.log('📝 Content Data:', contentData);
        
        // Validate
        if (!contentData.id) {
            throw new Error('Content ID is required');
        }

        // Generate JSON files
        const contentDE = generateContentJSON(contentData, 'de');
        const contentEN = generateContentJSON(contentData, 'en');

        // Determine paths
        const basePath = currentContentType === 'blog' ? 'blog' : 'concepts';
        const folderPath = `${basePath}/${contentData.id}`;

        // Create/Update files in GitHub
        await createGitHubFile(
            settings,
            `${folderPath}/content-de.json`,
            JSON.stringify(contentDE, null, 2),
            `Add/Update ${contentData.id} - DE content`
        );

        await createGitHubFile(
            settings,
            `${folderPath}/content-en.json`,
            JSON.stringify(contentEN, null, 2),
            `Add/Update ${contentData.id} - EN content`
        );

        // Create index.html if new
        const indexHTML = generateIndexHTML(contentData);
        await createGitHubFile(
            settings,
            `${folderPath}/index.html`,
            indexHTML,
            `Add/Update ${contentData.id} - index.html`
        );

        // Update blog.js or portfolio.js
        await updateRegistryFile(settings, contentData);

        // Update translation files
        await updateTranslations(settings, contentData);

        // Upload images if any
        if (uploadedFiles.heroImage) {
            await uploadImage(settings, folderPath, 'hero.jpg', uploadedFiles.heroImage.data);
        }

        alert('✅ Successfully saved to GitHub! Changes will be live after deployment.');
        saveBtn.textContent = '✅ Saved!';
        
        setTimeout(() => {
            saveBtn.textContent = '💾 Save to GitHub';
            saveBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error('Error saving to GitHub:', error);
        alert(`❌ Error: ${error.message}`);
        saveBtn.textContent = '💾 Save to GitHub';
        saveBtn.disabled = false;
    }
}

// Collect Form Data
function collectFormData() {
    const data = {
        id: document.getElementById('contentId').value.trim().toLowerCase().replace(/\s+/g, '-'),
        titleDE: document.getElementById('titleDE').value,
        titleEN: document.getElementById('titleEN').value,
        excerptDE: document.getElementById('excerptDE').value,
        excerptEN: document.getElementById('excerptEN').value,
        date: document.getElementById('contentDate').value,
        category: document.getElementById('contentCategory').value,
        tags: document.getElementById('contentTags').value.split(',').map(t => t.trim()).filter(t => t),
        sections: []
    };

    // Collect sections
    document.querySelectorAll('.section-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        const section = sections.find(s => s.id === id);
        const type = section.type;

        const sectionData = {
            type: type
        };

        // Extract data based on template type
        switch(type) {
            case 'text':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.textDE = item.querySelector('.section-text-de')?.value || '';
                sectionData.textEN = item.querySelector('.section-text-en')?.value || '';
                break;

            case 'features':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.items = parseFeatureItems(item.querySelector('.section-items')?.value || '');
                break;

            case 'example':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.contentDE = item.querySelector('.section-content-de')?.value || '';
                sectionData.contentEN = item.querySelector('.section-content-en')?.value || '';
                break;

            case 'mistakes':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.items = parseMistakeItems(item.querySelector('.section-items')?.value || '');
                break;

            case 'list':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.ordered = item.querySelector('.section-ordered')?.value === 'true';
                sectionData.items = parseListItems(item.querySelector('.section-items')?.value || '');
                break;

            case 'bulletpoints':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.items = parseBulletItems(item.querySelector('.section-items')?.value || '');
                break;

            case 'quote':
                sectionData.textDE = item.querySelector('.section-text-de')?.value || '';
                sectionData.textEN = item.querySelector('.section-text-en')?.value || '';
                sectionData.authorDE = item.querySelector('.section-author-de')?.value || '';
                sectionData.authorEN = item.querySelector('.section-author-en')?.value || '';
                break;

            case 'code':
                sectionData.titleDE = item.querySelector('.section-title-de')?.value || '';
                sectionData.titleEN = item.querySelector('.section-title-en')?.value || '';
                sectionData.language = item.querySelector('.section-language')?.value || 'text';
                sectionData.code = item.querySelector('.section-code')?.value || '';
                break;
        }

        data.sections.push(sectionData);
    });

    return data;
}

// Parse helper functions
function parseFeatureItems(text) {
    return text.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split('|');
        return {
            icon: parts[0]?.trim() || '•',
            textDE: parts[1]?.trim() || '',
            textEN: parts[2]?.trim() || ''
        };
    });
}

function parseMistakeItems(text) {
    return text.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split('|');
        return {
            textDE: parts[0]?.trim() || '',
            textEN: parts[1]?.trim() || ''
        };
    });
}

function parseListItems(text) {
    return text.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split('|');
        if (parts.length >= 4) {
            return {
                labelDE: parts[0]?.trim() || '',
                textDE: parts[1]?.trim() || '',
                labelEN: parts[2]?.trim() || '',
                textEN: parts[3]?.trim() || ''
            };
        } else {
            return {
                textDE: parts[0]?.trim() || '',
                textEN: parts[1]?.trim() || ''
            };
        }
    });
}

function parseBulletItems(text) {
    return text.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split('|');
        return {
            textDE: parts[0]?.trim() || '',
            textEN: parts[1]?.trim() || ''
        };
    });
}

// Generate Content JSON
function generateContentJSON(data, lang) {
    const sections = data.sections.map(section => {
        const json = {
            type: section.type
        };

        switch(section.type) {
            case 'text':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.text = lang === 'de' ? section.textDE : section.textEN;
                break;

            case 'features':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.items = section.items.map(item => ({
                    icon: item.icon,
                    text: lang === 'de' ? item.textDE : item.textEN
                }));
                break;

            case 'example':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.content = lang === 'de' ? section.contentDE : section.contentEN;
                break;

            case 'mistakes':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.items = section.items.map(item => 
                    lang === 'de' ? item.textDE : item.textEN
                );
                break;

            case 'list':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.ordered = section.ordered;
                json.items = section.items.map(item => {
                    if (item.labelDE && item.labelEN) {
                        return {
                            label: lang === 'de' ? item.labelDE : item.labelEN,
                            text: lang === 'de' ? item.textDE : item.textEN
                        };
                    } else {
                        return lang === 'de' ? item.textDE : item.textEN;
                    }
                });
                break;

            case 'bulletpoints':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.items = section.items.map(item => 
                    lang === 'de' ? item.textDE : item.textEN
                );
                break;

            case 'quote':
                json.text = lang === 'de' ? section.textDE : section.textEN;
                json.author = lang === 'de' ? section.authorDE : section.authorEN;
                break;

            case 'code':
                json.title = lang === 'de' ? section.titleDE : section.titleEN;
                json.language = section.language;
                json.code = section.code;
                break;
        }

        return json;
    });

    return { sections };
}

// Generate index.html
function generateIndexHTML(data) {
    const isBlog = currentContentType === 'blog';
    const pathPrefix = isBlog ? '../../' : '../../';
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.titleDE} - ${isBlog ? 'Blog' : 'Portfolio'}</title>
    <link rel="stylesheet" href="${pathPrefix}assets/css/style-base.css?v=2">
    <link rel="stylesheet" href="${pathPrefix}assets/css/style-concepts.css?v=2">
    ${isBlog ? `<link rel="stylesheet" href="${pathPrefix}assets/css/style-blog-post.css?v=2">` : ''}
</head>
<body style="opacity: 0;">

    <div id="navbar-placeholder"></div>

    <div class="back-button-container">
        <a href="${pathPrefix}${isBlog ? 'blog' : 'portfolio'}.html" class="back-button">← <span data-i18n="${isBlog ? 'blog' : 'concept'}.back">i18n error</span></a>
    </div>

    <section class="concept-detail">
        <div class="${isBlog ? 'blog' : 'concept'}-hero">
            <img id="postHeroImage" alt="${data.titleEN}" class="${isBlog ? 'blog' : 'concept'}-hero-image">
            <div class="${isBlog ? 'blog' : 'concept'}-hero-overlay">
                <h1 id="postTitle" data-i18n="${isBlog ? 'blog' : 'concept'}.posts.${data.id}.title">i18n error</h1>
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
            <p data-i18n="footer.copyright">i18n error</p>
        </div>
    </footer>

    <script src="${pathPrefix}assets/js/navbar-loader.js"></script>
    <script src="${pathPrefix}assets/js/i18n.js"></script>
    <script src="${pathPrefix}assets/js/${isBlog ? 'blog' : 'portfolio'}.js"></script>
    <script src="${pathPrefix}assets/js/templates.js"></script>
    <script src="${pathPrefix}assets/js/${isBlog ? 'blog' : 'concept'}-loader.js"></script>
    <script src="${pathPrefix}assets/js/parallax.js"></script>
    <script>
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        }, 100);
    </script>
</body>
</html>`;
}

// GitHub API calls
async function createGitHubFile(settings, path, content, message) {
    const url = `https://api.github.com/repos/${settings.githubOwner}/${settings.githubRepo}/contents/${path}`;
    
    console.log(`🔗 GitHub API URL: ${url}`);
    
    // Check if file exists to get SHA
    let sha = null;
    try {
        console.log(`📥 Checking if file exists: ${path}`);
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${settings.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Portfolio-CMS'
            }
        });
        
        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha;
            console.log(`✅ File exists, SHA: ${sha}`);
        } else if (checkResponse.status === 404) {
            console.log(`📝 File doesn't exist yet, will create new`);
        } else {
            console.warn(`⚠️ Check response status: ${checkResponse.status}`);
            const errorData = await checkResponse.json().catch(() => ({}));
            console.warn('Error data:', errorData);
        }
    } catch (e) {
        console.log(`⚠️ Check error (file probably doesn't exist):`, e.message);
    }

    // Create or update file
    const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode UTF-8
        branch: settings.githubBranch || 'main'
    };
    
    if (sha) {
        body.sha = sha; // Update existing file
    }

    console.log(`📤 ${sha ? 'Updating' : 'Creating'} file: ${path}`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${settings.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Portfolio-CMS'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText };
        }
        
        console.error('❌ GitHub API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });
        
        // Bessere Fehlermeldungen
        if (response.status === 401) {
            throw new Error('GitHub Token ungültig! Bitte überprüfe deinen Token in Settings.');
        } else if (response.status === 404) {
            throw new Error(`Repository nicht gefunden! Bitte überprüfe Owner (${settings.githubOwner}) und Repo (${settings.githubRepo})`);
        } else if (response.status === 403) {
            throw new Error('Keine Berechtigung! Token braucht "repo" Scope.');
        } else {
            throw new Error(`GitHub API Fehler (${response.status}): ${errorData.message || response.statusText}`);
        }
    }

    console.log(`✅ Successfully ${sha ? 'updated' : 'created'} file: ${path}`);
    return await response.json();
}

// Update registry files (blog.js or portfolio.js)
async function updateRegistryFile(settings, data) {
    const fileName = currentContentType === 'blog' ? 'blog.js' : 'portfolio.js';
    const path = `assets/js/${fileName}`;
    
    // This is a placeholder - you'll need to implement the logic to read,
    // parse, update, and write the JS file
    console.log('Would update', path, 'with', data);
    // For now, skip this as it requires parsing JavaScript
}

// Update translation files
async function updateTranslations(settings, data) {
    // This is a placeholder - you'll need to implement reading and updating
    // the de.json and en.json files
    console.log('Would update translations for', data.id);
    // For now, skip this as it requires JSON manipulation
}

// Upload image
async function uploadImage(settings, folderPath, fileName, base64Data) {
    // Remove data:image/... prefix
    const base64Content = base64Data.split(',')[1];
    
    await createGitHubFile(
        settings,
        `${folderPath}/${fileName}`,
        base64Content,
        `Upload image: ${fileName}`
    );
}
