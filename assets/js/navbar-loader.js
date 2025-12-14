// Load navbar component and set active link based on current page
async function loadNavbar() {
    try {
        // Determine current page and path depth
        const currentPath = window.location.pathname;
        const isConceptPage = currentPath.includes('/concepts/');
        const isBlogPost = currentPath.includes('/blog/');
        const isSubPage = isConceptPage || isBlogPost;
        const basePath = isSubPage ? '../../' : '';
        
        // Choose navbar file based on page type
        const navbarFile = isSubPage ? 'navbar-concept.html' : 'navbar.html';
        
        // Fetch navbar component
        const navbarPath = basePath + 'assets/includes/' + navbarFile;
        const response = await fetch(navbarPath);
        const navbarHTML = await response.text();
        
        // Create temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = navbarHTML;
        const navbar = temp.querySelector('nav');
        
        // Insert navbar at the start of body
        document.body.insertBefore(navbar, document.body.firstChild);
        
        // Dispatch event that navbar is loaded
        window.dispatchEvent(new CustomEvent('navbarLoaded'));

        // Set active nav link based on current page
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (isConceptPage) {
            // On concept pages, always set Portfolio as active
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.includes('portfolio.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        } else if (isBlogPost) {
            // On blog post pages, always set Blog as active
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.includes('blog.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        } else {
            // On normal pages, detect active link by filename
            const currentFile = currentPath.split('/').pop() || 'index.html';
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const hrefFile = href.split('/').pop();
                
                if (hrefFile === currentFile || 
                    (currentFile === '' && hrefFile === 'index.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Handle hamburger menu
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            
            // Close menu when link is clicked
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
        
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

// Load navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}

