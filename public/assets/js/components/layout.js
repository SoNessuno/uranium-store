import { el, $ } from '../core/dom.js';
import { getMe } from '../core/api.js';
import { applyI18n, toggleLang, getLang, L } from '../core/i18n.js';

const NAV = [['/', 'nav_home', 'Home'], ['/shop', 'nav_shop', 'Showcase'], ['/how-it-works', 'nav_how', 'How it works'], ['/orders', 'nav_orders', 'My orders']];

// Renders the shared header and footer; returns the current user (or null).
export async function initLayout() {
  const me = await getMe();
  const draw = () => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const auth = el('span', { id: 'auth' });
    if (me) {
      if (me.staff) auth.append(el('a', { href: '/admin/', textContent: L('Staff panel', 'Pannello staff') }));
      auth.append(el('a', { href: '/api/logout', textContent: `${me.name} · ${L('Log out', 'Esci')}` }));
    } else auth.append(el('a', { className: 'btn', href: '/api/login', textContent: L('Login with Discord', 'Accedi con Discord') }));

    $('#site-header').replaceChildren(el('div', { className: 'bar' },
      el('a', { className: 'brand', href: '/' }, el('img', { src: '/assets/img/logo.png', alt: '' }), 'Uranium Store'),
      el('nav', {},
        ...NAV.map(([href, key, text]) => el('a', { href, className: path === href ? 'active' : '', textContent: text, data: { i18n: key } })),
        el('button', { className: 'lang', type: 'button', textContent: getLang() === 'en' ? 'IT' : 'EN', onclick: toggleLang }),
        auth)));
    $('#site-footer').replaceChildren(el('footer', { className: 'site-footer' },
      el('span', { textContent: `© ${new Date().getFullYear()} Uranium Store · 🇮🇹 / 🇺🇸` }),
      el('span', {}, el('a', { href: '/privacy', textContent: 'Privacy' }),
        el('a', { href: 'https://discord.gg/2p333Sz94T', target: '_blank', rel: 'noopener', textContent: 'Discord' }))));
    applyI18n($('#site-header'));
  };
  draw();
  document.addEventListener('langchange', draw);
  applyI18n();
  return me;
}
