// Admin Editor - Main Logic
// Manages the content editor interface

// Password protection
const ADMIN_PASSWORD = 'admin123'; // Change this to your secure password

// State management
let currentContentType = 'blog'; // 'blog' or 'portfolio'
let sections = [];
let uploadedFiles = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializePasswordCheck();
    initializeEditor();
    loadSettings();
});

// Password Check
function initializePasswordCheck() {
    const loginButton = document.getElementById('loginButton');
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');

    loginButton.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    function checkPassword() {
        const password = passwordInput.value;
        if (password === ADMIN_PASSWORD) {
            document.getElementById('passwordModal').classList.remove('active');
            document.getElementById('adminInterface').style.display = 'block';
        } else {
            errorMessage.textContent = 'Incorrect password';
            errorMessage.classList.add('active');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Initialize Editor
function initializeEditor() {
    // Content type selector
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentContentType = btn.dataset.type;
        });
    });

    // Add section button
    document.getElementById('addSectionBtn').addEventListener('click', () => {
        document.getElementById('templateModal').classList.add('active');
    });

    // Template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            addSection(template);
            document.getElementById('templateModal').classList.remove('active');
        });
    });

    // Close template modal
    document.getElementById('closeTemplateModal').addEventListener('click', () => {
        document.getElementById('templateModal').classList.remove('active');
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('active');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('active');
    });

    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('testConnectionBtn').addEventListener('click', testGitHubConnection);

    // Actions
    document.getElementById('discardBtn').addEventListener('click', discardChanges);
    document.getElementById('downloadBtn').addEventListener('click', downloadFiles);
    document.getElementById('saveBtn').addEventListener('click', saveToGitHub);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Hero image upload
    document.getElementById('heroImageInput').addEventListener('change', handleHeroImageUpload);

    // Set today's date as default
    document.getElementById('contentDate').valueAsDate = new Date();
}

// Add Section
function addSection(templateType) {
    const sectionId = Date.now();
    const section = {
        id: sectionId,
        type: templateType
    };
    
    sections.push(section);
    renderSection(section);
}

// Render Section
function renderSection(section) {
    const container = document.getElementById('sectionsContainer');
    const sectionElement = document.createElement('div');
    sectionElement.className = 'section-item';
    sectionElement.dataset.id = section.id;

    let contentHTML = '';

    // Generate form fields based on template type
    switch(section.type) {
        case 'text':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Deutscher Titel">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="English Title">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Text (DE)</label>
                        <textarea class="section-text-de" rows="4" placeholder="Deutscher Text"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Text (EN)</label>
                        <textarea class="section-text-en" rows="4" placeholder="English Text"></textarea>
                    </div>
                </div>
            `;
            break;

        case 'features':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE) - optional</label>
                        <input type="text" class="section-title-de" placeholder="Optional">
                    </div>
                    <div class="form-group">
                        <label>Title (EN) - optional</label>
                        <input type="text" class="section-title-en" placeholder="Optional">
                    </div>
                </div>
                <div class="form-group">
                    <label>Features (one per line, format: icon|text DE|text EN)</label>
                    <textarea class="section-items" rows="6" placeholder="🎮|Deutscher Text|English Text&#10;⚡|Zweiter Punkt|Second Point"></textarea>
                    <small>Example: 🎮|Das ist ein Feature|This is a feature</small>
                </div>
            `;
            break;

        case 'example':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Beispiel: Game Title">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Example: Game Title">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Content (DE)</label>
                        <textarea class="section-content-de" rows="4" placeholder="Beispiel-Inhalt (HTML möglich)"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Content (EN)</label>
                        <textarea class="section-content-en" rows="4" placeholder="Example content (HTML allowed)"></textarea>
                    </div>
                </div>
            `;
            break;

        case 'mistakes':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Häufige Fehler">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Common Mistakes">
                    </div>
                </div>
                <div class="form-group">
                    <label>Mistakes (one per line, format: text DE|text EN)</label>
                    <textarea class="section-items" rows="6" placeholder="<strong>Fehler 1:</strong> Beschreibung|<strong>Mistake 1:</strong> Description"></textarea>
                </div>
            `;
            break;

        case 'list':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Liste">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="List">
                    </div>
                </div>
                <div class="form-group">
                    <label>Ordered List?</label>
                    <select class="section-ordered">
                        <option value="false">No (bullets)</option>
                        <option value="true">Yes (numbers)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Items (one per line, format: label DE|text DE|label EN|text EN)</label>
                    <textarea class="section-items" rows="6" placeholder="Label DE|Text DE|Label EN|Text EN"></textarea>
                    <small>For simple items without labels, use: text DE||text EN</small>
                </div>
            `;
            break;

        case 'bulletpoints':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Stichpunkte">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Bullet Points">
                    </div>
                </div>
                <div class="form-group">
                    <label>Items (one per line, format: text DE|text EN)</label>
                    <textarea class="section-items" rows="6" placeholder="Punkt 1|Point 1&#10;Punkt 2|Point 2"></textarea>
                </div>
            `;
            break;

        case 'gallery':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Galerie">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Gallery">
                    </div>
                </div>
                <div class="form-group">
                    <label>Images</label>
                    <input type="file" class="section-images" multiple accept="image/*">
                    <div class="gallery-preview"></div>
                </div>
            `;
            break;

        case 'video':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Video">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Video">
                    </div>
                </div>
                <div class="form-group">
                    <label>Video Source</label>
                    <input type="text" class="section-video-url" placeholder="YouTube URL or upload MP4">
                    <small>Or upload video file:</small>
                    <input type="file" class="section-video-file" accept="video/*">
                </div>
            `;
            break;

        case 'quote':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Quote (DE)</label>
                        <textarea class="section-text-de" rows="3" placeholder="Deutsches Zitat"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Quote (EN)</label>
                        <textarea class="section-text-en" rows="3" placeholder="English Quote"></textarea>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Author (DE)</label>
                        <input type="text" class="section-author-de" placeholder="Autor">
                    </div>
                    <div class="form-group">
                        <label>Author (EN)</label>
                        <input type="text" class="section-author-en" placeholder="Author">
                    </div>
                </div>
            `;
            break;

        case 'code':
            contentHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Title (DE)</label>
                        <input type="text" class="section-title-de" placeholder="Code-Beispiel">
                    </div>
                    <div class="form-group">
                        <label>Title (EN)</label>
                        <input type="text" class="section-title-en" placeholder="Code Example">
                    </div>
                </div>
                <div class="form-group">
                    <label>Language</label>
                    <input type="text" class="section-language" placeholder="javascript" value="javascript">
                </div>
                <div class="form-group">
                    <label>Code</label>
                    <textarea class="section-code" rows="8" placeholder="// Your code here" style="font-family: monospace;"></textarea>
                </div>
            `;
            break;
    }

    sectionElement.innerHTML = `
        <div class="section-item-header">
            <h3>${getTemplateDisplayName(section.type)}</h3>
            <div class="section-actions">
                <button class="btn-move-up" onclick="moveSection(${section.id}, 'up')">↑</button>
                <button class="btn-move-down" onclick="moveSection(${section.id}, 'down')">↓</button>
                <button class="btn-delete" onclick="deleteSection(${section.id})">🗑️</button>
            </div>
        </div>
        ${contentHTML}
    `;

    container.appendChild(sectionElement);
}

function getTemplateDisplayName(type) {
    const names = {
        'text': '📝 Text',
        'features': '✨ Features',
        'example': '💡 Example',
        'mistakes': '❌ Mistakes',
        'list': '📋 List',
        'bulletpoints': '• Bulletpoints',
        'gallery': '🖼️ Gallery',
        'video': '🎥 Video',
        'quote': '💬 Quote',
        'code': '💻 Code'
    };
    return names[type] || type;
}

// Section Management
function moveSection(id, direction) {
    const index = sections.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }
    rerenderSections();
}

function deleteSection(id) {
    if (confirm('Delete this section?')) {
        sections = sections.filter(s => s.id !== id);
        rerenderSections();
    }
}

function rerenderSections() {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';
    sections.forEach(section => renderSection(section));
}

// File Upload
function handleHeroImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('heroImagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Hero Image">`;
            uploadedFiles.heroImage = {
                name: file.name,
                data: e.target.result
            };
        };
        reader.readAsDataURL(file);
    }
}

// Settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    if (settings.githubToken) document.getElementById('githubToken').value = settings.githubToken;
    if (settings.githubOwner) document.getElementById('githubOwner').value = settings.githubOwner;
    if (settings.githubRepo) document.getElementById('githubRepo').value = settings.githubRepo;
    if (settings.githubBranch) document.getElementById('githubBranch').value = settings.githubBranch;
}

async function testGitHubConnection() {
    const statusDiv = document.getElementById('connectionStatus');
    const testBtn = document.getElementById('testConnectionBtn');
    
    testBtn.disabled = true;
    testBtn.textContent = '⏳ Testing...';
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#f5f5f5';
    statusDiv.style.color = '#333';
    statusDiv.textContent = '🔍 Testing GitHub connection...';
    
    try {
        const token = document.getElementById('githubToken').value;
        const owner = document.getElementById('githubOwner').value;
        const repo = document.getElementById('githubRepo').value;
        
        if (!token || !owner || !repo) {
            throw new Error('Please fill in all fields first!');
        }
        
        console.log('🧪 Testing GitHub connection...');
        console.log('Token length:', token.length);
        console.log('Owner:', owner);
        console.log('Repo:', repo);
        console.log('Browser:', navigator.userAgent);
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        
        // Test 1: Basic fetch capability
        statusDiv.textContent = '🧪 Testing browser fetch API...';
        try {
            const basicTest = await fetch('https://api.github.com/zen', { 
                method: 'GET',
                mode: 'cors'
            });
            if (!basicTest.ok) {
                throw new Error(`Basic fetch failed: ${basicTest.status}`);
            }
            const zen = await basicTest.text();
            console.log('✅ Basic fetch works. GitHub Zen:', zen);
        } catch (fetchError) {
            console.error('❌ Basic fetch failed:', fetchError);
            throw new Error(`Browser can't fetch from GitHub API! Error: ${fetchError.message}\n\nPossible causes:\n- Browser extension blocking requests\n- Antivirus/Firewall blocking\n- Try different browser (Chrome/Firefox)\n- Try running WITHOUT localhost (open HTML directly)`);
        }
        
        // Test 2: Test GitHub API with user endpoint
        statusDiv.textContent = '🔐 Testing GitHub token...';
        const userResponse = await fetch('https://api.github.com/user', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log('User response status:', userResponse.status);
        
        if (!userResponse.ok) {
            if (userResponse.status === 401) {
                throw new Error('Token is invalid! Please create a new token at github.com/settings/tokens');
            }
            const errorText = await userResponse.text();
            console.error('User API error:', errorText);
            throw new Error(`GitHub API error: ${userResponse.status} ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        console.log('✅ Token valid, user:', userData.login);
        
        // Test 3: Check repository access
        statusDiv.textContent = '📦 Checking repository access...';
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Repo response status:', repoResponse.status);
        
        if (!repoResponse.ok) {
            if (repoResponse.status === 404) {
                throw new Error(`Repository "${owner}/${repo}" not found!\n\nDouble-check:\n- Owner: Your GitHub username\n- Repo: Exact repository name (case-sensitive)`);
            }
            const errorText = await repoResponse.text();
            console.error('Repo API error:', errorText);
            throw new Error(`Cannot access repository: ${repoResponse.status} ${repoResponse.statusText}`);
        }
        
        const repoData = await repoResponse.json();
        console.log('✅ Repository access OK:', repoData.full_name);
        
        // Success!
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.innerHTML = `
            ✅ <strong>Connection successful!</strong><br>
            👤 User: ${userData.login}<br>
            📦 Repository: ${repoData.full_name}<br>
            🔐 Permissions: ${repoData.permissions.push ? '✅ Write access' : '❌ Read-only'}<br>
            🌍 Private: ${repoData.private ? 'Yes' : 'No'}
        `;
        
        if (!repoData.permissions.push) {
            statusDiv.innerHTML += '<br><br>⚠️ <strong>Warning:</strong> Token has no write access! You need "repo" scope when creating the token.';
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.color = '#721c24';
        statusDiv.innerHTML = `
            ❌ <strong>Connection failed</strong><br><br>
            ${error.message}<br><br>
            <strong>Quick fixes:</strong><br>
            1. Open browser console (F12) for details<br>
            2. Try a different browser (Chrome/Firefox)<br>
            3. Disable browser extensions temporarily<br>
            4. Check antivirus/firewall settings<br>
            5. Try opening admin.html directly (not via localhost)
        `;
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '🔗 Test Connection';
    }
}

function saveSettings() {
    const settings = {
        githubToken: document.getElementById('githubToken').value,
        githubOwner: document.getElementById('githubOwner').value,
        githubRepo: document.getElementById('githubRepo').value,
        githubBranch: document.getElementById('githubBranch').value
    };
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert('Settings saved!');
    document.getElementById('settingsModal').classList.remove('active');
}

// Download files locally (alternative to GitHub API)
function downloadFiles() {
    const contentType = document.getElementById('contentTypeSelect').value;
    const contentId = document.getElementById('contentIdInput').value;
    
    if (!contentType || !contentId) {
        alert('❌ Please select content type and enter ID first!');
        return;
    }
    
    // Generate content for both languages
    const contentDE = {
        sections: editorState.sections.map(section => {
            const sectionData = { ...section };
            // Use DE text fields
            if (section.titleDE) sectionData.title = section.titleDE;
            if (section.textDE) sectionData.text = section.textDE;
            if (section.contentDE) sectionData.content = section.contentDE;
            // Remove language-specific fields
            delete sectionData.titleDE;
            delete sectionData.titleEN;
            delete sectionData.textDE;
            delete sectionData.textEN;
            delete sectionData.contentDE;
            delete sectionData.contentEN;
            return sectionData;
        })
    };
    
    const contentEN = {
        sections: editorState.sections.map(section => {
            const sectionData = { ...section };
            // Use EN text fields
            if (section.titleEN) sectionData.title = section.titleEN;
            if (section.textEN) sectionData.text = section.textEN;
            if (section.contentEN) sectionData.content = section.contentEN;
            // Remove language-specific fields
            delete sectionData.titleDE;
            delete sectionData.titleEN;
            delete sectionData.textDE;
            delete sectionData.textEN;
            delete sectionData.contentDE;
            delete sectionData.contentEN;
            return sectionData;
        })
    };
    
    // Download DE file
    downloadFile(
        JSON.stringify(contentDE, null, 2),
        `content-de.json`,
        'application/json'
    );
    
    // Download EN file after short delay
    setTimeout(() => {
        downloadFile(
            JSON.stringify(contentEN, null, 2),
            `content-en.json`,
            'application/json'
        );
    }, 200);
    
    // Download index.html template
    setTimeout(() => {
        const indexHTML = generateIndexHTML(contentType, contentId);
        downloadFile(indexHTML, `index.html`, 'text/html');
    }, 400);
    
    // Show instructions
    const folderPath = contentType === 'blog' ? 'blog' : 'concepts';
    alert(`✅ 3 files downloaded successfully!\n\nNext steps:\n1. Create folder: ${folderPath}/${contentId}/\n2. Move all 3 files into that folder\n3. Upload folder to GitHub\n4. Or add to your local project\n\nFiles downloaded:\n- content-de.json\n- content-en.json\n- index.html`);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateIndexHTML(contentType, contentId) {
    const isPortfolio = contentType === 'portfolio';
    const loaderScript = isPortfolio ? 'concept-loader.js' : 'blog-loader.js';
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contentId}</title>
    <link rel="stylesheet" href="../../assets/css/style-base.css">
    <link rel="stylesheet" href="../../assets/css/style-concept.css">
</head>
<body>
    <div id="navbar-placeholder"></div>

    <main class="concept-detail">
        <div id="content-container"></div>
    </main>

    <script src="../../assets/js/navbar.js"></script>
    <script src="../../assets/js/i18n.js"></script>
    <script src="../../assets/js/templates.js"></script>
    <script src="../../assets/js/${loaderScript}"></script>
</body>
</html>`;
}

// Actions
function discardChanges() {
    if (confirm('Discard all changes?')) {
        location.reload();
    }
}

function logout() {
    if (confirm('Logout?')) {
        location.reload();
    }
}

// Save to GitHub - calls github-api.js
async function saveToGitHub() {
    // Will be implemented in github-api.js
    console.log('Saving to GitHub...');
    alert('GitHub integration will be implemented in github-api.js');
}
