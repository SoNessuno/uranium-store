import { startBackground } from '../effects/background.js';
import { initLayout } from '../components/layout.js';
import { el, $ } from '../core/dom.js';
import { api } from '../core/api.js';
import { L } from '../core/i18n.js';

const STATUS = { new: ['New', 'Nuovo'], accepted: ['Accepted', 'Accettato'], done: ['Completed', 'Completato'], rejected: ['Rejected', 'Rifiutato'] };
startBackground();
const me = await initLayout();
const root = $('#orders-root');

async function draw() {
  if (!me) {
    root.replaceChildren(el('p', {}, L('Log in with Discord to see your orders. ', 'Accedi con Discord per vedere i tuoi ordini. '),
      el('a', { className: 'btn', href: '/api/login', textContent: L('Login with Discord', 'Accedi con Discord') })));
    return;
  }
  const rows = await api('orders?mine=1').catch(() => []);
  root.replaceChildren(...(rows.length ? rows.map(o => el('article', { className: 'row' },
    el('h3', { textContent: `#${o.id} · ${o.product_name}` }),
    el('span', { className: 'tag ' + o.status, textContent: L(...STATUS[o.status]) }),
    el('div', { className: 'muted', textContent: new Date(o.created_at * 1000).toLocaleString() })))
    : [el('p', { className: 'muted', textContent: L('No orders yet.', 'Nessun ordine ancora.') })]));
}
draw();
document.addEventListener('langchange', draw);
