import { useForm } from '../../context/FormContext';

const ClientData = () => {
  const { clientData, setClientData } = useForm();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Dati Impianto
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Nome e Cognome Cliente</label>
          <input
            type="text"
            name="nomeCognome"
            value={clientData.nomeCognome}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci nome e cognome"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Indirizzo Impianto (completo di città)</label>
          <input
            type="text"
            name="indirizzo"
            value={clientData.indirizzo}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci indirizzo completo"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientData;
