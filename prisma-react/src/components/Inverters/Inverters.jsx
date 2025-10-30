import { useForm } from '../../context/FormContext';
import InverterItem from './InverterItem';

const Inverters = () => {
  const { inverters, setInverters } = useForm();

  const aggiungiInverter = () => {
    const newInverter = {
      id: Date.now(),
      tipo: 'none',
      quantita: 1
    };
    setInverters([...inverters, newInverter]);
  };

  const rimuoviInverter = (id) => {
    setInverters(inverters.filter(inv => inv.id !== id));
  };

  const updateInverter = (id, field, value) => {
    setInverters(inverters.map(inv =>
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#2E8B57">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        Inverter
      </h3>

      <div id="invertersContainer">
        {inverters.map((inverter) => (
          <InverterItem
            key={inverter.id}
            inverter={inverter}
            onRemove={() => rimuoviInverter(inverter.id)}
            onUpdate={updateInverter}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={aggiungiInverter}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Aggiungi Inverter
      </button>
    </div>
  );
};

export default Inverters;
