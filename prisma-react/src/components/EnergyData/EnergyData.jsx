import { useForm } from '../../context/FormContext';

const EnergyData = () => {
  const { energyData, setEnergyData } = useForm();

  const handleChange = (field, value) => {
    setEnergyData({ ...energyData, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
        </svg>
        Dati Energetici Cliente (Bolletta)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consumo Annuo */}
        <div className="form-group">
          <label className="form-label">Consumo Annuo (kWh)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            value={energyData.consumoAnnuo}
            onChange={(e) => handleChange('consumoAnnuo', e.target.value)}
          />
          <p className="info-text">Se compilato, genera l'analisi economica</p>
        </div>

        {/* Costo Energia Attuale */}
        <div className="form-group">
          <label className="form-label">Costo Energia Attuale (€/kWh)</label>
          <input
            type="number"
            className="form-input"
            min="0.1"
            step="0.01"
            value={energyData.costoEnergiaAttuale}
            onChange={(e) => handleChange('costoEnergiaAttuale', e.target.value)}
          />
        </div>

        {/* Spesa Annua Energia */}
        <div className="form-group">
          <label className="form-label">Spesa Annua Energia (€)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            value={energyData.spesaAnnuaEnergia}
            onChange={(e) => handleChange('spesaAnnuaEnergia', e.target.value)}
          />
          <p className="info-text">Se compilato, sostituisce il calcolo automatico</p>
        </div>

        {/* Autoconsumo Stimato */}
        <div className="form-group">
          <label className="form-label">Autoconsumo Stimato (%)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="100"
            value={energyData.autoconsumoStimato}
            onChange={(e) => handleChange('autoconsumoStimato', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyData;
