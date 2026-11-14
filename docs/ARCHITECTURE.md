# Architettura del sito

Pagine statiche in `public/` più una Pages Function (`functions/api/[[path]].js`) che inoltra ogni richiesta `/api/*` al bot, aggiungendo `X-Proxy-Secret`. Il browser parla solo col sito: niente CORS e cookie di sessione "first-party".

| Percorso | Contenuto |
|---|---|
| `public/*.html` | Home, vetrina (shop), i miei ordini, come funziona, privacy, 404 |
| `public/admin/` | Pannello staff (ordini e prodotti) |
| `public/assets/css/` | `tokens`, `layout`, `components`, `admin` |
| `public/assets/js/` | `core` (api, dom, i18n), `components`, `pages`, `admin`, `effects` |
| `public/assets/i18n/` | Traduzioni italiane |
| `public/_headers` | Header di sicurezza (CSP, ecc.) |
| `functions/api/[[path]].js` | Proxy verso il bot |
| `wrangler.toml` | Config Pages (`API_ORIGIN`); il segreto `PROXY_SECRET` si imposta con wrangler |
