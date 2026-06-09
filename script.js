/* ════════════════════════════════════════
   Scroll-reveal
════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


/* ════════════════════════════════════════
   Subtle parallax on phone mockups
════════════════════════════════════════ */
const phoneWraps = document.querySelectorAll('.phone-wrap');

function onScroll() {
  const vy = window.scrollY;
  phoneWraps.forEach((wrap) => {
    const parent = wrap.closest('.showcase');
    if (!parent) return;
    const rect  = parent.getBoundingClientRect();
    const mid   = rect.top + rect.height / 2;
    const delta = (window.innerHeight / 2 - mid) * 0.055;
    wrap.style.transform = `translateY(${delta}px)`;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });


/* ════════════════════════════════════════
   Scan frame blink animation
════════════════════════════════════════ */
const scanningLabel = document.querySelector('.scan-scanning');

if (scanningLabel) {
  setInterval(() => {
    scanningLabel.style.opacity = scanningLabel.style.opacity === '0.15' ? '0.55' : '0.15';
  }, 900);
}
