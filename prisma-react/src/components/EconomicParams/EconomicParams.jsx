import { useForm } from '../../context/FormContext';

const EconomicParams = () => {
  const { economicParams, setEconomicParams } = useForm();

  const handleChange = (field, value) => {
    if (field === 'tipoCessione') {
      setEconomicParams({ ...economicParams, [field]: value });
    } else {
      setEconomicParams({ ...economicParams, [field]: parseFloat(value) || 0 });
    }
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Parametri Economici
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Produzione Annua Stimata */}
        <div className="form-group">
          <label className="form-label">Produzione Annua Stimata (kWh da PVGIS)</label>
          <input
            type="number"
            className="form-input"
            min="800"
            max="1600"
            value={economicParams.produzioneAnnuaKw}
            onChange={(e) => handleChange('produzioneAnnuaKw', e.target.value)}
          />
          <p className="info-text">Se caricato il PVGIS viene compilato in automatico</p>
        </div>

        {/* Percentuale IVA */}
        <div className="form-group">
          <label className="form-label">Percentuale IVA (%)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="22"
            value={economicParams.percentualeIva}
            onChange={(e) => handleChange('percentualeIva', e.target.value)}
          />
        </div>

        {/* Percentuale Detrazione Fiscale */}
        <div className="form-group">
          <label className="form-label">Percentuale Detrazione Fiscale (%)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="100"
            value={economicParams.percentualeDetrazione}
            onChange={(e) => handleChange('percentualeDetrazione', e.target.value)}
          />
        </div>

        {/* Anni Detrazione */}
        <div className="form-group">
          <label className="form-label">Anni Detrazione</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={economicParams.anniDetrazione}
            onChange={(e) => handleChange('anniDetrazione', e.target.value)}
          />
        </div>

        {/* Risparmio Bolletta Stimato */}
        <div className="form-group">
          <label className="form-label">Risparmio Bolletta Stimato (%)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="100"
            value={economicParams.risparmioStimato}
            onChange={(e) => handleChange('risparmioStimato', e.target.value)}
          />
        </div>

        {/* Tipo di Cessione Energia */}
        <div className="form-group">
          <label className="form-label">Tipo di Cessione Energia</label>
          <select
            className="form-select"
            value={economicParams.tipoCessione}
            onChange={(e) => handleChange('tipoCessione', e.target.value)}
          >
            <option value="ritiro">Ritiro Dedicato</option>
            <option value="cessioneTotale">Cessione Totale</option>
            <option value="cessioneParziale">Cessione Parziale</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EconomicParams;
