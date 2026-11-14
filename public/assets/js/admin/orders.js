import { api } from '../core/api.js';
import { el, $ } from '../core/dom.js';

const NEXT = { new: ['accepted', 'rejected'], accepted: ['done', 'rejected'] };
const LABEL = { accepted: 'Accept', rejected: 'Reject', done: 'Mark completed' };

export async function loadOrders() {
  const status = $('#f').value;
  const rows = await api('orders' + (status ? '?status=' + status : ''));
  $('#list').replaceChildren(...(rows.length ? rows.map(o => el('article', { className: 'row' },
    el('h3', { textContent: `#${o.id} · ${o.product_name}` }),
    el('span', { className: 'tag ' + o.status, textContent: o.status + (o.handler ? ' · ' + o.handler : '') }),
    el('div', { className: 'muted', textContent: `${o.user_name} · Roblox: ${o.roblox} · ${new Date(o.created_at * 1000).toLocaleString()}` }),
    el('div', { textContent: o.details || '—' }),
    el('div', { className: 'act' }, ...(NEXT[o.status] || []).map(s => el('button', {
      textContent: LABEL[s],
      onclick: async () => {
        try { await api('orders/' + o.id, { method: 'PATCH', body: { status: s } }); } catch (e) { alert('Could not update: ' + (e.code || 'error')); }
        loadOrders();
      }
    }))))) : [el('p', { className: 'muted', textContent: 'No orders.' })]));
}
export const initOrders = () => { $('#f').onchange = loadOrders; };
