// OfflineManager - Gestione dati offline con IndexedDB
// Per funzionare anche in montagna senza connessione

class OfflineManager {
  constructor() {
    this.dbName = 'PrismaSolarDB';
    this.version = 1;
    this.db = null;
  }

  // Inizializza database IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Errore apertura IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB aperto con successo');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store per clienti offline
        if (!db.objectStoreNames.contains('clients')) {
          const clientsStore = db.createObjectStore('clients', {
            keyPath: 'id',
            autoIncrement: true
          });
          clientsStore.createIndex('email', 'email', { unique: false });
          clientsStore.createIndex('telefono', 'telefono', { unique: false });
          clientsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store per progetti offline
        if (!db.objectStoreNames.contains('projects')) {
          const projectsStore = db.createObjectStore('projects', {
            keyPath: 'id',
            autoIncrement: true
          });
          projectsStore.createIndex('clientId', 'clientId', { unique: false });
          projectsStore.createIndex('step', 'step', { unique: false });
          projectsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store per foto offline
        if (!db.objectStoreNames.contains('photos')) {
          const photosStore = db.createObjectStore('photos', {
            keyPath: 'id',
            autoIncrement: true
          });
          photosStore.createIndex('projectId', 'projectId', { unique: false });
          photosStore.createIndex('tipo', 'tipo', { unique: false });
          photosStore.createIndex('synced', 'synced', { unique: false });
          photosStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store per video offline
        if (!db.objectStoreNames.contains('videos')) {
          const videosStore = db.createObjectStore('videos', {
            keyPath: 'id',
            autoIncrement: true
          });
          videosStore.createIndex('projectId', 'projectId', { unique: false });
          videosStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store per coda richieste API
        if (!db.objectStoreNames.contains('apiQueue')) {
          const queueStore = db.createObjectStore('apiQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('priority', 'priority', { unique: false });
        }

        // Store per manutenzioni offline
        if (!db.objectStoreNames.contains('maintenance')) {
          const maintenanceStore = db.createObjectStore('maintenance', {
            keyPath: 'id',
            autoIncrement: true
          });
          maintenanceStore.createIndex('projectId', 'projectId', { unique: false });
          maintenanceStore.createIndex('tipo', 'tipo', { unique: false });
          maintenanceStore.createIndex('synced', 'synced', { unique: false });
        }

        console.log('Database structure created');
      };
    });
  }

  // === GESTIONE CLIENTI ===

  async saveClient(clientData) {
    const transaction = this.db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');

    const client = {
      ...clientData,
      synced: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(client);
      request.onsuccess = () => {
        console.log('Cliente salvato offline:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getClients(filter = {}) {
    const transaction = this.db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let clients = request.result;

        // Applica filtri
        if (filter.synced !== undefined) {
          clients = clients.filter(c => c.synced === filter.synced);
        }

        resolve(clients);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateClient(id, updates) {
    const transaction = this.db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const client = getRequest.result;
        if (!client) {
          reject(new Error('Client not found'));
          return;
        }

        const updatedClient = {
          ...client,
          ...updates,
          updatedAt: Date.now(),
          synced: false
        };

        const putRequest = store.put(updatedClient);
        putRequest.onsuccess = () => resolve(updatedClient);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // === GESTIONE PROGETTI ===

  async saveProject(projectData) {
    const transaction = this.db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');

    const project = {
      ...projectData,
      synced: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(project);
      request.onsuccess = () => {
        console.log('Progetto salvato offline:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProjects(filter = {}) {
    const transaction = this.db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let projects = request.result;

        if (filter.clientId) {
          projects = projects.filter(p => p.clientId === filter.clientId);
        }
        if (filter.step) {
          projects = projects.filter(p => p.step === filter.step);
        }
        if (filter.synced !== undefined) {
          projects = projects.filter(p => p.synced === filter.synced);
        }

        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateProject(id, updates) {
    const transaction = this.db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const project = getRequest.result;
        if (!project) {
          reject(new Error('Project not found'));
          return;
        }

        const updatedProject = {
          ...project,
          ...updates,
          updatedAt: Date.now(),
          synced: false
        };

        const putRequest = store.put(updatedProject);
        putRequest.onsuccess = () => resolve(updatedProject);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // === GESTIONE FOTO (per sopralluoghi) ===

  async savePhoto(projectId, photoBlob, metadata = {}) {
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    const photo = {
      projectId,
      blob: photoBlob,
      tipo: metadata.tipo || 'generale',
      descrizione: metadata.descrizione || '',
      gps: metadata.gps || null,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(photo);
      request.onsuccess = () => {
        console.log('Foto salvata offline:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotos(projectId) {
    const transaction = this.db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    const index = store.index('projectId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedPhotos() {
    const transaction = this.db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markPhotoSynced(photoId, airtableUrl) {
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(photoId);

      getRequest.onsuccess = () => {
        const photo = getRequest.result;
        if (!photo) {
          reject(new Error('Photo not found'));
          return;
        }

        photo.synced = true;
        photo.airtableUrl = airtableUrl;
        photo.syncedAt = Date.now();

        const putRequest = store.put(photo);
        putRequest.onsuccess = () => resolve(photo);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // === GESTIONE VIDEO ===

  async saveVideo(projectId, videoBlob, metadata = {}) {
    const transaction = this.db.transaction(['videos'], 'readwrite');
    const store = transaction.objectStore('videos');

    const video = {
      projectId,
      blob: videoBlob,
      tipo: metadata.tipo || 'drone',
      descrizione: metadata.descrizione || '',
      duration: metadata.duration || 0,
      gps: metadata.gps || null,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(video);
      request.onsuccess = () => {
        console.log('Video salvato offline:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedVideos() {
    const transaction = this.db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === CODA RICHIESTE API ===

  async queueApiRequest(requestData, priority = 5) {
    const transaction = this.db.transaction(['apiQueue'], 'readwrite');
    const store = transaction.objectStore('apiQueue');

    const queueItem = {
      ...requestData,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getQueuedRequests() {
    const transaction = this.db.transaction(['apiQueue'], 'readonly');
    const store = transaction.objectStore('apiQueue');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        // Ordina per priorità (alta = numero basso) e timestamp
        const sorted = request.result.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.timestamp - b.timestamp;
        });
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeQueuedRequest(id) {
    const transaction = this.db.transaction(['apiQueue'], 'readwrite');
    const store = transaction.objectStore('apiQueue');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async incrementRetryCount(id) {
    const transaction = this.db.transaction(['apiQueue'], 'readwrite');
    const store = transaction.objectStore('apiQueue');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error('Queue item not found'));
          return;
        }

        item.retryCount++;
        item.lastRetry = Date.now();

        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve(item);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // === STATISTICHE STORAGE ===

  async getStorageStats() {
    const stores = ['clients', 'projects', 'photos', 'videos', 'apiQueue'];
    const stats = {};

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const count = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      stats[storeName] = count;
    }

    // Calcola unsynced
    stats.unsyncedClients = await this.getClients({ synced: false }).then(c => c.length);
    stats.unsyncedProjects = await this.getProjects({ synced: false }).then(p => p.length);
    stats.unsyncedPhotos = await this.getUnsyncedPhotos().then(p => p.length);
    stats.unsyncedVideos = await this.getUnsyncedVideos().then(v => v.length);

    return stats;
  }

  // === CLEAR DATA ===

  async clearSyncedData() {
    const stores = ['clients', 'projects', 'photos', 'videos'];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('synced');

      const request = index.openCursor(IDBKeyRange.only(true));

      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    }

    console.log('Cleared all synced data');
  }

  async clearAllData() {
    const stores = ['clients', 'projects', 'photos', 'videos', 'apiQueue', 'maintenance'];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('Cleared all offline data');
  }
}

// Singleton instance
let offlineManagerInstance = null;

export const getOfflineManager = async () => {
  if (!offlineManagerInstance) {
    offlineManagerInstance = new OfflineManager();
    await offlineManagerInstance.init();
  }
  return offlineManagerInstance;
};

export default OfflineManager;
