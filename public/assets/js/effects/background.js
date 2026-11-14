import { el } from '../core/dom.js';

// Logo background that drifts with the pointer (or phone tilt) plus a soft glow following the cursor.
export function startBackground() {
  document.body.prepend(el('div', { className: 'bg' }), el('div', { className: 'glow' }));
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const set = (k, v) => document.documentElement.style.setProperty(k, v);
  addEventListener('pointermove', e => {
    set('--x', -(e.clientX / innerWidth - .5) * 40 + 'px'); set('--y', -(e.clientY / innerHeight - .5) * 40 + 'px');
    set('--gx', e.clientX + 'px'); set('--gy', e.clientY + 'px');
  });
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    const clamp = v => Math.max(-30, Math.min(30, v));
    set('--x', -clamp(e.gamma) * 1.2 + 'px'); set('--y', -clamp((e.beta || 0) - 45) * 1.2 + 'px');
  });
}
