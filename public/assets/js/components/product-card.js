import { el } from '../core/dom.js';
import { L } from '../core/i18n.js';
import { openGallery } from './gallery.js';

const still = matchMedia('(prefers-reduced-motion:reduce)').matches;

// Stacked photos: hover cycles through them, click opens the viewer. Extra photos load on first hover.
function media(p, images) {
  const imgs = images.map((src, i) => el('img', { alt: i ? '' : p.name, loading: 'lazy', className: i ? '' : 'on', ...(i ? {} : { src }) }));
  imgs.forEach((im, i) => { if (i) im.dataset.src = images[i]; });
  const dots = images.length > 1 ? el('div', { className: 'dots' }, ...images.map((_, i) => el('i', { className: i ? '' : 'on' }))) : null;
  let cur = 0, timer;
  const go = n => {
    cur = (n + images.length) % images.length;
    const im = imgs[cur];
    if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
    imgs.forEach((x, k) => x.classList.toggle('on', k === cur));
    dots?.childNodes.forEach((d, k) => d.classList.toggle('on', k === cur));
  };
  const box = el('div', { className: 'media', tabIndex: 0 }, ...imgs,
    ...(dots ? [dots, el('span', { className: 'badge', textContent: `${images.length} ${L('photos', 'foto')}` })] : []));
  box.setAttribute('role', 'button');
  box.setAttribute('aria-label', L('View photos of ', 'Vedi le foto di ') + p.name);
  const open = () => { clearInterval(timer); openGallery(images, cur, p.name); };
  box.onmouseenter = () => { if (images.length > 1 && !still) timer = setInterval(() => go(cur + 1), 1400); };
  box.onmouseleave = () => { clearInterval(timer); go(0); };
  box.onclick = open;
  box.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  return box;
}

export function productCard(p, onOrder) {
  const images = p.images?.length ? p.images : p.image ? [p.image] : [];
  const card = el('article', { className: 'card' },
    ...(images.length ? [media(p, images)] : []),
    el('div', {},
      el('h3', { textContent: p.name }),
      el('p', { textContent: p.description || '' }),
      el('p', { className: 'price', textContent: p.price || '' }),
      el('button', { className: 'btn', type: 'button', textContent: L('Order', 'Ordina'), onclick: () => onOrder(p) })));
  if (!still) {
    card.addEventListener('pointermove', e => { // gentle 3D tilt following the mouse
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
      card.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 6 + 'deg');
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  }
  return card;
}
