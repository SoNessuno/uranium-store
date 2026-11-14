import it from '../../i18n/it.js';

let lang = 'en';
try { lang = localStorage.getItem('lang') || (navigator.language?.startsWith('it') ? 'it' : 'en'); } catch { /* storage unavailable */ }
const original = new WeakMap();

export const getLang = () => lang;
export const L = (en, itText) => (lang === 'it' ? itText : en);

// Translates every [data-i18n] element under root (English text stays in the HTML as the source).
export function applyI18n(root = document) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach(node => {
    if (!original.has(node)) original.set(node, node.textContent);
    node.textContent = lang === 'it' && it[node.dataset.i18n] ? it[node.dataset.i18n] : original.get(node);
  });
}

export function toggleLang() {
  lang = lang === 'en' ? 'it' : 'en';
  try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  applyI18n();
  document.dispatchEvent(new Event('langchange'));
}
