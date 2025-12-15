// Authentication

const AUTH_PASSWORD = 'admi';

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const error = document.getElementById('loginError');

    if (password === AUTH_PASSWORD) {
        sessionStorage.setItem('cms_auth', 'true');
        window.location.href = 'editor.html';
    } else {
        error.style.display = 'block';
        setTimeout(() => error.style.display = 'none', 3000);
    }
});

// Protect editor
if (window.location.pathname.includes('editor.html')) {
    if (sessionStorage.getItem('cms_auth') !== 'true') {
        window.location.href = 'index.html';
    }
}

// Logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('[data-logout]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('cms_auth');
            window.location.href = 'index.html';
        });
    }
});
