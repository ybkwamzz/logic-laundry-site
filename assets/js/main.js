/**
 * Logic Laundry Services — main.js v2.0
 * Features:
 *   1. Soap bubble canvas animation (background)
 *   2. Navbar scroll effect + mobile menu
 *   3. Hero image carousel (auto-advance + dots)
 *   4. Scroll-in fade animations
 *   5. Weight slider → live price estimator + quote summary
 *   6. GPS / Geolocation capture for pickup
 *   7. Quote form → WhatsApp redirect with full order details
 *   8. Contact form → WhatsApp redirect
 *   9. Tracking notify signup
 *  10. Active nav link highlighting
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. SOAP BUBBLE CANVAS
  ───────────────────────────────────────────── */
  const canvas = document.getElementById('bubblesCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, bubbles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  /* Bubble class */
  function Bubble() {
    this.reset();
  }

  Bubble.prototype.reset = function () {
    this.x    = Math.random() * W;
    this.y    = H + Math.random() * 200;
    this.r    = 12 + Math.random() * 48;      // radius 12–60px
    this.vx   = (Math.random() - 0.5) * 0.6;  // gentle horizontal drift
    this.vy   = -(0.25 + Math.random() * 0.55);// float upward
    this.wobble = Math.random() * Math.PI * 2; // phase offset
    this.wobbleSpeed = 0.008 + Math.random() * 0.012;
    // Soap colours: translucent blues and whites
    const hues = [210, 215, 200, 195, 220];
    this.hue  = hues[Math.floor(Math.random() * hues.length)];
    this.alpha = 0.06 + Math.random() * 0.1;
  };

  Bubble.prototype.update = function () {
    this.wobble += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.wobble) * 0.4;
    this.y += this.vy;
  };

  Bubble.prototype.draw = function () {
    ctx.save();
    // Main translucent fill
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    const fill = ctx.createRadialGradient(
      this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.05,
      this.x, this.y, this.r
    );
    fill.addColorStop(0, `hsla(${this.hue},60%,90%,${this.alpha * 2})`);
    fill.addColorStop(0.6, `hsla(${this.hue},50%,75%,${this.alpha})`);
    fill.addColorStop(1, `hsla(${this.hue},40%,65%,0)`);
    ctx.fillStyle = fill;
    ctx.fill();

    // Rim / specular ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${this.hue},70%,90%,${this.alpha * 1.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Highlight dot (top-left)
    ctx.beginPath();
    ctx.arc(
      this.x - this.r * 0.32,
      this.y - this.r * 0.32,
      this.r * 0.18, 0, Math.PI * 2
    );
    ctx.fillStyle = `hsla(0,0%,100%,${this.alpha * 2.5})`;
    ctx.fill();

    ctx.restore();
  };

  // Create initial pool
  const BUBBLE_COUNT = 28;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = new Bubble();
    b.y = Math.random() * H; // scatter initial positions across full screen
    bubbles.push(b);
  }

  function animateBubbles() {
    ctx.clearRect(0, 0, W, H);
    bubbles.forEach(function (b) {
      b.update();
      b.draw();
      // Reset when bubble floats above screen
      if (b.y + b.r < -20) b.reset();
    });
    requestAnimationFrame(animateBubbles);
  }
  animateBubbles();


  /* ─────────────────────────────────────────────
     2. NAVBAR SCROLL + MOBILE MENU
  ───────────────────────────────────────────── */
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  nav.classList.toggle('scrolled', window.scrollY > 60);

  hamburger.addEventListener('click', function () {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ─────────────────────────────────────────────
     3. HERO CAROUSEL
  ───────────────────────────────────────────── */
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.dot');
  let current  = 0;
  let carouselTimer;

  function goToSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startCarousel() {
    carouselTimer = setInterval(function () {
      goToSlide(current + 1);
    }, 4000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      clearInterval(carouselTimer);
      goToSlide(i);
      startCarousel();
    });
  });

  startCarousel();


  /* ─────────────────────────────────────────────
     4. SCROLL-IN FADE ANIMATIONS
  ───────────────────────────────────────────── */
  // Auto-tag additional elements
  [
    '.service-card', '.pricing-card', '.feature-item',
    '.testimonial-card', '.gallery-item', '.contact-block',
    '.section-header', '.corp-item', '.tstep'
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
    });
  });

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.children);
      const delay = Math.min(siblings.indexOf(entry.target) * 70, 360);
      setTimeout(function () {
        entry.target.classList.add('visible');
      }, delay);
      fadeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    fadeObserver.observe(el);
  });


  /* ─────────────────────────────────────────────
     5. WEIGHT SLIDER → LIVE PRICE ESTIMATOR
  ───────────────────────────────────────────── */
  const slider    = document.getElementById('q-weight');
  const weightVal = document.getElementById('weightVal');
  const priceEst  = document.getElementById('priceEst');
  const serviceEl = document.getElementById('q-service');

  function calcPrice(kg, service) {
    const rate = (service || '').toLowerCase().includes('express') ? 120 : 80;
    return Math.max(kg * rate, 240); // min KSH 240
  }

  function updateSlider() {
    const kg = parseInt(slider.value, 10);
    const svc = serviceEl ? serviceEl.value : '';
    weightVal.textContent = kg;
    priceEst.textContent  = 'KSH ' + calcPrice(kg, svc).toLocaleString();
    updateQuoteSummary();
  }

  if (slider) {
    slider.addEventListener('input', updateSlider);
    if (serviceEl) serviceEl.addEventListener('change', updateSlider);
    updateSlider();
  }

  /* Quote summary */
  function updateQuoteSummary() {
    const qs = document.getElementById('quoteSummary');
    if (!qs) return;
    const kg   = parseInt(slider.value, 10);
    const svc  = serviceEl ? serviceEl.value : '';
    const date = document.getElementById('q-date') ? document.getElementById('q-date').value : '';
    if (kg && svc && date) {
      qs.hidden = false;
      document.getElementById('qs-weight').textContent = kg + ' kg';
      document.getElementById('qs-service').textContent = svc;
      document.getElementById('qs-date').textContent = date;
      document.getElementById('qs-total').textContent = 'KSH ' + calcPrice(kg, svc).toLocaleString();
    }
  }

  if (document.getElementById('q-date')) {
    document.getElementById('q-date').addEventListener('change', updateQuoteSummary);
  }


  /* ─────────────────────────────────────────────
     6. GPS LOCATION CAPTURE
  ───────────────────────────────────────────── */
  let capturedLat = null, capturedLng = null, capturedAddress = '';

  const locateBtn   = document.getElementById('locateBtn');
  const locIdle     = document.getElementById('locIdle');
  const locLoading  = document.getElementById('locLoading');
  const locSuccess  = document.getElementById('locSuccess');
  const locSuccessT = document.getElementById('locSuccessText');
  const resetLoc    = document.getElementById('resetLoc');
  const addrInput   = document.getElementById('q-address');

  if (locateBtn) {
    locateBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please type your address instead.');
        return;
      }
      locIdle.hidden    = true;
      locLoading.hidden = false;
      locSuccess.hidden = true;

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          capturedLat = pos.coords.latitude;
          capturedLng = pos.coords.longitude;
          capturedAddress = 'GPS: ' + capturedLat.toFixed(5) + ', ' + capturedLng.toFixed(5);
          locLoading.hidden = true;
          locSuccess.hidden = false;
          locSuccessT.textContent = '📍 Location captured! (' + capturedLat.toFixed(4) + ', ' + capturedLng.toFixed(4) + ')';
        },
        function (err) {
          locLoading.hidden = true;
          locIdle.hidden    = false;
          const msgs = {
            1: 'Location access denied. Please type your address.',
            2: 'Location unavailable. Please type your address.',
            3: 'Request timed out. Please type your address.'
          };
          alert(msgs[err.code] || 'Could not get location. Please type your address.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  if (resetLoc) {
    resetLoc.addEventListener('click', function () {
      capturedLat = capturedLng = null;
      capturedAddress = '';
      locSuccess.hidden = true;
      locIdle.hidden    = false;
      if (addrInput) addrInput.value = '';
    });
  }

  if (addrInput) {
    addrInput.addEventListener('input', function () {
      capturedAddress = addrInput.value.trim();
    });
  }


  /* ─────────────────────────────────────────────
     7. QUOTE FORM → WHATSAPP
  ───────────────────────────────────────────── */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    // Set tomorrow as default date
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const qDate = document.getElementById('q-date');
    if (qDate) {
      qDate.setAttribute('min', new Date().toISOString().split('T')[0]);
      qDate.value = today.toISOString().split('T')[0];
    }

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name    = v('q-name');
      const phone   = v('q-phone');
      const date    = v('q-date');
      const time    = v('q-time');
      const service = v('q-service');
      const weight  = slider ? slider.value : '?';
      const notes   = v('q-notes');
      const location = capturedLat
        ? 'GPS: ' + capturedLat.toFixed(5) + ', ' + capturedLng.toFixed(5) +
          '\nhttps://www.google.com/maps?q=' + capturedLat + ',' + capturedLng
        : (capturedAddress || v('q-address') || 'Not provided');

      if (!name || !phone) { highlightEmpty(quoteForm, ['q-name','q-phone']); return; }

      const price = calcPrice(parseInt(weight, 10), service);
      const msg = encodeURIComponent(
        '🧺 *Logic Laundry — New Order*\n\n' +
        '👤 Name: ' + name + '\n' +
        '📞 Phone: ' + phone + '\n' +
        '📅 Pickup Date: ' + date + '\n' +
        '⏰ Time: ' + time + '\n' +
        '🫧 Service: ' + service + '\n' +
        '⚖️ Weight: ~' + weight + ' kg\n' +
        '💰 Est. Cost: KSH ' + price.toLocaleString() + '\n' +
        '📍 Location: ' + location + '\n' +
        (notes ? '📝 Notes: ' + notes + '\n' : '') +
        '\nPlease confirm my pickup slot. Asante! 🙏'
      );

      window.open('https://wa.me/254715617654?text=' + msg, '_blank', 'noopener');
    });
  }


  /* ─────────────────────────────────────────────
     8. CONTACT FORM → WHATSAPP
  ───────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name    = v('c-name');
      const phone   = v('c-phone');
      const service = v('c-service');
      const message = v('c-message');
      if (!name || !phone) { highlightEmpty(contactForm, ['c-name','c-phone']); return; }
      const msg = encodeURIComponent(
        '💬 *New Enquiry — Logic Laundry*\n\n' +
        '👤 Name: ' + name + '\n' +
        '📞 Phone: ' + phone + '\n' +
        (service ? '🫧 Service: ' + service + '\n' : '') +
        (message ? '📝 Message: ' + message + '\n' : '')
      );
      window.open('https://wa.me/254715617654?text=' + msg, '_blank', 'noopener');
      if (formSuccess) { formSuccess.hidden = false; contactForm.reset(); setTimeout(function(){formSuccess.hidden=true},7000); }
    });
  }


  /* ─────────────────────────────────────────────
     9. TRACKING NOTIFY
  ───────────────────────────────────────────── */
  const notifyBtn = document.getElementById('notifyBtn');
  const notifySuccess = document.getElementById('notifySuccess');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', function () {
      const email = document.getElementById('notify-email');
      if (!email || !email.value.includes('@')) {
        email.style.borderColor = '#E53935';
        setTimeout(function(){email.style.borderColor=''}, 2000);
        return;
      }
      notifySuccess.hidden = false;
      email.value = '';
      setTimeout(function(){notifySuccess.hidden=true}, 8000);
    });
  }


  /* ─────────────────────────────────────────────
     10. ACTIVE NAV LINK
  ───────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav__links a');

  const secObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navAs.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(function (s) { secObserver.observe(s); });

  // Inject active style
  const s = document.createElement('style');
  s.textContent = '.nav__links a.active{color:var(--blue)}.nav__links a.active::after{width:100%}';
  document.head.appendChild(s);


  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  function v(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function highlightEmpty(form, ids) {
    ids.forEach(function (id) {
      const el = form.querySelector('#' + id);
      if (el && !el.value.trim()) {
        el.style.borderColor = '#E53935';
        el.style.boxShadow   = '0 0 0 3px rgba(229,57,53,.12)';
        el.addEventListener('input', function () {
          el.style.borderColor = '';
          el.style.boxShadow   = '';
        }, { once: true });
      }
    });
    const first = ids.map(function(id){return form.querySelector('#'+id)}).find(function(el){return el && !el.value.trim()});
    if (first) first.focus();
  }

})();
