import { useForm } from '../../context/FormContext';
import Inverters from '../Inverters/Inverters';
import Batteries from '../Batteries/Batteries';
import { essCabinet, parallelBox, evCharger, connettivita, backupControllo, meterCT, caviAccessori } from '../../data/accessories';

const Components = () => {
  const { components, setComponents } = useForm();

  const handleComponentChange = (field, value) => {
    setComponents({ ...components, [field]: value });
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Componenti
      </h2>

      {/* Inverter */}
      <Inverters />

      {/* Batteries */}
      <Batteries />

      {/* ESS Cabinet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="form-group">
          <label className="form-label">ESS Cabinet</label>
          <select
            className="form-select"
            value={components.essCabinet}
            onChange={(e) => handleComponentChange('essCabinet', e.target.value)}
          >
            <option value="none">Nessun Cabinet</option>
            {Object.entries(essCabinet).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                    {item.nome} - {item.descrizione} (€{item.prezzo.toLocaleString()}/cad)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantità ESS Cabinet</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={components.numeroEssCabinet}
            onChange={(e) => handleComponentChange('numeroEssCabinet', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* Parallel Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="form-group">
          <label className="form-label">Parallel Box</label>
          <select
            className="form-select"
            value={components.parallelBox}
            onChange={(e) => handleComponentChange('parallelBox', e.target.value)}
          >
            <option value="none">Nessuna Parallel Box</option>
            {Object.entries(parallelBox).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                    {item.nome} - {item.descrizione} (€{item.prezzo.toLocaleString()}/cad)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantità Parallel Box</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={components.numeroParallelBox}
            onChange={(e) => handleComponentChange('numeroParallelBox', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* EV Charger */}
      <div className="mb-8 mt-6">
        <h3 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#2E8B57">
            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
          Ricarica Elettrica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Tipo Caricatore EV</label>
            <select
              className="form-select"
              value={components.evCharger}
              onChange={(e) => handleComponentChange('evCharger', e.target.value)}
            >
              <option value="none">Nessun Caricatore</option>
              {evCharger.map((item) => (
                <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                  {item.nome} - {item.descrizione} (€{item.prezzo}/cad)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Numero Caricatori EV</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={components.numeroEvCharger}
              onChange={(e) => handleComponentChange('numeroEvCharger', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* Accessori e Monitoraggio */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#2E8B57">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
          Accessori e Monitoraggio
        </h3>

        {/* Connettività */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">Connettività</label>
            <select
              className="form-select"
              value={components.connettivita}
              onChange={(e) => handleComponentChange('connettivita', e.target.value)}
            >
              <option value="none">Nessuna Connettività</option>
              {connettivita.map((item) => (
                <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                  {item.nome} - {item.descrizione} (€{item.prezzo}/cad)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantità Connettività</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={components.numeroConnettivita}
              onChange={(e) => handleComponentChange('numeroConnettivita', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Backup e Controllo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">Backup e Controllo</label>
            <select
              className="form-select"
              value={components.backupControllo}
              onChange={(e) => handleComponentChange('backupControllo', e.target.value)}
            >
              <option value="none">Nessun Backup/Controllo</option>
              {Object.entries(backupControllo).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                      {item.nome} - {item.descrizione} (€{item.prezzo.toLocaleString()}/cad)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantità Backup e Controllo</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={components.numeroBackupControllo}
              onChange={(e) => handleComponentChange('numeroBackupControllo', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Meter e CT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">Meter e CT</label>
            <select
              className="form-select"
              value={components.meterCT}
              onChange={(e) => handleComponentChange('meterCT', e.target.value)}
            >
              <option value="none">Nessun Meter/CT</option>
              {Object.entries(meterCT).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                      {item.nome} - {item.descrizione} (€{item.prezzo}/cad)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantità Meter e CT</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={components.numeroMeterCT}
              onChange={(e) => handleComponentChange('numeroMeterCT', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Cavi e Accessori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Cavi e Accessori</label>
            <select
              className="form-select"
              value={components.caviAccessori}
              onChange={(e) => handleComponentChange('caviAccessori', e.target.value)}
            >
              <option value="none">Nessun Cavo/Accessorio</option>
              {Object.entries(caviAccessori).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id} data-prezzo={item.prezzo}>
                      {item.nome} - {item.descrizione} (€{item.prezzo}/cad)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantità Cavi e Accessori</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={components.numeroCaviAccessori}
              onChange={(e) => handleComponentChange('numeroCaviAccessori', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Components;
