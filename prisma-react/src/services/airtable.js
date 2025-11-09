/**
 * Airtable Service - Offline-First
 * Handles fetching product data from Airtable with offline support
 * - Always tries to use cached data first
 * - Fetches fresh data only when online and cache is old
 * - Works completely offline once data is cached
 */

import { isOnline, fetchWithOfflineFallback, shouldRefreshData } from '../utils/offline';

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = 'listino_prezzi';
const CACHE_KEY = 'prisma_products_cache';
const CACHE_TIMESTAMP_KEY = 'prisma_products_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LAST_SYNC_STATUS_KEY = 'prisma_last_sync_status';

/**
 * Fetch products from Airtable
 */
export const fetchProductsFromAirtable = async () => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured. Please check .env file.');
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Airtable records to our app format
    const products = data.records.map(record => ({
      airtableId: record.id, // Always unique Airtable record ID
      id: record.fields.id_component || record.id,
      name: record.fields.nome || '',
      description: record.fields.descrizione || '',
      category: record.fields.categoria || '',
      group: record.fields.gruppo || '',
      potenza: record.fields.potenza || 0,
      larghezza: record.fields.larghezza || 0,
      altezza: record.fields.altezza || 0,
      prezzo: record.fields.prezzo || 0
    }));

    return products;
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error;
  }
};

/**
 * Save products to localStorage
 */
export const cacheProducts = (products) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching products:', error);
  }
};

/**
 * Get cached products from localStorage
 * Returns cached data regardless of age (for offline use)
 */
export const getCachedProducts = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cached products:', error);
    return null;
  }
};

/**
 * Get cache timestamp
 */
export const getCacheTimestamp = () => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if cache exists and is valid
 */
export const isCacheValid = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const age = Date.now() - parseInt(timestamp);
  return age <= CACHE_DURATION;
};

/**
 * Get products with offline-first strategy
 * @param {boolean} forceRefresh - Force refresh even if cache is valid
 * @returns {Promise<{products: Array, fromCache: boolean, isStale: boolean}>}
 */
export const getProducts = async (forceRefresh = false) => {
  const cached = getCachedProducts();
  const cacheTimestamp = getCacheTimestamp();
  const online = isOnline();

  // OFFLINE MODE: Always return cache if available
  if (!online) {
    if (cached) {
      console.log('[Offline Mode] Using cached data');
      return {
        products: cached,
        fromCache: true,
        isStale: false,
        offline: true
      };
    } else {
      throw new Error('Nessun dato in cache. Connettiti a Internet per scaricare i dati.');
    }
  }

  // ONLINE MODE with cached data available
  if (cached && !forceRefresh) {
    const shouldRefresh = shouldRefreshData(cacheTimestamp, CACHE_DURATION);

    if (!shouldRefresh) {
      // Cache is fresh, use it
      console.log('[Cache] Using fresh cached data');
      return {
        products: cached,
        fromCache: true,
        isStale: false,
        offline: false
      };
    } else {
      // Cache is stale, try to refresh in background but return cached immediately
      console.log('[Cache] Data is stale, refreshing in background...');

      // Return cached data immediately for fast response
      const result = {
        products: cached,
        fromCache: true,
        isStale: true,
        offline: false
      };

      // Try to refresh in background (don't await)
      fetchProductsFromAirtable()
        .then(freshProducts => {
          cacheProducts(freshProducts);
          console.log('[Background Sync] Cache updated with fresh data');
          localStorage.setItem(LAST_SYNC_STATUS_KEY, JSON.stringify({
            success: true,
            timestamp: Date.now(),
            count: freshProducts.length
          }));
        })
        .catch(error => {
          console.warn('[Background Sync] Failed to update cache:', error.message);
          localStorage.setItem(LAST_SYNC_STATUS_KEY, JSON.stringify({
            success: false,
            timestamp: Date.now(),
            error: error.message
          }));
        });

      return result;
    }
  }

  // ONLINE MODE without cache OR force refresh
  try {
    console.log('[Fetch] Fetching fresh data from Airtable...');
    const products = await fetchProductsFromAirtable();
    cacheProducts(products);

    localStorage.setItem(LAST_SYNC_STATUS_KEY, JSON.stringify({
      success: true,
      timestamp: Date.now(),
      count: products.length
    }));

    return {
      products,
      fromCache: false,
      isStale: false,
      offline: false
    };
  } catch (error) {
    console.error('[Fetch Failed]', error);

    localStorage.setItem(LAST_SYNC_STATUS_KEY, JSON.stringify({
      success: false,
      timestamp: Date.now(),
      error: error.message
    }));

    // If fetch fails but we have old cache, use it as fallback
    if (cached) {
      console.warn('[Fallback] Using cached data after fetch failure');
      return {
        products: cached,
        fromCache: true,
        isStale: true,
        offline: false,
        error: error.message
      };
    }

    throw error;
  }
};

/**
 * Organize products by category
 */
export const organizeProductsByCategory = (products) => {
  const organized = {
    modules: [],
    inverters: [],
    batteries: [],
    essCabinet: [],
    parallelBox: [],
    evCharger: [],
    connettivita: [],
    backupControllo: [],
    meterCT: [],
    caviAccessori: []
  };

  // Track IDs to detect duplicates
  const seenIds = {
    modules: new Set(),
    inverters: new Set(),
    batteries: new Set()
  };

  products.forEach(product => {
    const category = product.category?.toLowerCase();
    const group = product.group?.toLowerCase();

    if (category === 'moduli' || group === 'moduli') {
      // Check for duplicates
      if (seenIds.modules.has(product.id)) {
        console.warn(`[organizeProductsByCategory] Duplicate module ID found: ${product.id}`, {
          name: product.name,
          category: product.category,
          group: product.group,
          airtableId: product.airtableId
        });
        return; // Skip duplicate
      }
      seenIds.modules.add(product.id);
      organized.modules.push({
        airtableId: product.airtableId,
        id: product.id,
        name: product.name,
        potenza: product.potenza,
        prezzo: product.prezzo,
        larghezza: product.larghezza,
        altezza: product.altezza
      });
    } else if (category === 'inverter' || group === 'inverter') {
      // Check for duplicates
      if (seenIds.inverters.has(product.id)) {
        console.warn(`[organizeProductsByCategory] Duplicate inverter ID found: ${product.id}`, {
          name: product.name,
          category: product.category,
          group: product.group,
          airtableId: product.airtableId
        });
        return; // Skip duplicate
      }
      seenIds.inverters.add(product.id);
      organized.inverters.push({
        airtableId: product.airtableId,
        id: product.id,
        name: product.name,
        potenza: product.potenza,
        prezzo: product.prezzo,
        category: product.category,
        group: product.group
      });
    } else if (category === 'batterie' || group === 'batterie') {
      // Check for duplicates
      if (seenIds.batteries.has(product.id)) {
        console.warn(`[organizeProductsByCategory] Duplicate battery ID found: ${product.id}`, {
          name: product.name,
          category: product.category,
          group: product.group,
          airtableId: product.airtableId
        });
        return; // Skip duplicate
      }
      seenIds.batteries.add(product.id);
      organized.batteries.push({
        airtableId: product.airtableId,
        id: product.id,
        name: product.name,
        capacita: product.potenza, // Using potenza field for capacity
        prezzo: product.prezzo,
        category: product.category,
        group: product.group
      });
    } else if (category === 'ess cabinet' || group === 'ess') {
      organized.essCabinet.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    } else if (category === 'parallel box' || group === 'parallel') {
      organized.parallelBox.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    } else if (category === 'ev charger' || group === 'ev') {
      organized.evCharger.push({
        id: product.id,
        name: product.name,
        potenza: product.potenza,
        prezzo: product.prezzo
      });
    } else if (category === 'connettivita' || group === 'connettivita') {
      organized.connettivita.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    } else if (category === 'backup' || group === 'backup') {
      organized.backupControllo.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    } else if (category === 'meter' || group === 'meter') {
      organized.meterCT.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    } else if (category === 'cavi' || group === 'cavi') {
      organized.caviAccessori.push({
        id: product.id,
        name: product.name,
        prezzo: product.prezzo
      });
    }
  });

  return organized;
};

/**
 * Get last sync status
 */
export const getLastSyncStatus = () => {
  try {
    const status = localStorage.getItem(LAST_SYNC_STATUS_KEY);
    return status ? JSON.parse(status) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear product cache
 */
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(LAST_SYNC_STATUS_KEY);
};

/**
 * Re-export online status check for convenience
 */
export { isOnline } from '../utils/offline';
