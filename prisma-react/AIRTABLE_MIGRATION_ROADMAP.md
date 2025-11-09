# 🚀 Roadmap: Migrazione Dati Prodotti ad Airtable

## 📋 Analisi Situazione Attuale

### ✅ Cosa Funziona
- Servizio Airtable (`src/services/airtable.js`) completo e funzionante
- Sincronizzazione automatica in background tramite UtilityBar
- Cache offline-first con durata 24 ore
- Dati vengono scaricati e salvati in localStorage

### ❌ Cosa Non Funziona
- I componenti importano dati HARDCODED da file statici:
  - `src/data/modules.js` → usato da GruppoModuli, FaldaItem
  - `src/data/inverters.js` → usato da InverterItem
  - `src/data/batteries.js` → usato da BatteryItem
- I dati Airtable vengono scaricati ma MAI utilizzati
- Prezzi e prodotti mostrati sono obsoleti/statici

### 🎯 Obiettivo Finale
Tutti i componenti devono usare i dati da Airtable come fonte unica di verità, con fallback offline dalla cache.

---

## 📝 Piano di Implementazione

### STEP 1: Creare Products Context
**File**: `src/context/ProductsContext.jsx`

Creare un Context React che:
- Carica i prodotti da Airtable all'avvio dell'app
- Organizza i prodotti per categoria (modules, inverters, batteries, etc.)
- Fornisce stati di loading/error
- Permette refresh manuale
- Gestisce cache e modalità offline

**Deliverable**: Hook `useProducts()` disponibile per tutti i componenti

---

### STEP 2: Creare Hook Specializzati
**File**: `src/hooks/useProductData.js`

Creare hook dedicati per accedere facilmente ai dati:
- `useModules()` → restituisce array di moduli fotovoltaici
- `useInverters()` → restituisce array di inverter
- `useBatteries()` → restituisce array di batterie
- `useInvertersByCategory()` → inverter organizzati per categoria
- `useBatteriesByCategory()` → batterie organizzate per categoria/gruppo

**Deliverable**: Hook pronti per essere usati nei componenti

---

### STEP 3: Integrare ProductsProvider in App
**File**: `src/App.jsx` o `src/main.jsx`

Wrappare l'app con ProductsProvider per rendere disponibili i dati ovunque:
```jsx
<ProductsProvider>
  <FormProvider>
    <App />
  </FormProvider>
</ProductsProvider>
```

**Deliverable**: Dati prodotti caricati all'avvio e disponibili globalmente

---

### STEP 4: Migrare GruppoModuli.jsx
**File**: `src/components/Falde/GruppoModuli.jsx`

- Rimuovere import di `modules.js`
- Usare hook `useModules()`
- Gestire stato loading
- Testare che il dropdown moduli funzioni

**Deliverable**: GruppoModuli usa Airtable

---

### STEP 5: Migrare FaldaItem.jsx
**File**: `src/components/Falde/FaldaItem.jsx`

- Rimuovere import di `modules.js`
- Usare hook `useModules()`
- Aggiornare calcolo potenza totale falda
- Testare che i calcoli siano corretti

**Deliverable**: FaldaItem usa Airtable

---

### STEP 6: Migrare InverterItem.jsx
**File**: `src/components/Inverters/InverterItem.jsx`

- Rimuovere import di `inverters.js`
- Usare hook `useInvertersByCategory()`
- Mantenere raggruppamento per categoria
- Testare dropdown inverter

**Deliverable**: InverterItem usa Airtable

---

### STEP 7: Migrare BatteryItem.jsx
**File**: `src/components/Batteries/BatteryItem.jsx`

- Rimuovere import di `batteries.js`
- Usare hook `useBatteriesByCategory()`
- Mantenere organizzazione per gruppo (T30, T58, HS, etc.)
- Testare dropdown batterie

**Deliverable**: BatteryItem usa Airtable

---

### STEP 8: Aggiornare calculations.js
**File**: `src/utils/calculations.js`

Verificare se usa dati statici e aggiornare:
- Se serve accesso a dati prodotti, passarli come parametri
- Oppure usare i dati già presenti nel formData

**Deliverable**: Calcoli funzionano con dati dinamici

---

### STEP 9: Aggiungere UI Feedback
**Componenti vari**

Aggiungere indicatori visivi:
- Loading spinner durante caricamento iniziale
- Messaggio se offline con cache
- Banner se cache è stale
- Errore se nessun dato disponibile

**Deliverable**: UX chiara sullo stato dei dati

---

### STEP 10: Testing Completo

Testare tutti gli scenari:
- ✅ Primo avvio (scarica da Airtable)
- ✅ Avvio con cache valida (usa cache)
- ✅ Avvio con cache stale (usa cache + refresh background)
- ✅ Modalità offline (usa solo cache)
- ✅ Refresh manuale
- ✅ Tutti i dropdown mostrano dati corretti
- ✅ Calcoli prezzi corretti
- ✅ Salvataggio sessioni funziona

**Deliverable**: App completamente funzionante con Airtable

---

### STEP 11: Cleanup
**File da rimuovere**:
- `src/data/modules.js`
- `src/data/inverters.js`
- `src/data/batteries.js`

Documentazione da aggiornare:
- README con info su Products Context
- Note sulla sincronizzazione Airtable

**Deliverable**: Codice pulito senza file obsoleti

---

## 🔄 Strategia Dati

### Formato Dati in Cache
```javascript
{
  modules: [
    { id, name, potenza, larghezza, altezza, prezzo }
  ],
  inverters: [
    { id, name, potenza, prezzo, category }
  ],
  batteries: [
    { id, name, capacita, prezzo, category, group }
  ],
  // ... altre categorie
}
```

### Mapping Airtable → App
- `categoria` in Airtable → categoria principale
- `gruppo` in Airtable → sottocategoria per organizzazione
- Usare funzione `organizeProductsByCategory()` esistente

---

## ⚠️ Gestione Errori

### Scenario 1: Airtable Non Disponibile + Cache Valida
→ Usare cache, mostrare banner "Offline"

### Scenario 2: Airtable Non Disponibile + NO Cache
→ Mostrare errore "Impossibile caricare dati. Connettiti a Internet."

### Scenario 3: Airtable Disponibile + Cache Stale
→ Usare cache immediatamente, aggiornare in background

### Scenario 4: Dati Corrotti in Cache
→ Cancellare cache, forzare fetch da Airtable

---

## 📊 Checklist Pre-Migrazione

- [x] Verificare che servizio Airtable funzioni
- [x] Confermare che dati sono in `listino_prezzi` table
- [ ] Verificare che tutti i prodotti abbiano campi richiesti
- [ ] Testare API Airtable in produzione
- [ ] Fare backup dei dati statici correnti
- [ ] Preparare piano di rollback

---

## 🎯 Success Metrics

Dopo la migrazione:
1. ✅ Tutti i dropdown caricano da Airtable
2. ✅ Prezzi aggiornati su Airtable si riflettono nell'app
3. ✅ App funziona offline con cache
4. ✅ Performance accettabile (< 2s caricamento iniziale)
5. ✅ Nessun import di file statici `.js`

---

**Timeline Stimata**: 3-4 ore
**Priorità**: 🔴 ALTA
**Status**: 📋 Pronto per implementazione
