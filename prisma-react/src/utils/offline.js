/**
 * Offline/Online Detection Utilities
 * Provides utilities for detecting network status and handling offline scenarios
 */

/**
 * Check if browser is currently online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Add listener for online/offline events
 * @param {Function} callback - Called with boolean (true = online, false = offline)
 * @returns {Function} cleanup function to remove listeners
 */
export const addConnectionListener = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Try to fetch data with offline fallback
 * @param {Function} fetchFn - Function that returns a promise (the fetch operation)
 * @param {Function} fallbackFn - Function to call if offline or fetch fails
 * @param {Object} options - Options for behavior
 * @returns {Promise} Result from fetch or fallback
 */
export const fetchWithOfflineFallback = async (fetchFn, fallbackFn, options = {}) => {
  const {
    skipOnlineCheck = false,
    timeout = 10000
  } = options;

  // If offline, immediately use fallback
  if (!skipOnlineCheck && !isOnline()) {
    console.log('[Offline Mode] Using cached data');
    return fallbackFn();
  }

  try {
    // Try to fetch with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeout)
    );

    const result = await Promise.race([fetchFn(), timeoutPromise]);
    return result;
  } catch (error) {
    console.warn('[Fetch Failed] Using fallback:', error.message);
    return fallbackFn();
  }
};

/**
 * Check if we should attempt to refresh data based on cache age and online status
 * @param {number} cacheTimestamp - Timestamp when data was cached
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} True if should refresh
 */
export const shouldRefreshData = (cacheTimestamp, maxAge) => {
  if (!isOnline()) {
    return false; // Don't try to refresh if offline
  }

  if (!cacheTimestamp) {
    return true; // No cache, should fetch
  }

  const age = Date.now() - cacheTimestamp;
  return age > maxAge;
};
