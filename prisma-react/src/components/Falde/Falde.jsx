import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import FaldaItem from './FaldaItem';

const Falde = () => {
  const { falde, setFalde } = useForm();
  const [faldaCounter, setFaldaCounter] = useState(() => {
    // Inizializza il counter basandosi sul massimo ID esistente
    if (falde.length === 0) return 1;
    const maxId = Math.max(...falde.map(f => f.id || 0));
    return maxId + 1;
  });

  // Aggiorna il counter quando le falde cambiano (es. dopo un caricamento da context)
  useEffect(() => {
    if (falde.length > 0) {
      const maxId = Math.max(...falde.map(f => f.id || 0));
      setFaldaCounter(prev => Math.max(prev, maxId + 1));
    }
  }, [falde.length]);

  const addFalda = () => {
    const newFalda = {
      id: faldaCounter,
      nome: `Falda ${faldaCounter}`,
      larghezza: 4,
      lunghezza: 10,
      inclinazione: 30,
      gruppiModuli: []
    };
    setFalde(prev => [...prev, newFalda]);
    setFaldaCounter(prev => prev + 1);
  };

  const removeFalda = (id) => {
    setFalde(prev => prev.filter(falda => falda.id !== id));
  };

  const updateFalda = (id, updatedData) => {
    setFalde(prev => prev.map(falda =>
      falda.id === id ? { ...falda, ...updatedData } : falda
    ));
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#2E8B57">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Falde
      </h2>

      <div className="space-y-4">
        {falde.map((falda) => (
          <FaldaItem
            key={falda.id}
            falda={falda}
            onRemove={removeFalda}
            onUpdate={updateFalda}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addFalda}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Aggiungi Falda
      </button>
    </div>
  );
};

export default Falde;
