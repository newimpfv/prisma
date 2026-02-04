import { useForm } from '../../context/FormContext';

const StructureData = () => {
  const { structureData, setStructureData } = useForm();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStructureData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
        </svg>
        Dati Struttura
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Tipologia Impianto</label>
          <select
            name="tipoImpianto"
            value={structureData.tipoImpianto}
            onChange={handleChange}
            className="form-select"
          >
            <option value="residenziale">Impianto Residenziale</option>
            <option value="aziendale">Impianto Aziendale</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Residenziale o aziendale</p>
        </div>

        <div className="form-group">
          <label className="form-label">Tipo di Tetto</label>
          <select
            name="tipoTetto"
            value={structureData.tipoTetto}
            onChange={handleChange}
            className="form-select"
          >
            <option value="lamiera">Lamiera Grecata</option>
            <option value="tegole">Tetto con Tegole</option>
            <option value="tettoia">Tettoia</option>
            <option value="a terra">A Terra</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Influisce sul costo del montaggio</p>
        </div>

        {/* Show building dimensions only for lamiera and tegole */}
        {structureData.tipoTetto !== 'tettoia' && structureData.tipoTetto !== 'a terra' && (
          <>
            <div className="form-group">
              <label className="form-label">Altezza Edificio (m)</label>
              <input
                type="number"
                name="altezzaEdificio"
                value={structureData.altezzaEdificio}
                onChange={handleChange}
                className="form-input"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Influisce sul totale dei cavi</p>
            </div>
            <div className="form-group">
              <label className="form-label">Lunghezza Edificio (m)</label>
              <input
                type="number"
                name="lunghezzaEdificio"
                value={structureData.lunghezzaEdificio}
                onChange={handleChange}
                className="form-input"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Influisce sul totale dei cavi</p>
            </div>
          </>
        )}
      </div>

      {/* Info message for "Tettoia" roof type */}
      {structureData.tipoTetto === 'tettoia' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            <strong>✓ Tipo impianto selezionato: Tettoia</strong>
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Vai alla tab <strong>"Configurazione Tetto"</strong> per configurare le tettoie, aggiungerne di nuove e impostare i moduli.
          </p>
        </div>
      )}

      {/* Info message for "A Terra" roof type */}
      {structureData.tipoTetto === 'a terra' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800">
            <strong>✓ Tipo impianto selezionato: Impianto A Terra</strong>
          </p>
          <p className="text-sm text-green-700 mt-2">
            Vai alla tab <strong>"Configurazione Tetto"</strong> per configurare gli impianti a terra, aggiungerne di nuovi e impostare i moduli.
          </p>
        </div>
      )}
    </div>
  );
};

export default StructureData;
