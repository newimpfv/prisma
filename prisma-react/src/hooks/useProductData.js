import { useProducts } from '../context/ProductsContext';

/**
 * Hook per ottenere i moduli fotovoltaici
 * @returns {Array} Array di moduli con struttura: { id, name, potenza, larghezza, altezza, prezzo }
 */
export const useModules = () => {
  const { products, loading, error } = useProducts();
  return {
    modules: products?.modules || [],
    loading,
    error
  };
};

/**
 * Hook per ottenere gli inverter
 * @returns {Array} Array di inverter con struttura: { id, name, potenza, prezzo, category }
 */
export const useInverters = () => {
  const { products, loading, error } = useProducts();
  return {
    inverters: products?.inverters || [],
    loading,
    error
  };
};

/**
 * Hook per ottenere gli inverter organizzati per categoria/gruppo
 * @returns {Object} Oggetto con inverter raggruppati per gruppo
 */
export const useInvertersByCategory = () => {
  const { products, loading, error } = useProducts();

  const invertersByCategory = {};

  if (products?.inverters) {
    products.inverters.forEach(inverter => {
      // Use 'group' for meaningful categorization (e.g., "Single Phase", "Three Phase")
      // 'category' would always be "inverter" for all inverters
      const category = inverter.group || inverter.category || 'Other';
      if (!invertersByCategory[category]) {
        invertersByCategory[category] = [];
      }
      invertersByCategory[category].push(inverter);
    });
  }

  return {
    invertersByCategory,
    loading,
    error
  };
};

/**
 * Hook per ottenere le batterie
 * @returns {Array} Array di batterie
 */
export const useBatteries = () => {
  const { products, loading, error } = useProducts();
  return {
    batteries: products?.batteries || [],
    loading,
    error
  };
};

/**
 * Hook per ottenere le batterie organizzate per gruppo/categoria
 * Mantiene la stessa struttura del file batteries.js originale
 * @returns {Object} Oggetto con batterie raggruppate (t30, t58, hs, rack, lv)
 */
export const useBatteriesByCategory = () => {
  const { products, loading, error } = useProducts();

  const batteriesByGroup = {
    t30: [],
    t58: [],
    hs: [],
    rack: [],
    lv: [],
    other: []
  };

  if (products?.batteries) {
    products.batteries.forEach(battery => {
      const group = battery.group?.toLowerCase() || '';
      const category = battery.category?.toLowerCase() || '';

      // Mapping basato sul gruppo o categoria
      if (group.includes('t30') || category.includes('t30')) {
        batteriesByGroup.t30.push(battery);
      } else if (group.includes('t58') || group.includes('t-bat h5.8') || category.includes('t58')) {
        batteriesByGroup.t58.push(battery);
      } else if (group.includes('hs') || category.includes('hs')) {
        batteriesByGroup.hs.push(battery);
      } else if (group.includes('rack') || category.includes('rack')) {
        batteriesByGroup.rack.push(battery);
      } else if (group.includes('lv') || group.includes('ld53') || group === 'ies' || category.includes('lv')) {
        batteriesByGroup.lv.push(battery);
      } else {
        // Cattura tutte le batterie che non corrispondono ai pattern esistenti
        batteriesByGroup.other.push(battery);
      }
    });
  }

  return {
    batteriesByGroup,
    loading,
    error
  };
};

/**
 * Hook per ottenere gli ESS Cabinets
 */
export const useEssCabinets = () => {
  const { products, loading, error } = useProducts();
  return {
    essCabinets: products?.essCabinet || [],
    loading,
    error
  };
};

/**
 * Hook per ottenere i Parallel Box
 */
export const useParallelBoxes = () => {
  const { products, loading, error } = useProducts();
  return {
    parallelBoxes: products?.parallelBox || [],
    loading,
    error
  };
};

/**
 * Hook per ottenere gli EV Charger
 */
export const useEvChargers = () => {
  const { products, loading, error } = useProducts();
  return {
    evChargers: products?.evCharger || [],
    loading,
    error
  };
};
