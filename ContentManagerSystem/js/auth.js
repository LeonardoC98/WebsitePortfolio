// Authentication Module
const AUTH_PASSWORD = 'admi';
const AUTH_KEY = 'cms_authenticated';

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

// Set authentication
function setAuthenticated(value) {
    sessionStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}

// Protect page (redirect if not authenticated)
function protectPage() {
    if (!isAuthenticated() && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/ContentManagerSystem/')) {
        window.location.href = 'index.html';
    }
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        if (password === AUTH_PASSWORD) {
            setAuthenticated(true);
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = 'Invalid password';
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    });
}

// Logout handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        setAuthenticated(false);
        window.location.href = 'index.html';
    });
}

// Run protection on page load
protectPage();
