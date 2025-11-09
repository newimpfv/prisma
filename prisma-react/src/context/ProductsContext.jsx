import { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, organizeProductsByCategory } from '../services/airtable';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getProducts(forceRefresh);

      // Organizza i prodotti per categoria
      const organized = organizeProductsByCategory(result.products);

      setProducts(organized);
      setIsOffline(result.offline || false);
      setIsStale(result.isStale || false);

      console.log(`[ProductsContext] Loaded ${result.products.length} products`, {
        fromCache: result.fromCache,
        offline: result.offline,
        stale: result.isStale
      });

    } catch (err) {
      console.error('[ProductsContext] Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carica prodotti all'avvio
  useEffect(() => {
    loadProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    isOffline,
    isStale,
    refresh: loadProducts
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
