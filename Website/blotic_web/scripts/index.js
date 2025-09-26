// Modern Homepage JavaScript for BLOTIC
document.addEventListener('DOMContentLoaded', function() {
    
    // Animated Counter for Stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Fade-in animations
    function initFadeInAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        const animatedElements = document.querySelectorAll('.feature-card, .stat-item, .timeline-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Enhanced logo animation
    function initLogoAnimation() {
        const logoArea = document.querySelector('.hero-logo-area');
        const logo = document.querySelector('.hero-logo');
        const letters = document.querySelectorAll('.hero-logo-text .letter');
        
        if (logoArea && logo && letters.length > 0) {
            letters.forEach((letter, index) => {
                letter.style.opacity = '0';
                letter.style.transform = `translateY(20px) scale(0.5)`;
                letter.style.transition = `all 0.4s ease ${index * 0.1}s`;
            });
            
            setTimeout(() => {
                letters.forEach((letter, index) => {
                    setTimeout(() => {
                        letter.style.opacity = '1';
                        letter.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                });
            }, 500);
            
            logoArea.addEventListener('mouseenter', () => {
                logo.style.transform = 'scale(1.1) rotate(5deg)';
                letters.forEach((letter, index) => {
                    setTimeout(() => {
                        letter.style.transform = 'translateY(-5px) scale(1.1)';
                    }, index * 50);
                });
            });
            
            logoArea.addEventListener('mouseleave', () => {
                logo.style.transform = 'scale(1) rotate(0deg)';
                letters.forEach(letter => {
                    letter.style.transform = 'translateY(0) scale(1)';
                });
            });
        }
    }
    
    // Button hover effects
    function initButtonEffects() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Initialize all animations
    function init() {
        animateCounters();
        initSmoothScrolling();
        initFadeInAnimations();
        initLogoAnimation();
        initButtonEffects();
    }
    
    // Run initialization
    init();
});