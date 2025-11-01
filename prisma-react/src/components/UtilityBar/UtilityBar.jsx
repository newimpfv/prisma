import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { getProducts, isOnline, getCacheTimestamp } from '../../services/airtable';
import { addConnectionListener } from '../../utils/offline';
import Version from '../Version/Version';

const UtilityBar = () => {
  const [importHover, setImportHover] = useState(false);
  const [syncHover, setSyncHover] = useState(false);
  const [clearHover, setClearHover] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [cacheAge, setCacheAge] = useState(null);

  const {
    setClientData,
    setStructureData,
    setFalde,
    setInverters,
    setBatteries,
    setComponents,
    setLaborSafety,
    setUnitCosts,
    setEnergyData,
    setEconomicParams,
    setQuoteData,
    setCustomText,
    setPvgisData,
    setRenderImages
  } = useForm();

  // Listen for online/offline events
  useEffect(() => {
    const cleanup = addConnectionListener((isOnline) => {
      setOnline(isOnline);
      if (isOnline) {
        console.log('[Network] Back online - checking for data updates');

        // Auto-sync in background when coming back online if cache is stale
        const timestamp = getCacheTimestamp();
        if (timestamp) {
          const age = Date.now() - timestamp;
          const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

          if (age > CACHE_DURATION) {
            console.log('[Auto-Sync] Cache is stale, refreshing in background...');
            getProducts(true)
              .then(result => {
                console.log(`[Auto-Sync] Successfully updated ${result.products.length} products`);
                // Update cache age display
                const newTimestamp = getCacheTimestamp();
                if (newTimestamp) {
                  setCacheAge(Date.now() - newTimestamp);
                }
              })
              .catch(error => {
                console.warn('[Auto-Sync] Failed:', error.message);
              });
          } else {
            console.log('[Auto-Sync] Cache is still fresh, no need to update');
          }
        }
      } else {
        console.log('[Network] Gone offline - using cached data');
      }
    });

    // Update cache age periodically
    const updateCacheAge = () => {
      const timestamp = getCacheTimestamp();
      if (timestamp) {
        const age = Date.now() - timestamp;
        setCacheAge(age);
      } else {
        setCacheAge(null);
      }
    };

    updateCacheAge();
    const interval = setInterval(updateCacheAge, 30000); // Update every 30 seconds

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  // Format cache age for display
  const formatCacheAge = (age) => {
    if (!age) return 'mai';
    const hours = Math.floor(age / (1000 * 60 * 60));
    const minutes = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h fa`;
    if (minutes > 0) return `${minutes}m fa`;
    return 'ora';
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.prisma';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);

          // Restore all data
          setClientData(data.clientData || {});
          setStructureData(data.structureData || {});
          setFalde(data.falde || []);
          setInverters(data.inverters || []);
          setBatteries(data.batteries || []);
          setComponents(data.components || {});
          setLaborSafety(data.laborSafety || {});
          setUnitCosts(data.unitCosts || {});
          setEnergyData(data.energyData || {});
          setEconomicParams(data.economicParams || {});
          setQuoteData(data.quoteData || {});
          setCustomText(data.customText || {});
          setPvgisData(data.pvgisData || null);
          setRenderImages(data.renderImages || ['', '', '']);

          alert('Preventivo importato con successo!');
        } catch (error) {
          alert('Errore nell\'importazione del file: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = async () => {
    const confirmMessage = '⚠️ ATTENZIONE ⚠️\n\n' +
      'Questa operazione cancellerà TUTTI i dati memorizzati:\n\n' +
      '• Preventivi salvati\n' +
      '• Cache clienti\n' +
      '• Cache impianti\n' +
      '• Report di manutenzione\n' +
      '• Cache listino prezzi\n' +
      '• Cache Service Worker\n' +
      '• Tutti i dati offline\n\n' +
      'Sei SICURO di voler continuare?';

    if (confirm(confirmMessage)) {
      try {
        // 1. Clear ALL localStorage
        console.log('Clearing localStorage...');
        const itemsCount = localStorage.length;
        localStorage.clear();

        // 2. Clear ALL sessionStorage
        console.log('Clearing sessionStorage...');
        sessionStorage.clear();

        // 3. Clear Service Worker caches
        if ('serviceWorker' in navigator && 'caches' in window) {
          console.log('Clearing Service Worker caches...');
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        }

        // 4. Clear IndexedDB if present
        if ('indexedDB' in window) {
          console.log('Clearing IndexedDB...');
          try {
            const databases = await indexedDB.databases();
            await Promise.all(
              databases.map(db => {
                console.log(`Deleting database: ${db.name}`);
                return new Promise((resolve) => {
                  const request = indexedDB.deleteDatabase(db.name);
                  request.onsuccess = () => resolve();
                  request.onerror = () => resolve(); // Continue even if error
                });
              })
            );
          } catch (e) {
            console.warn('Could not enumerate IndexedDB databases:', e);
          }
        }

        // 5. Unregister Service Workers
        if ('serviceWorker' in navigator) {
          console.log('Unregistering Service Workers...');
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(registration => {
              console.log('Unregistering Service Worker...');
              return registration.unregister();
            })
          );
        }

        alert(`✅ Cache Svuotata!\n\n${itemsCount} elementi rimossi da localStorage.\nTutte le cache e i dati offline sono stati cancellati.\n\nLa pagina verrà ricaricata.`);

        // Reload the page to start fresh
        window.location.reload(true); // Force reload from server
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert(`❌ Errore durante la pulizia della cache:\n\n${error.message}\n\nAlcuni dati potrebbero non essere stati cancellati.`);
      }
    }
  };

  const handleSync = async () => {
    // Check if offline
    if (!online) {
      alert('⚠️ Modalità Offline\n\nSei attualmente offline. Il pulsante Sync funziona solo quando sei connesso a Internet.\n\nL\'app continuerà a funzionare con i dati salvati in cache.');
      return;
    }

    try {
      setSyncing(true);
      const result = await getProducts(true); // Force refresh

      if (result.offline) {
        alert(`📴 Offline\n\nSei offline. Vengono usati ${result.products.length} prodotti dalla cache.`);
      } else if (result.fromCache && result.error) {
        alert(`⚠️ Sincronizzazione Parziale\n\nImpossibile connettersi ad Airtable (${result.error}).\n\nVengono usati ${result.products.length} prodotti dalla cache precedente.`);
      } else {
        alert(`✅ Sincronizzazione Completata!\n\n${result.products.length} prodotti caricati da Airtable.\n\nI dati sono stati aggiornati e salvati in cache.`);
        // Update cache age immediately
        const timestamp = getCacheTimestamp();
        if (timestamp) {
          setCacheAge(Date.now() - timestamp);
        }
        window.location.reload(); // Reload to apply new data
      }
    } catch (error) {
      alert(`❌ Errore Sincronizzazione\n\n${error.message}\n\nVerifica la connessione e riprova.`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Import Button - Green Gradient */}
        <button
          onClick={handleImport}
          onMouseEnter={() => setImportHover(true)}
          onMouseLeave={() => setImportHover(false)}
          style={{
            background: importHover
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: importHover
              ? '0 10px 25px -5px rgba(16, 185, 129, 0.5), 0 8px 10px -6px rgba(16, 185, 129, 0.4)'
              : '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            cursor: 'pointer',
            transform: importHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
          }}
          title="Importa Preventivo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Importa
        </button>

        {/* Sync Airtable Button - Purple Gradient with Online/Offline Indicator */}
        <button
          onClick={handleSync}
          disabled={syncing || !online}
          onMouseEnter={() => setSyncHover(true)}
          onMouseLeave={() => setSyncHover(false)}
          style={{
            background: !online
              ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
              : syncing
              ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
              : syncHover
              ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: syncHover && !syncing && online
              ? '0 10px 25px -5px rgba(139, 92, 246, 0.5), 0 8px 10px -6px rgba(139, 92, 246, 0.4)'
              : '0 4px 15px -3px rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            cursor: (syncing || !online) ? 'not-allowed' : 'pointer',
            transform: syncHover && !syncing && online ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
            opacity: (syncing || !online) ? 0.6 : 1,
            position: 'relative'
          }}
          title={online ? `Sincronizza Listino Prezzi da Airtable (cache: ${formatCacheAge(cacheAge)})` : 'Offline - Sincronizzazione non disponibile'}
        >
          {/* Online/Offline Status Indicator */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: online ? '#10b981' : '#ef4444',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />

          {syncing ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Sincronizzando...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : !online ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              Offline
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Sync Airtable
              {cacheAge && (
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  ({formatCacheAge(cacheAge)})
                </span>
              )}
            </>
          )}
        </button>

        {/* Clear All Cache Button - Red with white background */}
        <button
          onClick={handleClearAll}
          onMouseEnter={() => setClearHover(true)}
          onMouseLeave={() => setClearHover(false)}
          style={{
            background: clearHover ? '#fee2e2' : 'white',
            color: clearHover ? '#dc2626' : '#ef4444',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: clearHover
              ? '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 8px 10px -6px rgba(239, 68, 68, 0.3)'
              : '0 4px 15px -3px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: clearHover ? '2px solid #dc2626' : '2px solid #ef4444',
            cursor: 'pointer',
            transform: clearHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
          }}
          title="Svuota Cache: Cancella tutti i dati memorizzati (localStorage, Service Worker, IndexedDB)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Svuota Cache
        </button>

        {/* Version Button */}
        <Version />
      </div>
    </>
  );
};

export default UtilityBar;
