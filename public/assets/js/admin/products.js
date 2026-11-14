import { api } from '../core/api.js';
import { el, $ } from '../core/dom.js';

const form = $('#pf');

function edit(p) {
  $('#pt').textContent = p ? 'Edit product #' + p.id : 'Add product';
  form.dataset.id = p ? p.id : '';
  form.name.value = p?.name || ''; form.description.value = p?.description || ''; form.price.value = p?.price || '';
  form.image.value = p?.image || ''; form.sort.value = p?.sort || 0; form.active.checked = p ? !!p.active : true;
}

export async function loadProducts() {
  const rows = await api('products?all=1');
  $('#plist').replaceChildren(...rows.map(p => el('article', { className: 'row' },
    el('h3', { textContent: p.name + (p.price ? ' · ' + p.price : '') }),
    el('div', { className: 'muted', textContent: (p.active ? 'Visible' : 'Hidden') + (p.description ? ' · ' + p.description : '') }),
    el('div', { className: 'act' },
      el('button', { textContent: 'Edit', onclick: () => { edit(p); scrollTo(0, 0); } }),
      el('button', { textContent: 'Delete', onclick: async () => { if (confirm(`Delete "${p.name}"?`)) { await api('products/' + p.id, { method: 'DELETE' }); loadProducts(); } } })))));
}

export function initProducts() {
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      await api('products', { method: 'POST', body: { id: form.dataset.id || undefined, name: form.name.value, description: form.description.value, price: form.price.value, image: form.image.value, sort: form.sort.value, active: form.active.checked } });
      edit(null); loadProducts();
    } catch (err) { alert('Could not save: ' + (err.code || 'error')); }
  };
  $('#reset').onclick = () => edit(null);
}
