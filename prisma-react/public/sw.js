// Service Worker for PRISMA Solar - Offline Support
// Versione 1.0.0 - Supporto offline per lavoro in montagna

const CACHE_NAME = 'prisma-solar-v1.0.0';
const OFFLINE_QUEUE = 'offline-requests';

// File da cachare per funzionamento offline
const CACHE_FILES = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/templates/PRISMA.html',
  '/version.json'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_FILES);
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );

  // Attiva immediatamente il nuovo service worker
  self.skipWaiting();
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Prende controllo immediatamente di tutte le pagine
  return self.clients.claim();
});

// Strategia di fetch: Network First, poi Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-HTTP/HTTPS (chrome-extension, devtools, etc)
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignora richieste browser extensions
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Gestione chiamate API Airtable
  if (url.hostname === 'api.airtable.com') {
    event.respondWith(handleAirtableRequest(request));
    return;
  }

  // Per tutti gli altri file: Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Copia la response per poterla cachare
            // Solo se HTTP/HTTPS e status OK
            if (response && response.status === 200 && request.url.startsWith('http')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Verifica ancora schema prima di cachare
                  if (request.url.startsWith('http')) {
                    cache.put(request, responseToCache).catch((err) => {
                      console.log('Cache put failed:', request.url, err);
                    });
                  }
                });
            }
            return response;
          })
          .catch(() => {
            // Offline: ritorna pagina placeholder se richiesta HTML
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Gestione richieste Airtable (Network First con fallback offline)
async function handleAirtableRequest(request) {
  try {
    // Prova prima con la rete
    const response = await fetch(request);

    // Se successo, salva in cache per reference (solo GET requests)
    if (response && response.status === 200 && request.method === 'GET') {
      const responseClone = response.clone();
      caches.open('airtable-cache').then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, queuing request for later sync');

    // Se è una richiesta POST/PUT/PATCH, mettila in coda
    if (request.method !== 'GET') {
      await queueOfflineRequest(request);

      // Ritorna una risposta mock per non bloccare l'app
      return new Response(
        JSON.stringify({
          offline: true,
          queued: true,
          message: 'Richiesta salvata. Verrà sincronizzata quando tornerà la connessione.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Se è una GET, prova a recuperare dalla cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Nessuna cache disponibile
    return new Response(
      JSON.stringify({
        offline: true,
        error: 'No cached data available'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Coda richieste offline per sincronizzazione successiva
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };

  // Salva in IndexedDB tramite messaggio al client
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'QUEUE_REQUEST',
      data: requestData
    });
  });
}

// Background Sync - sincronizza quando torna la connessione
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('[SW] Starting offline data sync...');

  // Invia messaggio ai client per avviare la sincronizzazione
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'START_SYNC'
    });
  });
}

// Gestione messaggi dai client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
