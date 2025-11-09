import { useModules } from '../../hooks/useProductData';

const GruppoModuli = ({ gruppo, faldaId, onRemove, onUpdate }) => {
  const { modules, loading } = useModules();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(gruppo.id, { [name]: value });
  };

  const selectedModule = modules.find(m => m.id === gruppo.modulo) || modules[0];

  return (
    <div className="gruppo-moduli-item mb-4 p-4 border rounded-lg bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          name="nome"
          value={gruppo.nome}
          onChange={handleChange}
          className="form-input w-full max-w-xs"
          placeholder="Nome Gruppo"
        />
        <button
          type="button"
          onClick={() => onRemove(gruppo.id)}
          className="text-red-500 hover:text-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Orientamento Moduli</label>
          <select
            name="orientamento"
            value={gruppo.orientamento}
            onChange={handleChange}
            className="form-select"
          >
            <option value="verticale">Verticale</option>
            <option value="orizzontale">Orizzontale</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Influisce sulle guide</p>
        </div>

        <div className="form-group">
          <label className="form-label">Modulo Fotovoltaico</label>
          <select
            name="modulo"
            value={gruppo.modulo}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {loading ? (
              <option>Caricamento moduli...</option>
            ) : modules.length === 0 ? (
              <option>Nessun modulo disponibile</option>
            ) : (
              modules.map((module) => (
                <option key={module.airtableId || module.id} value={module.id}>
                  {module.name} (€{module.prezzo.toFixed(2)})
                </option>
              ))
            )}
          </select>
          {!loading && selectedModule && (
            <p className="text-xs text-gray-600 mt-1">
              Dimensioni: {selectedModule.larghezza}m x {selectedModule.altezza}m - {selectedModule.potenza}W
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Numero File</label>
          <input
            type="number"
            name="numeroFile"
            value={gruppo.numeroFile}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Moduli per Fila</label>
          <input
            type="number"
            name="moduliPerFila"
            value={gruppo.moduliPerFila}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Info Guide</label>
          <div className="info-text">
            <p>Distanza tra moduli: 3cm (morsetti centrali)</p>
            <p>Guide: 2 guide da 3.1m per fila</p>
            <p>Totale moduli: {gruppo.numeroFile * gruppo.moduliPerFila}</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Potenza Gruppo</label>
          <p className="text-lg font-semibold p-2 bg-gray-100 rounded">
            {((gruppo.numeroFile * gruppo.moduliPerFila * selectedModule.potenza) / 1000).toFixed(2)} kW
          </p>
        </div>
      </div>
    </div>
  );
};

export default GruppoModuli;
