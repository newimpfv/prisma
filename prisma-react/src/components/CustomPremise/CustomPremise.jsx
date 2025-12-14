import { useForm } from '../../context/FormContext';

const CustomPremise = () => {
  const { customText, setCustomText } = useForm();

  const handleChange = (value) => {
    setCustomText({ ...customText, premessaPersonalizzata: value });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        Premessa Personalizzata
      </h2>

      <div className="form-group">
        <label className="form-label">
          Testo introduttivo (apparirà all'inizio del preventivo, lasciare vuoto per autogenerazione)
        </label>
        <textarea
          className="form-input font-bold"
          rows="6"
          style={{ width: '100%' }}
          placeholder="Offerta economica per installazione di un impianto fotovoltaico con accumulo.

Vi trasmettiamo la nostra migliore offerta per l'esecuzione dei lavori da effettuare sull'edificio.

A seguito di sopralluogo tecnico, abbiamo valutato la migliore soluzione per le vostre esigenze..."
          value={customText.premessaPersonalizzata}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <p className="info-text mt-1">Allarga il box del testo dall'angolo in basso a destra</p>
    </div>
  );
};

export default CustomPremise;
