# PRISMA Solar - Piano d'Azione Completo
## Gestione Completa del Ciclo Cliente (13 Step)

**Versione**: 3.0 - Workflow Completo
**Data**: 30 Ottobre 2025
**Priorità**: Smartphone-first + Offline-ready

---

## 🎯 Obiettivo

Gestire l'intero ciclo di vita del cliente dall'iniziale richiesta preventivo fino alla manutenzione post-installazione, tutto tramite **smartphone**, con **minimo numero di click**, funzionante **anche offline** (es. in montagna).

---

## 📱 Requisiti Tecnici

### Must Have
- ✅ **Mobile-first**: Ottimizzato per smartphone
- ✅ **Offline-first**: Funziona senza internet, sincronizza dopo
- ✅ **Touch-friendly**: Bottoni grandi, swipe gestures
- ✅ **PWA**: Installabile come app
- ✅ **Camera integration**: Foto/video diretti
- ✅ **GPS tracking**: Coordinate automatiche
- ✅ **Cloud sync**: Airtable quando online

---

## 🗺️ I 13 Step del Workflow

```
1. Richiesta Preventivo          📞 Lead
2. Raccolta Info Iniziali         📋 Dati Base
3. Preventivo Veloce              💨 Quick Quote
4. Sopralluogo                    🏠 Foto + Video
5. Progetto 3D + Render           🎨 Design
6. Preventivo Ufficiale           📄 Offerta Completa
7. Documenti Contratto            📑 Legale
8. Pagamento → Ordine Materiali   💰 Acquisto
9. Materiali → Montaggio          🔧 Installazione
10. Allaccio Enel                 ⚡ Connessione
11. Monitoraggio Remoto           📊 Controllo
12. Manutenzione Ordinaria        🔄 Routine
13. Manutenzione Straordinaria    🚨 Emergenze
```

---

## 🏗️ Architettura Airtable

### Tabelle Necessarie

#### 1. **tblClienti** (dettagli_clienti) - Cliente principale
```javascript
{
  id: "recXXXX",
  nome: "Mario Rossi",
  telefono: "+39 333 1234567",
  email: "mario@example.com",
  indirizzo: "Via Roma 123, Torino",

  // Status workflow
  statusCliente: "preventivo_inviato", // lead, preventivo_veloce,
                                        // sopralluogo, preventivo_ufficiale,
                                        // contratto, installazione, attivo,
                                        // manutenzione

  // Date importanti
  dataPrimoContatto: "2025-10-30",
  ultimaAttivita: "2025-11-15",

  // Documenti
  bolletta: [{ url: "..." }],
  documentiIdentita: [{ url: "..." }],
  documentiContratto: [{ url: "..." }],

  // Links
  progetti: ["recPROJ001"], // Link a Progetti
  manutenzioni: ["recMANUT01"] // Link a Manutenzioni
}
```

#### 2. **tblProgetti** (dettagli_impianti) - Progetto/Impianto
```javascript
{
  id: "recPROJ001",
  cliente: "recXXXX", // Link a Cliente
  nomeProgetto: "Impianto Rossi 6.5kW",

  // Status progetto (13 step)
  step: 3, // Da 1 a 13
  stepNome: "preventivo_veloce",
  dataStep: "2025-11-01",

  // Step 1-3: Preventivi
  preventivoVeloce: { /* dati */ },
  preventivoVeloceData: "2025-11-01",

  // Step 4: Sopralluogo
  sopralluogoData: "2025-11-05",
  sopralluogoFoto: [{ url: "..." }],
  sopralluogoVideo: [{ url: "..." }],
  sopralluogoNote: "Tetto in buone condizioni",
  coordinateGPS: "45.0703,7.6869", // Auto da GPS smartphone
  linkPCloud: "https://pcloud.com/folder/...",

  // Step 5: Render
  render3D: [{ url: "..." }],
  renderData: "2025-11-08",

  // Step 6: Preventivo Ufficiale
  prismaData: '{ ... }', // Tutti i dati del form PRISMA
  preventivoUfficialePDF: [{ url: "..." }],
  preventivoUfficialeData: "2025-11-10",

  // Step 7: Contratto
  contrattoPDF: [{ url: "..." }],
  contrattoFirmatoData: "2025-11-15",

  // Step 8: Pagamento e Ordine
  pagamento1Data: "2025-11-15",
  pagamento1Importo: 8250,
  materialiOrdinatiData: "2025-11-16",
  fornitore: "Solartech",
  numeroOrdine: "ORD-2025-1234",

  // Step 9: Installazione
  materialiArrivatiData: "2025-11-25",
  installazioneIniziData: "2025-11-28",
  installazioneCompletataData: "2025-11-30",
  checklistInstallazione: '{ ... }', // JSON checklist
  fotoInstallazione: [{ url: "..." }],

  // Step 10: Allaccio
  allaccioEnelData: "2025-12-05",
  codicePOD: "IT001E12345678",

  // Step 11: Monitoraggio
  monitoraggioAttivo: true,
  ultimoMonitoraggio: "2025-12-20",
  produzioneOggi: 45.2, // kWh
  alertMonitoraggio: [],

  // Dati tecnici
  potenzaKw: 6.5,
  numeroModuli: 20,
  inverter: "X1-Hybrid 6.0kW",
  batterie: "H5.0 - 5kWh",

  // Economici
  prezzoTotale: 16500,
  compenso: 4500,
  costoMateriali: 10000
}
```

#### 3. **tblManutenzioni** (nuova tabella)
```javascript
{
  id: "recMANUT01",
  cliente: "recXXXX", // Link
  progetto: "recPROJ001", // Link

  // Tipo
  tipo: "ordinaria", // ordinaria, straordinaria
  categoria: "pulizia", // pulizia, controllo, riparazione,
                        // sostituzione, emergenza

  // Dettagli
  descrizione: "Pulizia moduli programmata",
  dataRichiesta: "2025-12-15",
  dataEsecuzione: "2025-12-18",
  dataCompletamento: "2025-12-18",

  // Status
  status: "completata", // richiesta, programmata, in_corso, completata

  // Problema (per straordinarie)
  problema: "Inverter guasto", // null per ordinarie
  gravita: "alta", // bassa, media, alta, critica

  // Intervento
  noteIntervento: "Sostituito inverter in garanzia",
  pezziUsati: ["Inverter X1-Hybrid 6.0kW"],
  costoMateriali: 0, // Garanzia
  costoManodopera: 150,

  // Foto
  fotoPrima: [{ url: "..." }],
  fotoDopo: [{ url: "..." }],

  // Follow-up
  prossimaManutenzioneProgrammata: "2026-06-15"
}
```

#### 4. **tblAttivita** (nuova tabella) - Log di tutte le azioni
```javascript
{
  id: "recACT001",
  cliente: "recXXXX",
  progetto: "recPROJ001", // Opzionale

  tipo: "chiamata", // chiamata, email, sopralluogo, installazione,
                     // manutenzione, pagamento, nota

  descrizione: "Chiamata cliente - conferma sopralluogo",
  data: "2025-11-05T10:30:00",

  // GPS (se azione fatta in loco)
  coordinate: "45.0703,7.6869",
  luogo: "Via Roma 123, Torino",

  // Allegati
  allegati: [{ url: "..." }],

  // Note
  note: "Cliente disponibile giovedì mattina"
}
```

---

## 📱 Nuova Struttura Tab (Mobile-Optimized)

### 🏠 Home / Dashboard
```
┌─────────────────────────────────────────┐
│ 📱 PRISMA Solar                          │
├─────────────────────────────────────────┤
│                                          │
│ 👋 Ciao! Cosa vuoi fare oggi?           │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ➕ Nuovo Cliente                     │ │
│ │ Inizia un nuovo preventivo           │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 Clienti Attivi (8)                │ │
│ │ Gestisci i tuoi clienti              │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 🔧 Installazioni Oggi (2)            │ │
│ │ Mario Rossi • Laura Bianchi          │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 📊 Monitoraggio (15 impianti)        │ │
│ │ 3 alert • Tutto OK                   │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 🔄 Manutenzioni Programmate (4)      │ │
│ │ Prossima: 15 Dic - Pulizia Verdi     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ────────────────────────────────────    │
│ 💰 Entrate Mese: €45.000                │
│ 📊 Progetti Attivi: 12                   │
└─────────────────────────────────────────┘
```

### 📋 Lista Clienti (con filtri per step)
```
┌─────────────────────────────────────────┐
│ 🔍 Cerca cliente...                      │
├─────────────────────────────────────────┤
│ Filtri: [Tutti ▼] [Step ▼] [Data ▼]     │
├─────────────────────────────────────────┤
│                                          │
│ 📞 NUOVI CONTATTI (3)                    │
│ ┌───────────────────────────────────┐   │
│ │ Mario Rossi                       │   │
│ │ ☎️ +39 333 123 4567               │   │
│ │ 📍 Torino • Step 2/13             │   │
│ │ [Continua →]                      │   │
│ └───────────────────────────────────┘   │
│                                          │
│ 🏠 SOPRALLUOGHI (2)                      │
│ ┌───────────────────────────────────┐   │
│ │ Laura Bianchi                     │   │
│ │ ☎️ +39 340 987 6543               │   │
│ │ 📍 Pinerolo • Step 4/13           │   │
│ │ Sopral: Domani 10:00              │   │
│ │ [GPS] [Continua →]                │   │
│ └───────────────────────────────────┘   │
│                                          │
│ 🔧 IN INSTALLAZIONE (1)                  │
│ 💰 PAGAMENTI ATTESI (2)                  │
│ ✅ COMPLETATI (15)                       │
└─────────────────────────────────────────┘
```

### 🔄 Workflow Cliente (13 Step con Progress Bar)
```
┌─────────────────────────────────────────┐
│ ← Mario Rossi                            │
│ ███████⬜⬜⬜⬜⬜⬜ Step 4/13          │
├─────────────────────────────────────────┤
│                                          │
│ ✅ 1. Richiesta Preventivo               │
│    30 Ott 2025 • Tramite: Facebook       │
│                                          │
│ ✅ 2. Info Iniziali                      │
│    31 Ott 2025 • Bolletta acquisita      │
│                                          │
│ ✅ 3. Preventivo Veloce                  │
│    1 Nov 2025 • €16.500 • Inviato       │
│                                          │
│ 🔵 4. Sopralluogo                        │
│    5 Nov 2025 10:00                      │
│    ┌─────────────────────────────┐       │
│    │ [📸 Inizia Sopralluogo]     │       │
│    │ [📍 Naviga su Maps]         │       │
│    │ [☎️ Chiama Cliente]         │       │
│    └─────────────────────────────┘       │
│                                          │
│ ⏸️ 5. Progetto 3D                        │
│ ⏸️ 6. Preventivo Ufficiale               │
│ ⏸️ 7. Contratto                          │
│ ⏸️ 8. Pagamento e Ordine                 │
│ ⏸️ 9. Installazione                      │
│ ⏸️ 10. Allaccio Enel                     │
│ ⏸️ 11. Monitoraggio                      │
│ ⏸️ 12-13. Manutenzione                   │
│                                          │
│ ────────────────────────────────────    │
│ [📝 Aggiungi Nota] [📁 Documenti]        │
└─────────────────────────────────────────┘
```

---

## 🎯 Implementazione per Step

### **STEP 1: Richiesta Preventivo** 📞

**Cosa Serve:**
- Form veloce per acquisire lead
- Minimal info: nome, telefono, città

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 📞 Nuovo Cliente                         │
├─────────────────────────────────────────┤
│                                          │
│ Nome e Cognome *                         │
│ [Mario Rossi                        ]    │
│                                          │
│ Telefono *                               │
│ [+39 333 123 4567                   ]    │
│                                          │
│ Città                                    │
│ [Torino                             ]    │
│                                          │
│ Come ci ha trovato?                      │
│ ○ Facebook  ○ Google  ○ Passaparola      │
│                                          │
│ [💾 Salva e Continua]                    │
└─────────────────────────────────────────┘
```

**Backend:**
- Crea record in `tblClienti`
- Status: `"lead"`
- Step: `1`

---

### **STEP 2: Raccolta Info Iniziali** 📋

**Cosa Serve:**
- Dati completi cliente
- Upload bolletta
- Indirizzo preciso

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 📋 Dati Cliente                          │
├─────────────────────────────────────────┤
│                                          │
│ Email                                    │
│ [mario.rossi@example.com            ]    │
│                                          │
│ Indirizzo Impianto *                     │
│ [Via Roma 123                       ]    │
│ [Torino                             ]    │
│ [10121                              ]    │
│ [📍 Usa posizione GPS]                   │
│                                          │
│ Codice Fiscale                           │
│ [RSSMRA80A01L219K                   ]    │
│                                          │
│ Bolletta Elettrica *                     │
│ [📷 Scatta Foto] [📁 Carica File]        │
│ ✅ bolletta.pdf (2.3 MB)                 │
│                                          │
│ Note                                     │
│ [Cliente interessato a batterie     ]    │
│                                          │
│ [💾 Salva e Vai al Preventivo]           │
└─────────────────────────────────────────┘
```

**Backend:**
- Aggiorna `tblClienti`
- Upload bolletta (Airtable attachment)
- Step: `2`

---

### **STEP 3: Preventivo Veloce** 💨

**Cosa Serve:**
- Calcolo rapido basato su bolletta
- Stima potenza necessaria
- Range di prezzo

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 💨 Preventivo Veloce                     │
├─────────────────────────────────────────┤
│                                          │
│ Consumo Annuo (da bolletta)              │
│ [8500] kWh/anno                          │
│                                          │
│ Potenza Consigliata                      │
│ 🟢 6.5 kW (20 moduli)                    │
│                                          │
│ Stima Prezzo                             │
│ 💰 €15.000 - €18.000                     │
│    (IVA inclusa)                         │
│                                          │
│ Risparmio Stimato                        │
│ 📊 ~€1.500/anno                          │
│ 💡 Rientro in 10 anni                    │
│                                          │
│ Include:                                 │
│ ✓ 20 moduli fotovoltaici                │
│ ✓ Inverter 6kW                          │
│ ✓ Sistema di montaggio                  │
│ ✓ Installazione completa                │
│                                          │
│ Vuoi aggiungere batterie?                │
│ [Sì, 5kWh +€4.500] [No]                 │
│                                          │
│ [📄 Invia Preventivo via WhatsApp]       │
│ [📧 Invia via Email]                     │
└─────────────────────────────────────────┘
```

**Backend:**
- Crea record in `tblProgetti`
- Salva `preventivoVeloce`
- Link a cliente
- Step: `3`

**Azione:**
- Genera PDF semplice
- Invia via WhatsApp o Email

---

### **STEP 4: Sopralluogo** 🏠

**Cosa Serve:**
- Checklist sopralluogo
- Camera per foto/video
- GPS automatico
- Upload diretto a pCloud
- Funziona OFFLINE

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 🏠 Sopralluogo - Mario Rossi             │
│ 📍 Via Roma 123, Torino                  │
│ 🕐 5 Nov 2025 10:30                      │
├─────────────────────────────────────────┤
│                                          │
│ GPS: 45.0703, 7.6869 ✅                  │
│ [📍 Aggiorna Posizione]                  │
│                                          │
│ ──────── FOTO ────────                   │
│                                          │
│ Tetto (Vista generale)                   │
│ [📷 Scatta] ✅ 4 foto                    │
│                                          │
│ Quadro Elettrico                         │
│ [📷 Scatta] ✅ 2 foto                    │
│                                          │
│ Contatore                                │
│ [📷 Scatta] ✅ 1 foto                    │
│                                          │
│ ──────── VIDEO ────────                  │
│                                          │
│ Video Drone                              │
│ [🎥 Registra] ✅ drone.mp4 (145 MB)     │
│                                          │
│ ──────── MISURE ────────                 │
│                                          │
│ Larghezza Tetto                          │
│ [12.5] metri                             │
│                                          │
│ Lunghezza Tetto                          │
│ [8.0] metri                              │
│                                          │
│ Orientamento                             │
│ ○ Sud  ● Sud-Ovest  ○ Ovest             │
│                                          │
│ Inclinazione                             │
│ [30] gradi                               │
│                                          │
│ Tipo Copertura                           │
│ ● Tegole  ○ Lamiera  ○ Guaina           │
│                                          │
│ ──────── NOTE ────────                   │
│                                          │
│ [Tetto in ottime condizioni.         ]   │
│ [Nessun ombreggiamento.              ]   │
│ [Cliente ha chiesto anche wallbox.   ]   │
│                                          │
│ ──────── AZIONI ────────                 │
│                                          │
│ Status Upload: ⏳ 7/8 file               │
│ [☁️ Carica su pCloud]                    │
│                                          │
│ [✅ Completa Sopralluogo]                │
└─────────────────────────────────────────┘
```

**Funzionalità Offline:**
```javascript
// Service Worker per gestione offline
// Salva foto/video in IndexedDB
// Quando torna online, sincronizza

const handlePhotoCapture = async (photo) => {
  // Salva locale
  await saveToIndexedDB('photos', {
    projectId: 'recPROJ001',
    photo: photo,
    timestamp: Date.now(),
    synced: false
  });

  // Mostra in UI
  updateUI();

  // Prova upload se online
  if (navigator.onLine) {
    await syncPhotos();
  }
};

const syncPhotos = async () => {
  const unsyncedPhotos = await getUnsyncedPhotos();

  for (const photo of unsyncedPhotos) {
    try {
      // Upload a Airtable
      await uploadToAirtable(photo);

      // Upload a pCloud (opzionale)
      await uploadToPCloud(photo);

      // Marca come sincronizzato
      await markAsSynced(photo.id);
    } catch (error) {
      console.log('Sync failed, retry later');
    }
  }
};

// Auto-sync quando torna online
window.addEventListener('online', () => {
  syncPhotos();
});
```

**Backend:**
- Aggiorna `tblProgetti`
- Salva foto in Airtable attachments
- Salva coordinate GPS
- Link pCloud (se usato)
- Step: `4`

---

### **STEP 5: Progetto 3D + Render** 🎨

**Cosa Serve:**
- Link a software 3D esterno (es. SketchUp, PVSyst)
- Upload render finali

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 🎨 Render 3D                             │
├─────────────────────────────────────────┤
│                                          │
│ Foto Sopralluogo                         │
│ [📸 Visualizza 7 foto]                   │
│                                          │
│ Video Drone                              │
│ [🎥 Guarda video]                        │
│                                          │
│ ────────────────────────────────────    │
│                                          │
│ Render Completati                        │
│ [📁 Carica Render]                       │
│                                          │
│ ✅ render_vista1.jpg                     │
│ ✅ render_vista2.jpg                     │
│ ✅ render_vista_drone.jpg                │
│                                          │
│ [✅ Render Completati]                   │
└─────────────────────────────────────────┘
```

**Backend:**
- Upload render in `tblProgetti`
- Step: `5`

---

### **STEP 6: Preventivo Ufficiale** 📄

**Cosa Serve:**
- Form PRISMA completo (esistente)
- Genera PDF con render
- Include tutti i dettagli

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 📄 Preventivo Ufficiale                  │
├─────────────────────────────────────────┤
│                                          │
│ Cliente: Mario Rossi                     │
│ Dati già acquisiti ✅                    │
│                                          │
│ [🏠 Configura Tetto]                     │
│ [⚡ Scegli Apparecchiature]              │
│ [💰 Calcola Costi]                       │
│ [📊 Parametri Economici]                 │
│                                          │
│ Render da includere:                     │
│ ✅ 3 render selezionati                  │
│                                          │
│ [📄 Genera PDF Completo]                 │
│ [📧 Invia al Cliente]                    │
└─────────────────────────────────────────┘
```

**Backend:**
- Usa form PRISMA esistente
- Salva `prismaData` completo
- Genera PDF con render
- Step: `6`

---

### **STEP 7: Documenti Contratto** 📑

**Cosa Serve:**
- Checklist documenti necessari
- Upload documenti cliente
- Genera contratto

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 📑 Documenti Contratto                   │
├─────────────────────────────────────────┤
│                                          │
│ Cliente ha accettato! 🎉                 │
│                                          │
│ Documenti Necessari:                     │
│                                          │
│ ✅ Carta d'Identità                      │
│    [📷] documento.pdf                    │
│                                          │
│ ✅ Codice Fiscale                        │
│    [📷] cf.pdf                           │
│                                          │
│ ✅ Visura Catastale                      │
│    [📁 Carica] ⏸️                        │
│                                          │
│ ✅ Atto di Proprietà                     │
│    [📁 Carica] ⏸️                        │
│                                          │
│ ✅ Bolletta Elettrica                    │
│    Già acquisita ✅                      │
│                                          │
│ ✅ IBAN per Rimborsi                     │
│    [IT60X0542811101000000123456     ]    │
│                                          │
│ ────────────────────────────────────    │
│                                          │
│ [📄 Genera Contratto]                    │
│                                          │
│ Contratto generato:                      │
│ ✅ contratto_rossi.pdf                   │
│                                          │
│ [📧 Invia per Firma Digitale]            │
│ [📝 Firma in Presenza]                   │
└─────────────────────────────────────────┘
```

**Backend:**
- Upload documenti in `tblClienti`
- Genera contratto PDF
- Step: `7`

---

### **STEP 8: Pagamento → Ordine Materiali** 💰

**Cosa Serve:**
- Track pagamenti
- Gestione ordini materiali
- Fornitori

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 💰 Pagamenti e Ordini                    │
├─────────────────────────────────────────┤
│                                          │
│ ──── PAGAMENTI ────                      │
│                                          │
│ Totale Contratto: €16.500                │
│                                          │
│ ✅ Acconto 50% - €8.250                  │
│    Ricevuto: 15 Nov 2025                 │
│    [📄 Ricevuta]                         │
│                                          │
│ ⏸️ 2° Pagamento 40% - €6.600             │
│    Previsto: All'inizio lavori           │
│    [✅ Segna come Ricevuto]              │
│                                          │
│ ⏸️ Saldo 10% - €1.650                    │
│    Previsto: A collaudo                  │
│                                          │
│ ──── ORDINE MATERIALI ────               │
│                                          │
│ Stato: ⏸️ Da ordinare                    │
│                                          │
│ Fornitore                                │
│ [Solartech Italia               ▼]       │
│                                          │
│ Materiali:                               │
│ • 20x Modulo 325W                        │
│ • 1x Inverter X1-Hybrid 6kW              │
│ • 1x Batteria 5kWh                       │
│ • Kit montaggio tegole                   │
│ • Cavi e accessori                       │
│                                          │
│ Costo Materiali: €10.000                 │
│                                          │
│ Numero Ordine                            │
│ [ORD-2025-1234                      ]    │
│                                          │
│ [📦 Conferma Ordine]                     │
│                                          │
│ Ordine confermato! ✅                    │
│ Consegna prevista: 25 Nov 2025           │
│                                          │
│ [✅ Materiali Arrivati?]                 │
└─────────────────────────────────────────┘
```

**Backend:**
- Traccia pagamenti in `tblProgetti`
- Salva dettagli ordine
- Step: `8`

---

### **STEP 9: Installazione** 🔧

**Cosa Serve:**
- Checklist installazione (come definito prima)
- Camera per foto
- Lavora OFFLINE
- Firma cliente

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 🔧 Installazione - Mario Rossi           │
│ ████████⬜⬜⬜⬜⬜ 65% (29/45)         │
├─────────────────────────────────────────┤
│                                          │
│ 📸 FOTO INIZIALI                         │
│ ✅ 3 foto caricate                       │
│                                          │
│ 🏠 PREPARAZIONE TETTO                    │
│ ✅ Tetto ispezionato                     │
│ ✅ Struttura verificata                  │
│ ✅ Protezioni installate                 │
│                                          │
│ 🔧 SISTEMA MONTAGGIO                     │
│ ✅ Guide installate (12/12)              │
│ ✅ Staffe fissate (16/16)                │
│ ☐ Impermeabilizzazione                   │
│                                          │
│ [Continua Installazione →]               │
│                                          │
│ 💾 Ultimo salvataggio: 2 min fa          │
│ 📶 Offline - Sincronizzerà dopo          │
└─────────────────────────────────────────┘
```

**Backend:**
- Salva stato checklist in `tblProgetti`
- Upload foto
- Funziona offline con sync
- Step: `9`

---

### **STEP 10: Allaccio Enel** ⚡

**Cosa Serve:**
- Data allaccio
- Codice POD
- Documenti Enel

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ ⚡ Allaccio Enel                         │
├─────────────────────────────────────────┤
│                                          │
│ Installazione Completata! ✅              │
│ Data: 30 Nov 2025                        │
│                                          │
│ ──── ALLACCIO RETE ────                  │
│                                          │
│ Data Richiesta Allaccio                  │
│ [1 Dic 2025                         ]    │
│                                          │
│ Data Allaccio Effettivo                  │
│ [5 Dic 2025                         ]    │
│                                          │
│ Codice POD                               │
│ [IT001E12345678                     ]    │
│                                          │
│ Tecnico Enel                             │
│ [Giovanni Bianchi                   ]    │
│ [📞 +39 011 1234567]                     │
│                                          │
│ Documenti Allaccio                       │
│ [📁 Carica] ✅ verbale_allaccio.pdf      │
│                                          │
│ [✅ Allaccio Completato]                 │
│                                          │
│ 🎉 Impianto Attivo!                      │
│ [▶️ Avvia Monitoraggio]                  │
└─────────────────────────────────────────┘
```

**Backend:**
- Salva data allaccio
- Codice POD
- Step: `10`

---

### **STEP 11: Monitoraggio Remoto** 📊

**Cosa Serve:**
- Dashboard produzione
- Alert automatici
- Log prestazioni

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 📊 Monitoraggio - Impianto Rossi         │
│ 🟢 Tutto OK                              │
├─────────────────────────────────────────┤
│                                          │
│ ──── OGGI ────                           │
│ ☀️ Produzione: 45.2 kWh                  │
│ 💰 Guadagno: €7.20                       │
│ 🔋 Batteria: 80%                         │
│                                          │
│ ──── QUESTO MESE ────                    │
│ ⚡ Prodotto: 890 kWh                     │
│ 💰 Guadagno: €142                        │
│ 📈 vs Mese Scorso: +12%                  │
│                                          │
│ ──── ALERT ────                          │
│ 🟢 Nessun problema                       │
│                                          │
│ ──── GRAFICO ────                        │
│ [Grafico produzione ultimi 7 giorni]     │
│                                          │
│ ──── AZIONI ────                         │
│ [📞 Chiama Cliente]                      │
│ [📧 Invia Report]                        │
│ [🔄 Programma Manutenzione]              │
│                                          │
│ Prossimo Controllo: 15 Dic 2025          │
└─────────────────────────────────────────┘
```

**Backend:**
- Crea dashboard dati (da API inverter)
- Alert system
- Step: `11`

---

### **STEP 12: Manutenzione Ordinaria** 🔄

**Cosa Serve:**
- Calendario manutenzioni
- Checklist controlli
- Report cliente

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 🔄 Manutenzione Ordinaria                │
├─────────────────────────────────────────┤
│                                          │
│ ──── PROGRAMMATE ────                    │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Mario Rossi - Pulizia Moduli      │   │
│ │ 📅 15 Dic 2025                    │   │
│ │ ⏰ 09:00                          │   │
│ │ [Inizia Manutenzione →]          │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Laura Bianchi - Controllo Annuale │   │
│ │ 📅 20 Dic 2025                    │   │
│ │ ⏰ 14:00                          │   │
│ │ [📍 Naviga] [☎️ Chiama]          │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ──── NUOVA MANUTENZIONE ────             │
│ [➕ Programma Nuova]                     │
└─────────────────────────────────────────┘

──────────────────────────────────────────

│ 🔄 Manutenzione - Mario Rossi            │
│ Pulizia Moduli                           │
├─────────────────────────────────────────┤
│                                          │
│ ☐ Pulizia moduli (20 pz)                │
│ ☐ Controllo serraggio viti              │
│ ☐ Verifica cavi                         │
│ ☐ Test produzione                       │
│ ☐ Pulizia inverter                      │
│ ☐ Check batteria                        │
│                                          │
│ 📸 Foto Prima                            │
│ [📷 Scatta]                              │
│                                          │
│ 📸 Foto Dopo                             │
│ [📷 Scatta]                              │
│                                          │
│ 📝 Note                                  │
│ [Tutto in ordine, produzione OK     ]    │
│                                          │
│ Prossima Manutenzione                    │
│ [15 Giu 2026] (6 mesi)                   │
│                                          │
│ [✅ Completa Manutenzione]               │
│ [📧 Invia Report a Cliente]              │
└─────────────────────────────────────────┘
```

**Backend:**
- Crea record in `tblManutenzioni`
- Tipo: `ordinaria`
- Step: `12`

---

### **STEP 13: Manutenzione Straordinaria** 🚨

**Cosa Serve:**
- Alert da monitoraggio
- Gestione emergenze
- Track riparazioni

**UI Mobile:**
```
┌─────────────────────────────────────────┐
│ 🚨 Manutenzione Straordinaria            │
├─────────────────────────────────────────┤
│                                          │
│ ──── ALERT ATTIVI ────                   │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ 🔴 Mario Rossi                    │   │
│ │ Inverter non risponde             │   │
│ │ 📅 Oggi 08:30                     │   │
│ │ [Gestisci Emergenza →]           │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ 🟡 Laura Bianchi                  │   │
│ │ Produzione ridotta -30%           │   │
│ │ 📅 Ieri                           │   │
│ │ [Programma Controllo]            │   │
│ └───────────────────────────────────┘   │
│                                          │
│ [➕ Nuova Richiesta Cliente]             │
└─────────────────────────────────────────┘

──────────────────────────────────────────

│ 🚨 Intervento - Mario Rossi              │
│ Inverter non risponde                    │
├─────────────────────────────────────────┤
│                                          │
│ Problema Riportato                       │
│ [Inverter spento, display nero      ]    │
│                                          │
│ Gravità                                  │
│ ○ Bassa  ○ Media  ● Alta  ○ Critica     │
│                                          │
│ Data Intervento                          │
│ [Oggi - 30 Nov 2025             ▼]       │
│                                          │
│ ──── DIAGNOSI ────                       │
│                                          │
│ Foto Problema                            │
│ [📷 Scatta] ✅ 3 foto                    │
│                                          │
│ Causa Identificata                       │
│ [Scheda di controllo guasta         ]    │
│                                          │
│ ──── RIPARAZIONE ────                    │
│                                          │
│ Azione Eseguita                          │
│ ● Sostituzione componente                │
│ ○ Riparazione                           │
│ ○ Reset/Riconfigurazione                │
│                                          │
│ Componente Sostituito                    │
│ [Scheda controllo inverter          ]    │
│                                          │
│ In Garanzia?                             │
│ ● Sì  ○ No                              │
│                                          │
│ Costo Materiale                          │
│ [0] € (garanzia)                         │
│                                          │
│ Costo Manodopera                         │
│ [150] €                                  │
│                                          │
│ Tempo Intervento                         │
│ [2] ore                                  │
│                                          │
│ Foto Riparazione                         │
│ [📷 Scatta] ✅ 2 foto                    │
│                                          │
│ ──── TEST ────                           │
│                                          │
│ ☑️ Inverter riacceso                     │
│ ☑️ Produzione ripristinata               │
│ ☑️ Tutti i parametri OK                  │
│                                          │
│ Note                                     │
│ [Problema risolto. Inverter ora      ]   │
│ [funziona correttamente.             ]   │
│                                          │
│ [✅ Chiudi Intervento]                   │
│ [📧 Invia Report a Cliente]              │
└─────────────────────────────────────────┘
```

**Backend:**
- Crea record in `tblManutenzioni`
- Tipo: `straordinaria`
- Track costi e tempi
- Step: `13`

---

## 🔄 Sistema di Sincronizzazione Offline

### Service Worker Implementation

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'prisma-v1';
const OFFLINE_QUEUE = 'offline-queue';

// Cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/main.js',
        '/assets/style.css',
        // ... other assets
      ]);
    })
  );
});

// Handle offline requests
self.addEventListener('fetch', (event) => {
  // API calls
  if (event.request.url.includes('api.airtable.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Se offline, salva in coda
          return queueRequest(event.request);
        })
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

const syncOfflineData = async () => {
  const queue = await getOfflineQueue();

  for (const request of queue) {
    try {
      await fetch(request.url, request.options);
      await removeFromQueue(request.id);
    } catch (error) {
      console.log('Sync failed for request', request.id);
    }
  }
};
```

### Offline Storage

```javascript
// offlineManager.js
import { openDB } from 'idb';

const DB_NAME = 'prisma-offline';
const DB_VERSION = 1;

class OfflineManager {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store per foto
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        }

        // Store per dati form
        if (!db.objectStoreNames.contains('formData')) {
          db.createObjectStore('formData', { keyPath: 'id' });
        }

        // Store per azioni pendenti
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
  }

  // Salva foto offline
  async savePhoto(projectId, photoBlob, metadata) {
    const photo = {
      projectId,
      blob: photoBlob,
      metadata,
      timestamp: Date.now(),
      synced: false
    };

    await this.db.add('photos', photo);
    return photo;
  }

  // Salva dati form offline
  async saveFormData(formId, data) {
    const formData = {
      id: formId,
      data: data,
      timestamp: Date.now(),
      synced: false
    };

    await this.db.put('formData', formData);
  }

  // Ottieni elementi non sincronizzati
  async getUnsyncedItems() {
    const photos = await this.db.getAll('photos');
    const forms = await this.db.getAll('formData');

    return {
      photos: photos.filter(p => !p.synced),
      forms: forms.filter(f => !f.synced)
    };
  }

  // Sincronizza con Airtable
  async syncWithAirtable() {
    if (!navigator.onLine) {
      console.log('Offline - sync skipped');
      return;
    }

    const unsynced = await this.getUnsyncedItems();

    // Sync photos
    for (const photo of unsynced.photos) {
      try {
        await uploadPhotoToAirtable(photo);
        photo.synced = true;
        await this.db.put('photos', photo);
      } catch (error) {
        console.error('Photo sync failed', error);
      }
    }

    // Sync form data
    for (const form of unsynced.forms) {
      try {
        await updateAirtableRecord(form);
        form.synced = true;
        await this.db.put('formData', form);
      } catch (error) {
        console.error('Form sync failed', error);
      }
    }
  }
}

export const offlineManager = new OfflineManager();
```

---

## 📅 Piano di Implementazione (8 settimane)

```
Settimana 1-2: Foundation + Step 1-3
├─ Giorno 1-3: Setup offline system (Service Worker, IndexedDB)
├─ Giorno 4-5: Home/Dashboard mobile-first
├─ Giorno 6-7: Step 1-2 (Lead + Dati cliente)
└─ Giorno 8-10: Step 3 (Preventivo veloce)

Settimana 3: Step 4 (Sopralluogo) + Offline
├─ Giorno 1-2: UI sopralluogo mobile
├─ Giorno 3-4: Camera + GPS integration
├─ Giorno 5: Offline storage
└─ Giorno 6-7: Sync system + test montagna

Settimana 4: Step 5-7 (Render, Preventivo, Contratto)
├─ Giorno 1-2: Upload render + Step 5
├─ Giorno 3-4: Preventivo ufficiale (usa PRISMA esistente)
└─ Giorno 5-7: Contratto + documenti

Settimana 5: Step 8-9 (Pagamenti, Installazione)
├─ Giorno 1-2: Tracking pagamenti
├─ Giorno 3-4: Ordine materiali
└─ Giorno 5-7: Checklist installazione (offline-ready)

Settimana 6: Step 10-11 (Allaccio, Monitoraggio)
├─ Giorno 1-2: Allaccio Enel
├─ Giorno 3-5: Dashboard monitoraggio
└─ Giorno 6-7: Alert system

Settimana 7: Step 12-13 (Manutenzioni)
├─ Giorno 1-3: Manutenzione ordinaria
├─ Giorno 4-5: Manutenzione straordinaria
└─ Giorno 6-7: Testing completo

Settimana 8: Polish + PWA + Testing
├─ Giorno 1-2: PWA installation
├─ Giorno 3-4: Performance optimization
├─ Giorno 5: Testing offline in montagna
└─ Giorno 6-7: Bug fixes + deploy
```

---

## 🎯 Checklist Funzionalità Chiave

### Must Have (Priorità 1)
- [x] Mobile-first UI
- [x] Offline mode (foto, checklist)
- [x] Background sync
- [x] Camera integration
- [x] GPS automatico
- [x] PWA installabile
- [x] Tutti i 13 step del workflow
- [x] Airtable sync

### Should Have (Priorità 2)
- [ ] WhatsApp integration (invio PDF)
- [ ] Notifiche push
- [ ] Export Excel/CSV
- [ ] Backup automatico
- [ ] Multi-progetto view

### Nice to Have (Priorità 3)
- [ ] Firma digitale integrata
- [ ] OCR bollette (auto-estrazione dati)
- [ ] Template personalizzabili
- [ ] Dashboard analytics avanzato

---

## 📱 Progressive Web App (PWA)

### manifest.json
```json
{
  "name": "PRISMA Solar",
  "short_name": "PRISMA",
  "description": "Gestione completa impianti fotovoltaici",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#3b82f6",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "orientation": "portrait"
}
```

### Install Prompt
```javascript
// Mostra prompt installazione
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Mostra bottone "Installa App"
  showInstallButton();
});

const installApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('App installata!');
  }

  deferredPrompt = null;
};
```

---

## 🚀 Launch Day Checklist

### Pre-Launch
- [ ] Tutti i 13 step funzionanti
- [ ] Test offline completo
- [ ] Test in montagna (no signal)
- [ ] PWA installata e testata
- [ ] Backup Airtable configurato
- [ ] Tutorial video registrato

### Launch
- [ ] Deploy production
- [ ] Installa PWA su tuo smartphone
- [ ] Test primo cliente reale
- [ ] Monitor errori

### Post-Launch
- [ ] Raccogli feedback
- [ ] Fix bug urgenti
- [ ] Ottimizzazioni performance

---

**Versione**: 3.0 - Workflow Completo Mobile-First Offline-Ready
**Creato**: 30 Ottobre 2025
**Target**: Gestione completa 13-step su smartphone
**Offline**: ✅ Funziona in montagna senza rete

---

*Tutto quello che ti serve, sempre a portata di smartphone, anche senza internet! 📱⚡🏔️*
