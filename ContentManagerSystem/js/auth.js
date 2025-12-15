// Authentication - Now uses serverless backend

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const error = document.getElementById('loginError');

    try {
        // Call serverless auth function instead of checking locally
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            sessionStorage.setItem('cms_auth', 'true');
            window.location.href = 'editor.html';
        } else {
            error.textContent = 'Invalid password';
            error.style.display = 'block';
            setTimeout(() => error.style.display = 'none', 3000);
        }
    } catch (err) {
        console.error('Auth error:', err);
        error.textContent = 'Connection error. Try again.';
        error.style.display = 'block';
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
