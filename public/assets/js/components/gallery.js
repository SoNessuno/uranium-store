import { el } from '../core/dom.js';
import { L } from '../core/i18n.js';

let dialog;

// Full-size photo viewer: arrows, keyboard (← →), swipe, click outside to close.
export function openGallery(images, start = 0, alt = '') {
  if (!images.length) return;
  dialog ??= document.body.appendChild(el('dialog', { className: 'gallery' }));
  let i = start;
  const img = el('img', { alt });
  const count = el('span', { className: 'count' });
  const show = n => {
    i = (n + images.length) % images.length;
    img.src = images[i];
    count.textContent = `${i + 1} / ${images.length}`;
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; // replay the fade
  };
  const btn = (cls, text, label, fn) => {
    const b = el('button', { className: cls, type: 'button', textContent: text, onclick: fn });
    b.setAttribute('aria-label', label);
    return b;
  };
  const many = images.length > 1;
  const stage = el('div', { className: 'stage' }, img,
    ...(many ? [btn('prev', '‹', L('Previous', 'Precedente'), () => show(i - 1)), btn('next', '›', L('Next', 'Successiva'), () => show(i + 1)), count] : []),
    btn('close', '✕', L('Close', 'Chiudi'), () => dialog.close()));
  let x0 = null;
  stage.onpointerdown = e => { x0 = e.clientX; };
  stage.onpointerup = e => {
    if (many && x0 !== null && Math.abs(e.clientX - x0) > 50) show(i + (e.clientX < x0 ? 1 : -1));
    x0 = null;
  };
  dialog.onkeydown = e => { if (many && e.key === 'ArrowLeft') show(i - 1); if (many && e.key === 'ArrowRight') show(i + 1); };
  dialog.onclick = e => { if (e.target === dialog) dialog.close(); };
  dialog.replaceChildren(stage);
  show(start);
  dialog.showModal();
}
