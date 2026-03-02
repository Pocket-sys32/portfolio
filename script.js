// rjthandi.dev — Subtle interactions

// Albums shelf: expand/collapse on click
document.querySelectorAll('.album-card[data-album]').forEach((card) => {
  const btn = card.querySelector('.album-spine');
  const details = card.querySelector('.album-details');
  if (!btn || !details) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    details.hidden = expanded;
  });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');

function updateActiveLink() {
  const scrollY = window.scrollY;
  let current = '';

  sections.forEach((section) => {
    const top = section.offsetTop - 100;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href').slice(1);
    link.classList.toggle('active', href === current);
  });
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);
