/**
 * Sessions Service - Airtable Integration
 * Manages session data in Airtable "sessioni" table
 */

import { isOnline } from './airtable';

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const SESSIONS_TABLE = 'tblb7q5ZbbdPhe19v'; // sessioni table
const CACHE_KEY = 'prisma_sessions_cache';
const CACHE_TIMESTAMP_KEY = 'prisma_sessions_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (shorter than clients/installations)

/**
 * Fetch all sessions from Airtable
 */
export const fetchSessions = async () => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}`;
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

    const sessions = data.records.map(record => ({
      id: record.id,
      airtableId: record.id,
      session_id: record.fields.session_id || '',
      nome_cliente: record.fields.nome_cliente || '',
      cognome_cliente: record.fields.cognome_cliente || '',
      riferimento_preventivo: record.fields.riferimento_preventivo || '',
      session_data: record.fields.session_data ? JSON.parse(record.fields.session_data) : null,
      last_updated: record.fields.last_updated || '',
      created_at: record.fields.created_at || '',
      status: record.fields.status || 'draft',
      client_record: record.fields.client_record || [],
      installation_record: record.fields.installation_record || [],
      createdTime: record.createdTime
    }));

    // Cache the sessions
    localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

/**
 * Get cached sessions
 */
export const getCachedSessions = () => {
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
    console.error('Error reading cached sessions:', error);
    return null;
  }
};

/**
 * Get sessions (from cache or fetch)
 */
export const getSessions = async (forceRefresh = false) => {
  // Offline mode
  if (!isOnline()) {
    const cached = getCachedSessions() || [];
    return { sessions: cached, fromCache: true, offline: true };
  }

  // Try cache first
  if (!forceRefresh) {
    const cached = getCachedSessions();
    if (cached) {
      return { sessions: cached, fromCache: true, offline: false };
    }
  }

  // Fetch fresh data
  try {
    const sessions = await fetchSessions();
    return { sessions, fromCache: false, offline: false };
  } catch (error) {
    // Fallback to cache on error
    const cached = getCachedSessions() || [];
    return { sessions: cached, fromCache: true, offline: false, error: error.message };
  }
};

/**
 * Create a new session in Airtable
 */
export const createSession = async (sessionData) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot create session while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}`;

    const fields = {
      session_id: sessionData.session_id || '',
      nome_cliente: sessionData.nome_cliente || '',
      cognome_cliente: sessionData.cognome_cliente || '',
      riferimento_preventivo: sessionData.riferimento_preventivo || '',
      session_data: JSON.stringify(sessionData.session_data || {}),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: sessionData.status || 'draft'
    };

    // Add optional linked records
    if (sessionData.client_record) {
      fields.client_record = Array.isArray(sessionData.client_record)
        ? sessionData.client_record
        : [sessionData.client_record];
    }
    if (sessionData.installation_record) {
      fields.installation_record = Array.isArray(sessionData.installation_record)
        ? sessionData.installation_record
        : [sessionData.installation_record];
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
      throw new Error(`Failed to create session: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...sessionData
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Update an existing session in Airtable
 */
export const updateSession = async (sessionId, sessionData) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot update session while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}/${sessionId}`;

    const fields = {
      nome_cliente: sessionData.nome_cliente || '',
      cognome_cliente: sessionData.cognome_cliente || '',
      riferimento_preventivo: sessionData.riferimento_preventivo || '',
      session_data: JSON.stringify(sessionData.session_data || {}),
      last_updated: new Date().toISOString(),
      status: sessionData.status || 'draft'
    };

    // Add optional linked records
    if (sessionData.client_record) {
      fields.client_record = Array.isArray(sessionData.client_record)
        ? sessionData.client_record
        : [sessionData.client_record];
    }
    if (sessionData.installation_record) {
      fields.installation_record = Array.isArray(sessionData.installation_record)
        ? sessionData.installation_record
        : [sessionData.installation_record];
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
      throw new Error(`Failed to update session: ${error}`);
    }

    const result = await response.json();

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return {
      id: result.id,
      airtableId: result.id,
      ...sessionData
    };
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

/**
 * Delete a session from Airtable
 */
export const deleteSession = async (sessionId) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  if (!isOnline()) {
    throw new Error('Cannot delete session while offline');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}/${sessionId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete session: ${error}`);
    }

    // Clear cache to force refresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

/**
 * Find session by session_id
 */
export const findSessionById = async (sessionId) => {
  const { sessions } = await getSessions();
  return sessions.find(session => session.session_id === sessionId) || null;
};

/**
 * Find sessions by client name
 */
export const findSessionsByClient = async (nome, cognome) => {
  const { sessions } = await getSessions();
  return sessions.filter(session =>
    session.nome_cliente.toLowerCase() === nome.toLowerCase() &&
    (!cognome || session.cognome_cliente.toLowerCase() === cognome.toLowerCase())
  );
};
