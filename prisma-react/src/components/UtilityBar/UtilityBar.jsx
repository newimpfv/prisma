import { useState } from 'react';
import { useForm } from '../../context/FormContext';

const UtilityBar = () => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [importHover, setImportHover] = useState(false);
  const [clearHover, setClearHover] = useState(false);
  const [versionHover, setVersionHover] = useState(false);

  const {
    setClientData,
    setStructureData,
    setFalde,
    setInverters,
    setBatteries,
    setComponents,
    setLaborSafety,
    setUnitCosts,
    setEnergyData,
    setEconomicParams,
    setQuoteData,
    setCustomText,
    setPvgisData,
    setRenderImages
  } = useForm();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.prisma';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);

          // Restore all data
          setClientData(data.clientData || {});
          setStructureData(data.structureData || {});
          setFalde(data.falde || []);
          setInverters(data.inverters || []);
          setBatteries(data.batteries || []);
          setComponents(data.components || {});
          setLaborSafety(data.laborSafety || {});
          setUnitCosts(data.unitCosts || {});
          setEnergyData(data.energyData || {});
          setEconomicParams(data.economicParams || {});
          setQuoteData(data.quoteData || {});
          setCustomText(data.customText || {});
          setPvgisData(data.pvgisData || null);
          setRenderImages(data.renderImages || ['', '', '']);

          alert('Preventivo importato con successo!');
        } catch (error) {
          alert('Errore nell\'importazione del file: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Sei sicuro di voler cancellare TUTTI i dati di TUTTI i preventivi?')) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prisma_autosave_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert('Tutti i dati sono stati cancellati.');
      window.location.reload();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Import Button - Green Gradient */}
        <button
          onClick={handleImport}
          onMouseEnter={() => setImportHover(true)}
          onMouseLeave={() => setImportHover(false)}
          style={{
            background: importHover
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: importHover
              ? '0 10px 25px -5px rgba(16, 185, 129, 0.5), 0 8px 10px -6px rgba(16, 185, 129, 0.4)'
              : '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            cursor: 'pointer',
            transform: importHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
          }}
          title="Importa Preventivo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Importa
        </button>

        {/* Clear All Button - Red with white background */}
        <button
          onClick={handleClearAll}
          onMouseEnter={() => setClearHover(true)}
          onMouseLeave={() => setClearHover(false)}
          style={{
            background: clearHover ? '#fee2e2' : 'white',
            color: clearHover ? '#dc2626' : '#ef4444',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: clearHover
              ? '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 8px 10px -6px rgba(239, 68, 68, 0.3)'
              : '0 4px 15px -3px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: clearHover ? '2px solid #dc2626' : '2px solid #ef4444',
            cursor: 'pointer',
            transform: clearHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
          }}
          title="Cancella Dati Salvati"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Cancella Tutto
        </button>

        {/* Version Button - Blue Badge */}
        <button
          onClick={() => setShowVersionModal(true)}
          onMouseEnter={() => setVersionHover(true)}
          onMouseLeave={() => setVersionHover(false)}
          style={{
            background: versionHover
              ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            boxShadow: versionHover
              ? '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.4)'
              : '0 4px 15px -3px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            cursor: 'pointer',
            transform: versionHover ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
          }}
          title="Informazioni Versione"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '0.95rem', width: '0.95rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          v4.0
        </button>
      </div>

      {/* Version Info Modal */}
      {showVersionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '28rem',
            width: '100%',
            padding: '2rem',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '2.5rem', width: '2.5rem', color: '#2563eb' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>PRISMA React</h2>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4b5563', marginTop: '0.25rem' }}>Versione 4.0.0</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Novità in questa versione:</h3>
                <ul style={{ fontSize: '0.875rem', color: '#4b5563', listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: '1.75' }}>
                  <li>Applicazione React completamente rinnovata</li>
                  <li>Tutti i componenti modulari e ottimizzati</li>
                  <li>Calcoli in tempo reale</li>
                  <li>Salvataggio automatico ogni 30 secondi</li>
                  <li>Gestione sessioni migliorata</li>
                  <li>Supporto caricamento immagini render</li>
                  <li>Integrazione mappa PVGIS interattiva</li>
                  <li>Importazione/Esportazione preventivi</li>
                </ul>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Basato su PRISMA HTML v3.42<br />
                  React Edition - Marzo 2025
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVersionModal(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.3s',
                border: '2px solid #60a5fa',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 20px 25px -5px rgba(37, 99, 235, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UtilityBar;
