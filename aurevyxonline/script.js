/**
 * AUREVYXONLINE - DIGITAL GROWTH AGENCY ENGINE
 * With Background Canvas Scroll Scrubbing ("Smoothie")
 * Interactive Light-Up on Cursor Hover & Finger Touch
 * Mobile, Phone, Tablet, Laptop, and PC responsive.
 */

(function () {
  'use strict';

  const TOTAL_FRAMES = 240;
  const FRAME_PREFIX = 'frames/frame_';
  const FRAME_EXT = '.webp';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loaderBar = document.getElementById('loader-bar');

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnFrame = -1;

  /**
   * 4-digit frame formatting
   */
  function padFrame(num) {
    return String(num).padStart(4, '0');
  }

  /**
   * Canvas Responsive Resize with DPR
   */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    lastDrawnFrame = -1;
    drawFrame(Math.round(currentFrame));
  }

  /**
   * Draw specific frame index with object-fit cover
   */
  function drawFrame(frameIndex) {
    if (frameIndex === lastDrawnFrame) return;

    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
    const img = images[clampedIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = clampedIndex - offset;
        const next = clampedIndex + offset;
        if (prev >= 0 && images[prev]?.complete && images[prev].naturalWidth > 0) {
          renderToCanvas(images[prev]);
          break;
        }
        if (next < TOTAL_FRAMES && images[next]?.complete && images[next].naturalWidth > 0) {
          renderToCanvas(images[next]);
          break;
        }
      }
      return;
    }

    renderToCanvas(img);
    lastDrawnFrame = clampedIndex;
  }

  /**
   * Object-Fit Cover math onto canvas
   */
  function renderToCanvas(img) {
    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const imgW = img.naturalWidth || 1280;
    const imgH = img.naturalHeight || 720;

    const canvasRatio = cWidth / cHeight;
    const imgRatio = imgW / imgH;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Screen is wider than 16:9 (PC / Laptop)
      drawW = cWidth;
      drawH = cWidth / imgRatio;
      drawX = 0;
      drawY = (cHeight - drawH) / 2;
    } else {
      // Screen is taller than 16:9 (Mobile Portrait)
      drawH = cHeight;
      drawW = cHeight * imgRatio;
      drawX = (cWidth - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  /**
   * Preload 240 WebP frames
   */
  function preloadFrames() {
    const firstImg = new Image();
    firstImg.src = `${FRAME_PREFIX}${padFrame(1)}${FRAME_EXT}`;
    images[0] = firstImg;
    firstImg.onload = () => {
      drawFrame(0);
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (i === 0 && images[0]) continue;

      const img = new Image();
      img.src = `${FRAME_PREFIX}${padFrame(i + 1)}${FRAME_EXT}`;
      images[i] = img;

      img.onload = () => {
        loadedCount++;
        const pct = (loadedCount / TOTAL_FRAMES) * 100;
        if (loaderBar) {
          loaderBar.style.width = `${pct}%`;
          if (loadedCount >= TOTAL_FRAMES) {
            setTimeout(() => loaderBar.classList.add('done'), 200);
          }
        }
      };

      img.onerror = () => {
        loadedCount++;
      };
    }
  }

  /**
   * Calculate Scroll Progress across the full page
   */
  function getScrollProgress() {
    const scrollY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const maxScroll = scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return 0;
    return Math.max(0, Math.min(1, scrollY / maxScroll));
  }

  /**
   * Smoothie Lerp loop
   */
  function animationLoop() {
    const progress = getScrollProgress();
    targetFrame = progress * (TOTAL_FRAMES - 1);

    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) > 0.005) {
      currentFrame += delta * 0.18;
      drawFrame(Math.round(currentFrame));
    }

    requestAnimationFrame(animationLoop);
  }

  // Scroll event listener
  window.addEventListener('scroll', () => {
    targetFrame = getScrollProgress() * (TOTAL_FRAMES - 1);
  }, { passive: true });

  // Resize and orientation handlers
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 150);
  });

  /**
   * Interactive Light-Up Spotlight on Mouse Cursor & Finger Touch
   */
  function initCardSpotlight() {
    const cards = document.querySelectorAll('.spotlight-card, .glass-panel, .fanned-card, .flow-card');

    cards.forEach((card) => {
      // Track mouse position over card
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      // Immediate light-up on finger touch on mobile
      card.addEventListener('touchstart', (e) => {
        cards.forEach((c) => c.classList.remove('is-lit'));
        card.classList.add('is-lit');

        if (e.touches.length > 0) {
          const rect = card.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        }
      }, { passive: true });
    });

    // Tap outside clears mobile active lit card
    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.glass-panel') && !e.target.closest('.fanned-card') && !e.target.closest('.flow-card')) {
        cards.forEach((c) => c.classList.remove('is-lit'));
      }
    }, { passive: true });
  }

  /**
   * Interactive Moving Cards Deck (Inspired by attached design)
   * Smooth Bidirectional Flow Engine (Flows smoothly in both directions: Left & Right)
   * Frictionless Momentum Drag / Touch Flick & Infinite Loop in both directions
   */
  function initCardsDeckMarquee() {
    const marquee = document.getElementById('cards-deck-marquee');
    const track = document.getElementById('cards-deck-track');
    const btnPrev = document.getElementById('deck-flow-prev');
    const btnNext = document.getElementById('deck-flow-next');
    if (!marquee || !track) return;

    // Clone cards twice to create 3 sets for seamless infinite bidirectional loop
    const originalCards = Array.from(track.children);
    originalCards.forEach((card) => {
      const clone1 = card.cloneNode(true);
      clone1.setAttribute('aria-hidden', 'true');
      track.appendChild(clone1);
    });
    originalCards.forEach((card) => {
      const clone2 = card.cloneNode(true);
      clone2.setAttribute('aria-hidden', 'true');
      track.appendChild(clone2);
    });

    let singleSetWidth = 0;
    function updateMetrics() {
      singleSetWidth = track.scrollWidth / 3;
    }

    // Set initial position at center set so user can scroll left or right infinitely
    setTimeout(() => {
      updateMetrics();
      if (singleSetWidth > 0) {
        marquee.scrollLeft = singleSetWidth;
      }
    }, 100);

    window.addEventListener('resize', updateMetrics, { passive: true });

    // Flow physics state
    let autoSpeed = 0.85;       // base forward speed (+ = right/next, - = left/prev)
    let currentSpeed = autoSpeed;
    let targetSpeed = autoSpeed;
    let isInteracting = false;   // true during hover/touch/drag
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;

    // High performance RAF ticker for butter-smooth bidirectional motion
    function flowLoop() {
      if (!isInteracting && !isDragging) {
        // Momentum glide smoothly easing back to target speed
        currentSpeed += (targetSpeed - currentSpeed) * 0.04;
        marquee.scrollLeft += currentSpeed;
      }

      // Infinite wrapping in BOTH directions
      if (singleSetWidth > 0) {
        if (marquee.scrollLeft >= singleSetWidth * 2) {
          marquee.scrollLeft -= singleSetWidth;
        } else if (marquee.scrollLeft <= 5) {
          marquee.scrollLeft += singleSetWidth;
        }
      }

      requestAnimationFrame(flowLoop);
    }
    requestAnimationFrame(flowLoop);

    // Pause on hover over card
    const allCards = track.querySelectorAll('.fanned-card');
    allCards.forEach((card) => {
      card.addEventListener('pointerenter', () => {
        isInteracting = true;
      });
      card.addEventListener('pointerleave', () => {
        if (!isDragging) isInteracting = false;
      });
      card.addEventListener('touchstart', () => {
        allCards.forEach(c => c.classList.remove('is-touched'));
        card.classList.add('is-touched');
        isInteracting = true;
      }, { passive: true });
    });

    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.fanned-card') && !e.target.closest('.deck-flow-btn')) {
        allCards.forEach(c => c.classList.remove('is-touched'));
        isInteracting = false;
      }
    }, { passive: true });

    // Mouse Dragging (Bidirectional Flow)
    marquee.addEventListener('mousedown', (e) => {
      isDragging = true;
      isInteracting = true;
      startX = e.pageX;
      lastX = e.pageX;
      startScroll = marquee.scrollLeft;
      lastTime = performance.now();
      velocity = 0;
      marquee.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.pageX;
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dx = x - lastX;

      marquee.scrollLeft = startScroll - (x - startX);

      // Track instantaneous flick velocity
      velocity = -(dx / dt) * 16;
      lastX = x;
      lastTime = now;
    });

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      marquee.style.cursor = 'grab';

      // Apply drag momentum in the flicked direction
      if (Math.abs(velocity) > 0.3) {
        currentSpeed = Math.max(-12, Math.min(12, velocity));
        // Keep auto-flowing in the flicked direction
        targetSpeed = velocity > 0 ? 0.85 : -0.85;
      }
      setTimeout(() => {
        isInteracting = false;
      }, 150);
    }

    window.addEventListener('mouseup', stopDrag);

    // Touch Swipe on Mobile (Bidirectional Flow)
    let touchStartX = 0;
    let touchStartScroll = 0;
    let touchLastX = 0;
    let touchLastTime = 0;
    let touchVelocity = 0;

    marquee.addEventListener('touchstart', (e) => {
      if (e.touches.length === 0) return;
      isDragging = true;
      isInteracting = true;
      touchStartX = e.touches[0].pageX;
      touchLastX = touchStartX;
      touchStartScroll = marquee.scrollLeft;
      touchLastTime = performance.now();
      touchVelocity = 0;
    }, { passive: true });

    marquee.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const x = e.touches[0].pageX;
      const now = performance.now();
      const dt = Math.max(1, now - touchLastTime);
      const dx = x - touchLastX;

      marquee.scrollLeft = touchStartScroll - (x - touchStartX);
      touchVelocity = -(dx / dt) * 16;
      touchLastX = x;
      touchLastTime = now;
    }, { passive: true });

    marquee.addEventListener('touchend', () => {
      isDragging = false;
      if (Math.abs(touchVelocity) > 0.3) {
        currentSpeed = Math.max(-14, Math.min(14, touchVelocity));
        targetSpeed = touchVelocity > 0 ? 0.85 : -0.85;
      }
      setTimeout(() => {
        isInteracting = false;
      }, 200);
    }, { passive: true });

    // Directional Buttons (Left & Right)
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.preventDefault();
        targetSpeed = -0.85; // change direction to Left
        currentSpeed = -8;    // impulse flick to the left
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        targetSpeed = 0.85;  // change direction to Right
        currentSpeed = 8;    // impulse flick to the right
      });
    }
  }

  /**
   * Interactive UI Controls: Navigation, Typing effect, Contact form
   */
  function initInteractiveUI() {
    // Mobile Drawer
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileClose = document.getElementById('mobile-close');
    const mobLinks = document.querySelectorAll('.mob-link, .mob-talk');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', () => {
        mobileNav.classList.add('open');
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          mobileNav.classList.remove('open');
        });
      }

      mobLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
        });
      });
    }

    // Active navigation state is page-based on the multi-page site.
    const currentPage = document.body.dataset.page || 'home';
    const pageTargets = {
      home: 'index.html', about: 'about.html', 'why-us': 'why-us.html',
      services: 'services.html', work: 'work.html',
      testimonials: 'testimonials.html', contact: 'contact.html', privacy: null, terms: null
    };
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', Boolean(pageTargets[currentPage]) && link.getAttribute('href') === pageTargets[currentPage]);
    });

    // Typing Effect for Subtitle
    const typingEl = document.querySelector('.typing-text');
    if (typingEl) {
      const phrases = [
        'Digital Growth Agency',
        'Marketing, Web & Content',
        'Meta & Google Ads Specialist',
        'Viral Video & Reels Studio'
      ];
      let phraseIdx = 0;
      let charIdx = phrases[0].length;
      let isDeleting = true;
      let typingDelay = 2000;

      function type() {
        const currentPhrase = phrases[phraseIdx];

        if (isDeleting) {
          charIdx--;
          typingEl.textContent = currentPhrase.substring(0, charIdx);
          if (charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typingDelay = 400;
          } else {
            typingDelay = 45;
          }
        } else {
          charIdx++;
          typingEl.textContent = currentPhrase.substring(0, charIdx);
          if (charIdx === currentPhrase.length) {
            isDeleting = true;
            typingDelay = 2200;
          } else {
            typingDelay = 80;
          }
        }

        setTimeout(type, typingDelay);
      }

      setTimeout(type, 1500);
    }

    // Contact Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-submit');
        const origText = btn.innerHTML;
        btn.innerHTML = '<span>AUDIT REQUESTED! ✓</span>';
        btn.style.background = '#00e676';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = origText;
          btn.style.background = '';
        }, 3500);
      });
    }

    // Testimonial dots navigation
    const dots = document.querySelectorAll('.t-dot');
    const cards = document.querySelectorAll('.testimonial-card');
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // Init
  function init() {
    resizeCanvas();
    preloadFrames();
    initCardsDeckMarquee();
    initCardSpotlight();
    initInteractiveUI();
    requestAnimationFrame(animationLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
