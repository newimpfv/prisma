import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    loadSessions();
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));

    if (diffMin < 1) return 'Appena salvato';
    if (diffMin < 60) return `${diffMin} minuti fa`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ore fa`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} giorni fa`;

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} mesi fa`;
  };

  const loadSessions = () => {
    const sessionList = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('prisma_autosave_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          sessionList.push({
            key,
            ...data,
            clientName: data.clientData?.nomeCognome || 'Unnamed',
            quoteRef: data.quoteData?.riferimentoPreventivo || 'Draft',
            lastSaved: data.lastSaved || 'Unknown'
          });
        } catch (error) {
          console.error('Error loading session:', error);
        }
      }
    }
    // Sort by last saved date (newest first)
    sessionList.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
    setSessions(sessionList);

    // Show modal if there are saved sessions
    if (sessionList.length > 0) {
      setShowModal(true);
    }
  };

  const restoreSession = (session) => {
    setClientData(session.clientData || {});
    setStructureData(session.structureData || {});
    setFalde(session.falde || []);
    setInverters(session.inverters || []);
    setBatteries(session.batteries || []);
    setComponents(session.components || {});
    setLaborSafety(session.laborSafety || {});
    setUnitCosts(session.unitCosts || {});
    setEnergyData(session.energyData || {});
    setEconomicParams(session.economicParams || {});
    setQuoteData(session.quoteData || {});
    setCustomText(session.customText || {});
    setPvgisData(session.pvgisData || null);
    setRenderImages(session.renderImages || ['', '', '']);

    setShowModal(false);
    alert('Sessione ripristinata con successo!');
  };

  const deleteSession = (key) => {
    if (confirm('Sei sicuro di voler eliminare questa sessione salvata?')) {
      localStorage.removeItem(key);
      loadSessions();
    }
  };

  const startNewSession = () => {
    setShowModal(false);
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 500,
          transition: 'background-color 0.3s',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px' }} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
          <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
        Sessioni Salvate ({sessions.length})
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          width: '380px',
          maxWidth: '95%',
          maxHeight: '60vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#0F3460', marginBottom: '0.75rem' }}>
          Sessioni Salvate
        </h2>

        <div style={{ marginBottom: '0.75rem' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              <p>Nessuna sessione salvata</p>
            </div>
          ) : (
            <div>
              {sessions.map((session) => (
                <div
                  key={session.key}
                  style={{
                    padding: '0.6rem',
                    marginBottom: '0.6rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.4rem',
                    transition: 'all 0.2s',
                    position: 'relative',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#2d3748' }}>
                      {session.clientName}
                    </strong>
                    <span style={{ color: '#718096', fontSize: '0.7rem' }}>
                      {getTimeAgo(new Date(session.lastSaved))}
                    </span>
                  </div>
                  <div style={{ color: '#4a5568', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem' }}>Rif: {session.quoteRef}</span>
                  </div>
                  <div style={{ display: 'flex', marginTop: '0.4rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => restoreSession(session)}
                      style={{
                        padding: '0.3rem 0.55rem',
                        backgroundColor: '#0F3460',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Ripristina
                    </button>
                    <button
                      onClick={() => deleteSession(session.key)}
                      style={{
                        padding: '0.3rem 0.55rem',
                        backgroundColor: 'white',
                        color: '#e53e3e',
                        border: '1px solid #e53e3e',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '0.75rem' }}>
          <button
            onClick={startNewSession}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#e2e8f0',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              flexGrow: 1,
              fontSize: '0.8rem'
            }}
          >
            Nuova Sessione
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
