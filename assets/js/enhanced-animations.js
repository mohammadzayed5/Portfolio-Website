/**
 * Enhanced Scroll-Triggered Animations
 * Adds smooth, performant animations as elements enter viewport
 */

(function() {
    // Animation configuration
    const config = {
        rootMargin: '0px 0px -100px 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    // Create Intersection Observer
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // Add visible class for CSS animations
                element.classList.add('is-visible');

                // Apply stagger delay for children
                if (element.hasAttribute('data-stagger')) {
                    const children = element.querySelectorAll('[data-animate]');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('is-visible');
                        }, index * 100);
                    });
                }

                // Trigger count-up animation for numbers
                if (element.hasAttribute('data-count')) {
                    animateNumber(element);
                }

                // Trigger progress bar animation
                if (element.hasAttribute('data-progress')) {
                    animateProgress(element);
                }
            }
        });
    }, config);

    /**
     * Animate numbers counting up
     */
    function animateNumber(element) {
        const target = parseFloat(element.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOut;

            element.textContent = Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Animate progress bars
     */
    function animateProgress(element) {
        const progress = element.getAttribute('data-progress');
        element.style.width = progress + '%';
    }

    /**
     * Add parallax effect to elements
     */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    /**
     * Add smooth reveal animation to gallery items
     */
    function initGalleryAnimations() {
        const galleryItems = document.querySelectorAll('.gallery article');

        galleryItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.setAttribute('data-animate', 'true');

            observer.observe(item);

            // Add stagger effect
            item.addEventListener('transitionend', function handler() {
                item.removeEventListener('transitionend', handler);
            });
        });
    }

    /**
     * Add hover tilt effect to cards
     */
    function initTiltEffect() {
        const cards = document.querySelectorAll('.gallery article, .items section');

        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });

            card.style.transition = 'transform 0.3s ease';
        });
    }

    /**
     * Add typing animation to hero text
     */
    function initTypingAnimation() {
        const typingElement = document.querySelector('[data-typing]');
        if (!typingElement) return;

        const text = typingElement.textContent;
        typingElement.textContent = '';
        typingElement.style.opacity = '1';

        let index = 0;

        function type() {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(type, 50);
            }
        }

        setTimeout(type, 500);
    }

    /**
     * Add pulse animation to scroll indicators
     */
    function initScrollIndicators() {
        const scrollButtons = document.querySelectorAll('.smooth-scroll-middle');

        scrollButtons.forEach(button => {
            setInterval(() => {
                button.style.animation = 'pulse 1s ease-in-out';
                setTimeout(() => {
                    button.style.animation = '';
                }, 1000);
            }, 3000);
        });
    }

    /**
     * Observe all elements with animation attributes
     */
    function initObservers() {
        // Observe sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('animate-on-scroll');
            observer.observe(section);
        });

        // Observe spotlight content
        const spotlights = document.querySelectorAll('.spotlight .content');
        spotlights.forEach(content => {
            observer.observe(content);
        });

        // Observe items
        const items = document.querySelectorAll('.items section');
        items.forEach(item => {
            observer.observe(item);
        });
    }

    /**
     * Initialize all animations
     */
    function init() {
        initObservers();
        initGalleryAnimations();
        initTiltEffect();
        initParallax();
        initScrollIndicators();

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Add entrance animation to page
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = '1';
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        .gallery article {
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .gallery article.is-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .items section {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .items section:hover {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
})();
