// Parallax effect for hero images with smooth deceleration
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
let lastScroll = 0;
let rafId = null;

// Smooth animation loop
function smoothParallax() {
    // Lerp (linear interpolation) for smooth deceleration
    const lerp = 0.1; // Lower = smoother/slower, higher = snappier
    
    currentX += (targetX - currentX) * lerp;
    currentY += (targetY - currentY) * lerp;
    
    // Update blog hero
    const blogHeroImage = document.querySelector('.blog-hero-image');
    if (blogHeroImage) {
        blogHeroImage.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    
    // Update concept hero
    const conceptHeroImage = document.querySelector('.concept-hero-image');
    if (conceptHeroImage) {
        conceptHeroImage.style.transform = `translateY(${currentY}px)`;
    }
    
    // Continue animation if values are still changing
    if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(smoothParallax);
    } else {
        rafId = null;
    }
}

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Concept pages parallax (vertical only)
    const conceptHeroImage = document.querySelector('.concept-hero-image');
    if (conceptHeroImage) {
        const parallaxSpeed = 0.35;
        const initialOffset = -40;
        targetY = initialOffset + (scrolled * parallaxSpeed);
    }
    
    // Blog pages parallax (exponential acceleration)
    const blogHeroImage = document.querySelector('.blog-hero-image');
    if (blogHeroImage) {
        const baseSpeed = 0.25;
        const exponentialFactor = 0.0015;
        const parallaxSpeedX = baseSpeed + Math.pow(scrolled * exponentialFactor, 2);
        
        targetX = scrolled * parallaxSpeedX;
        targetY = 0;
    }
    
    // Start smooth animation if not already running
    if (!rafId) {
        rafId = requestAnimationFrame(smoothParallax);
    }
    
    lastScroll = scrolled;
});
