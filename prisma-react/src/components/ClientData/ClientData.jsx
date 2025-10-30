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
          <label className="form-label">Nome / Ragione Sociale</label>
          <input
            type="text"
            name="nome"
            value={clientData.nome || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci nome o ragione sociale"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cognome</label>
          <input
            type="text"
            name="cognome"
            value={clientData.cognome || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci cognome"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={clientData.email || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci email"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Telefono</label>
          <input
            type="tel"
            name="telefono"
            value={clientData.telefono || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci telefono"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Comune</label>
          <input
            type="text"
            name="comune"
            value={clientData.comune || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci comune"
          />
        </div>
        <div className="form-group md:col-span-2">
          <label className="form-label">Indirizzo Impianto Completo</label>
          <input
            type="text"
            name="indirizzo"
            value={clientData.indirizzo || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci indirizzo completo dell'impianto"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientData;
