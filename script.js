/* ════════════════════════════════════════
   Navbar — transparent → frosted, light/dark aware
════════════════════════════════════════ */
const Nav = document.querySelector('.site-nav');

// Add "scrolled" class once user leaves the very top
window.addEventListener('scroll', () => {
  Nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Flip to light-bg when a light section is majority in view
const LightSections = document.querySelectorAll('.light-section');
let LightSectionsVisible = 0;

const navLightObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {
        LightSectionsVisible++;
      } else {
        LightSectionsVisible = Math.max(0, LightSectionsVisible - 1);
      }

    });

    Nav.classList.toggle('light-bg', LightSectionsVisible > 0);

  },
  { threshold: 0.15, rootMargin: `-${Nav.offsetHeight}px 0px 0px 0px` }
);

LightSections.forEach((section) => navLightObserver.observe(section));


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
   Scan frame blink animation
════════════════════════════════════════ */
const scanningLabel = document.querySelector('.scan-scanning');

if (scanningLabel) {
  setInterval(() => {
    scanningLabel.style.opacity = scanningLabel.style.opacity === '0.15' ? '0.55' : '0.15';
  }, 900);
}
