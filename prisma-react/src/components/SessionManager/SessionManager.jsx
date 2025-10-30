import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { getSessions, deleteSession as deleteAirtableSession } from '../../services/sessions';
import { isOnline } from '../../services/airtable';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [offline, setOffline] = useState(false);
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
    setRenderImages,
    setSessionId,
    setHasCheckedDuplicates
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

  const loadSessions = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Load from Airtable
      const { sessions: airtableSessions, fromCache: cached, offline: isOffline } = await getSessions(forceRefresh);

      setFromCache(cached);
      setOffline(isOffline);

      // Transform Airtable sessions to match UI format
      const sessionList = airtableSessions.map(session => {
        const sessionData = session.session_data || {};
        const clientName = session.nome_cliente && session.cognome_cliente
          ? `${session.nome_cliente} ${session.cognome_cliente}`.trim()
          : session.nome_cliente || 'Unnamed';

        return {
          airtableId: session.airtableId,
          sessionId: session.session_id,
          clientName,
          quoteRef: session.riferimento_preventivo || 'Draft',
          lastSaved: session.last_updated || session.created_at || 'Unknown',
          status: session.status || 'draft',
          ...sessionData
        };
      });

      // Also load localStorage sessions (for backwards compatibility and offline work)
      const localSessions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prisma_session_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            // Skip if already in Airtable sessions
            const alreadyInAirtable = sessionList.some(s => s.sessionId === data.sessionId);
            if (!alreadyInAirtable) {
              const clientName = data.clientData?.nome && data.clientData?.cognome
                ? `${data.clientData.nome} ${data.clientData.cognome}`.trim()
                : data.clientData?.nome || data.clientData?.nomeCognome || 'Unnamed';
              localSessions.push({
                key,
                sessionId: data.sessionId,
                clientName,
                quoteRef: data.quoteData?.riferimentoPreventivo || 'Draft',
                lastSaved: data.lastSaved || 'Unknown',
                status: 'local_only',
                ...data
              });
            }
          } catch (error) {
            console.error('Error loading local session:', error);
          }
        }
      }

      // Combine and sort by last saved date (newest first)
      const allSessions = [...sessionList, ...localSessions];
      allSessions.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));

      setSessions(allSessions);

      // Show modal on first load if there are saved sessions
      if (allSessions.length > 0 && !showModal) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback to localStorage only
      loadLocalSessionsOnly();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalSessionsOnly = () => {
    const sessionList = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('prisma_session_') || key.startsWith('prisma_autosave_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const clientName = data.clientData?.nome && data.clientData?.cognome
            ? `${data.clientData.nome} ${data.clientData.cognome}`.trim()
            : data.clientData?.nome || data.clientData?.nomeCognome || 'Unnamed';
          sessionList.push({
            key,
            sessionId: data.sessionId,
            clientName,
            quoteRef: data.quoteData?.riferimentoPreventivo || 'Draft',
            lastSaved: data.lastSaved || 'Unknown',
            status: 'local_only',
            ...data
          });
        } catch (error) {
          console.error('Error loading session:', error);
        }
      }
    }
    sessionList.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
    setSessions(sessionList);
    setOffline(true);
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

    // Restore session ID and reset duplicate check
    if (session.sessionId) {
      setSessionId(session.sessionId);
    }
    setHasCheckedDuplicates(true); // Already checked in previous session

    setShowModal(false);
    alert('✅ Sessione ripristinata con successo!');
  };

  const deleteSession = async (session) => {
    if (!confirm('Sei sicuro di voler eliminare questa sessione salvata?')) {
      return;
    }

    try {
      // Delete from Airtable if it has an airtableId
      if (session.airtableId && isOnline()) {
        await deleteAirtableSession(session.airtableId);
      }

      // Delete from localStorage
      if (session.key) {
        localStorage.removeItem(session.key);
      }
      // Also try to delete by sessionId
      if (session.sessionId) {
        localStorage.removeItem(`prisma_session_${session.sessionId}`);
      }

      // Reload sessions
      await loadSessions();

      alert('✅ Sessione eliminata con successo!');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('⚠️ Errore durante l\'eliminazione della sessione. Riprova.');
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
          left: '16px',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#0F3460' }}>
            Sessioni Salvate
          </h2>
          <button
            onClick={() => loadSessions(true)}
            disabled={loading}
            style={{
              padding: '0.3rem 0.6rem',
              backgroundColor: loading ? '#e2e8f0' : '#3b82f6',
              color: loading ? '#718096' : 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            {loading ? '⏳' : '🔄'} Aggiorna
          </button>
        </div>

        {/* Status indicator */}
        {offline && (
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.25rem',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
            color: '#92400e'
          }}>
            📡 Offline - Mostrando sessioni da cache locale
          </div>
        )}
        {!offline && fromCache && (
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '0.25rem',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
            color: '#1e40af'
          }}>
            💾 Mostrando sessioni da cache (clicca Aggiorna per ricaricare)
          </div>
        )}

        <div style={{ marginBottom: '0.75rem' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              <p>Nessuna sessione salvata</p>
            </div>
          ) : (
            <div>
              {sessions.map((session, index) => (
                <div
                  key={session.airtableId || session.key || index}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem', color: '#2d3748' }}>
                        {session.clientName}
                      </strong>
                      {/* Status badge */}
                      {session.status === 'local_only' && (
                        <span style={{
                          marginLeft: '0.4rem',
                          padding: '0.1rem 0.3rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '0.2rem',
                          fontSize: '0.65rem',
                          fontWeight: '600'
                        }}>
                          💾 Locale
                        </span>
                      )}
                      {session.status === 'in_progress' && (
                        <span style={{
                          marginLeft: '0.4rem',
                          padding: '0.1rem 0.3rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '0.2rem',
                          fontSize: '0.65rem',
                          fontWeight: '600'
                        }}>
                          ☁️ Cloud
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#718096', fontSize: '0.7rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
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
                      onClick={() => deleteSession(session)}
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
