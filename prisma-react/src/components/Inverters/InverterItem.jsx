import { useInvertersByCategory } from '../../hooks/useProductData';

const InverterItem = ({ inverter, onRemove, onUpdate }) => {
  const { invertersByCategory, loading } = useInvertersByCategory();

  return (
    <div className="gruppo-moduli-item">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Inverter Selection */}
        <div className="md:col-span-8">
          <label className="form-label">Tipo Inverter</label>
          <select
            className="form-select"
            value={inverter.tipo}
            onChange={(e) => onUpdate(inverter.id, 'tipo', e.target.value)}
            disabled={loading}
          >
            <option value="none">Nessun Inverter</option>

            {loading ? (
              <option>Caricamento inverter...</option>
            ) : Object.keys(invertersByCategory).length === 0 ? (
              <option>Nessun inverter disponibile</option>
            ) : (
              Object.entries(invertersByCategory).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((inv) => (
                    <option key={inv.airtableId || inv.id} value={inv.id} data-prezzo={inv.prezzo} data-potenza={inv.potenza}>
                      {inv.name} (€{inv.prezzo}/cad)
                    </option>
                  ))}
                </optgroup>
              ))
            )}
          </select>
        </div>

        {/* Quantity */}
        <div className="md:col-span-3">
          <label className="form-label">Quantità</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={inverter.quantita}
            onChange={(e) => onUpdate(inverter.id, 'quantita', parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Remove Button */}
        <div className="md:col-span-1 flex items-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-2"
            title="Rimuovi Inverter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InverterItem;
