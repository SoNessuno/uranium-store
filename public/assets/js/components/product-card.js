import { el } from '../core/dom.js';
import { L } from '../core/i18n.js';

export const productCard = (p, onOrder) => el('article', { className: 'card' },
  ...(p.image ? [el('img', { src: p.image, alt: p.name, loading: 'lazy' })] : []),
  el('div', {},
    el('h3', { textContent: p.name }),
    el('p', { textContent: p.description || '' }),
    el('p', { className: 'price', textContent: p.price || '' }),
    el('button', { className: 'btn', type: 'button', textContent: L('Order', 'Ordina'), onclick: () => onOrder(p) })));
