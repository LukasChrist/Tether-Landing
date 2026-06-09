/* ════════════════════════════════════════
   Navbar — transparent → frosted, light/dark aware
════════════════════════════════════════ */
const Nav = document.querySelector('.site-nav');

// Add "scrolled" class once user leaves the very top
window.addEventListener('scroll', () => {
  Nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Flip nav text dark/light based on what section is *directly behind* the navbar.
// We poll on every scroll tick using getBoundingClientRect so the check is pixel-perfect.
const AllSections   = document.querySelectorAll('.light-section, .dark-section, .hero, footer');
const NavHeight     = () => Nav.getBoundingClientRect().height;

function UpdateNavColor() {

  // Sample the midpoint of the navbar strip
  const SampleY = NavHeight() / 2;

  // Walk every tracked section and find whichever one the sample point sits inside
  let IsLight = false;

  AllSections.forEach((Section) => {

    const Rect = Section.getBoundingClientRect();

    if (SampleY >= Rect.top && SampleY <= Rect.bottom) {
      IsLight = Section.classList.contains('light-section');
    }

  });

  Nav.classList.toggle('light-bg', IsLight);

}

window.addEventListener('scroll', UpdateNavColor, { passive: true });
UpdateNavColor(); // run once on load


/* ════════════════════════════════════════
   Scroll progress bar
════════════════════════════════════════ */
const ProgressBar = document.querySelector('.scroll-progress');

function UpdateProgress() {

  const ScrollTop = window.scrollY;
  const DocHeight = document.documentElement.scrollHeight - window.innerHeight;
  const Progress  = DocHeight > 0 ? (ScrollTop / DocHeight) * 100 : 0;

  ProgressBar.style.width = Progress + '%';

}

window.addEventListener('scroll', UpdateProgress, { passive: true });


/* ════════════════════════════════════════
   Side section dots — active state
════════════════════════════════════════ */
const Dots       = document.querySelectorAll('.section-dot');
const DotsNav    = document.querySelector('.section-dots');
const Sections   = ['hero', 'memories', 'vault', 'scan', 'share', 'tags'];
const LightIds   = new Set(['memories', 'scan', 'tags']);

const dotObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (!entry.isIntersecting) return;

      const Id         = entry.target.id;
      const ActiveDot  = document.querySelector(`.section-dot[data-section="${Id}"]`);

      // Deactivate all, activate matching dot
      Dots.forEach((d) => d.classList.remove('active'));
      if (ActiveDot) ActiveDot.classList.add('active');

      // Flip dot colour scheme over light sections
      DotsNav.classList.toggle('light-mode', LightIds.has(Id));

    });

  },
  { threshold: 0.4 }
);

Sections.forEach((Id) => {

  const El = document.getElementById(Id);
  if (El) dotObserver.observe(El);

});

// Smooth scroll on dot click
Dots.forEach((Dot) => {

  Dot.addEventListener('click', (e) => {

    e.preventDefault();
    const Target = document.getElementById(Dot.dataset.section);
    if (Target) Target.scrollIntoView({ behavior: 'smooth' });

  });

});


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
   Pillar card 3-D tilt on mouse move
════════════════════════════════════════ */
document.querySelectorAll('.pillar-card').forEach((Card) => {

  Card.addEventListener('mousemove', (e) => {

    const Rect   = Card.getBoundingClientRect();
    const CenterX = Rect.left + Rect.width  / 2;
    const CenterY = Rect.top  + Rect.height / 2;
    const RotateX = ((e.clientY - CenterY) / (Rect.height / 2)) * -6; /* max ±6deg */
    const RotateY = ((e.clientX - CenterX) / (Rect.width  / 2)) *  6;

    Card.style.transition = 'transform .05s linear, box-shadow .05s linear';
    Card.style.transform  = `perspective(600px) rotateX(${RotateX}deg) rotateY(${RotateY}deg) translateY(-6px)`;

  });

  Card.addEventListener('mouseleave', () => {

    Card.style.transition = 'transform .4s var(--ease), box-shadow .4s ease';
    Card.style.transform  = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';

  });

});


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
