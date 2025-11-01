// OfflineQueue - Gestione sincronizzazione automatica
// Sincronizza foto, video, progetti e clienti quando torna internet

import { getOfflineManager } from './offlineManager';

class OfflineQueue {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncListeners = [];
    this.airtableToken = import.meta.env.VITE_AIRTABLE_TOKEN;
    this.airtableBase = import.meta.env.VITE_AIRTABLE_BASE_ID;

    // Ascolta eventi online/offline
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Connessione ripristinata!');
      this.isOnline = true;
      this.notifyListeners('online');

      // Avvia sincronizzazione automatica dopo 2 secondi
      setTimeout(() => this.startSync(), 2000);
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connessione persa!');
      this.isOnline = false;
      this.notifyListeners('offline');
    });

    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'START_SYNC') {
          this.startSync();
        }
      });
    }
  }

  // Registra callback per eventi sync
  onSyncStatusChange(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(status, data = {}) {
    this.syncListeners.forEach(callback => {
      callback({ status, data });
    });
  }

  // === SINCRONIZZAZIONE PRINCIPALE ===

  async startSync() {
    if (this.isSyncing) {
      console.log('Sync già in corso...');
      return;
    }

    if (!this.isOnline) {
      console.log('Offline - sync rimandata');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncing', { progress: 0 });

    console.log('🔄 Avvio sincronizzazione...');

    try {
      const offlineManager = await getOfflineManager();

      // 1. Sincronizza clienti
      await this.syncClients(offlineManager);

      // 2. Sincronizza progetti
      await this.syncProjects(offlineManager);

      // 3. Sincronizza foto
      await this.syncPhotos(offlineManager);

      // 4. Sincronizza video
      await this.syncVideos(offlineManager);

      // 5. Processa coda API
      await this.processApiQueue(offlineManager);

      console.log('✅ Sincronizzazione completata!');
      this.notifyListeners('completed', { success: true });

      // Registra background sync
      await this.registerBackgroundSync();

    } catch (error) {
      console.error('❌ Errore sincronizzazione:', error);
      this.notifyListeners('error', { error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  // === SYNC CLIENTI ===

  async syncClients(offlineManager) {
    const unsyncedClients = await offlineManager.getClients({ synced: false });

    console.log(`📋 Sincronizzando ${unsyncedClients.length} clienti...`);

    for (const client of unsyncedClients) {
      try {
        let airtableId;

        if (client.airtableId) {
          // Update esistente
          airtableId = await this.updateClientInAirtable(client);
        } else {
          // Nuovo cliente
          airtableId = await this.createClientInAirtable(client);
        }

        // Marca come sincronizzato
        await offlineManager.updateClient(client.id, {
          airtableId,
          synced: true,
          syncedAt: Date.now()
        });

        console.log(`✅ Cliente ${client.nome} sincronizzato`);

      } catch (error) {
        console.error(`❌ Errore sync cliente ${client.id}:`, error);
      }
    }
  }

  async createClientInAirtable(client) {
    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tbldgj4A9IUwSL8z6`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'nome / ragione sociale': client.nome,
            'email': client.email,
            'telefono': client.telefono,
            'indirizzo installazione impianto': client.indirizzo,
            'comune': client.comune,
            'provincia': client.provincia,
            'CAP': client.cap,
            'data di nascita': client.dataNascita,
            'nazione di nascita': client.nazioneDiNascita,
            'provincia di nascita': client.provinciaDiNascita,
            'comune di nascita': client.comuneDiNascita,
            'indirizzo residenza': client.indirizzoResidenza,
            'città residenza': client.cittaResidenza,
            'CAP residenza': client.capResidenza,
            'codice fiscale': client.codiceFiscale,
            'IBAN': client.iban,
            'contatto tramite': client.contattoTramite,
            'referente': client.referente,
            'note cliente': client.noteCliente,
            'statusCliente': 'nuovo_lead',
            'step': 1
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  async updateClientInAirtable(client) {
    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tbldgj4A9IUwSL8z6/${client.airtableId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'nome / ragione sociale': client.nome,
            'email': client.email,
            'telefono': client.telefono,
            'note cliente': client.noteCliente
            // Altri campi aggiornabili...
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    return client.airtableId;
  }

  // === SYNC PROGETTI ===

  async syncProjects(offlineManager) {
    const unsyncedProjects = await offlineManager.getProjects({ synced: false });

    console.log(`📂 Sincronizzando ${unsyncedProjects.length} progetti...`);

    for (const project of unsyncedProjects) {
      try {
        let airtableId;

        if (project.airtableId) {
          airtableId = await this.updateProjectInAirtable(project);
        } else {
          airtableId = await this.createProjectInAirtable(project);
        }

        await offlineManager.updateProject(project.id, {
          airtableId,
          synced: true,
          syncedAt: Date.now()
        });

        console.log(`✅ Progetto ${project.id} sincronizzato`);

      } catch (error) {
        console.error(`❌ Errore sync progetto ${project.id}:`, error);
      }
    }
  }

  async createProjectInAirtable(project) {
    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tblU0P92KEZv9hQsK`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'cliente': [project.clientAirtableId],
            'step': project.step || 1,
            'stepNome': project.stepNome || 'nuovo',
            'coordinateGPS': project.coordinateGPS,
            'sopralluogoData': project.sopralluogoData,
            'linkPCloud': project.linkPCloud,
            'potenzaImpianto': project.potenzaImpianto
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  async updateProjectInAirtable(project) {
    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tblU0P92KEZv9hQsK/${project.airtableId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'step': project.step,
            'stepNome': project.stepNome,
            'coordinateGPS': project.coordinateGPS,
            'linkPCloud': project.linkPCloud
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    return project.airtableId;
  }

  // === SYNC FOTO ===

  async syncPhotos(offlineManager) {
    const unsyncedPhotos = await offlineManager.getUnsyncedPhotos();

    console.log(`📸 Sincronizzando ${unsyncedPhotos.length} foto...`);

    for (const photo of unsyncedPhotos) {
      try {
        // Upload foto su Airtable attachment
        const airtableUrl = await this.uploadPhotoToAirtable(photo);

        await offlineManager.markPhotoSynced(photo.id, airtableUrl);

        console.log(`✅ Foto ${photo.id} sincronizzata`);

      } catch (error) {
        console.error(`❌ Errore sync foto ${photo.id}:`, error);

        // Incrementa retry count
        if (photo.retryCount < 3) {
          await offlineManager.updatePhoto(photo.id, {
            retryCount: photo.retryCount + 1
          });
        }
      }
    }
  }

  async uploadPhotoToAirtable(photo) {
    // Converti blob in base64 per Airtable
    const base64 = await this.blobToBase64(photo.blob);

    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tblU0P92KEZv9hQsK/${photo.projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'sopralluogoFoto': [
              {
                url: base64,
                filename: `foto_${photo.timestamp}.jpg`
              }
            ]
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable photo upload error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.fields.sopralluogoFoto[0].url;
  }

  // === SYNC VIDEO ===

  async syncVideos(offlineManager) {
    const unsyncedVideos = await offlineManager.getUnsyncedVideos();

    console.log(`🎥 Sincronizzando ${unsyncedVideos.length} video...`);

    for (const video of unsyncedVideos) {
      try {
        // Per i video, carica su pCloud invece che Airtable
        // (Airtable ha limiti di dimensione)
        const pCloudUrl = await this.uploadVideoToPCloud(video);

        // Poi salva il link in Airtable
        await this.savePCloudLinkToAirtable(video.projectId, pCloudUrl);

        await offlineManager.markVideoSynced(video.id, pCloudUrl);

        console.log(`✅ Video ${video.id} sincronizzato`);

      } catch (error) {
        console.error(`❌ Errore sync video ${video.id}:`, error);
      }
    }
  }

  async uploadVideoToPCloud(video) {
    // Placeholder - implementare con pCloud API
    // Per ora ritorna URL mock
    console.log('Upload video to pCloud:', video);
    return `https://pcloud.com/video_${video.timestamp}.mp4`;
  }

  async savePCloudLinkToAirtable(projectId, pCloudUrl) {
    const response = await fetch(
      `https://api.airtable.com/v0/${this.airtableBase}/tblU0P92KEZv9hQsK/${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'linkPCloud': pCloudUrl
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }
  }

  // === PROCESS API QUEUE ===

  async processApiQueue(offlineManager) {
    const queuedRequests = await offlineManager.getQueuedRequests();

    console.log(`📤 Processando ${queuedRequests.length} richieste in coda...`);

    for (const request of queuedRequests) {
      try {
        await this.executeQueuedRequest(request);
        await offlineManager.removeQueuedRequest(request.id);
        console.log(`✅ Richiesta ${request.id} completata`);

      } catch (error) {
        console.error(`❌ Errore richiesta ${request.id}:`, error);

        if (request.retryCount < request.maxRetries) {
          await offlineManager.incrementRetryCount(request.id);
        } else {
          console.log(`❌ Richiesta ${request.id} fallita dopo ${request.maxRetries} tentativi`);
          await offlineManager.removeQueuedRequest(request.id);
        }
      }
    }
  }

  async executeQueuedRequest(request) {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // === UTILITIES ===

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-data');
        console.log('Background sync registered');
      } catch (error) {
        console.log('Background sync not supported:', error);
      }
    }
  }

  // === STATUS ===

  async getSyncStatus() {
    const offlineManager = await getOfflineManager();
    const stats = await offlineManager.getStorageStats();

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingClients: stats.unsyncedClients,
      pendingProjects: stats.unsyncedProjects,
      pendingPhotos: stats.unsyncedPhotos,
      pendingVideos: stats.unsyncedVideos,
      pendingRequests: stats.apiQueue
    };
  }
}

// Singleton instance
let offlineQueueInstance = null;

export const getOfflineQueue = () => {
  if (!offlineQueueInstance) {
    offlineQueueInstance = new OfflineQueue();
  }
  return offlineQueueInstance;
};

export default OfflineQueue;
