/**
 * Airtable Service - Complete API Wrapper
 * Centralized service for all Airtable operations
 *
 * Features:
 * - Modular structure per table
 * - Error handling
 * - Rate limiting (5 req/sec Airtable limit)
 * - Field validation
 * - Type safety with JSDoc
 * - Offline fallback
 *
 * @module airtableService
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  token: import.meta.env.VITE_AIRTABLE_TOKEN,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  baseUrl: 'https://api.airtable.com/v0',
  rateLimit: {
    maxRequests: 5,
    perMilliseconds: 1000
  }
};

// Table IDs
const TABLES = {
  CLIENTS: 'tbldgj4A9IUwSL8z6',        // dettagli_clienti
  INSTALLATIONS: 'tblU0P92KEZv9hQsK',  // dettagli_impianti
  PRODUCTS: 'listino_prezzi',           // listino_prezzi
  SESSIONS: 'sessioni',                 // sessioni
  TASKS: 'da_fare',                     // da_fare
  BUDGET: 'budget'                      // budget (software)
};

// Field mappings for each table
const FIELD_MAPS = {
  clients: {
    fullName: 'nome / ragione sociale',
    email: 'email',
    phone: 'telefono',
    address: 'indirizzo installazione impianto',
    city: 'comune',
    province: 'provincia',
    zip: 'CAP',
    birthDate: 'data di nascita',
    birthNation: 'nazione di nascita',
    birthProvince: 'provincia di nascita',
    birthCity: 'comune di nascita',
    residenceAddress: 'indirizzo residenza',
    residenceCity: 'città residenza',
    residenceZip: 'CAP residenza',
    taxCode: 'codice fiscale',
    iban: 'IBAN',
    contactMethod: 'contatto tramite',
    referent: 'referente',
    notes: 'note cliente',
    status: 'statusCliente',
    step: 'step'
  },
  installations: {
    client: 'cliente',
    step: 'step',
    stepName: 'stepNome',
    inspectionDate: 'sopralluogoData',
    inspectionPhotos: 'sopralluogoFoto',
    coordinates: 'coordinate',
    pCloudLink: 'linkPCloud',
    installationPower: 'potenzaImpianto',
    installationChecklist: 'checklistInstallazione',
    installationPhotos: 'fotoInstallazione',
    monitoringActive: 'monitoraggioAttivo',
    todayProduction: 'produzioneOggi'
  },
  sessions: {
    sessionId: 'sessionId',
    clientName: 'nomeCliente',
    email: 'email',
    phone: 'telefono',
    timestamp: 'timestamp',
    formData: 'formData'
  }
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  constructor(maxRequests, perMilliseconds) {
    this.maxRequests = maxRequests;
    this.perMilliseconds = perMilliseconds;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();

    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      time => now - time < this.perMilliseconds
    );

    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.perMilliseconds - (now - oldestRequest);

      if (waitTime > 0) {
        console.log(`[RateLimit] Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot(); // Recursive check
      }
    }

    // Add current request
    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(
  CONFIG.rateLimit.maxRequests,
  CONFIG.rateLimit.perMilliseconds
);

// ============================================================================
// BASE API CLIENT
// ============================================================================

/**
 * Base fetch wrapper with error handling and rate limiting
 * @private
 */
async function airtableFetch(endpoint, options = {}) {
  if (!CONFIG.token || !CONFIG.baseId) {
    throw new Error('Airtable credentials not configured. Check .env file.');
  }

  // Wait for rate limit slot
  await rateLimiter.waitForSlot();

  const url = `${CONFIG.baseUrl}/${CONFIG.baseId}/${endpoint}`;

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${CONFIG.token}`,
      'Content-Type': 'application/json'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    console.log(`[Airtable] ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Airtable API error: ${response.status}`;

      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[Airtable Error]', error);
    throw error;
  }
}

// ============================================================================
// CLIENTS API
// ============================================================================

export const clients = {
  /**
   * Get all clients
   * @param {Object} options - Query options
   * @param {string} [options.filterByFormula] - Airtable filter formula
   * @param {number} [options.maxRecords] - Max records to return
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    const params = new URLSearchParams();

    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await airtableFetch(`${TABLES.CLIENTS}${query}`);

    return data.records || [];
  },

  /**
   * Get single client by ID
   * @param {string} clientId - Airtable record ID
   * @returns {Promise<Object>}
   */
  async getById(clientId) {
    const data = await airtableFetch(`${TABLES.CLIENTS}/${clientId}`);
    return data;
  },

  /**
   * Create new client
   * @param {Object} fields - Client fields
   * @returns {Promise<Object>}
   */
  async create(fields) {
    const data = await airtableFetch(TABLES.CLIENTS, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Update existing client
   * @param {string} clientId - Airtable record ID
   * @param {Object} fields - Fields to update
   * @returns {Promise<Object>}
   */
  async update(clientId, fields) {
    const data = await airtableFetch(`${TABLES.CLIENTS}/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Delete client
   * @param {string} clientId - Airtable record ID
   * @returns {Promise<Object>}
   */
  async delete(clientId) {
    const data = await airtableFetch(`${TABLES.CLIENTS}/${clientId}`, {
      method: 'DELETE'
    });
    return data;
  },

  /**
   * Search clients by email or phone
   * @param {string} email - Email to search
   * @param {string} phone - Phone to search
   * @returns {Promise<Array>}
   */
  async findDuplicates(email, phone) {
    let formula = '';

    if (email && phone) {
      formula = `OR({email}='${email}', {telefono}='${phone}')`;
    } else if (email) {
      formula = `{email}='${email}'`;
    } else if (phone) {
      formula = `{telefono}='${phone}'`;
    }

    if (!formula) return [];

    return await this.getAll({ filterByFormula: formula });
  }
};

// ============================================================================
// INSTALLATIONS API
// ============================================================================

export const installations = {
  /**
   * Get all installations
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    const params = new URLSearchParams();

    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await airtableFetch(`${TABLES.INSTALLATIONS}${query}`);

    return data.records || [];
  },

  /**
   * Get single installation
   * @param {string} installationId
   * @returns {Promise<Object>}
   */
  async getById(installationId) {
    const data = await airtableFetch(`${TABLES.INSTALLATIONS}/${installationId}`);
    return data;
  },

  /**
   * Create new installation/sopralluogo
   * @param {Object} fields - Installation fields
   * @returns {Promise<Object>}
   */
  async create(fields) {
    const data = await airtableFetch(TABLES.INSTALLATIONS, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Update installation
   * @param {string} installationId
   * @param {Object} fields
   * @returns {Promise<Object>}
   */
  async update(installationId, fields) {
    const data = await airtableFetch(`${TABLES.INSTALLATIONS}/${installationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Get installations by client
   * @param {string} clientId - Airtable client record ID
   * @returns {Promise<Array>}
   */
  async getByClient(clientId) {
    const formula = `{cliente}='${clientId}'`;
    return await this.getAll({ filterByFormula: formula });
  },

  /**
   * Get installations by step
   * @param {number} step - Step number (1-13)
   * @returns {Promise<Array>}
   */
  async getByStep(step) {
    const formula = `{step}=${step}`;
    return await this.getAll({ filterByFormula: formula });
  }
};

// ============================================================================
// SESSIONS API
// ============================================================================

export const sessions = {
  /**
   * Get all sessions
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    const params = new URLSearchParams();

    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await airtableFetch(`${TABLES.SESSIONS}${query}`);

    return data.records || [];
  },

  /**
   * Create session
   * @param {Object} fields
   * @returns {Promise<Object>}
   */
  async create(fields) {
    const data = await airtableFetch(TABLES.SESSIONS, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Update session
   * @param {string} sessionId - Airtable record ID
   * @param {Object} fields
   * @returns {Promise<Object>}
   */
  async update(sessionId, fields) {
    const data = await airtableFetch(`${TABLES.SESSIONS}/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    return data;
  },

  /**
   * Find session by sessionId
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object|null>}
   */
  async findBySessionId(sessionId) {
    const formula = `{sessionId}='${sessionId}'`;
    const results = await this.getAll({
      filterByFormula: formula,
      maxRecords: 1
    });

    return results[0] || null;
  }
};

// ============================================================================
// PRODUCTS API (wrapper around existing airtable.js)
// ============================================================================

export {
  getProducts,
  getCachedProducts,
  fetchProductsFromAirtable,
  organizeProductsByCategory
} from './airtable.js';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Build Airtable filter formula
 * @param {Object} conditions - Key-value pairs for filtering
 * @returns {string}
 */
export function buildFilter(conditions) {
  const filters = Object.entries(conditions).map(([field, value]) => {
    if (typeof value === 'string') {
      return `{${field}}='${value}'`;
    } else if (typeof value === 'number') {
      return `{${field}}=${value}`;
    } else if (typeof value === 'boolean') {
      return `{${field}}=${value ? 1 : 0}`;
    }
    return '';
  }).filter(Boolean);

  if (filters.length === 0) return '';
  if (filters.length === 1) return filters[0];

  return `AND(${filters.join(', ')})`;
}

/**
 * Validate required fields
 * @param {Object} fields
 * @param {Array<string>} required
 * @throws {Error}
 */
export function validateFields(fields, required) {
  const missing = required.filter(field => !fields[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Format Airtable date (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse Airtable date
 * @param {string} dateString
 * @returns {Date}
 */
export function parseDate(dateString) {
  return new Date(dateString);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  clients,
  installations,
  sessions,
  buildFilter,
  validateFields,
  formatDate,
  parseDate,
  TABLES,
  FIELD_MAPS
};

/**
 * @typedef {Object} AirtableRecord
 * @property {string} id - Record ID
 * @property {Object} fields - Record fields
 * @property {string} createdTime - ISO timestamp
 */

/**
 * @typedef {Object} QueryOptions
 * @property {string} [filterByFormula] - Airtable filter formula
 * @property {number} [maxRecords] - Max records to return
 * @property {string} [sort] - Sort field and direction
 */
