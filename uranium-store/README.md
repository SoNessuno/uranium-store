# Uranium Store – setup

Struttura: `public/` (sito e pannello `/admin`), `functions/api/` (login Discord, ordini, bot), `schema.sql` (database), `wrangler.toml` (config).

## 1. Database (Cloudflare D1)
```
npx wrangler d1 create uranium-store
```
Copia il `database_id` in `wrangler.toml`, poi:
```
npx wrangler d1 execute uranium-store --remote --file=schema.sql
```

## 2. Valori in `wrangler.toml` (sezione [vars])
Client ID, Public Key, ID server, ID ruolo staff, ID canale ordini.

## 3. Progetto Pages e segreti
```
npx wrangler pages project create uranium-store --production-branch main
npx wrangler pages secret put DISCORD_BOT_TOKEN --project-name uranium-store
npx wrangler pages secret put DISCORD_CLIENT_SECRET --project-name uranium-store
npx wrangler pages secret put SESSION_SECRET --project-name uranium-store
```
`SESSION_SECRET` = una stringa casuale lunga almeno 32 caratteri. Non condividere i segreti con nessuno.

## 4. Deploy
```
npx wrangler pages deploy
```
(Il drag & drop della dashboard non supporta le Functions: usa wrangler oppure collega un repo GitHub.)

## 5. Discord Developer Portal (usa l'URL reale del sito)
- OAuth2 → Redirects: `https://TUO-SITO.pages.dev/api/callback`
- General Information → Interactions Endpoint URL: `https://TUO-SITO.pages.dev/api/discord` (da salvare dopo il deploy)
- Il bot deve poter vedere il canale ordini con: Visualizza canale, Invia messaggi, Incorpora link.

## 6. Prova
Login dal sito, aggiungi un prodotto da `/admin`, fai un ordine e controlla il canale Discord.
