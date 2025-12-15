// Dashboard functionality

// Navigate to editor
document.getElementById('createBlog')?.addEventListener('click', () => {
    window.location.href = 'editor.html?type=blog';
});

document.getElementById('createConcept')?.addEventListener('click', () => {
    window.location.href = 'editor.html?type=concept';
});

// Load recent content (placeholder)
function loadRecentContent() {
    const container = document.getElementById('recentContent');
    
    // For now, show placeholder
    container.innerHTML = '<p class="text-muted">No recent content. Start by creating a new blog or concept!</p>';
    
    // TODO: Load from localStorage or GitHub API
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRecentContent();
});
