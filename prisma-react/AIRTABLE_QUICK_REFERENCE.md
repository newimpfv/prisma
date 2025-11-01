# Airtable Quick Reference - PRISMA Solar

Quick reference guide for all Airtable tables.

## Base Configuration
```javascript
BASE_ID: 'appZ2DRpgz4wr3OqX'
API_URL: 'https://api.airtable.com/v0/appZ2DRpgz4wr3OqX'
TOKEN: import.meta.env.VITE_AIRTABLE_TOKEN
```

---

## Tables at a Glance

| # | Table Name | ID | Purpose | Currently Used |
|---|------------|-----|---------|----------------|
| 1 | **dettagli_clienti** | `tbldgj4A9IUwSL8z6` | Client contact info | ❌ Not yet |
| 2 | **dettagli_impianti** | `tblp0aOjMtrn7kCv1` | Installation projects | ❌ Not yet |
| 3 | **budget** | `tblydCjFKnlV9VDRJ` | Software budget | ❌ Not yet |
| 4 | **da_fare** | `tblTRU4BEt1w2zllZ` | Task management | ❌ Not yet |
| 5 | **listino_prezzi** | `tbli07cJoEIWNEAnW` | Product catalog | ✅ Yes |
| 6 | **sessioni** | `tblb7q5ZbbdPhe19v` | Session storage | ✅ Yes |

---

## 1. dettagli_clienti (Clients)
**ID**: `tbldgj4A9IUwSL8z6`

### Key Fields
- `nome / ragione sociale` - Client name (PRIMARY)
- `email`, `cellulare`, `telefono` - Contact info
- `indirizzo impianto`, `città impianto`, `cap impianto` - Installation address
- `Data Contatto`, `Contatto tramite` - Contact tracking
- `session_id` - Link to sessions

### Quick API Call
```bash
# Get all clients
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6" \
  -H "Authorization: Bearer $TOKEN"

# Create client
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbldgj4A9IUwSL8z6" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"nome / ragione sociale":"Mario Rossi","email":"test@example.com"}}'
```

---

## 2. dettagli_impianti (Installations)
**ID**: `tblp0aOjMtrn7kCv1`

### Key Fields
- `nome` - Installation name (PRIMARY)
- `indirizzo`, `coordinate` - Location
- `n moduli totali` - Total modules
- `status offerta`, `status realizzazione` - Progress tracking
- `prisma_data` - Complete PRISMA form data (JSON)
- `render moduli`, `foto impianto reale` - Images
- `session_id` - Link to sessions

### Quick API Call
```bash
# Get all installations
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1" \
  -H "Authorization: Bearer $TOKEN"

# Create installation
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblp0aOjMtrn7kCv1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"nome":"Impianto Test","n moduli totali":20}}'
```

---

## 3. budget (Software Budget)
**ID**: `tblydCjFKnlV9VDRJ`

### Key Fields
- `Name` - Software name (PRIMARY)
- `Area` - Category (Grafica, SEO, Storage, etc.)
- `Costo Annuo` - Annual cost
- `Status` - Da prendere, Preso, etc.
- `Assignee` - Manu, Cesare, Simo e Cinzia

### Quick API Call
```bash
# Get software budget
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblydCjFKnlV9VDRJ" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. da_fare (Tasks)
**ID**: `tblTRU4BEt1w2zllZ`

### Key Fields
- `Task` - Task name (PRIMARY)
- `Status` - To do, In progress, Done, etc.
- `Tipologia` - Nuovi impianti, Revamping, Ufficio, etc.
- `Assignee` - Manu, Denis, Cesare, etc.
- `Scadenza` - Deadline

### Quick API Call
```bash
# Get all tasks
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblTRU4BEt1w2zllZ" \
  -H "Authorization: Bearer $TOKEN"

# Create task
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblTRU4BEt1w2zllZ" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"Task":"New task","Status":"To do","Tipologia":"Ufficio"}}'
```

---

## 5. listino_prezzi (Products) ✅ INTEGRATED
**ID**: `tbli07cJoEIWNEAnW`

### Key Fields
- `id_component` - Component ID (PRIMARY)
- `nome`, `descrizione` - Product name and description
- `categoria` - inverter, ev charger, battery, module
- `gruppo` - Product group
- `potenza` - Power (W)
- `prezzo` - Price (€)

### Current Integration
```javascript
// File: /src/services/airtable.js
import { getProducts } from './services/airtable';

// Get all products (cached 24 hours)
const products = await getProducts();

// Force refresh
const products = await getProducts(true);
```

### Quick API Call
```bash
# Get all products
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbli07cJoEIWNEAnW" \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tbli07cJoEIWNEAnW?filterByFormula={categoria}='inverter'" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. sessioni (Sessions) ✅ INTEGRATED
**ID**: `tblb7q5ZbbdPhe19v`

### Key Fields
- `session_id` - Session ID (PRIMARY)
- `nome_cliente`, `cognome_cliente` - Client name
- `session_data` - Complete form data (JSON)
- `last_updated`, `created_at` - Timestamps
- `status` - draft, in_progress, saved_to_airtable

### Current Integration
```javascript
// File: /src/services/airtable.js

// Save session
import { saveSessionToAirtable } from './services/airtable';
await saveSessionToAirtable(sessionId, sessionData, clientName, quoteRef);

// Load session
import { loadSessionFromAirtable } from './services/airtable';
const sessionData = await loadSessionFromAirtable(sessionId);

// Get all sessions
import { getAllSessions } from './services/airtable';
const sessions = await getAllSessions();

// Delete session
import { deleteSession } from './services/airtable';
await deleteSession(recordId);
```

### Quick API Call
```bash
# Get all sessions
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblb7q5ZbbdPhe19v" \
  -H "Authorization: Bearer $TOKEN"

# Get specific session
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/tblb7q5ZbbdPhe19v?filterByFormula={session_id}='SESSION_ID'" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common API Patterns

### GET Records
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/TABLE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### GET with Filter
```bash
curl "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/TABLE_ID?filterByFormula={fieldname}='value'" \
  -H "Authorization: Bearer $TOKEN"
```

### CREATE Record
```bash
curl -X POST "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/TABLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"field1":"value1","field2":"value2"}}'
```

### UPDATE Record
```bash
curl -X PATCH "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/TABLE_ID/RECORD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"field1":"new_value"}}'
```

### DELETE Record
```bash
curl -X DELETE "https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/TABLE_ID/RECORD_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## JavaScript Integration Template

```javascript
// Generic Airtable fetch function
const airtableFetch = async (tableId, method = 'GET', data = null, recordId = null) => {
  const url = recordId
    ? `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/${tableId}/${recordId}`
    : `https://api.airtable.com/v0/appZ2DRpgz4wr3OqX/${tableId}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }

  return await response.json();
};

// Usage examples
// Get records
const records = await airtableFetch('tbldgj4A9IUwSL8z6');

// Create record
const newRecord = await airtableFetch('tbldgj4A9IUwSL8z6', 'POST', {
  fields: { 'nome / ragione sociale': 'Test Client' }
});

// Update record
const updatedRecord = await airtableFetch('tbldgj4A9IUwSL8z6', 'PATCH', {
  fields: { 'email': 'new@example.com' }
}, 'recXXXXXXXXXXXXX');

// Delete record
await airtableFetch('tbldgj4A9IUwSL8z6', 'DELETE', null, 'recXXXXXXXXXXXXX');
```

---

## Rate Limits

⚠️ **Important**: Airtable API limits:
- **5 requests per second** per base
- **100,000 records** per base

```javascript
// Rate limiter implementation
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let lastCallTime = 0;
const minInterval = 200; // 200ms = 5 req/sec

const rateLimitedFetch = async (...args) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;

  if (timeSinceLastCall < minInterval) {
    await sleep(minInterval - timeSinceLastCall);
  }

  lastCallTime = Date.now();
  return fetch(...args);
};
```

---

## Error Handling

```javascript
const handleAirtableError = (error, response) => {
  const status = response?.status;

  switch (status) {
    case 401:
      return 'Invalid API token';
    case 403:
      return 'Permission denied';
    case 404:
      return 'Record not found';
    case 422:
      return 'Invalid data format';
    case 429:
      return 'Rate limit exceeded';
    default:
      return error.message || 'Unknown error';
  }
};

// Usage
try {
  const data = await airtableFetch('TABLE_ID');
} catch (error) {
  console.error(handleAirtableError(error));
}
```

---

## Next Steps for Integration

### Priority 1: Client Management
- [ ] Create `clientService.js`
- [ ] Implement `createClientRecord()`
- [ ] Implement `findDuplicateClients()`
- [ ] Add client sync on quote save

### Priority 2: Installation Management
- [ ] Create `installationService.js`
- [ ] Implement `createInstallationRecord()`
- [ ] Link installations to clients
- [ ] Upload render images

### Priority 3: Task Automation
- [ ] Create `taskService.js`
- [ ] Auto-create tasks from workflows
- [ ] Implement task status tracking

---

## File Locations

- **Full Guide**: `/AIRTABLE_INTEGRATION_GUIDE.md`
- **Current Integration**: `/src/services/airtable.js`
- **Environment Config**: `/.env` (not committed)
- **Environment Template**: `/.env.example`

---

## Support

For detailed information, see `AIRTABLE_INTEGRATION_GUIDE.md`

**Contact**: solefacilesrl@gmail.com
**Last Updated**: 2025-10-30
