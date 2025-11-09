import { useState, useEffect } from 'react';
import GruppoModuli from './GruppoModuli';
import { useModules } from '../../hooks/useProductData';

const FaldaItem = ({ falda, onRemove, onUpdate }) => {
  const { modules } = useModules();
  const [gruppoCounter, setGruppoCounter] = useState(() => {
    // Inizializza il counter basandosi sul massimo ID esistente nei gruppi
    if (!falda.gruppiModuli || falda.gruppiModuli.length === 0) return 1;
    const maxId = Math.max(...falda.gruppiModuli.map(g => g.id || 0));
    return maxId + 1;
  });

  // Aggiorna il counter quando i gruppi cambiano
  useEffect(() => {
    if (falda.gruppiModuli && falda.gruppiModuli.length > 0) {
      const maxId = Math.max(...falda.gruppiModuli.map(g => g.id || 0));
      setGruppoCounter(prev => Math.max(prev, maxId + 1));
    }
  }, [falda.gruppiModuli?.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(falda.id, { [name]: parseFloat(value) || value });
  };

  const addGruppoModuli = () => {
    const newGruppo = {
      id: gruppoCounter,
      nome: `Gruppo ${gruppoCounter}`,
      orientamento: 'verticale',
      modulo: 'longi440',
      numeroFile: 2,
      moduliPerFila: 10
    };
    const updatedGruppi = [...(falda.gruppiModuli || []), newGruppo];
    onUpdate(falda.id, { gruppiModuli: updatedGruppi });
    setGruppoCounter(prev => prev + 1);
  };

  const removeGruppoModuli = (gruppoId) => {
    const updatedGruppi = falda.gruppiModuli.filter(g => g.id !== gruppoId);
    onUpdate(falda.id, { gruppiModuli: updatedGruppi });
  };

  const updateGruppoModuli = (gruppoId, updatedData) => {
    const updatedGruppi = falda.gruppiModuli.map(g =>
      g.id === gruppoId ? { ...g, ...updatedData } : g
    );
    onUpdate(falda.id, { gruppiModuli: updatedGruppi });
  };

  // Calcola la potenza totale della falda sommando le potenze di tutti i gruppi
  const calculateTotalPower = () => {
    if (!falda.gruppiModuli || falda.gruppiModuli.length === 0) {
      return 0;
    }

    const totalPower = falda.gruppiModuli.reduce((sum, gruppo) => {
      const selectedModule = modules.find(m => m.id === gruppo.modulo) || modules[0];
      const gruppoPower = (gruppo.numeroFile * gruppo.moduliPerFila * selectedModule.potenza) / 1000;
      return sum + gruppoPower;
    }, 0);

    return totalPower;
  };

  return (
    <div className="falda-group mb-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          name="nome"
          value={falda.nome}
          onChange={handleChange}
          className="form-input w-full max-w-xs"
          placeholder="Nome Falda"
        />
        <button
          type="button"
          onClick={() => onRemove(falda.id)}
          className="text-red-500 hover:text-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="form-group">
          <label className="form-label">Larghezza (m)</label>
          <input
            type="number"
            name="larghezza"
            value={falda.larghezza}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lunghezza (m)</label>
          <input
            type="number"
            name="lunghezza"
            value={falda.lunghezza}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Inclinazione (gradi)</label>
          <input
            type="number"
            name="inclinazione"
            value={falda.inclinazione}
            onChange={handleChange}
            className="form-input"
            min="0"
            max="90"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#2E8B57">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Gruppi di Moduli
        </h4>

        <div className="space-y-4">
          {(falda.gruppiModuli || []).map((gruppo) => (
            <GruppoModuli
              key={gruppo.id}
              gruppo={gruppo}
              faldaId={falda.id}
              onRemove={removeGruppoModuli}
              onUpdate={updateGruppoModuli}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addGruppoModuli}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Aggiungi Gruppo Moduli
        </button>

        <div className="form-group mt-4">
          <label className="form-label">Potenza Totale Falda</label>
          <p className="text-lg font-semibold p-2 bg-green-100 rounded text-green-800">
            {calculateTotalPower().toFixed(2)} kW
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaldaItem;
