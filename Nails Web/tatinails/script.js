document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Sticky header on scroll
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
                // Scroll down
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
                // Scroll up
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Google Sheets Integration
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRRNaAK1mz-_Z7fCCWgXK-EjmTeZJm1RgNUSu_tuS7lotijNtb2gdp_DYhsgFymJA1/exec'; // Замените на ваш URL Google Apps Script

    // Form submission
    const appointmentForm = document.getElementById('appointment');
    if (appointmentForm) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').setAttribute('min', today);
        
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {
                name: formData.get('name').trim(),
                phone: formData.get('phone').trim(),
                date: formData.get('date')
            };
            
            // Basic validation
            if (!formObject.name || formObject.name.length < 2) {
                alert('Пожалуйста, введите ваше имя (минимум 2 символа)');
                return;
            }
            
            if (!formObject.phone || formObject.phone.replace(/\D/g, '').length < 10) {
                alert('Пожалуйста, введите корректный номер телефона');
                return;
            }
            
            if (!formObject.date) {
                alert('Пожалуйста, выберите дату записи');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
                
                // Format date for better readability
                const formattedDate = new Date(formObject.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Prepare data for Google Sheets
                const sheetData = {
                    ...formObject,
                    date: formattedDate,
                    timestamp: new Date().toISOString()
                };
                
                // Send data to Google Sheets
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sheetData)
                });
                
                // Show success message
                alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время для подтверждения записи.');
                
                // Reset form
                this.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
            } finally {
                // Reset button state
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить заявку';
                }
            }
        });
    }

    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .portfolio-item, .contact-info, .appointment-form');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Initial check on load
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Set minimum date for appointment form (today)
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const minDate = yyyy + '-' + mm + '-' + dd;
        
        dateInput.setAttribute('min', minDate);
    }

    // Lightbox functionality
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-image');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        let currentImageIndex = 0;
        const images = [];

        // Collect all portfolio images
        portfolioItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                images.push({
                    src: item.href || img.src,
                    alt: img.alt || 'Portfolio image'
                });
            }
        });

        // Open lightbox with clicked image
        function openLightbox(index) {
            if (index >= 0 && index < images.length) {
                currentImageIndex = index;
                lightboxImg.src = images[currentImageIndex].src;
                lightboxImg.alt = images[currentImageIndex].alt;
                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        // Close lightbox
        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Navigation functions
        function showPrevImage() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            openLightbox(currentImageIndex);
        }

        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            openLightbox(currentImageIndex);
        }

        // Event listeners for portfolio items
        portfolioItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });
        });

        // Lightbox controls
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });

        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'ArrowLeft') {
                    showPrevImage();
                } else if (e.key === 'ArrowRight') {
                    showNextImage();
                }
            }
        });
    }

    initLightbox();

    // Add hover effect for touch devices
    function handleTouch() {
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (hasTouch) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch-device');
        }
    }
    
    handleTouch();
});

// Add loading class to body for initial page load animations
document.body.classList.add('loading');

window.addEventListener('load', function() {
    // Remove loading class when page is fully loaded
    document.body.classList.remove('loading');
    
    // Add loaded class for any entrance animations
    document.body.classList.add('loaded');
});
