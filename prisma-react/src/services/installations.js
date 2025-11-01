/**
 * Installations Service - Airtable Integration
 * Manages installation/impianti data in Airtable
 * Links installations to clients via "dati cliente" field
 */

import { isOnline } from './airtable';

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const INSTALLATIONS_TABLE = 'tblp0aOjMtrn7kCv1'; // impianti table
const CACHE_KEY = 'prisma_installations_cache';
const CACHE_TIMESTAMP_KEY = 'prisma_installations_cache_timestamp';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Fetch all installations from Airtable
 */
export const fetchInstallations = async () => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();

    const installations = data.records.map(record => ({
      id: record.id,
      airtableId: record.id,
      nome: record.fields.nome || '',
      indirizzo: record.fields.indirizzo || '',
      coordinate: record.fields.coordinate || '',
      dettagli_moduli: record.fields['dettagli moduli e note'] || '',
      n_moduli_totali: record.fields['n moduli totali'] || 0,
      status_offerta: record.fields['status offerta'] || '',
      status_realizzazione: record.fields['status realizzazione'] || '',
      simulazione_render: record.fields['simulazione/render'] || '',
      impianto_completato: record.fields['impianto completato'] || false,
      compenso: record.fields.Compenso || 0,
      dati_cliente: record.fields['dati cliente'] || [], // Linked client records
      session_id: record.fields.session_id || '',
      maps_ref: record.fields['maps / ref'] || [],
      render_moduli: record.fields['render moduli'] || [],
      foto_impianto: record.fields['foto impianto reale'] || [],
      createdTime: record.createdTime
    }));

    // Cache the installations
    localStorage.setItem(CACHE_KEY, JSON.stringify(installations));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    return installations;
  } catch (error) {
    console.error('Error fetching installations:', error);
    throw error;
  }
};

/**
 * Get cached installations
 */
export const getCachedInstallations = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) {
      return null;
    }

    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      return null; // Cache expired
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cached installations:', error);
    return null;
  }
};

/**
 * Get installations (from cache or fetch)
 */
export const getInstallations = async (forceRefresh = false) => {
  // Offline mode
  if (!isOnline()) {
    const cached = getCachedInstallations() || [];
    return { installations: cached, fromCache: true, offline: true };
  }

  // Try cache first
  if (!forceRefresh) {
    const cached = getCachedInstallations();
    if (cached) {
      return { installations: cached, fromCache: true, offline: false };
    }
  }

  // Fetch fresh data
  try {
    const installations = await fetchInstallations();
    return { installations, fromCache: false, offline: false };
  } catch (error) {
    // Fallback to cache on error
    const cached = getCachedInstallations() || [];
    return { installations: cached, fromCache: true, offline: false, error: error.message };
  }
};

/**
 * Create a new installation in Airtable and link to client
 * @param {Object} installationData - Installation data
 * @param {string} clientId - Airtable record ID of the client to link
 * @param {string} sessionId - Session ID for tracking
 */
export const createInstallation = async (installationData, clientId = null, sessionId = null) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot create installation while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}`;

    const fields = {
      nome: installationData.nome || '',
      indirizzo: installationData.indirizzo || '',
      'dettagli moduli e note': installationData.dettagli_moduli || '',
      'n moduli totali': installationData.n_moduli_totali || 0,
      'status offerta': installationData.status_offerta || 'in preparazione',
      'status realizzazione': installationData.status_realizzazione || 'non iniziato',
      'simulazione/render': installationData.simulazione_render || 'Da fare',
      'impianto completato': installationData.impianto_completato || false,
      Compenso: installationData.compenso || 0
    };

    // Add optional fields
    if (installationData.coordinate) fields.coordinate = installationData.coordinate;
    if (sessionId) fields.session_id = sessionId;

    // Link to client via "dati cliente" field (linked record)
    if (clientId) {
      fields['dati cliente'] = [clientId];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create installation: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...installationData
    };
  } catch (error) {
    console.error('Error creating installation:', error);
    throw error;
  }
};

/**
 * Update an existing installation in Airtable
 */
export const updateInstallation = async (installationId, installationData, clientId = null, sessionId = null) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot update installation while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}/${installationId}`;

    const fields = {
      nome: installationData.nome || '',
      indirizzo: installationData.indirizzo || '',
      'dettagli moduli e note': installationData.dettagli_moduli || '',
      'n moduli totali': installationData.n_moduli_totali || 0,
      'status offerta': installationData.status_offerta || '',
      'status realizzazione': installationData.status_realizzazione || '',
      'simulazione/render': installationData.simulazione_render || '',
      'impianto completato': installationData.impianto_completato || false,
      Compenso: installationData.compenso || 0
    };

    // Add optional fields
    if (installationData.coordinate) fields.coordinate = installationData.coordinate;
    if (sessionId) fields.session_id = sessionId;

    // Update client link if provided
    if (clientId) {
      fields['dati cliente'] = [clientId];
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update installation: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...installationData
    };
  } catch (error) {
    console.error('Error updating installation:', error);
    throw error;
  }
};

/**
 * Delete an installation from Airtable
 */
export const deleteInstallation = async (installationId) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot delete installation while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}/${installationId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete installation: ${error}`);
    }

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return true;
  } catch (error) {
    console.error('Error deleting installation:', error);
    throw error;
  }
};

/**
 * Get installations for a specific client
 */
export const getInstallationsForClient = async (clientId) => {
  const { installations } = await getInstallations();

  return installations.filter(inst =>
    inst.dati_cliente && inst.dati_cliente.includes(clientId)
  );
};

/**
 * Create installation from current quote/preventivo data
 */
export const createInstallationFromQuote = async (quoteData, clientId, sessionId = null) => {
  // Extract relevant data from quote
  const totalModules = quoteData.falde?.reduce((sum, falda) =>
    sum + (falda.num_moduli || 0), 0) || 0;

  const installationData = {
    nome: quoteData.quoteData?.oggetto || 'Nuovo Impianto',
    indirizzo: `${quoteData.clientData?.indirizzo || ''}, ${quoteData.clientData?.comune || ''} ${quoteData.clientData?.provincia || ''}`.trim(),
    dettagli_moduli: `Impianto ${totalModules} moduli - Potenza totale: ${quoteData.structureData?.totale_potenza_kW || 0} kW`,
    n_moduli_totali: totalModules,
    status_offerta: 'in preparazione',
    status_realizzazione: 'preventivo',
    simulazione_render: 'Da fare',
    impianto_completato: false,
    compenso: 0
  };

  return await createInstallation(installationData, clientId, sessionId);
};

/**
 * Save quote to Airtable (creates both client and installation)
 */
export const saveQuoteToAirtable = async (quoteData, sessionId = null) => {
  // Check if client is already selected (via airtableClientId)
  let client;
  const { findExistingClient, createClient } = await import('./clients.js');

  const clientDataFromForm = quoteData.clientData || {};
  // Handle both new format (nome + cognome) and old format (nomeCognome)
  const nomeCliente = clientDataFromForm.nome && clientDataFromForm.cognome
    ? `${clientDataFromForm.nome} ${clientDataFromForm.cognome}`.trim()
    : clientDataFromForm.nome || clientDataFromForm.nomeCognome || '';
  const emailCliente = clientDataFromForm.email || '';

  // If there's an airtableClientId, use that existing client
  if (clientDataFromForm.airtableClientId) {
    console.log(`Using existing client ID: ${clientDataFromForm.airtableClientId}`);
    client = {
      airtableId: clientDataFromForm.airtableClientId,
      nome: nomeCliente
    };
  } else {
    // Check if a client with this name or email already exists
    const existingClient = await findExistingClient(nomeCliente, emailCliente);

    if (existingClient) {
      console.log(`Found existing client: ${existingClient.nome} (${existingClient.id})`);
      client = existingClient;
    } else {
      // Create new client
      console.log(`Creating new client: ${nomeCliente}`);
      const clientData = {
        nome: nomeCliente,
        email: emailCliente,
        cellulare: clientDataFromForm.telefono || '',
        indirizzo_impianto: clientDataFromForm.indirizzo || '',
        citta_impianto: clientDataFromForm.comune || '',
        note: `Preventivo generato da web app - ${new Date().toLocaleString('it-IT')}`
      };

      client = await createClient(clientData, sessionId);
    }
  }

  // Then create the installation linked to this client
  const installation = await createInstallationFromQuote(quoteData, client.airtableId || client.id, sessionId);

  return {
    client,
    installation,
    wasExisting: !!clientDataFromForm.airtableClientId
  };
};

/**
 * Link an installation to a client
 * Updates the "dati cliente" field on the installation record
 */
export const linkInstallationToClient = async (installationId, clientId) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot link installation while offline');
  }

  try {
    // First, get the current installation to see existing links
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}/${installationId}`;

    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch installation: ${getResponse.status}`);
    }

    const installation = await getResponse.json();
    const currentClients = installation.fields['dati cliente'] || [];

    // Add client if not already linked
    if (!currentClients.includes(clientId)) {
      const updatedClients = [...currentClients, clientId];

      const patchResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'dati cliente': updatedClients
          }
        })
      });

      if (!patchResponse.ok) {
        const error = await patchResponse.text();
        throw new Error(`Failed to link installation: ${error}`);
      }

      // Clear cache
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);

      return await patchResponse.json();
    }

    return installation;
  } catch (error) {
    console.error('Error linking installation to client:', error);
    throw error;
  }
};

/**
 * Unlink an installation from a client
 * Removes the client from the "dati cliente" field on the installation record
 */
export const unlinkInstallationFromClient = async (installationId, clientId) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot unlink installation while offline');
  }

  try {
    // First, get the current installation
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}/${installationId}`;

    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch installation: ${getResponse.status}`);
    }

    const installation = await getResponse.json();
    const currentClients = installation.fields['dati cliente'] || [];

    // Remove client from the list
    const updatedClients = currentClients.filter(id => id !== clientId);

    const patchResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'dati cliente': updatedClients
        }
      })
    });

    if (!patchResponse.ok) {
      const error = await patchResponse.text();
      throw new Error(`Failed to unlink installation: ${error}`);
    }

    // Clear cache
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return await patchResponse.json();
  } catch (error) {
    console.error('Error unlinking installation from client:', error);
    throw error;
  }
};
