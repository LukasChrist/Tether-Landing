/* Always start at top on reload */
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);


/* ════════════════════════════════════════
   Device capability flags
════════════════════════════════════════ */
const IsMobile  = window.matchMedia('(max-width: 820px)').matches;
const IsTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


/* ════════════════════════════════════════
   Single rAF scroll loop — all scroll
   work runs here to avoid layout thrash
════════════════════════════════════════ */
const Nav        = document.querySelector('.site-nav');
const Scrim      = document.querySelector('.top-scrim');
const ProgressBar = document.querySelector('.scroll-progress');
const AllSections = document.querySelectorAll('.light-section, .dark-section, .hero, footer');
const PhoneWraps  = document.querySelectorAll('.phone-wrap');

let ScrollY       = 0;
let RafPending    = false;
let CachedNavH    = Nav ? Nav.offsetHeight : 60;

function RunScrollWork() {

  RafPending = false;
  ScrollY    = window.scrollY;

  /* -- scrolled class -- */
  if (Nav) Nav.classList.toggle('scrolled', ScrollY > 60);

  /* -- progress bar -- */
  if (ProgressBar) {
    const DocH     = document.documentElement.scrollHeight - window.innerHeight;
    const Progress = DocH > 0 ? (ScrollY / DocH) * 100 : 0;
    ProgressBar.style.width = Progress + '%';
  }

  /* -- nav / scrim colour (pixel-precise, uses cached nav height) -- */
  if (Nav) {
    const SampleY = CachedNavH / 2;
    let IsLight   = false;

    AllSections.forEach((Section) => {
      const T = Section.getBoundingClientRect().top;
      const B = T + Section.offsetHeight;
      if (SampleY >= T && SampleY <= B) {
        IsLight = Section.classList.contains('light-section');
      }
    });

    Nav.classList.toggle('light-bg', IsLight);
    if (Scrim) Scrim.classList.toggle('light-mode', IsLight);
  }

  /* -- parallax on phone mockups (desktop only) -- */
  if (!IsMobile) {
    PhoneWraps.forEach((Wrap) => {
      const Parent = Wrap.closest('.showcase');
      if (!Parent) return;
      const Rect  = Parent.getBoundingClientRect();
      const Mid   = Rect.top + Rect.height / 2;
      const Delta = (window.innerHeight / 2 - Mid) * 0.055;
      Wrap.style.transform = `translateY(${Delta}px)`;
    });
  }

}

function OnScroll() {
  if (!RafPending) {
    RafPending = true;
    requestAnimationFrame(RunScrollWork);
  }
}

window.addEventListener('scroll', OnScroll, { passive: true });

/* Re-cache nav height on resize */
window.addEventListener('resize', () => {
  CachedNavH = Nav ? Nav.offsetHeight : 60;
}, { passive: true });

RunScrollWork(); /* run once on load */


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
   Showcase margin deco fade-in
════════════════════════════════════════ */
const DecoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.querySelectorAll('.showcase-deco').forEach((Deco) => {
        Deco.classList.toggle('visible', entry.isIntersecting);
      });
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.showcase').forEach((s) => DecoObserver.observe(s));


/* ════════════════════════════════════════
   Pillar card 3-D tilt — desktop / mouse only
════════════════════════════════════════ */
if (!IsTouch) {

  document.querySelectorAll('.pillar-card').forEach((Card) => {

    Card.addEventListener('mousemove', (e) => {
      const Rect    = Card.getBoundingClientRect();
      const RotateX = ((e.clientY - Rect.top  - Rect.height / 2) / (Rect.height / 2)) * -6;
      const RotateY = ((e.clientX - Rect.left - Rect.width  / 2) / (Rect.width  / 2)) *  6;
      Card.style.transition = 'transform .05s linear';
      Card.style.transform  = `perspective(600px) rotateX(${RotateX}deg) rotateY(${RotateY}deg) translateY(-6px)`;
    });

    Card.addEventListener('mouseleave', () => {
      Card.style.transition = 'transform .4s var(--ease)';
      Card.style.transform  = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });

  });

}


/* ════════════════════════════════════════
   Ripple effect on phone UI buttons
════════════════════════════════════════ */
function AddRipple(Selector, LightRipple = false) {

  document.querySelectorAll(Selector).forEach((El) => {

    El.addEventListener('click', (e) => {

      const Rect   = El.getBoundingClientRect();
      const Size   = Math.max(Rect.width, Rect.height) * 1.6;
      const X      = e.clientX - Rect.left - Size / 2;
      const Y      = e.clientY - Rect.top  - Size / 2;

      const Ripple = document.createElement('span');
      Ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${Size}px; height:${Size}px; left:${X}px; top:${Y}px;
        background:${LightRipple ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)'};
        transform:scale(0); opacity:1;
        animation: ripple-out .45s ease forwards;
      `;

      El.appendChild(Ripple);
      setTimeout(() => Ripple.remove(), 500);

    });

  });

}

AddRipple('.shutter-btn',  true);
AddRipple('.send-invite',  true);
AddRipple('.vault-row',    false);
AddRipple('.tab',          false);


/* ════════════════════════════════════════
   Scan frame blink animation
════════════════════════════════════════ */
const scanningLabel = document.querySelector('.scan-scanning');

if (scanningLabel) {
  setInterval(() => {
    scanningLabel.style.opacity = scanningLabel.style.opacity === '0.15' ? '0.55' : '0.15';
  }, 900);
}
