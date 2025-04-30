document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');

    // Dynamic Year in Footer
    const yearSpans = document.querySelectorAll('#year');
    if (yearSpans.length > 0) {
        yearSpans.forEach(span => {
            span.textContent = new Date().getFullYear();
        });
    } else {
        console.warn('No #year elements found');
    }

    // Logo Animation
    const logos = document.querySelectorAll('.logo');
    if (logos.length > 0) {
        logos.forEach(logo => {
            setTimeout(() => {
                logo.classList.add('logo-animated');
            }, 100);
        });
    } else {
        console.warn('No .logo elements found');
    }

    // Navigation Bar Check
    const nav = document.querySelector('.nav');
    if (nav) {
        console.log('Navigation bar found:', nav);
    } else {
        console.warn('Navigation bar (.nav) not found');
    }

    // Slideshow Functionality
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        };
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
    }

    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length > 0) {
        let currentTestimonial = 0;
        const showTestimonial = (index) => {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });
        };
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        }, 7000);
    }

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // IntersectionObserver for Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatableElements = document.querySelectorAll('.fade-in, .section-title, .team-card');
    if (animatableElements.length > 0) {
        animatableElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        console.warn('No animatable elements found');
    }

    // Fallback for animations
    setTimeout(() => {
        animatableElements.forEach(element => {
            if (!element.classList.contains('in-view')) {
                element.classList.add('in-view');
                console.log('Applied fallback for:', element);
            }
        });
    }, 1000);

    // Smooth Scroll for Navigation Links
    const navLinks = document.querySelectorAll('.nav a');
    if (navLinks.length > 0) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    window.location.href = targetId;
                }
            });
        });
    } else {
        console.warn('No navigation links found');
    }
});