# Architettura del sito

Pagine statiche in `public/` più una Pages Function (`functions/api/[[path]].js`) che inoltra ogni richiesta `/api/*` al bot, aggiungendo `X-Proxy-Secret`. Il browser parla solo col sito: niente CORS e cookie di sessione "first-party".

| Percorso | Contenuto |
|---|---|
| `public/*.html` | Home, vetrina (shop), i miei ordini, come funziona, privacy, 404 |
| `public/admin/` | Pannello staff (ordini e prodotti) |
| `public/assets/css/` | `tokens`, `layout`, `components`, `motion` (animazioni, galleria), `admin` |
| `public/assets/js/` | `core` (api, dom, i18n), `components`, `pages`, `admin`, `effects` |
| `public/assets/i18n/` | Traduzioni italiane |
| `public/_headers` | Header di sicurezza (CSP, ecc.) |
| `functions/api/[[path]].js` | Proxy verso il bot |
| `wrangler.toml` | Config Pages (`API_ORIGIN`); il segreto `PROXY_SECRET` si imposta con wrangler |

## Animazioni e immagini
- `assets/css/motion.css`: ingresso della home, simboli degli elementi che salgono sullo sfondo, comparsa degli elementi allo scroll, effetto luce sui pulsanti, schede prodotto con inclinazione 3D. Tutto si disattiva per chi ha impostato "riduci animazioni" nel sistema.
- `assets/js/effects/motion.js`: scroll reveal e simboli; `components/product-card.js`: foto che scorrono al passaggio del mouse; `components/gallery.js`: visualizzatore a schermo intero (frecce, tastiera, swipe).
- Pannello `/admin/`: ogni prodotto può avere fino a 8 immagini, caricate dal pannello (max 5 MB, PNG/JPEG/WebP/GIF) o aggiunte con un link `https://`; la prima è la copertina e con ★ si cambia.
