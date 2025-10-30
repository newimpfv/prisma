import { useForm } from '../../context/FormContext';
import BatteryItem from './BatteryItem';

const Batteries = () => {
  const { batteries, setBatteries } = useForm();

  const aggiungiBatteria = () => {
    const newBattery = {
      id: Date.now(),
      tipo: 'none',
      quantita: 1
    };
    setBatteries([...batteries, newBattery]);
  };

  const rimuoviBatteria = (id) => {
    setBatteries(batteries.filter(bat => bat.id !== id));
  };

  const updateBattery = (id, field, value) => {
    setBatteries(batteries.map(bat =>
      bat.id === id ? { ...bat, [field]: value } : bat
    ));
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#2E8B57">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Sistema di Accumulo
      </h3>

      <div id="batterieContainer">
        {batteries.map((battery) => (
          <BatteryItem
            key={battery.id}
            battery={battery}
            onRemove={() => rimuoviBatteria(battery.id)}
            onUpdate={updateBattery}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={aggiungiBatteria}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Aggiungi Batteria
      </button>
    </div>
  );
};

export default Batteries;
