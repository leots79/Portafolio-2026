document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once it's visible to only animate once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with the .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 2. Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for sticky header
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Brutalist random hover effects (Optional: Adds erratic brutalist behavior)
    // Uncomment the code below if you want cards to have a slight random rotation on hover
    /*
    const cards = document.querySelectorAll('.brutalist-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const randomRotation = (Math.random() - 0.5) * 4; // Between -2 and 2 degrees
            card.style.transform = `translate(-5px, -5px) rotate(${randomRotation}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translate(0, 0) rotate(0deg)';
        });
    });
    */
});
