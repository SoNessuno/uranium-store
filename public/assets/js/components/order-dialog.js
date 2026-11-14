import { el } from '../core/dom.js';
import { api } from '../core/api.js';
import { L } from '../core/i18n.js';

const ERRORS = {
  roblox: ['Invalid Roblox username (3-20 letters, numbers or _).', 'Username Roblox non valido (3-20 lettere, numeri o _).'],
  limit: ['You already have 5 open orders.', 'Hai già 5 ordini aperti.'],
  login: ['Please log in again.', 'Rifai il login.']
};
let dialog;

export function openOrder(product, me) {
  if (!me) { location.href = '/api/login'; return; }
  dialog ??= document.body.appendChild(el('dialog'));
  const msg = el('p', { className: 'form-msg', role: 'status' });
  const roblox = el('input', { name: 'roblox', required: true, pattern: '[A-Za-z0-9_]{3,20}', maxLength: 20, autocomplete: 'off' });
  const details = el('textarea', { name: 'details', rows: 4, maxLength: 500 });
  const submit = el('button', { className: 'btn', type: 'submit', textContent: L('Send order', 'Invia ordine') });
  const form = el('form', {},
    el('h2', { textContent: product.name }),
    el('label', {}, L('Roblox username', 'Username Roblox'), roblox),
    el('label', {}, L('Details (vehicle, colors, notes)', 'Dettagli (veicolo, colori, note)'), details),
    msg,
    el('div', { className: 'btns' }, submit, el('button', { className: 'btn ghost', type: 'button', textContent: L('Close', 'Chiudi'), onclick: () => dialog.close() })));
  form.onsubmit = async e => {
    e.preventDefault(); submit.disabled = true;
    try {
      const d = await api('orders', { method: 'POST', body: { product_id: product.id, roblox: roblox.value, details: details.value } });
      msg.textContent = L(`Order #${d.id} sent! You will be tagged on Discord.`, `Ordine #${d.id} inviato! Ti taggheremo su Discord.`);
      form.reset();
    } catch (err) {
      const m = ERRORS[err.code];
      msg.textContent = m ? L(...m) : L('Something went wrong, try again.', 'Qualcosa è andato storto, riprova.');
    }
    submit.disabled = false;
  };
  dialog.replaceChildren(form);
  dialog.showModal();
}
