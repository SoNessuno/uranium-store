# Setup del sito (Cloudflare Pages)

Il sito è statico e ha una funzione proxy che inoltra `/api/*` al bot. Installa prima il bot (zip `uranium-store-bot`): servono il suo indirizzo `https://api.tuodominio.it` e il valore di `PROXY_SECRET` scritto nel suo `.env`.

## 1. Controlli prima di cominciare
- `https://api.tuodominio.it/api/me` risponde "404" (normale: l'API risponde solo al sito).
- Hai un account Cloudflare e Node.js installato.

## 2. Configurazione
In `wrangler.toml` imposta `API_ORIGIN = "https://api.tuodominio.it"`.

## 3. Deploy
```
npm install
npx wrangler pages project create uranium-store --production-branch main
npx wrangler pages secret put PROXY_SECRET --project-name uranium-store   # stesso valore del .env del bot
npm run deploy
```
Il caricamento manuale dalla dashboard non supporta le Functions: usa wrangler oppure GitHub (root del progetto, output `public`).

## 4. Collegamento con il bot
Al termine del deploy ottieni l'URL del sito (es. `https://uranium-store.pages.dev`). Controlla che coincida con:
- `SITE_URL` nel `.env` del bot (senza slash finale), poi `sudo systemctl restart uranium-store`;
- il Redirect OAuth2 nel Discord Developer Portal: `https://TUO-SITO.pages.dev/api/callback`.

Se in futuro usi un dominio personalizzato per il sito, aggiorna entrambi.

## 5. Prova
Apri il sito, fai il login con Discord, aggiungi un prodotto da `/admin/` (serve il ruolo staff), fai un ordine e controlla il canale Discord.

## Sviluppo locale
Copia `.dev.vars.example` in `.dev.vars` e usa `npm run dev`.
