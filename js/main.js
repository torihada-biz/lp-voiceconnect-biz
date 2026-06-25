// hamburger menu
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });
}

// fade-in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// contact form — Formspree
const FORMSPREE_ID = 'mlgyjebk';

const form = document.getElementById('contactForm');
if (form) {
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const privacy = form.querySelector('#privacy');
    if (!privacy.checked) {
      status.textContent = 'プライバシーポリシーへの同意が必要です。';
      status.style.color = '#f55';
      return;
    }

    const btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'SENDING...';
    status.textContent = '';

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        status.textContent = '送信完了しました。ありがとうございます。';
        status.style.color = '#fff';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      status.textContent = '送信に失敗しました。しばらくしてからお試しください。';
      status.style.color = '#f55';
    } finally {
      btn.disabled = false;
      btn.textContent = 'SUBMIT';
    }
  });
}

// ④ SCROLL PROGRESS BAR
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();

// ② HERO PARALLAX
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
  }, { passive: true });
})();

// ③ TEXT SPLIT ANIMATION
(function initTextSplit() {
  const els = document.querySelectorAll('.section-title, .page-hero-title, .members-title, .live-date-title');
  els.forEach(el => {
    el.innerHTML = [...el.textContent].map((ch, i) =>
      `<span class="char" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
    el.classList.add('char-split');
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('char-animate'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.char-split').forEach(el => obs.observe(el));
})();

// ① CUSTOM CURSOR + MAGNETIC EFFECT
(function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('custom-cursor');

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
    dot.style.left = (mx - 4)  + 'px';
    dot.style.top  = (my - 4)  + 'px';
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });

  (function tickRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = (rx - 20) + 'px';
    ring.style.top  = (ry - 20) + 'px';
    requestAnimationFrame(tickRing);
  })();

  // magnetic elements
  document.querySelectorAll('.btn, .header-nav a, .section-more, .pagetop, .footer-socials a').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.38;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.38;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.left   = (rx - 28) + 'px';
      ring.style.top    = (ry - 28) + 'px';
      ring.style.borderColor = 'rgba(255,255,255,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transform  = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
      ring.style.width  = '';
      ring.style.height = '';
      ring.style.borderColor = '';
    });
  });
})();

// countdown timer — 2026/08/14 19:00 JST
(function initCountdown() {
  const target = new Date('2026-08-14T19:00:00+09:00');
  const timers = document.querySelectorAll('.countdown-timer');
  if (!timers.length) return;

  function tick() {
    const diff = target - Date.now();
    timers.forEach(timer => {
      const nums = timer.querySelectorAll('.countdown-num');
      if (!nums.length) return;
      if (diff <= 0) {
        nums.forEach(n => { n.textContent = '00'; });
        return;
      }
      nums[0].textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
      nums[1].textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
      nums[2].textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      nums[3].textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    });
  }

  tick();
  setInterval(tick, 1000);
})();
