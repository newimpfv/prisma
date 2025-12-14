import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import TettoiaItem from './TettoiaItem';

const Tettoie = () => {
  const { falde, setFalde, structureData } = useForm();
  const isATerra = structureData.tipoTetto === 'a terra';
  const [tettoiaCounter, setTettoiaCounter] = useState(() => {
    const tettoieFalde = falde.filter(f => f.tettoiaIndex !== undefined);
    if (tettoieFalde.length === 0) return 1;
    const maxIndex = Math.max(...tettoieFalde.map(f => f.tettoiaIndex || 0));
    return maxIndex + 2;
  });

  // Aggiorna il counter quando le tettoie cambiano
  useEffect(() => {
    const tettoieFalde = falde.filter(f => f.tettoiaIndex !== undefined);
    if (tettoieFalde.length > 0) {
      const maxIndex = Math.max(...tettoieFalde.map(f => f.tettoiaIndex || 0));
      setTettoiaCounter(prev => Math.max(prev, maxIndex + 2));
    }
  }, [falde.filter(f => f.tettoiaIndex !== undefined).length]);

  const addTettoia = () => {
    const tettoieFalde = falde.filter(f => f.tettoiaIndex !== undefined);
    const newIndex = tettoieFalde.length;
    const baseNome = isATerra ? 'Struttura' : 'Tettoia';

    const newTettoia = {
      id: Date.now(),
      tettoiaIndex: newIndex,
      nome: `${baseNome} ${newIndex + 1}`,
      altezza: isATerra ? 0 : 0,
      larghezza: 0,
      lunghezza: 0,
      inclinazione: 0,
      costoKitStruttura: 0,
      gruppiModuli: []
    };

    setFalde(prev => [...prev, newTettoia]);
    setTettoiaCounter(prev => prev + 1);
  };

  const removeTettoia = (id) => {
    const baseNome = isATerra ? 'Struttura' : 'Tettoia';
    setFalde(prev => {
      const filtered = prev.filter(falda => falda.id !== id);
      // Rinumera le tettoie/impianti rimanenti
      return filtered.map(falda => {
        if (falda.tettoiaIndex !== undefined) {
          const tettoieOnly = filtered.filter(f => f.tettoiaIndex !== undefined);
          const newIndex = tettoieOnly.indexOf(falda);
          return {
            ...falda,
            tettoiaIndex: newIndex,
            nome: `${baseNome} ${newIndex + 1}`
          };
        }
        return falda;
      });
    });
  };

  const updateTettoia = (id, updatedData) => {
    setFalde(prev => prev.map(falda =>
      falda.id === id ? { ...falda, ...updatedData } : falda
    ));
  };

  // Filtra solo le falde che sono tettoie
  const tettoieFalde = falde.filter(f => f.tettoiaIndex !== undefined);

  const titleText = isATerra ? 'Impianti A Terra' : 'Tettoie';
  const buttonText = isATerra ? 'Aggiungi Impianto A Terra' : 'Aggiungi Tettoia';
  const iconColor = isATerra ? '#228B22' : '#2E8B57';

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill={iconColor}>
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        {titleText}
      </h2>

      <div className="space-y-4">
        {tettoieFalde.map((tettoia) => (
          <TettoiaItem
            key={tettoia.id}
            tettoia={tettoia}
            onRemove={removeTettoia}
            onUpdate={updateTettoia}
            isATerra={isATerra}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addTettoia}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        {buttonText}
      </button>
    </div>
  );
};

export default Tettoie;
