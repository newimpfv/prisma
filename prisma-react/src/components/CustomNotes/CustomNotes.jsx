import { useForm } from '../../context/FormContext';

const CustomNotes = () => {
  const { customText, setCustomText } = useForm();

  const handleChange = (value) => {
    setCustomText({ ...customText, notePersonalizzate: value });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
        Note Personalizzate
      </h2>

      <div className="form-group">
        <label className="form-label">
          Note Aggiuntive (appariranno nel preventivo sotto alle note standard)
        </label>
        <textarea
          className="form-input"
          rows="4"
          style={{ width: '100%' }}
          placeholder="Inserisci qui eventuali note aggiuntive per il preventivo..."
          value={customText.notePersonalizzate}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <p className="info-text mt-1">Allarga il box del testo dall'angolo in basso a destra</p>
    </div>
  );
};

export default CustomNotes;
