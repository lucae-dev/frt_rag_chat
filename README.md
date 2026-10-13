# Commercialista AI — frontend

SPA React per interrogare l'assistente fiscale, leggere citazioni verificabili, lasciare feedback e revisionare
le conversazioni raccolte dalla dashboard amministrativa.

Produzione: [frontend-production-4668.up.railway.app](https://frontend-production-4668.up.railway.app).

## Struttura

```text
src/
  features/
    chat/       componenti, hook, client SSE e gestione citazioni
    admin/      dashboard, sessione token e client API
    analytics/  PostHog e sole proprietà aggregate
  App.jsx       selezione chat/admin
  config.js     base URL del backend
  index.jsx     bootstrap React
```

Il codice è organizzato per funzionalità. Le chiamate HTTP stanno in `services`, lo stato della chat in `useChat`
e i componenti si occupano soltanto della presentazione e degli eventi utente.

## Sviluppo

Richiede Node.js 22 o successivo.

```bash
npm ci
npm run dev
```

In sviluppo il backend predefinito è `http://localhost:8080`. Si può sovrascrivere con:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Test e build

```bash
npm test
npm run build
npm audit
```

Vitest usa jsdom. La suite copre componenti principali, dashboard admin, hook della chat, feedback, analytics e
decodifica SSE, incluso un evento diviso tra più chunk di rete. La build Vite viene prodotta in `dist/`.

## Configurazione

| Variabile | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | backend esplicito; in produzione vuoto usa il reverse proxy same-origin |
| `VITE_POSTHOG_KEY` | project key pubblica PostHog |
| `VITE_POSTHOG_HOST` | host EU, normalmente `https://eu.i.posthog.com` |

Le variabili `VITE_*` vengono incorporate nella build statica. Modificarle richiede una nuova build/deploy.

## Privacy e dataset

Gli eventi analytics non contengono domanda o risposta. Gli input e i nodi `.ph-mask` sono mascherati nel session
replay; body, header e console non vengono registrati. PostHog non viene inizializzato su `/admin`.

Il backend conserva invece le interazioni per costruire un dataset di valutazione: la dashboard `/admin` richiede
un token inserito dall'operatore e conservato soltanto in `sessionStorage`. Il token non deve mai essere aggiunto a
variabili `VITE_*` o al bundle.

## Deploy

Il `Dockerfile` esegue la build Vite e serve `dist/` con Nginx. Nginx inoltra `/api` e `/v1` al backend privato e
usa fallback a `index.html` per le route client-side. La configurazione Railway è mantenuta nella repository
backend, in `.railway/railway.ts`.
