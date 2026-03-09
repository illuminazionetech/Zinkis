# SETUP.md - Zinkis Location Intelligence

Questa guida spiega come configurare e distribuire l'applicazione Zinkis su Netlify.

## Architettura e Funzionamento
L'applicazione è costruita come una Single Page Application (SPA) in React con un'architettura **Serverless**.
- **Frontend**: React + Tailwind CSS + Leaflet.
- **Backend**: Netlify Functions (JS) utilizzate come proxy CORS per proteggere le comunicazioni con le API esterne e aggirare i blocchi del browser.
- **Persistence**: Le API Key dell'utente vengono salvate nel `LocalStorage` del browser (Pattern: "Bring Your Own Key").

---

## 1. Registrazione API

Per il pieno funzionamento dell'app, è necessario ottenere le seguenti chiavi:

### A. Google Maps Platform (Places & Traffic)
1. Vai su [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuovo progetto.
3. Abilita le seguenti API:
   - **Places API** (per i concorrenti e recensioni).
   - **Maps Static API** o l'accesso ai Tile (già gestito tramite URL).
4. Vai nella sezione "Credenziali" e crea una **API Key**.
5. **Costi**: Google offre $200 di credito gratuito ogni mese. Per un uso moderato, l'app rientrerà nel tier gratuito.

### B. BestTime.app (Dati di Affluenza)
1. Registrati su [BestTime.app](https://besttime.app/).
2. Ottieni la tua `Private API Key` dalla dashboard.
3. **Costi**: Offrono un piano gratuito limitato per sviluppatori (100-200 crediti/mese) che permette di testare i dati di affluenza dei POI.

### C. OpenStreetMap / Overpass / Nominatim
- Usati per geocoding e dati fallback.
- Sono **gratuiti** e non richiedono chiavi API nel codice corrente (già integrati).

---

## 2. Configurazione Locale e Sviluppo

1. Clona il repository.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
4. Apri l'app nel browser e inserisci le tue API Key nel pannello **Impostazioni**.

---

## 3. Deploy su Netlify

### Metodo Manuale (Netlify CLI)
1. Installa Netlify CLI: `npm install -g netlify-cli`.
2. Esegui il build del progetto: `npm run build`.
3. Esegui il deploy: `netlify deploy --prod --dir dist`.

### Metodo Automatico (GitHub/GitLab)
1. Carica il codice su un repository Git.
2. Collega il repository a Netlify.
3. Imposta i seguenti parametri di build:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions Folder**: `functions`

**Nota Importante**: Le Netlify Functions in questo progetto si trovano nella cartella `/functions`. Netlify le rileverà automaticamente al momento del deploy.

---

## 4. Troubleshooting
- **CORS Error**: Assicurati di non chiamare le API di Google direttamente dal client. L'app è già configurata per usare `/.netlify/functions/proxy`.
- **API Key non valida**: Se ricevi errori 403, controlla che le chiavi inserite nel pannello Impostazioni siano corrette e che i servizi (Places API) siano abilitati nella Google Cloud Console.
