# Guida Sopralluogo - PRISMA Solar

## 📸 Componente Sopralluogo Implementato!

**Versione:** 5.0.0
**Data:** 2025-10-30
**Status:** ✅ Pronto per il test

---

## 🎯 Cosa fa

Il componente **Sopralluogo** permette di:

1. ✅ **Catturare GPS automaticamente** - Coordinate rilevate all'apertura
2. ✅ **Upload foto da galleria/camera** - Multiplo, con preview
3. ✅ **Upload video da galleria/camera** - Con gestione dimensioni
4. ✅ **Link pCloud manuale** - Campo input per link video caricati manualmente
5. ✅ **Upload su Airtable** - Foto automatico, link pCloud salvato
6. ✅ **Supporto offline** - Salva in IndexedDB se no rete
7. ✅ **UI mobile-friendly** - Bottoni grandi, touch-optimized

---

## 📱 Come Usare (Desktop Test)

### 1. Apri l'app

```
http://localhost:5173
```

### 2. Vai al tab **"Sopralluogo"** 📸

È l'ultimo tab nella barra di navigazione.

### 3. GPS Automatico

All'apertura del tab:
- Il browser chiederà il permesso per accedere alla posizione
- **Click "Consenti"**
- Le coordinate appariranno nel campo GPS (es: `45.0703,7.6869`)
- Se non funziona, puoi inserirle manualmente

### 4. Aggiungi Foto

**Desktop:**
- Click su **"Aggiungi Foto (Camera/Galleria)"**
- Seleziona file immagini dal computer
- Supporta selezione multipla (Ctrl+Click / Cmd+Click)

**Mobile:**
- Click su **"Aggiungi Foto"**
- Scegli:
  - **📷 Scatta foto** → Apre camera
  - **📁 Scegli dalla galleria** → Apre galleria
- Supporta selezione multipla

**Preview:**
- Ogni foto appare in una griglia
- Mostra nome file e dimensione
- Bottone **X** per rimuovere

### 5. Aggiungi Video

**Desktop:**
- Click su **"Aggiungi Video (Camera/Galleria)"**
- Seleziona file video dal computer

**Mobile:**
- Click su **"Aggiungi Video"**
- Scegli:
  - **🎥 Registra video** → Apre camera video
  - **📁 Scegli dalla galleria** → Apre galleria

**Lista:**
- Video elencati con nome e dimensione
- Bottone **"Rimuovi"** per eliminare

### 6. Link pCloud (Opzionale)

**Workflow:**
1. Carica manualmente i video su pCloud
2. Ottieni link condiviso da pCloud
3. Incolla link nel campo **"Link pCloud"**
4. Esempio: `https://pcloud.com/video12345`

**Nota:** I video NON vengono caricati automaticamente, solo il link viene salvato su Airtable.

### 7. Salva Sopralluogo

Click su **"💾 Salva Sopralluogo"**

**Online:**
- ✅ Foto caricate su Airtable (campo `sopralluogoFoto`)
- ✅ Link pCloud salvato (campo `linkPCloud`)
- ✅ Coordinate GPS salvate (campo `coordinate`)
- ✅ Data sopralluogo (campo `sopralluogoData`)
- ✅ Banner verde: "Sopralluogo salvato su Airtable!"

**Offline:**
- ⚠️ Dati salvati in IndexedDB locale
- ⚠️ Banner giallo: "Salvato offline - Verrà sincronizzato..."
- ✅ Sync automatica quando torna rete

---

## 📱 Come Usare (Mobile Test)

### Test su Smartphone Reale:

1. **Apri da mobile:**
   - Chrome/Safari: `https://prisma.solefacilesrl.com`
   - O IP locale: `http://192.168.x.x:5173` (per test dev)

2. **Login**

3. **Vai al tab Sopralluogo** (📸)

4. **GPS:**
   - Permetti accesso posizione quando richiesto
   - GPS si rileva automaticamente

5. **Foto:**
   - Click "Aggiungi Foto"
   - Menu nativo apparirà:
     - **Scatta foto** → Camera si apre
     - **Scegli dalla galleria**
   - Scatta/seleziona multiple foto
   - Preview appare immediatamente

6. **Video:**
   - Click "Aggiungi Video"
   - Menu nativo apparirà:
     - **Registra video** → Camera video si apre
     - **Scegli dalla galleria**
   - Registra/seleziona video
   - Nome e dimensione appaiono

7. **pCloud:**
   - Carica video su pCloud (app separata o browser)
   - Ottieni link condiviso
   - Incolla nel campo "Link pCloud"

8. **Salva:**
   - Click "Salva Sopralluogo"
   - Foto upload automatico (se online)
   - Dati salvati su Airtable

---

## 🗂️ Campi Airtable

### Tabella: `dettagli_impianti` (tblU0P92KEZv9hQsK)

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `sopralluogoFoto` | Attachment | Foto caricate (max 20MB per foto) |
| `linkPCloud` | Single line text / URL | Link video su pCloud |
| `coordinate` | Single line text | GPS "lat,lng" |
| `sopralluogoData` | Date | Data sopralluogo (YYYY-MM-DD) |

**Assicurati che questi campi esistano su Airtable!**

---

## 🧪 Test da Fare

### Test 1: GPS Rilevamento

1. Apri tab Sopralluogo
2. Permetti accesso posizione
3. ✅ Coordinate appaiono nel campo
4. ✅ Banner verde: "Posizione rilevata!"

### Test 2: Upload Foto Desktop

1. Click "Aggiungi Foto"
2. Seleziona 2-3 immagini
3. ✅ Preview appaiono in griglia
4. ✅ Nome e dimensione visibili
5. ✅ Banner: "✅ 3 foto aggiunte"

### Test 3: Rimuovi Foto

1. Click su **X** in una foto
2. ✅ Foto rimossa dalla griglia
3. ✅ Banner: "Foto rimossa"

### Test 4: Upload Video Desktop

1. Click "Aggiungi Video"
2. Seleziona 1 video
3. ✅ Video appare in lista
4. ✅ Nome e dimensione visibili

### Test 5: Link pCloud

1. Scrivi nel campo: `https://pcloud.com/test123`
2. ✅ Campo accetta input
3. ✅ Link salvato quando salvi

### Test 6: Salva Online

**Prerequisiti:**
- ✅ Almeno 1 foto O link pCloud
- ✅ Connessione internet attiva
- ✅ Token Airtable valido in `.env`

**Steps:**
1. Aggiungi foto
2. Click "Salva Sopralluogo"
3. ✅ Banner verde: "Sopralluogo salvato su Airtable!"
4. ✅ Form si svuota dopo 2 secondi
5. ✅ Verifica su Airtable che il record esista

### Test 7: Salva Offline

**Prerequisiti:**
- ✅ Almeno 1 foto O link pCloud
- ✅ Connessione offline (DevTools → Network → Offline)

**Steps:**
1. Aggiungi foto
2. Click "Salva Sopralluogo"
3. ✅ Banner giallo: "Salvato offline - Verrà sincronizzato..."
4. ✅ Dati in IndexedDB (DevTools → Application → IndexedDB → PrismaSolarDB → projects)

### Test 8: Sync Offline → Online

1. Salva sopralluogo offline (come Test 7)
2. Torna online (Network → No throttling)
3. ✅ Dopo 2 secondi: sync automatica parte
4. ✅ Console: "Sincronizzazione in corso..."
5. ✅ Banner verde: "Dati sincronizzati con successo!"
6. ✅ Verifica su Airtable

### Test 9: Mobile Camera (su smartphone)

**Prerequisiti:**
- Smartphone con camera
- Chrome/Safari mobile
- Permessi camera

**Steps:**
1. Apri app su mobile
2. Tab Sopralluogo
3. Click "Aggiungi Foto"
4. Scegli "Scatta foto"
5. ✅ Camera si apre
6. Scatta foto
7. ✅ Foto appare in preview
8. ✅ Foto salvata anche in galleria

### Test 10: Status Indicators

1. ✅ Quando online: Banner verde "🌐 Online"
2. ✅ Quando offline: Banner giallo "📴 Offline"
3. ✅ Contatore: "📸 X foto • 🎥 Y video"
4. ✅ GPS: "📍 GPS rilevato" se presente

---

## 🐛 Troubleshooting

### GPS non funziona

**Problema:** Coordinate non appaiono

**Soluzioni:**
1. Verifica permessi browser (icona lucchetto in URL)
2. HTTPS richiesto per GPS su produzione
3. Localhost funziona anche su HTTP
4. Inserisci coordinate manualmente se necessario

### Foto non si caricano

**Problema:** Errore durante upload

**Soluzioni:**
1. Verifica token Airtable in `.env`
2. Verifica campo `sopralluogoFoto` esiste su Airtable (tipo Attachment)
3. Verifica dimensione foto < 20MB
4. Controlla console per errori API

### Video troppo grandi

**Problema:** Video non si carica

**Soluzione:**
- I video NON vengono caricati automaticamente
- Usa pCloud per video grandi
- Solo il link viene salvato su Airtable

### Button disabilitato

**Problema:** "Salva Sopralluogo" grigio

**Causa:**
- Serve almeno 1 foto O link pCloud
- Aggiungi contenuto per abilitare

### Offline sync non parte

**Problema:** Dati offline non si sincronizzano

**Soluzioni:**
```javascript
// Forza sync da console
const queue = (await import('./src/services/offlineQueue.js')).getOfflineQueue();
await queue.startSync();
```

---

## 📊 Formati Supportati

### Foto
- ✅ JPEG/JPG
- ✅ PNG
- ✅ HEIC (iPhone)
- ✅ WebP
- ⚠️ Max 20 MB per foto (limite Airtable)

### Video
- ✅ MP4
- ✅ MOV (iPhone)
- ✅ WebM
- ⚠️ Upload manuale su pCloud consigliato per video grandi

---

## 🔧 API Reference

### Funzioni principali

```javascript
// Handle photo selection
const handlePhotoSelect = (e) => {
  const files = Array.from(e.target.files);
  // Convert to data URL for preview
  // Add to photos array with metadata
};

// Handle video selection
const handleVideoSelect = (e) => {
  const files = Array.from(e.target.files);
  // Add to videos array with metadata
};

// Upload to Airtable
const uploadToAirtable = async () => {
  // Prepare photo attachments
  // Create record with fields:
  // - sopralluogoData (date)
  // - coordinate (GPS)
  // - linkPCloud (URL)
  // - sopralluogoFoto (attachments)

  // If online: POST to Airtable
  // If offline: Save to IndexedDB
};
```

### Airtable API Call

```javascript
// POST /v0/{baseId}/tblU0P92KEZv9hQsK
{
  "fields": {
    "sopralluogoData": "2025-10-30",
    "coordinate": "45.0703,7.6869",
    "linkPCloud": "https://pcloud.com/...",
    "sopralluogoFoto": [
      { "url": "data:image/jpeg;base64,...", "filename": "foto1.jpg" },
      { "url": "data:image/jpeg;base64,...", "filename": "foto2.jpg" }
    ]
  }
}
```

---

## 📱 Mobile UI Screenshot

```
┌──────────────────────────────────────┐
│ 📸 Sopralluogo Impianto              │
├──────────────────────────────────────┤
│                                      │
│ 📍 Coordinate GPS                    │
│ ┌──────────────────────────────────┐ │
│ │ 45.0703,7.6869                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 📷 Foto Impianto                     │
│ ┌──────────────────────────────────┐ │
│ │ 📸 Aggiungi Foto (Camera/Galleria) │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │ [IMG] │ │ [IMG] │ │ [IMG] │     │
│ │  [X]  │ │  [X]  │ │  [X]  │     │
│ └────────┘ └────────┘ └────────┘    │
│                                      │
│ 🎥 Video Impianto                    │
│ ┌──────────────────────────────────┐ │
│ │ 🎥 Aggiungi Video                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ☁️ Link pCloud                       │
│ ┌──────────────────────────────────┐ │
│ │ https://pcloud.com/...           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 🌐 Online                         │ │
│ │ 📸 3 foto • 🎥 1 video • 📍 GPS   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │     💾 Salva Sopralluogo         │ │
│ └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Checklist Completamento

### Implementazione
- [x] Component Sopralluogo.jsx creato
- [x] GPS automatico implementato
- [x] Upload foto con preview
- [x] Upload video con lista
- [x] Input link pCloud
- [x] Upload Airtable online
- [x] Salvataggio offline (IndexedDB)
- [x] Status indicators (online/offline)
- [x] UI mobile-friendly
- [x] Tab aggiunto in App.jsx

### Testing Desktop
- [ ] GPS rilevamento
- [ ] Upload foto (singola/multipla)
- [ ] Preview foto
- [ ] Rimuovi foto
- [ ] Upload video
- [ ] Link pCloud
- [ ] Salva online
- [ ] Salva offline
- [ ] Sync offline → online

### Testing Mobile
- [ ] GPS su smartphone
- [ ] Camera capture foto
- [ ] Camera capture video
- [ ] Selezione multipla da galleria
- [ ] UI responsive
- [ ] Touch gestures
- [ ] Upload 4G/WiFi
- [ ] Offline mode in montagna

### Airtable
- [ ] Campo `sopralluogoFoto` esiste (Attachment)
- [ ] Campo `linkPCloud` esiste (Single line text)
- [ ] Campo `coordinate` esiste (Single line text)
- [ ] Campo `sopralluogoData` esiste (Date)
- [ ] Token valido in `.env`
- [ ] Record creato correttamente
- [ ] Foto visibili su Airtable

---

## 🚀 Prossimi Step (Opzionali)

### Enhancement 1: Compressione Foto
```javascript
// Comprimi foto prima dell'upload
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});
```

### Enhancement 2: Metadata EXIF
```javascript
// Estrai metadata foto (data, GPS, camera)
import exifr from 'exifr';

const exif = await exifr.parse(file);
console.log('GPS:', exif.latitude, exif.longitude);
console.log('Date:', exif.DateTimeOriginal);
```

### Enhancement 3: Video Preview
```javascript
// Genera thumbnail video
<video src={video.url} controls style={{ width: '100%' }} />
```

### Enhancement 4: Upload Progress
```javascript
// Progress bar per upload
const [uploadProgress, setUploadProgress] = useState(0);

// XMLHttpRequest con progress tracking
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100;
  setUploadProgress(percent);
});
```

---

## 📞 Support

**Problemi?**
- Controlla console browser (F12)
- Verifica `.env` configurato
- Verifica campi Airtable esistono
- Test connessione Airtable

**Domande?**
- Email: solefacilesrl@gmail.com
- Documentazione: `OFFLINE_MODE_TESTING.md`

---

**Versione:** 5.0.0
**Component:** Sopralluogo.jsx
**Status:** ✅ Ready to Test

*Il sopralluogo è pronto per catturare foto e video, anche in montagna senza internet!* 📸🏔️
