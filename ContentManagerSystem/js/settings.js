// Settings Management

const SETTINGS_KEY = 'cms_github_settings';

// Load settings from localStorage
function loadSettings() {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {};
}

// Save settings to localStorage
function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Get settings
function getSettings() {
    return loadSettings();
}

// Populate form with saved settings
function populateForm() {
    const settings = loadSettings();
    
    if (settings.token) document.getElementById('githubToken').value = settings.token;
    if (settings.user) document.getElementById('githubUser').value = settings.user;
    if (settings.repo) document.getElementById('githubRepo').value = settings.repo;
    if (settings.branch) document.getElementById('githubBranch').value = settings.branch;
}

// Test GitHub connection
async function testConnection() {
    const token = document.getElementById('githubToken').value;
    const user = document.getElementById('githubUser').value;
    const repo = document.getElementById('githubRepo').value;
    const statusDiv = document.getElementById('connectionStatus');
    
    if (!token || !user || !repo) {
        showStatus('Please fill in all fields', 'error');
        return;
    }
    
    statusDiv.textContent = 'Testing connection...';
    statusDiv.className = 'status-message';
    statusDiv.style.display = 'block';
    
    try {
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            showStatus('✓ Connection successful!', 'success');
        } else if (response.status === 404) {
            showStatus('✗ Repository not found', 'error');
        } else if (response.status === 401) {
            showStatus('✗ Invalid token', 'error');
        } else {
            showStatus(`✗ Error: ${response.statusText}`, 'error');
        }
    } catch (error) {
        showStatus(`✗ Connection failed: ${error.message}`, 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('connectionStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
}

// Save settings form
document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = {
        token: document.getElementById('githubToken').value,
        user: document.getElementById('githubUser').value,
        repo: document.getElementById('githubRepo').value,
        branch: document.getElementById('githubBranch').value
    };
    
    saveSettings(settings);
    showStatus('✓ Settings saved successfully!', 'success');
});

// Test connection button
document.getElementById('testConnectionBtn')?.addEventListener('click', testConnection);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateForm();
});
