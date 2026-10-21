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
    // 4. Dynamic Logo Carousel Auto-Loader
    initLogoCarousel();

    // 5. Vertical Reels 9:16 Carousel
    initReelsCarousel();
});

async function initLogoCarousel() {
    const track = document.getElementById('brand-carousel-track');
    if (!track) return;

    let logoFiles = [];

    // Estrategia 1: Intentar leer el directorio directamente (funciona en servidores locales de dev)
    try {
        const dirResponse = await fetch('IMG-Logos/');
        if (dirResponse.ok) {
            const htmlText = await dirResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            
            const discoveredFiles = links
                .map(link => link.getAttribute('href'))
                .filter(href => href && /\.(png|jpe?g|svg|webp)$/i.test(href))
                .map(href => {
                    const cleanName = href.split('/').pop().split('?')[0];
                    return decodeURIComponent(cleanName);
                });

            if (discoveredFiles.length > 0) {
                logoFiles = [...new Set(discoveredFiles)];
            }
        }
    } catch (e) {
        // En servidores de producción estáticos la lectura directa de carpetas puede no estar permitida
    }

    // Estrategia 2: Si no hubo lectura directa, cargar desde IMG-Logos/logos.json
    if (logoFiles.length === 0) {
        try {
            const jsonResponse = await fetch('IMG-Logos/logos.json');
            if (jsonResponse.ok) {
                logoFiles = await jsonResponse.json();
            }
        } catch (e) {
            console.warn('No se pudo cargar logos.json:', e);
        }
    }

    // Si ambas estrategias fallan, mantener el HTML por defecto renderizado en index.html
    if (!logoFiles || logoFiles.length === 0) return;

    // Función auxiliar para generar atributo alt limpio
    const formatAlt = (filename) => {
        return filename
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    // Asegurar que haya suficientes imágenes para que el bucle continuo del carrusel cubra pantallas ultra-wide y 4K (mínimo 24 ítems)
    let renderList = [...logoFiles];
    while (renderList.length < 24) {
        renderList = renderList.concat(logoFiles);
    }

    const buildContentHTML = () => {
        return renderList.map(file => `
            <span class="brand-logo-item">
                <img src="IMG-Logos/${encodeURIComponent(file)}" alt="${formatAlt(file)}" class="brand-logo-img" loading="lazy">
            </span>
            <span class="brand-separator">✦</span>
        `).join('');
    };

    const innerHTML = buildContentHTML();

    track.innerHTML = `
        <div class="carousel-content">${innerHTML}</div>
        <div class="carousel-content" aria-hidden="true">${innerHTML}</div>
    `;
}

// 5. Vertical Reels 9:16 Carousel Controller
function initReelsCarousel() {
    const track = document.getElementById('reels-track');
    const prevBtn = document.getElementById('reels-prev-btn');
    const nextBtn = document.getElementById('reels-next-btn');
    const shuffleBtn = document.getElementById('reels-shuffle-btn');

    if (!track) return;

    const playIconUrl = 'https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/play.svg';
    const pauseIconUrl = 'https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/pause.svg';

    // 1. Randomization / Shuffle logic
    const shuffleReelCards = (smoothScroll = false) => {
        const cards = Array.from(track.querySelectorAll('.reel-card'));
        if (cards.length <= 1) return;

        // Pause any active playback before shuffling
        cards.forEach(card => {
            const video = card.querySelector('.reel-video');
            if (video && !video.paused) {
                video.pause();
            }
            card.classList.remove('is-playing');
            const playIcon = card.querySelector('.play-icon');
            if (playIcon) playIcon.src = playIconUrl;
        });

        // Fisher-Yates shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        cards.forEach(card => track.appendChild(card));

        if (smoothScroll) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollLeft = 0;
        }
    };

    // Shuffle automatically on initial load
    shuffleReelCards(false);

    // Shuffle button click event
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            shuffleReelCards(true);
            shuffleBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                shuffleBtn.style.transform = '';
            }, 300);
        });
    }

    const getScrollStep = () => {
        const firstCard = track.querySelector('.reel-card');
        return firstCard ? firstCard.offsetWidth + 24 : 320;
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
    }

    // Video Play/Pause & Single Active Playback
    let hasDragged = false;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const reelCards = track.querySelectorAll('.reel-card');

    reelCards.forEach(card => {
        const video = card.querySelector('.reel-video');
        const playBtn = card.querySelector('.reel-play-btn');
        const playIcon = playBtn ? playBtn.querySelector('.play-icon') : null;

        if (!video) return;

        const pauseCurrentVideo = () => {
            video.pause();
            card.classList.remove('is-playing');
            if (playIcon) playIcon.src = playIconUrl;
        };

        const togglePlayback = (e) => {
            if (hasDragged) return; // Prevent toggle if user was scrolling/dragging

            if (!video.paused) {
                pauseCurrentVideo();
            } else {
                // Pause all other videos
                const allCards = track.querySelectorAll('.reel-card');
                allCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        const otherVideo = otherCard.querySelector('.reel-video');
                        const otherPlayIcon = otherCard.querySelector('.play-icon');
                        if (otherVideo && !otherVideo.paused) {
                            otherVideo.pause();
                            otherCard.classList.remove('is-playing');
                            if (otherPlayIcon) otherPlayIcon.src = playIconUrl;
                        }
                    }
                });

                // Play this video
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            card.classList.add('is-playing');
                            if (playIcon) playIcon.src = pauseIconUrl;
                        })
                        .catch(err => {
                            console.warn('Reproducción bloqueada o postergada por el navegador:', err);
                        });
                }
            }
        };

        const frame = card.querySelector('.reel-frame');
        if (frame) {
            frame.addEventListener('click', togglePlayback);
        }
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlayback(e);
            });
        }

        // Reset icon when video ends naturally
        video.addEventListener('ended', () => {
            card.classList.remove('is-playing');
            if (playIcon) playIcon.src = playIconUrl;
        });
    });

    // Mouse drag-to-scroll interaction for desktop
    track.addEventListener('mousedown', (e) => {
        isDown = true;
        hasDragged = false;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = '';
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = '';
        setTimeout(() => {
            hasDragged = false;
        }, 50);
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(x - startX) > 8) {
            hasDragged = true;
        }
        track.scrollLeft = scrollLeft - walk;
    });
}
