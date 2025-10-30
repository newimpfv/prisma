/**
 * Clients Service - Airtable Integration
 * Manages client data in Airtable "clienti" table
 */

import { isOnline } from './airtable';

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const CLIENTS_TABLE = 'tbldgj4A9IUwSL8z6'; // clienti table
const CACHE_KEY = 'prisma_clients_cache';
const CACHE_TIMESTAMP_KEY = 'prisma_clients_cache_timestamp';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Fetch all clients from Airtable
 */
export const fetchClients = async () => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTS_TABLE}`;
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

    const clients = data.records.map(record => ({
      id: record.id,
      airtableId: record.id,
      nome: record.fields['nome / ragione sociale'] || '',
      nome_first: record.fields.nome || '',
      cognome: record.fields.cognome || '',
      email: record.fields.email || '',
      cellulare: record.fields.cellulare || '',
      telefono: record.fields.telefono || '',
      indirizzo: Array.isArray(record.fields.indirizzo) ? record.fields.indirizzo[0] : record.fields.indirizzo || '',
      indirizzo_impianto: record.fields['indirizzo impianto'] || '',
      citta_impianto: record.fields['città impianto'] || '',
      indirizzo_residenza: record.fields['indirizzo di residenza'] || '',
      citta_residenza: record.fields['città di residenza'] || '',
      cap_impianto: record.fields['CAP impianto'] || '',
      iban: record.fields.IBAN || '',
      data_sopralluogo: record.fields['data sopralluogo'] || '',
      data_contatto: record.fields['Data Contatto'] || '',
      contatto_tramite: record.fields['Contatto tramite'] || '',
      note: record.fields['ulteriori note'] || '',
      session_id: record.fields.session_id || '',
      impianto: record.fields.impianto || [], // Linked records
      createdTime: record.createdTime
    }));

    // Cache the clients
    localStorage.setItem(CACHE_KEY, JSON.stringify(clients));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    return clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

/**
 * Get cached clients
 */
export const getCachedClients = () => {
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
    console.error('Error reading cached clients:', error);
    return null;
  }
};

/**
 * Get clients (from cache or fetch)
 */
export const getClients = async (forceRefresh = false) => {
  // Offline mode
  if (!isOnline()) {
    const cached = getCachedClients() || [];
    return { clients: cached, fromCache: true, offline: true };
  }

  // Try cache first
  if (!forceRefresh) {
    const cached = getCachedClients();
    if (cached) {
      return { clients: cached, fromCache: true, offline: false };
    }
  }

  // Fetch fresh data
  try {
    const clients = await fetchClients();
    return { clients, fromCache: false, offline: false };
  } catch (error) {
    // Fallback to cache on error
    const cached = getCachedClients() || [];
    return { clients: cached, fromCache: true, offline: false, error: error.message };
  }
};

/**
 * Create a new client in Airtable
 */
export const createClient = async (clientData, sessionId = null) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot create client while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTS_TABLE}`;

    const fields = {
      'nome / ragione sociale': clientData.nome || '',
      email: clientData.email || '',
      cellulare: clientData.cellulare || '',
      telefono: clientData.telefono || '',
      'indirizzo impianto': clientData.indirizzo_impianto || '',
      'città impianto': clientData.citta_impianto || '',
      'Data Contatto': clientData.data_contatto || new Date().toISOString().split('T')[0],
      'Contatto tramite': clientData.contatto_tramite || 'Web App',
      'ulteriori note': clientData.note || ''
    };

    // Add optional fields
    if (clientData.nome_first) fields.nome = clientData.nome_first;
    if (clientData.cognome) fields.cognome = clientData.cognome;
    if (clientData.indirizzo_residenza) fields['indirizzo di residenza'] = clientData.indirizzo_residenza;
    if (clientData.citta_residenza) fields['città di residenza'] = clientData.citta_residenza;
    if (clientData.cap_impianto) fields['CAP impianto'] = clientData.cap_impianto;
    if (clientData.iban) fields.IBAN = clientData.iban;
    if (clientData.data_sopralluogo) fields['data sopralluogo'] = clientData.data_sopralluogo;
    if (sessionId) fields.session_id = sessionId;

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
      throw new Error(`Failed to create client: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...clientData
    };
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

/**
 * Update an existing client in Airtable
 */
export const updateClient = async (clientId, clientData, sessionId = null) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot update client while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTS_TABLE}/${clientId}`;

    const fields = {
      'nome / ragione sociale': clientData.nome || '',
      email: clientData.email || '',
      cellulare: clientData.cellulare || '',
      telefono: clientData.telefono || '',
      'indirizzo impianto': clientData.indirizzo_impianto || '',
      'città impianto': clientData.citta_impianto || '',
      'ulteriori note': clientData.note || ''
    };

    // Add optional fields
    if (clientData.nome_first) fields.nome = clientData.nome_first;
    if (clientData.cognome) fields.cognome = clientData.cognome;
    if (clientData.indirizzo_residenza) fields['indirizzo di residenza'] = clientData.indirizzo_residenza;
    if (clientData.citta_residenza) fields['città di residenza'] = clientData.citta_residenza;
    if (clientData.cap_impianto) fields['CAP impianto'] = clientData.cap_impianto;
    if (clientData.iban) fields.IBAN = clientData.iban;
    if (clientData.data_contatto) fields['Data Contatto'] = clientData.data_contatto;
    if (clientData.contatto_tramite) fields['Contatto tramite'] = clientData.contatto_tramite;
    if (clientData.data_sopralluogo) fields['data sopralluogo'] = clientData.data_sopralluogo;
    if (sessionId) fields.session_id = sessionId;

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
      throw new Error(`Failed to update client: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...clientData
    };
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

/**
 * Delete a client from Airtable
 */
export const deleteClient = async (clientId) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot delete client while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTS_TABLE}/${clientId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete client: ${error}`);
    }

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

/**
 * Search clients by name or email
 */
export const searchClients = async (query) => {
  const { clients } = await getClients();

  const lowerQuery = query.toLowerCase();
  return clients.filter(client =>
    client.nome.toLowerCase().includes(lowerQuery) ||
    client.email.toLowerCase().includes(lowerQuery) ||
    (client.cellulare && client.cellulare.includes(query)) ||
    (client.citta_impianto && client.citta_impianto.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Find existing client by name and email
 * Returns the client if found, null otherwise
 */
export const findExistingClient = async (nome, email) => {
  const { clients } = await getClients();

  // First try to find by exact name match
  let existingClient = clients.find(client =>
    client.nome.toLowerCase() === nome.toLowerCase()
  );

  // If not found by name and email is provided, try to find by email
  if (!existingClient && email) {
    existingClient = clients.find(client =>
      client.email && client.email.toLowerCase() === email.toLowerCase()
    );
  }

  return existingClient || null;
};
