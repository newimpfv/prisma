# PRISMA Solar - Simplified Single-User Roadmap

**Target User**: Single operator (in-house tool)
**Version**: 2.0 - Simplified for solo use
**Date**: 2025-10-30

---

## 🎯 Vision (Simplified)

Transform PRISMA into a **complete solo workflow tool** covering:
1. Client database
2. Quote generation (existing)
3. **Contract generation** (NEW)
4. **On-site installation checklist** (NEW)
5. Project tracking

**Key Changes from Original Roadmap:**
- ❌ Remove team collaboration features
- ❌ Remove task assignment to others
- ❌ Remove team views and permissions
- ✅ Add contract management
- ✅ Add installation checklist for field work
- ✅ Simplified workflow for one person

---

## 🗂️ New Tab Structure (Simplified)

```
Current (9 tabs):
1. 👥 Gestione Clienti - Basic session management
2. 👤 Cliente e Struttura
3. 🏠 Configurazione Tetto
4. ⚡ Apparecchiature
5. 💰 Costi
6. 📊 Energia ed Economia
7. 📋 Preventivo
8. ✏️ Personalizzazione
9. 📄 Risultati ed Export

Proposed (11 tabs):
1. 🏠 Home/Dashboard          [NEW] - Quick overview
2. 🗂️ Database Clienti        [NEW] - Full client list & search
3. 👤 Dati Cliente            [EXISTING - Enhanced]
4. 🏠 Configurazione Tetto    [EXISTING]
5. ⚡ Apparecchiature         [EXISTING]
6. 💰 Costi                   [EXISTING]
7. 📊 Energia ed Economia     [EXISTING]
8. 📋 Preventivo              [EXISTING]
9. 📄 Contratto               [NEW] - Contract generation
10. ✅ Checklist Installazione [NEW] - On-site checklist
11. 📤 Esporta                [EXISTING]
```

---

## 📋 Phase 1: Client Database (1 week)
**Goal**: Stop re-entering client data every time

### Features
1. **Client Database Tab** (🗂️)
   - List all clients from Airtable
   - Search by name, email, phone, address
   - Click to view/edit
   - Quick actions: New Quote, View Projects

2. **Enhanced Client Form** (👤)
   - All required fields for contracts
   - Auto-save to Airtable
   - Load existing client data
   - Duplicate detection

3. **Quick Client Selector**
   - Dropdown at top of app: "Select Client"
   - Loads all their data
   - Shows their previous quotes

### Implementation
```
Week 1:
Day 1-2: Create clientService.js + client database view
Day 3-4: Enhance client form with all fields
Day 5-7: Test, polish, deploy
```

---

## 📋 Phase 2: Contract Management (1 week)
**Goal**: Generate professional installation contracts

### New Tab: 📄 Contratto

**What You Need in Contract:**
```
Standard Solar Installation Contract Sections:

1. PARTIES
   - Client: [Full Name, Tax Code, Address]
   - Company: SoleFacile S.r.l.

2. INSTALLATION DETAILS
   - Location: [Installation Address]
   - System Specs: [Total kW, # Modules, Equipment List]
   - Installation Date: [Planned Date]

3. PRICE & PAYMENT
   - Total Price: €[Amount] + IVA
   - Payment Schedule:
     - 50% on contract signing
     - 40% on installation start
     - 10% on completion
   - Payment Method: Bank Transfer to IBAN

4. WORK SCOPE
   ✅ Solar panel installation ([X] modules)
   ✅ Inverter installation ([Brand/Model])
   ✅ Electrical wiring and connections
   ✅ Roof mounting system
   ✅ Grid connection
   ✅ Documentation and permits
   ✅ Testing and commissioning

5. TIMELINE
   - Start Date: [Date]
   - Expected Completion: [Date]
   - Warranty Period: [Years]

6. RESPONSIBILITIES
   Client Responsibilities:
   - Provide site access
   - Ensure permits
   - Pay per schedule

   Company Responsibilities:
   - Professional installation
   - Quality materials
   - Meet timeline
   - Provide warranty

7. WARRANTY
   - Equipment: [Manufacturer warranty]
   - Installation: [Years] years
   - Maintenance: [Terms]

8. SIGNATURES
   Client: _____________  Date: ______
   Company: ____________  Date: ______
```

### Contract Template Fields

**New Fields Needed in FormContext:**
```javascript
const [contractData, setContractData] = useState({
  // Dates
  contractDate: '',
  startDate: '',
  completionDate: '',

  // Pricing (auto-calculated from quote)
  totalPrice: 0,
  ivaAmount: 0,
  totalWithIva: 0,

  // Payment schedule (from quote)
  payment1Percent: 50,
  payment1Amount: 0,
  payment2Percent: 40,
  payment2Amount: 0,
  payment3Percent: 10,
  payment3Amount: 0,

  // Work scope (checkboxes)
  includePanelInstallation: true,
  includeInverterInstallation: true,
  includeWiring: true,
  includeMounting: true,
  includeGridConnection: true,
  includeDocumentation: true,
  includeTesting: true,

  // Custom work items
  customWorkItems: [],

  // Warranty
  equipmentWarrantyYears: 25,
  installationWarrantyYears: 10,
  maintenanceTerms: '',

  // Legal
  agreedTerms: false,
  clientSignature: '',
  clientSignatureDate: '',
  companySignature: '',
  companySignatureDate: ''
});
```

### Contract Form Layout
```
┌─────────────────────────────────────────┐
│ 📄 Contratto di Installazione           │
├─────────────────────────────────────────┤
│                                          │
│ CLIENT INFO (Auto-filled from client)   │
│ ├─ Name, Address, Tax Code, Email       │
│                                          │
│ INSTALLATION INFO (From quote)          │
│ ├─ Address, System Size, Equipment      │
│                                          │
│ PRICING (Auto-calculated)               │
│ ├─ Subtotal: €[X]                       │
│ ├─ IVA (10%): €[X]                      │
│ ├─ TOTAL: €[X]                          │
│                                          │
│ PAYMENT SCHEDULE                         │
│ ├─ [50%] Payment 1: €[X] - On Signing  │
│ ├─ [40%] Payment 2: €[X] - On Start    │
│ └─ [10%] Payment 3: €[X] - On Complete │
│                                          │
│ TIMELINE                                 │
│ ├─ Start Date: [Date Picker]            │
│ └─ Completion: [Date Picker]            │
│                                          │
│ WORK SCOPE                               │
│ ✅ Panel installation (20 modules)      │
│ ✅ Inverter installation (X1-Hybrid)    │
│ ✅ Electrical connections                │
│ ✅ Mounting system (Tegole)             │
│ ✅ Grid connection                       │
│ ✅ Permits and documentation            │
│ ✅ Testing and commissioning            │
│ + Add Custom Item                        │
│                                          │
│ WARRANTY                                 │
│ ├─ Equipment: [25] years                │
│ ├─ Installation: [10] years             │
│ └─ Maintenance: [Text Area]             │
│                                          │
│ ADDITIONAL TERMS                         │
│ [Rich Text Editor]                       │
│                                          │
│ ────────────────────────────────────    │
│ [Preview Contract] [Generate PDF]        │
└─────────────────────────────────────────┘
```

### Contract PDF Template
**File**: `/public/templates/CONTRATTO.html` (create new)

Similar to PRISMA.html but for contract layout.

---

## 📋 Phase 3: Installation Checklist (3 days)
**Goal**: Checklist to use while on the roof

### New Tab: ✅ Checklist Installazione

**Use Case:**
You're on the client's roof with your tablet/phone. You need to check off what's done.

### Checklist Sections

```
┌─────────────────────────────────────────┐
│ ✅ Checklist Installazione               │
│ Cliente: [Mario Rossi]                   │
│ Data: [2025-11-15]                       │
├─────────────────────────────────────────┤
│                                          │
│ 📸 FOTO INIZIALI                         │
│ ☐ Foto tetto prima installazione        │
│ ☐ Foto area di lavoro                   │
│ ☐ Foto quadro elettrico esistente       │
│ [Upload Photos]                          │
│                                          │
│ 🏠 PREPARAZIONE TETTO                    │
│ ☐ Tetto ispezionato e pulito            │
│ ☐ Struttura verificata (capacità carico)│
│ ☐ Accesso sicuro predisposto            │
│ ☐ Protezioni anti-caduta installate     │
│                                          │
│ 🔧 SISTEMA DI MONTAGGIO                  │
│ ☐ Guide installate (n° __/__)           │
│ ☐ Staffe fissate (n° __/__)             │
│ ☐ Impermeabilizzazione verificata       │
│ ☐ Allineamento controllato              │
│                                          │
│ ⚡ MODULI FOTOVOLTAICI                   │
│ ☐ Moduli posizionati (n° __/20)         │
│ ☐ Moduli fissati e bloccati             │
│ ☐ Cavi DC collegati                     │
│ ☐ Polarità verificata                   │
│ ☐ Diodi di bypass controllati           │
│                                          │
│ 🔌 INVERTER                              │
│ ☐ Inverter montato a parete             │
│ ☐ Cavi DC collegati a inverter          │
│ ☐ Cavi AC collegati a quadro            │
│ ☐ Messa a terra collegata               │
│ ☐ Comunicazione Wi-Fi/LAN configurata   │
│                                          │
│ 🔋 BATTERIE (se presenti)                │
│ ☐ Batterie installate                   │
│ ☐ Cavi collegati                        │
│ ☐ BMS configurato                       │
│ ☐ Test di carica eseguito               │
│                                          │
│ 📊 QUADRO ELETTRICO                      │
│ ☐ Quadro AC installato                  │
│ ☐ Interruttori installati               │
│ ☐ Protezioni SPD installate             │
│ ☐ Contatore bidirezionale montato       │
│ ☐ Etichettatura completata              │
│                                          │
│ ⚡ TEST E COMMISSIONING                  │
│ ☐ Test di isolamento (> 1MΩ)            │
│ ☐ Test di continuità OK                 │
│ ☐ Tensione DC misurata: [___] V         │
│ ☐ Tensione AC misurata: [___] V         │
│ ☐ Inverter acceso e funzionante         │
│ ☐ Produzione verificata                 │
│ ☐ Monitoraggio attivo                   │
│                                          │
│ 📄 DOCUMENTAZIONE                        │
│ ☐ Schema elettrico aggiornato           │
│ ☐ Certificato di conformità             │
│ ☐ Dichiarazione fine lavori             │
│ ☐ Manuali consegnati al cliente         │
│ ☐ App monitoraggio installata           │
│                                          │
│ 📸 FOTO FINALI                           │
│ ☐ Foto impianto completato              │
│ ☐ Foto quadro elettrico                 │
│ ☐ Foto inverter e batterie              │
│ ☐ Foto etichette e certificazioni       │
│ [Upload Photos]                          │
│                                          │
│ 👤 CONSEGNA CLIENTE                      │
│ ☐ Spiegazione funzionamento             │
│ ☐ Demo app monitoraggio                 │
│ ☐ Consegna documenti                    │
│ ☐ Firma accettazione lavori             │
│                                          │
│ 📝 NOTE                                  │
│ [Text Area for notes]                    │
│                                          │
│ ────────────────────────────────────    │
│ Progress: 35/45 (78%)                    │
│                                          │
│ [💾 Save Progress] [✅ Mark Complete]    │
│ [📤 Send Report to Client]               │
└─────────────────────────────────────────┘
```

### Checklist Features

1. **Photo Upload**
   - Before/during/after photos
   - Camera integration on mobile
   - Attach to installation record

2. **Progress Tracking**
   - Auto-calculate completion %
   - Save progress at any time
   - Resume later

3. **Measurements**
   - Input fields for voltage, current
   - Photo of multimeter readings
   - Time stamps

4. **Notes Field**
   - Issues encountered
   - Changes made
   - Client requests

5. **Client Signature**
   - Digital signature pad
   - Timestamp
   - Save to Airtable

### Mobile-Optimized
- Large checkboxes (easy to tap)
- Sticky header with client name
- Swipe to mark complete
- Offline mode (sync later)
- Works on phone/tablet

---

## 📋 Phase 4: Project Tracking (1 week)
**Goal**: Track your own projects from quote to completion

### Simple Project View

```
┌─────────────────────────────────────────┐
│ 📊 I Miei Progetti                       │
├─────────────────────────────────────────┤
│ Filters: [All] [Quote] [Accepted]       │
│          [In Progress] [Completed]       │
├─────────────────────────────────────────┤
│                                          │
│ 📋 PREVENTIVI (4)                        │
│ ┌───────────────────────────────────┐   │
│ │ Mario Rossi - 6.5kW              │   │
│ │ Created: 2025-10-20               │   │
│ │ Status: ✉️ Sent                   │   │
│ │ [View] [Edit] [Send Contract]     │   │
│ └───────────────────────────────────┘   │
│                                          │
│ 🔧 IN CORSO (2)                          │
│ ┌───────────────────────────────────┐   │
│ │ Laura Bianchi - 10kW             │   │
│ │ Installation: 2025-11-05          │   │
│ │ Status: 📋 Contract Signed        │   │
│ │ Progress: ⬜⬜⬜⬜⬜⬜⬜ 0%          │   │
│ │ [View] [Start Checklist] [Call]   │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ Paolo Verdi - 8kW                │   │
│ │ Installation: Today!              │   │
│ │ Status: 🔧 Installing             │   │
│ │ Progress: ████⬜⬜⬜ 60%           │   │
│ │ [Continue Checklist] [Photos]     │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ✅ COMPLETATI (15)                       │
│ [Show More...]                           │
│                                          │
│ ────────────────────────────────────    │
│ Total Revenue This Month: €45,000        │
└─────────────────────────────────────────┘
```

### Project Stages (Simple)

```
1. Quote Created → 2. Quote Sent → 3. Accepted
→ 4. Contract Signed → 5. Installing → 6. Complete
```

### Quick Actions
- **From Quote**: Send Contract
- **From Contract**: Start Installation (opens checklist)
- **From Checklist**: Mark Complete
- **Anytime**: Call client, View details, Add note

---

## 🗂️ Simplified Data Model

### Client Record (Airtable: dettagli_clienti)
```javascript
{
  // Basic Info
  nome: 'Mario',
  cognome: 'Rossi',
  codiceFiscale: 'RSSMRA80A01H501Z',
  email: 'mario@example.com',
  telefono: '+39 333 1234567',

  // Address
  indirizzo: 'Via Roma 123',
  citta: 'Torino',
  cap: '10121',

  // Other
  contattoTramite: 'Facebook ADS',
  dataContatto: '2025-10-30',
  note: 'Cliente interessato a batterie',

  // Links
  progetti: ['recXXXX'] // Link to installations
}
```

### Installation Record (Airtable: dettagli_impianti)
```javascript
{
  // Basic
  nome: 'Impianto Rossi - 6.5kW',
  clienteId: 'recYYYY',
  indirizzo: 'Via Roma 123, Torino',

  // Quote Data (entire PRISMA form data as JSON)
  prismaData: '{ clientData: {...}, falde: [...], ... }',

  // Status
  status: 'contract_signed', // quote_created, quote_sent,
                               // accepted, contract_signed,
                               // installing, completed

  // Dates
  dataPreventivo: '2025-10-20',
  dataContratto: '2025-10-25',
  dataInstallazione: '2025-11-05',
  dataCompletamento: null,

  // Progress
  checklistProgress: 35, // out of 45
  checklistData: '{ ... }', // JSON of checklist state

  // Files
  pdfPreventivo: [{ url: '...' }],
  pdfContratto: [{ url: '...' }],
  fotoInstallazione: [{ url: '...' }, ...],

  // Money
  prezzoTotale: 15000,
  compenso: 4500
}
```

---

## 🔄 Complete Workflow

### 1. New Client Inquiry
```
📞 Client calls/emails
  ↓
🗂️ Go to "Database Clienti" → [+ Nuovo Cliente]
  ↓
👤 Fill client details → Auto-saves to Airtable
  ↓
📋 Click "Create Quote" for this client
```

### 2. Create Quote
```
📋 PRISMA tabs 3-8 (existing workflow)
  ↓
💾 Click "Save" → Links to client in Airtable
  ↓
📄 Generate PDF → Send to client
```

### 3. Client Accepts
```
✉️ Client says "Yes!"
  ↓
📊 Go to "I Miei Progetti" → Find project → Click "Send Contract"
  ↓
📄 Go to "Contratto" tab
  ↓
Fill dates, payment schedule, work scope
  ↓
📤 Generate Contract PDF → Client signs
  ↓
💾 Upload signed contract → Update status to "Contract Signed"
```

### 4. Installation Day
```
🏠 Arrive at client location
  ↓
📱 Open PRISMA on tablet
  ↓
📊 "I Miei Progetti" → Find project → Click "Start Installation"
  ↓
✅ Work through "Checklist Installazione" tab
  ↓
☑️ Check items as you complete them
  ↓
📸 Take photos at each stage
  ↓
💾 Save progress regularly (works offline)
```

### 5. Completion
```
✅ Last checklist item done
  ↓
✅ Click "Mark Complete"
  ↓
📤 Generate completion report
  ↓
👤 Client signs acceptance
  ↓
✅ Status changes to "Completed"
  ↓
💰 Invoice and close project
```

---

## 📱 Mobile Considerations

### Must Work On
- Tablet (primary for on-site)
- Phone (backup)
- Desktop (office work)

### Key Features for Mobile
1. **Offline Mode**
   - Checklist works without internet
   - Syncs when connection returns
   - Cache all client data

2. **Camera Integration**
   - Quick photo capture
   - Auto-attach to project
   - Compress before upload

3. **Touch-Friendly**
   - Large checkboxes
   - Swipe gestures
   - Sticky headers
   - Bottom nav bar

4. **Quick Access**
   - "Today's Installation" widget on home
   - One-tap to resume checklist
   - Quick call client button

---

## 📅 Implementation Timeline (Simplified)

```
Week 1: Client Database
├─ Day 1-2: clientService.js + database view
├─ Day 3-4: Enhanced client form
└─ Day 5-7: Testing and polish

Week 2: Contract Management
├─ Day 1-2: Contract form + data model
├─ Day 3-4: Contract PDF template
└─ Day 5-7: Integration + testing

Week 3: Installation Checklist
├─ Day 1: Checklist UI + data model
├─ Day 2: Photo upload + offline mode
└─ Day 3: Testing on mobile

Week 4: Project Tracking
├─ Day 1-3: Project list view
├─ Day 4-5: Status workflow
└─ Day 6-7: Integration + polish

Total: 4 weeks (1 month)
```

---

## 🎯 Success Criteria

### Must Have
✅ Search and select existing clients
✅ Client data auto-fills in quote
✅ Generate contract with all details
✅ Checklist works on tablet while on roof
✅ Take photos and attach to project
✅ Track project from quote to completion
✅ All data syncs to Airtable

### Should Have
✅ Offline checklist mode
✅ Progress percentage calculation
✅ Quick stats (revenue, active projects)
✅ Client signature on checklist

### Nice to Have
◯ WhatsApp integration (send PDFs)
◯ Calendar view of installations
◯ Quick expense tracking

---

## 🔧 Technical Notes

### New Files to Create
```
src/
├── services/
│   ├── clientService.js        [NEW]
│   ├── installationService.js  [NEW]
│   └── contractService.js      [NEW]
│
├── components/
│   ├── ClientDatabase/
│   │   ├── ClientDatabase.jsx  [NEW]
│   │   ├── ClientList.jsx      [NEW]
│   │   └── ClientCard.jsx      [NEW]
│   │
│   ├── Contract/
│   │   ├── Contract.jsx        [NEW]
│   │   ├── ContractForm.jsx    [NEW]
│   │   └── PaymentSchedule.jsx [NEW]
│   │
│   ├── Checklist/
│   │   ├── Checklist.jsx       [NEW]
│   │   ├── ChecklistSection.jsx[NEW]
│   │   ├── PhotoUpload.jsx     [NEW]
│   │   └── SignaturePad.jsx    [NEW]
│   │
│   └── ProjectTracking/
│       ├── ProjectList.jsx     [NEW]
│       ├── ProjectCard.jsx     [NEW]
│       └── ProjectFilters.jsx  [NEW]
│
└── utils/
    ├── contractGenerator.js    [NEW]
    ├── offlineSync.js          [NEW]
    └── photoCompression.js     [NEW]

public/
└── templates/
    └── CONTRATTO.html          [NEW]
```

### State Management (Add to FormContext)
```javascript
// Contract Data
const [contractData, setContractData] = useState({...});

// Checklist Data
const [checklistData, setChecklistData] = useState({...});

// Installation Status
const [installationStatus, setInstallationStatus] = useState('quote_created');
```

---

## 📊 Comparison: Before vs After

### Before (Current)
```
❌ Re-enter client every time
❌ No contract generation
❌ Paper checklist while on roof
❌ No project tracking
❌ Manual status updates
❌ Searching old quotes is hard
```

### After (4 weeks)
```
✅ Client database - select existing
✅ Auto-generate contracts
✅ Digital checklist on tablet
✅ See all projects in one place
✅ Automatic status tracking
✅ Quick search by client/date
```

---

## 📞 Support

**Questions?**
- Email: solefacilesrl@gmail.com
- Check: SIMPLIFIED_ROADMAP.md (this file)

**Start Here:**
1. Week 1: Client database
2. Week 2: Contract generation
3. Week 3: Installation checklist
4. Week 4: Project tracking

---

**Version**: 2.0 - Simplified Single-User
**Created**: 2025-10-30
**Target**: Solo operator workflow
**Timeline**: 4 weeks

---

*Much simpler than team collaboration! Focus on YOUR workflow: clients → quotes → contracts → installation → tracking. That's it! 🚀*
