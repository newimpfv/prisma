import { useForm } from '../../context/FormContext';

const LaborSafety = () => {
  const { laborSafety, setLaborSafety } = useForm();

  const handleChange = (field, value) => {
    setLaborSafety({ ...laborSafety, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
        Manodopera e Sicurezza
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Costo Manodopera */}
        <div className="form-group">
          <label className="form-label">Costo Manodopera (per kW)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={laborSafety.costoManodopera}
            onChange={(e) => handleChange('costoManodopera', e.target.value)}
            required
          />
        </div>

        {/* Spese Legali */}
        <div className="form-group">
          <label className="form-label">Spese Legali</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={laborSafety.costoFresia}
            onChange={(e) => handleChange('costoFresia', e.target.value)}
            required
          />
        </div>

        {/* Costo Sicurezza */}
        <div className="form-group">
          <label className="form-label">Costo Sicurezza (0 se escluso)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.1"
            value={laborSafety.costoSicurezza}
            onChange={(e) => handleChange('costoSicurezza', e.target.value)}
            required
          />
        </div>

        {/* Margine di Guadagno */}
        <div className="form-group">
          <label className="form-label">Margine di Guadagno (%)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="100"
            step="0.1"
            value={laborSafety.margineGuadagno}
            onChange={(e) => handleChange('margineGuadagno', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default LaborSafety;
