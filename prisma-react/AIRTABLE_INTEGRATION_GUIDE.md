# Airtable Integration Guide - PRISMA Solar

Complete documentation for all Airtable tables used in the PRISMA Solar application.

## Base Information
- **Base ID**: `appZ2DRpgz4wr3OqX`
- **API Base URL**: `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX`
- **Authentication**: Bearer token (stored in `.env` as `VITE_AIRTABLE_TOKEN`)

---

## Table Overview

| Table Name | Table ID | Description | Primary Use |
|------------|----------|-------------|-------------|
| dettagli_clienti | `tbldgj4A9IUwSL8z6` | Client contact and personal information | Client management, contact details |
| dettagli_impianti | `tblp0aOjMtrn7kCv1` | Installation/project details | Project tracking, renders, installations |
| budget | `tblydCjFKnlV9VDRJ` | Software and tools budget tracking | Software license management |
| da_fare | `tblTRU4BEt1w2zllZ` | Task management | Team task tracking, project todos |
| listino_prezzi | `tbli07cJoEIWNEAnW` | Product catalog and pricing | Product database, pricing info |
| sessioni | `tblb7q5ZbbdPhe19v` | User session storage | Session management, autosave |

---

## 1. dettagli_clienti (Clients Table)
**Table ID**: `tbldgj4A9IUwSL8z6`

### Description
Stores all client contact information, personal details, and documentation.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| nome / ragione sociale | `fldvLJvaACqCYz8Nq` | singleLineText | Client name or company name (PRIMARY) |
| impianto | `fldhB5kzaUcKOX2Ji` | multipleRecordLinks | Links to installations table |
| Pc | `fldqvzcqkO1gz0BEG` | singleLineText | PC reference |
| Data Contatto | `fldfJJHUg4lq0oy0e` | date | First contact date |
| Contatto tramite | `fldeP4bPGcX7AlXUJ` | singleSelect | Contact method: Facebook ADS, Website, E-mail, Passaparola |
| nome | `fldzveH9wE0KkIAnv` | singleLineText | First name |
| cognome | `fldvmDX1jM2IcdPW5` | singleLineText | Last name |
| data di nascita | `fld3p9qTzXv5XuJdy` | date | Birth date |
| nazione di nascita | `fld874hH9OAJGTc58` | singleLineText | Birth country |
| provincia di nascita | `fldWG36Ty0LNn4k9U` | singleLineText | Birth province |
| comune di nascita | `fldgAhTt6yRrgM8DA` | singleLineText | Birth city |
| telefono | `fldkcJETm6lHFLtLL` | phoneNumber | Phone number |
| cellulare | `fldzdz46p817ohn62` | phoneNumber | Mobile number |
| email | `fldz9UB3kr2a5gl1l` | email | Email (used as username for portals) |
| indirizzo residenza | `flduwFmjSsrRekrKf` | singleLineText | Residence address |
| città residenza | `fldJLTELlm7BpTy2E` | singleLineText | Residence city |
| cap di residenza | `fldlAFBTPJiZPKxl0` | number | Residence postal code |
| indirizzo impianto | `fldornQNj3cuFNAcr` | singleLineText | Installation address |
| città impianto | `fldzgTnEkE0hPUa23` | singleLineText | Installation city |
| cap impianto | `fldIyTBiYBg8VJQZL` | number | Installation postal code |
| copia C.I. | `fldVaqP7F2RNF7tBU` | multipleAttachments | ID card copies |
| copia C.F. | `fldIA5v2ckBfbfAx6` | multipleAttachments | Tax code copies |
| copia ultima bolletta elettrica | `fldpzT4QfyDSNg34k` | multipleAttachments | Latest electricity bill |
| IBAN | `fld4kboJJIiqqrTSF` | singleLineText | IBAN for ENEL procedures |
| visura | `fld1GMGHeMzoRqZCI` | multipleAttachments | Property registry document |
| ulteriori note | `fldY5WQgm69znSVLS` | multilineText | Additional notes |
| data sopralluogo | `fldb3CEtTC5JqfdYr` | date | Site inspection date |
| session_id | `fldreJY0OdlBXI1eU` | singleLineText | Session identifier |
| indirizzo | `fldyZNvDdjhu3rCdM` | multipleLookupValues | Address lookup from installations |
| offerta | `fldDOR6k57B9JCmCv` | singleLineText | Quote reference |
| File vari | `fldaY46oi5esnGhFi` | multipleAttachments | Various files |
| referente | `fldsOMMj4T6YB9woy` | singleLineText | Reference person |
| sessioni | `fldkNsuXRWX6d70rK` | multipleRecordLinks | Links to sessions table |

### Example API Calls

**Create Client:**
```bash
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "nome / ragione sociale": "Mario Rossi",
      "email": "mario.rossi@example.com",
      "cellulare": "+393331234567",
      "Data Contatto": "2025-10-30"
    }
  }'
```

**Get Clients:**
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. dettagli_impianti (Installations Table)
**Table ID**: `tblp0aOjMtrn7kCv1`

### Description
Contains all installation/project information, renders, progress tracking, and technical details.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| nome | `fldSMD0EzDq5UQEoR` | singleLineText | Installation name (PRIMARY) |
| tag / parentele / info | `fldxLtqIO6pCuBJcb` | multilineText | Tags, relationships, info |
| indirizzo | `fldZMaqYaUXTEFBZJ` | singleLineText | Installation address |
| coordinate | `fldm4jWH1wkqKjXS2` | singleLineText | GPS coordinates |
| simulazione/render | `fldeAkjuSvbAx0wbl` | singleSelect | Render status: Da fare, In costruzione, Da revisionare, Fatto, Rimandato |
| status offerta | `fldDUS8iCzLYg4ytm` | singleSelect | Quote status: da mandare, in attesa di risposta, mandata, non si fa, da rivedere |
| status progetto | `fldEFBwDRuRqfIJ0C` | singleSelect | Project status: da fare, in attesa di risposta, non si fa |
| status realizzazione | `fldquKhnqwhcYhOgk` | singleSelect | Realization status: da montare, in corso, montato, non si fa |
| maps / ref | `fldsngDYo1DKDexQR` | multipleAttachments | Reference images and maps |
| render moduli | `fldH4CxDghog7Dk8B` | multipleAttachments | Module render images |
| foto impianto reale | `fldnts5HAMXz1HWSw` | multipleAttachments | Real installation photos |
| n moduli totali | `fldrtB04NeqNLRUb7` | number | Total number of modules |
| dettagli moduli e note | `fldIoJV1a5NZb5tyh` | multilineText | Module details and notes |
| file report/offerta | `fldILkmQLDDXDCTeu` | multipleAttachments | Report/quote files |
| Created | `fldRUmB5MSeF8BrQk` | createdTime | Creation timestamp |
| Compenso | `fld6moMZAM7S79Nkz` | currency | Compensation amount (€) |
| impianto completato | `fldIPII7tVBuh6tgw` | checkbox | Installation completed |
| Makehome | `flddc5FrW1BDX8AtW` | checkbox | Makehome flag |
| dati cliente | `fldfzlIKhZWdlg4OW` | multipleRecordLinks | Links to clients table |
| zippati | `fldXkSkmyR5Geh1cJ` | checkbox | Files zipped |
| calendario SoleFacile | `fldKXFGV156KAZ6N4` | singleLineText | SoleFacile calendar |
| prisma_data | `fldECWAWbJmOe51ln` | multilineText | PRISMA form data (JSON) |
| session_id | `fldutqClcHPSHizIg` | singleLineText | Session identifier |
| sessioni | `fldqVmxmFTPjoAVSN` | multipleRecordLinks | Links to sessions table |

### Views
- `riepilogo impianti`: Grid view of all installations
- `riepilogo impianti finiti`: Completed installations
- `simulazioni da fare`: Simulations to be done
- `simulazioni - gallery`: Gallery view of simulations
- `offerta`: Quote management view
- `compensi`: Compensation tracking

### Example API Calls

**Create Installation:**
```bash
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "nome": "Impianto Rossi",
      "indirizzo": "Via Roma 123, Torino",
      "n moduli totali": 20,
      "status offerta": "mandata"
    }
  }'
```

**Update Installation with PRISMA Data:**
```bash
curl -X PATCH "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1/RECORD_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "prisma_data": "{\"clientData\":{},\"structureData\":{}}",
      "session_id": "session_123"
    }
  }'
```

---

## 3. budget (Software Budget Table)
**Table ID**: `tblydCjFKnlV9VDRJ`

### Description
Tracks software subscriptions, tools, and their costs for budget management.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Name | `fldMUdHTFADggh67u` | singleLineText | Software name (PRIMARY) |
| Area | `fldbWMuaYnW2T6tdd` | multipleSelects | Categories: Grafica, WebSite, SEO, Gestionale, Storage, etc. |
| Link | `fldUSaSmA3YQcumih` | url | Software website URL |
| Costo Annuo | `fld20ovD0R4bH9s9P` | currency | Annual cost (€) |
| Notes | `fldFVO3q8zQWAwoob` | multilineText | Additional notes |
| Status | `fldxf93hvKMVkVJnT` | singleSelect | Status: In forse / opzionale, Da prendere, Preso |
| Assignee | `fldnfY3LtTh7nRnri` | multipleSelects | Assigned to: Manu, Cesare, Simo e Cinzia |
| Importanza | `fldeJZ3t2DdAK2XU4` | rating | Importance (1-5 stars) |
| Priorità | `fldZ7Kol7bGRghm0X` | rating | Priority (1-5 stars) |

### Example API Calls

**Get Software Budget:**
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblydCjFKnlV9VDRJ" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. da_fare (Tasks Table)
**Table ID**: `tblTRU4BEt1w2zllZ`

### Description
Team task management and project tracking system.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Task | `fld5jBP7Zo12YSJgn` | singleLineText | Task name (PRIMARY) |
| Notes | `fldhqqmeiULrWA9Ki` | richText | Detailed task notes |
| Assignee | `fldY4Lm3fa8uknR5f` | multipleSelects | Assigned to: Manu, Cesare, Simo e Cinzia, Denis |
| Status | `fld8rrqBGHugMTgl4` | singleSelect | Status: To do, In pausa, In calendario, In progress, In review, Done |
| Tipologia | `fldIRh8CZ66ohXZ1q` | singleSelect | Type: Nuovi impianti, Manutenzioni, Riparazioni, Fatturazione, Ufficio, Revamping, Convention, Sopralluogo, Marketing |
| Obiettivo | `fldpDqzg0ictwo0mC` | singleSelect | Objective: Automatizzare gli step, Gestione clienti, Sistemare la parte legale |
| Scadenza | `fldctH9sDjVsWlnf7` | date | Deadline date |
| Dimensione task | `fldfJmpY6qg4m3vBr` | singleSelect | Size: Piccolo (1-2 giorni), Medio (una settimana), Grande (più di una settimana) |

### Views
- `riepilogo`: Task overview
- `Kanban`: Kanban board view

### Example API Calls

**Create Task:**
```bash
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblTRU4BEt1w2zllZ" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "Task": "Finish installation at client site",
      "Assignee": ["Manu", "Denis"],
      "Status": "To do",
      "Tipologia": "Nuovi impianti"
    }
  }'
```

---

## 5. listino_prezzi (Product Catalog)
**Table ID**: `tbli07cJoEIWNEAnW`

### Description
Product catalog with prices, specifications, and technical details for all solar equipment.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| id_component | `fldkpNN4lYijeOmph` | singleLineText | Component ID (PRIMARY) |
| nome | `fld6RmKZTxOaBTGDb` | singleLineText | Product name |
| descrizione | `fldpV0E2VSmbrnIYD` | singleLineText | Product description |
| categoria | `fldB8qFEVcBUtA8Ju` | singleLineText | Category: inverter, ev charger, battery, module, etc. |
| gruppo | `fldMEo3NUfk25b1Nx` | singleLineText | Product group: Micro, Three Phase, Hybrid, etc. |
| potenza | `fldJHvXVP5QO4oHT2` | number | Power rating (W) |
| larghezza | `fldNOBk5fMgdbvNvz` | number | Width (m) |
| prezzo | `flduw1nkJXVzorZzT` | number | Price (€) |
| altezza | `fld1VF9eHNYDVEgVH` | number | Height (m) |
| Attachments | `fldnmBDmYXsFUWEFn` | multipleAttachments | Product files and images |
| Attachment Summary | `fldhqDs0obTi0w4YB` | aiText | AI-generated summary of attachments |

### Example API Calls

**Get Products (used in PRISMA):**
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbli07cJoEIWNEAnW" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Filter by Category:**
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbli07cJoEIWNEAnW?filterByFormula={categoria}='inverter'" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Integration with PRISMA
This table is currently integrated in `/src/services/airtable.js` with the `getProducts()` function:

```javascript
export const getProducts = async (forceRefresh = false) => {
  // Fetches all products and caches them locally
  // Used to populate inverters, batteries, and component selections
};
```

---

## 6. sessioni (Sessions Table)
**Table ID**: `tblb7q5ZbbdPhe19v`

### Description
Stores user session data for the PRISMA application, enabling cloud backup and multi-device access.

### Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| session_id | `fldsFfd2QHSZsyuc6` | singleLineText | Session ID (PRIMARY) |
| nome_cliente | `fldGsWiFwJ7GfJEJr` | singleLineText | Client first name |
| cognome_cliente | `fldAJawea9qsSBlmT` | singleLineText | Client last name |
| riferimento_preventivo | `fld5klfI1ZNkrPwnT` | singleLineText | Quote reference |
| session_data | `fldE0RAXHwNEZAeRb` | multilineText | Complete session data (JSON) |
| last_updated | `fldlebNxX0B8g1bmw` | dateTime | Last update timestamp |
| created_at | `fldnU0cBT1tpHxWoH` | dateTime | Creation timestamp |
| status | `fldbYIHvuvfyUBJFv` | singleSelect | Status: draft, in_progress, saved_to_airtable |
| client_record | `fldW3EhlSI89k08cR` | multipleRecordLinks | Links to clients table |
| installation_record | `fldDcwqaz2DejgJWI` | multipleRecordLinks | Links to installations table |

### Current Integration
Already implemented in `/src/services/airtable.js`:

```javascript
// Save session to Airtable
export const saveSessionToAirtable = async (sessionId, sessionData, clientName, quoteRef) => {
  // Creates or updates session record
};

// Load session from Airtable
export const loadSessionFromAirtable = async (sessionId) => {
  // Retrieves session data
};

// Get all sessions for client manager
export const getAllSessions = async () => {
  // Lists all saved sessions
};

// Delete session
export const deleteSession = async (recordId) => {
  // Removes session from Airtable
};
```

---

## Table Relationships

### Entity Relationship Diagram

```
dettagli_clienti (Clients)
    ├─[1:N]─> dettagli_impianti (Installations)
    ├─[1:N]─> sessioni (Sessions)

dettagli_impianti (Installations)
    ├─[N:1]─< dettagli_clienti (Clients)
    ├─[1:N]─> sessioni (Sessions)

sessioni (Sessions)
    ├─[N:1]─< dettagli_clienti (Clients)
    └─[N:1]─< dettagli_impianti (Installations)

listino_prezzi (Products) [Standalone catalog]
budget (Software) [Standalone budget tracking]
da_fare (Tasks) [Standalone task management]
```

### Key Relationships

1. **Client → Installation**: One client can have multiple installations
2. **Installation → Client**: Each installation belongs to one client
3. **Session → Client**: Sessions are linked to client records
4. **Session → Installation**: Sessions track specific installation quotes

---

## Web App Integration Guide

### Current Implementation

The PRISMA React app currently uses these tables:

1. **listino_prezzi**: Product catalog (inverters, batteries, modules)
   - File: `/src/services/airtable.js`
   - Function: `getProducts()`
   - Cache: localStorage with 24-hour expiration

2. **sessioni**: Session management and autosave
   - File: `/src/services/airtable.js`
   - Functions: `saveSessionToAirtable()`, `loadSessionFromAirtable()`, `getAllSessions()`
   - Used in: ClientManager, FormContext, autosave system

### Recommended Future Integrations

#### 1. Client Management Integration

**Purpose**: Sync client data from PRISMA forms directly to `dettagli_clienti` table

**Implementation Location**: `/src/services/clientService.js` (new file)

```javascript
// Example: Create client record
export const createClientRecord = async (clientData) => {
  const response = await fetch(
    'https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'nome / ragione sociale': `${clientData.nome} ${clientData.cognome}`,
          'email': clientData.email,
          'cellulare': clientData.cellulare,
          'indirizzo impianto': clientData.indirizzo,
          'città impianto': clientData.citta,
          'cap impianto': clientData.cap,
          'Data Contatto': new Date().toISOString().split('T')[0]
        }
      })
    }
  );
  return await response.json();
};

// Example: Check for duplicate clients
export const findDuplicateClients = async (email, phone) => {
  const formula = `OR({email}='${email}', {cellulare}='${phone}')`;
  const url = `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6?filterByFormula=${encodeURIComponent(formula)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`
    }
  });
  return await response.json();
};
```

**Use Cases**:
- When saving a quote, automatically create/update client record
- Check for duplicate clients before creating new records
- Pre-fill client data from existing records

#### 2. Installation Management Integration

**Purpose**: Link completed quotes to `dettagli_impianti` table

**Implementation Location**: `/src/services/installationService.js` (new file)

```javascript
// Example: Create installation record
export const createInstallationRecord = async (quoteData, clientRecordId) => {
  const response = await fetch(
    'https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'nome': `Impianto ${quoteData.clientData.nome} ${quoteData.clientData.cognome}`,
          'indirizzo': quoteData.structureData.indirizzo,
          'coordinate': quoteData.structureData.coordinate,
          'n moduli totali': quoteData.falde.reduce((sum, f) => sum + f.moduli, 0),
          'prisma_data': JSON.stringify(quoteData),
          'dati cliente': [clientRecordId],
          'status offerta': 'mandata',
          'simulazione/render': 'Fatto'
        }
      })
    }
  );
  return await response.json();
};

// Example: Attach render images to installation
export const uploadRenderImages = async (recordId, imageUrls) => {
  const attachments = imageUrls.map(url => ({ url }));

  const response = await fetch(
    `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'render moduli': attachments
        }
      })
    }
  );
  return await response.json();
};
```

**Use Cases**:
- Save completed quotes as installation records
- Track quote status (sent, accepted, rejected)
- Upload render images from PRISMA to Airtable
- Link installations to client records

#### 3. Task Management Integration

**Purpose**: Create tasks from PRISMA workflows

**Implementation Location**: `/src/services/taskService.js` (new file)

```javascript
// Example: Create task for site inspection
export const createSiteInspectionTask = async (clientName, address, assignees) => {
  const response = await fetch(
    'https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblTRU4BEt1w2zllZ',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Task': `Sopralluogo - ${clientName}`,
          'Notes': `Indirizzo: ${address}`,
          'Assignee': assignees,
          'Status': 'To do',
          'Tipologia': 'Sopralluogo',
          'Dimensione task': 'Piccolo (1-2 giorni)'
        }
      })
    }
  );
  return await response.json();
};

// Example: Create installation task
export const createInstallationTask = async (clientName, modules, assignees) => {
  const response = await fetch(
    'https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblTRU4BEt1w2zllZ',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Task': `Montaggio impianto ${clientName}`,
          'Notes': `${modules} moduli da installare`,
          'Assignee': assignees,
          'Status': 'In calendario',
          'Tipologia': 'Nuovi impianti'
        }
      })
    }
  );
  return await response.json();
};
```

**Use Cases**:
- Automatically create tasks when quote is accepted
- Schedule site inspections
- Track installation progress

---

## API Usage Best Practices

### 1. Rate Limiting
Airtable API has rate limits:
- **5 requests per second per base**
- **100,000 records per base**

**Implementation**:
```javascript
// Add rate limiting to API calls
const rateLimiter = {
  lastCall: 0,
  minInterval: 200, // 200ms = 5 requests/second

  async wait() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    this.lastCall = Date.now();
  }
};

// Use before each API call
await rateLimiter.wait();
const response = await fetch(url);
```

### 2. Error Handling
```javascript
const handleAirtableError = (error, response) => {
  if (response.status === 429) {
    return 'Rate limit exceeded. Please wait and try again.';
  }
  if (response.status === 401) {
    return 'Authentication failed. Check your API token.';
  }
  if (response.status === 404) {
    return 'Record not found.';
  }
  if (response.status === 422) {
    return 'Invalid data. Check field types and values.';
  }
  return `API error: ${error.message}`;
};
```

### 3. Caching Strategy
```javascript
const cacheConfig = {
  products: { duration: 24 * 60 * 60 * 1000, key: 'airtable_products_cache' },
  clients: { duration: 1 * 60 * 60 * 1000, key: 'airtable_clients_cache' },
  installations: { duration: 1 * 60 * 60 * 1000, key: 'airtable_installations_cache' }
};

const getCachedData = (cacheKey, duration) => {
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  const age = Date.now() - timestamp;

  if (age > duration) {
    localStorage.removeItem(cacheKey);
    return null;
  }

  return data;
};

const setCachedData = (cacheKey, data) => {
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};
```

### 4. Batch Operations
```javascript
// Create multiple records at once (max 10 per request)
const batchCreateRecords = async (tableId, records) => {
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const results = [];
  for (const batch of batches) {
    const response = await fetch(
      `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/${tableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: batch.map(fields => ({ fields })) })
      }
    );
    results.push(...(await response.json()).records);
    await rateLimiter.wait();
  }

  return results;
};
```

---

## Environment Variables

Ensure these variables are set in `.env`:

```bash
# Airtable Configuration
VITE_AIRTABLE_TOKEN=patFgkV1nIq7nuALV.xxxxx
VITE_AIRTABLE_BASE_ID=appZ2DRpgz4wr3OqX

# Login Credentials
VITE_LOGIN_NAME=Emanuele
VITE_LOGIN_PASSWORD=SolefacilePrisma
```

**Security Note**: Never commit `.env` to git. Use `.env.example` as template.

---

## Testing API Calls

### Using curl

```bash
# Set your token
export AIRTABLE_TOKEN="patFgkV1nIq7nuALV.xxxxx"

# Test connection
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6?maxRecords=3" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN"

# Create test record
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "nome / ragione sociale": "Test Client",
      "email": "test@example.com"
    }
  }'

# Update record
curl -X PATCH "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6/RECORD_ID" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "cellulare": "+393331234567"
    }
  }'

# Delete record
curl -X DELETE "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6/RECORD_ID" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN"
```

### Using JavaScript (Browser Console)

```javascript
// Test get products
const token = import.meta.env.VITE_AIRTABLE_TOKEN;
const baseId = 'appZ2DRpgz4wr3OqX';

fetch(`https://api.airtable.com/v0/${baseId}/tbli07cJoEIWNEAnW?maxRecords=5`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Products:', data.records));

// Test create client
fetch(`https://api.airtable.com/v0/${baseId}/tbldgj4A9IUwSL8z6`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fields: {
      'nome / ragione sociale': 'Test Client',
      'email': 'test@example.com'
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('Created client:', data));
```

---

## Appendix: Complete Field Reference

### Field Types Reference

| Airtable Type | JavaScript Type | Example |
|---------------|----------------|---------|
| singleLineText | string | "Mario Rossi" |
| multilineText | string | "Long text\nwith newlines" |
| richText | string (Markdown) | "**Bold** text" |
| email | string | "user@example.com" |
| phoneNumber | string | "+393331234567" |
| url | string | "https://example.com" |
| number | number | 42.5 |
| currency | number | 1234.56 |
| date | string (ISO) | "2025-10-30" |
| dateTime | string (ISO) | "2025-10-30T12:00:00.000Z" |
| checkbox | boolean | true |
| singleSelect | string | "Option 1" |
| multipleSelects | string[] | ["Option 1", "Option 2"] |
| multipleRecordLinks | string[] | ["recXXXXXXXXXXXXX"] |
| multipleAttachments | object[] | [{ url: "...", filename: "..." }] |
| rating | number | 5 |

### Creating Records with Different Field Types

```javascript
const exampleRecord = {
  fields: {
    // Text fields
    'nome / ragione sociale': 'Mario Rossi',
    'ulteriori note': 'Multi-line\ntext here',

    // Contact fields
    'email': 'mario.rossi@example.com',
    'cellulare': '+393331234567',
    'telefono': '+390112345678',

    // Numbers
    'cap di residenza': 10121,
    'n moduli totali': 20,
    'Compenso': 5000.00,

    // Dates
    'Data Contatto': '2025-10-30',
    'data sopralluogo': '2025-11-15',
    'last_updated': '2025-10-30T12:00:00.000Z',

    // Selections
    'Contatto tramite': 'Facebook ADS',
    'Status': 'To do',
    'Assignee': ['Manu', 'Denis'],

    // Checkboxes
    'impianto completato': true,
    'zippati': false,

    // Links to other records
    'impianto': ['recXXXXXXXXXXXXX'],
    'dati cliente': ['recYYYYYYYYYYYYY'],

    // Attachments (by URL)
    'render moduli': [
      { url: 'https://example.com/image1.png' },
      { url: 'https://example.com/image2.png' }
    ],

    // Ratings
    'Importanza': 5,
    'Priorità': 4
  }
};
```

---

## Support and Resources

- **Airtable API Documentation**: https://airtable.com/developers/web/api/introduction
- **PRISMA Project Repository**: (internal)
- **Current Integration**: `/src/services/airtable.js`

---

## Changelog

### Version 1.0 - 2025-10-30
- Initial documentation created
- All 6 tables documented with complete field reference
- API examples and integration guides provided
- Best practices and testing methods included

---

**Document maintained by**: PRISMA Development Team
**Last updated**: 2025-10-30
**For questions**: solefacilesrl@gmail.com
