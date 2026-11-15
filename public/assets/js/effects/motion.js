import { el } from '../core/dom.js';

const SYMBOLS = ['U', 'S', 'Ra', 'Pu', 'Th', 'Np', 'Am', 'Cm'];
const AUTO = 'main section > h2, main section .about > div, main .band .in > *, main .partner, main table.prices, main .steps li, main .prose > *, main .page-head > *, main section > .lead, main section > .btns';
const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
let observer;

// Fades elements in as they scroll into view (staggered by 80 ms inside a group).
export function reveal(root = document, selector = AUTO) {
  if (still || !('IntersectionObserver' in window)) return; // content simply stays visible
  observer ??= new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  }), { threshold: 0.1 });
  [...root.querySelectorAll(selector)].filter(n => !n.classList.contains('reveal')).forEach((n, i) => {
    n.classList.add('reveal');
    n.style.setProperty('--delay', (i % 6) * 80 + 'ms');
    observer.observe(n);
  });
}

// Slowly rising element symbols (U, S, Ra, ...) behind the page.
export function startParticles(count = 14) {
  if (still) return;
  const box = el('div', { className: 'particles' });
  for (let i = 0; i < count; i++) {
    const s = el('span', { textContent: SYMBOLS[i % SYMBOLS.length] });
    s.style.setProperty('--x', Math.random() * 100 + '%');
    s.style.setProperty('--s', 1.2 + Math.random() * 2.4 + 'rem');
    s.style.setProperty('--t', 18 + Math.random() * 22 + 's');
    s.style.setProperty('--d', -Math.random() * 30 + 's');
    box.append(s);
  }
  document.body.prepend(box);
}

export function initMotion() {
  startParticles();
  reveal();
}
