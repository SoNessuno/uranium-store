import { api, upload } from '../core/api.js';
import { el, $ } from '../core/dom.js';

const MAX_IMAGES = 8, MAX_BYTES = 5 << 20;
const UPLOAD_ERRORS = { type: 'not a PNG, JPEG, WebP or GIF image', too_large: 'file too large' };
const form = $('#pf');
let images = [];

function drawImages() {
  $('#imgs').replaceChildren(...images.map((url, i) => el('div', { className: 'thumb' },
    el('img', { src: url, alt: '' }),
    el('div', { className: 'tools' },
      i ? el('button', { type: 'button', title: 'Make cover', textContent: '★', onclick: () => { images.unshift(images.splice(i, 1)[0]); drawImages(); } })
        : el('span', { className: 'cover', textContent: 'Cover' }),
      el('button', { type: 'button', title: 'Remove', textContent: '✕', onclick: () => { images.splice(i, 1); drawImages(); } })))));
  $('#imgcount').textContent = `${images.length}/${MAX_IMAGES}`;
}

async function addFiles(files) {
  for (const f of files) {
    if (images.length >= MAX_IMAGES) { alert(`At most ${MAX_IMAGES} images per product.`); break; }
    if (f.size > MAX_BYTES) { alert(`${f.name}: larger than 5 MB.`); continue; }
    try { images.push(await upload(f)); drawImages(); }
    catch (e) { alert(`${f.name}: ${UPLOAD_ERRORS[e.code] || 'upload failed'}`); }
  }
}

function edit(p) {
  $('#pt').textContent = p ? 'Edit product #' + p.id : 'Add product';
  form.dataset.id = p ? p.id : '';
  form.elements.name.value = p?.name || ''; form.elements.description.value = p?.description || ''; form.elements.price.value = p?.price || '';
  form.elements.sort.value = p?.sort || 0; form.elements.active.checked = p ? !!p.active : true;
  images = p ? [...(p.images?.length ? p.images : p.image ? [p.image] : [])] : [];
  $('#imgurl').value = '';
  drawImages();
}

export async function loadProducts() {
  const rows = await api('products?all=1');
  $('#plist').replaceChildren(...rows.map(p => el('article', { className: 'row' },
    el('h3', { textContent: p.name + (p.price ? ' · ' + p.price : '') }),
    el('div', { className: 'minis' }, ...(p.images || []).slice(0, 4).map(u => el('img', { src: u, alt: '' }))),
    el('div', { className: 'muted', textContent: (p.active ? 'Visible' : 'Hidden') + (p.description ? ' · ' + p.description : '') }),
    el('div', { className: 'act' },
      el('button', { textContent: 'Edit', onclick: () => { edit(p); scrollTo(0, 0); } }),
      el('button', { textContent: 'Delete', onclick: async () => { if (confirm(`Delete "${p.name}"?`)) { await api('products/' + p.id, { method: 'DELETE' }); loadProducts(); } } })))));
}

export function initProducts() {
  $('#file').onchange = async e => { await addFiles([...e.target.files]); e.target.value = ''; };
  $('#addurl').onclick = () => {
    const url = $('#imgurl').value.trim();
    if (!/^https:\/\//.test(url)) { alert('The link must start with https://'); return; }
    if (images.length >= MAX_IMAGES) { alert(`At most ${MAX_IMAGES} images per product.`); return; }
    images.push(url); $('#imgurl').value = ''; drawImages();
  };
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      await api('products', { method: 'POST', body: { id: form.dataset.id || undefined, name: form.elements.name.value, description: form.elements.description.value, price: form.elements.price.value, images, sort: form.elements.sort.value, active: form.elements.active.checked } });
      edit(null); loadProducts();
    } catch (err) { alert('Could not save: ' + (err.code || 'error')); }
  };
  $('#reset').onclick = () => edit(null);
  edit(null);
}
