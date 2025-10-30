import { useForm } from '../../context/FormContext';

const UnitCosts = () => {
  const { unitCosts, setUnitCosts } = useForm();

  const handleChange = (field, value) => {
    setUnitCosts({ ...unitCosts, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Costi Unitari (€)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morsetti Centrali */}
        <div className="form-group">
          <label className="form-label">Costo Morsetti Centrali</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoMorsettiCentrali}
            onChange={(e) => handleChange('costoMorsettiCentrali', e.target.value)}
            required
          />
        </div>

        {/* Morsetti Finali */}
        <div className="form-group">
          <label className="form-label">Costo Morsetti Finali</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoMorsettiFinali}
            onChange={(e) => handleChange('costoMorsettiFinali', e.target.value)}
            required
          />
        </div>

        {/* Guide Lamiera */}
        <div className="form-group">
          <label className="form-label">Costo Guide Lamiera (m)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoGuideLamiera}
            onChange={(e) => handleChange('costoGuideLamiera', e.target.value)}
            required
          />
        </div>

        {/* Guide Tegole */}
        <div className="form-group">
          <label className="form-label">Costo Guide Tegole (m)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoGuideTegole}
            onChange={(e) => handleChange('costoGuideTegole', e.target.value)}
            required
          />
        </div>

        {/* Prolunga Guide Tegole */}
        <div className="form-group">
          <label className="form-label">Costo Prolunga Guide Tegole</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoProlungaGuide}
            onChange={(e) => handleChange('costoProlungaGuide', e.target.value)}
            required
          />
        </div>

        {/* Staffe Tegole */}
        <div className="form-group">
          <label className="form-label">Costo Staffe Tegole</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoStaffeTegole}
            onChange={(e) => handleChange('costoStaffeTegole', e.target.value)}
            required
          />
        </div>

        {/* Cavi CA */}
        <div className="form-group">
          <label className="form-label">Costo Cavi CA (per m)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoCaviCA}
            onChange={(e) => handleChange('costoCaviCA', e.target.value)}
            required
          />
        </div>

        {/* Lunghezza Cavi CA */}
        <div className="form-group">
          <label className="form-label">Lunghezza Cavi CA (m)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.lunghezzaCaviCA}
            onChange={(e) => handleChange('lunghezzaCaviCA', e.target.value)}
            required
          />
        </div>

        {/* Cavi DC */}
        <div className="form-group">
          <label className="form-label">Costo Cavi DC (per m)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoCaviDC}
            onChange={(e) => handleChange('costoCaviDC', e.target.value)}
            required
          />
        </div>

        {/* Quadri Elettrici */}
        <div className="form-group">
          <label className="form-label">Costo Quadri Elettrici</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoQuadri}
            onChange={(e) => handleChange('costoQuadri', e.target.value)}
            required
          />
        </div>

        {/* Mezzi al Giorno */}
        <div className="form-group">
          <label className="form-label">Costo Mezzi al Giorno</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.costoMezzi}
            onChange={(e) => handleChange('costoMezzi', e.target.value)}
            required
          />
        </div>

        {/* Giorni Utilizzo Mezzi */}
        <div className="form-group">
          <label className="form-label">Giorni Utilizzo Mezzi</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={unitCosts.giorniMezzi}
            onChange={(e) => handleChange('giorniMezzi', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default UnitCosts;
