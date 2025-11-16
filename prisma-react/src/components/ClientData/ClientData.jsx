import { useForm } from '../../context/FormContext';
import { useState, useEffect } from 'react';
import { fetchClients, createClient } from '../../services/clients';
import { fetchInstallations, createInstallation, updateInstallation } from '../../services/installations';

const ClientData = () => {
  const {
    clientData,
    setClientData,
    selectedClientRecord,
    setSelectedClientRecord,
    selectedInstallation,
    setSelectedInstallation
  } = useForm();
  const [clients, setClients] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showInstallationSelector, setShowInstallationSelector] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [installationSearchQuery, setInstallationSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadClients = async () => {
    if (!online) return;
    setLoadingClients(true);
    try {
      const clientsList = await fetchClients();
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadInstallations = async () => {
    if (!online) return;
    setLoadingInstallations(true);
    try {
      const installationsList = await fetchInstallations();
      setInstallations(installationsList);
    } catch (error) {
      console.error('Error loading installations:', error);
    } finally {
      setLoadingInstallations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectClient = async (client) => {
    setSelectedClientRecord(client);
    setClientData(prev => ({
      ...prev,
      nome: client.nome || '',
      cognome: client.cognome || '',
      email: client.email || '',
      telefono: client.telefono || client.cellulare || '',
      airtableClientId: client.airtableId || client.id
    }));
    setShowClientSelector(false);

    // Check if client has linked installations and auto-select the first one
    if (client.impianto && client.impianto.length > 0) {
      try {
        // Load installations if not already loaded
        if (installations.length === 0) {
          await loadInstallations();
        }

        // Find the linked installation
        const linkedInstallationId = client.impianto[0];
        const linkedInstallation = installations.find(
          inst => inst.id === linkedInstallationId || inst.airtableId === linkedInstallationId
        );

        if (linkedInstallation) {
          setSelectedInstallation(linkedInstallation);
          setClientData(prev => ({
            ...prev,
            nomeImpianto: linkedInstallation.nome || '',
            indirizzo: linkedInstallation.indirizzo || '',
            airtableInstallationId: linkedInstallation.airtableId || linkedInstallation.id
          }));
          setSuccessMessage('✓ Cliente e Impianto collegato selezionati');
        } else {
          setSuccessMessage('✓ Cliente selezionato');
        }
      } catch (error) {
        console.error('Error loading linked installation:', error);
        setSuccessMessage('✓ Cliente selezionato');
      }
    } else {
      setSuccessMessage('✓ Cliente selezionato');
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSelectInstallation = (installation) => {
    setSelectedInstallation(installation);
    setClientData(prev => ({
      ...prev,
      nomeImpianto: installation.nome || '',
      indirizzo: installation.indirizzo || '',
      airtableInstallationId: installation.airtableId || installation.id
    }));
    setShowInstallationSelector(false);
    setSuccessMessage('✓ Impianto selezionato');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveAndLink = async () => {
    if (!online) {
      alert('⚠️ Funzione disponibile solo online');
      return;
    }
    setSaving(true);
    try {
      let clientId = clientData.airtableClientId;
      let installationId = clientData.airtableInstallationId;

      // Create client if new
      if (!clientId && clientData.nome) {
        const clientPayload = {
          'nome / ragione sociale': clientData.nome,
          cognome: clientData.cognome || '',
          email: clientData.email || '',
          telefono: clientData.telefono || '',
          'indirizzo impianto': clientData.indirizzo || ''
        };
        const newClient = await createClient(clientPayload);
        clientId = newClient.id;
        setSelectedClientRecord(newClient);
        setClientData(prev => ({ ...prev, airtableClientId: clientId }));
      }

      // Create installation if new
      if (!installationId && clientData.nomeImpianto) {
        const installationPayload = {
          nome: clientData.nomeImpianto,
          indirizzo: clientData.indirizzo || '',
          'dati cliente': clientId ? [clientId] : []
        };
        const newInstallation = await createInstallation(installationPayload);
        installationId = newInstallation.id;
        setSelectedInstallation(newInstallation);
        setClientData(prev => ({ ...prev, airtableInstallationId: installationId }));
      } else if (installationId && clientId) {
        // Link existing installation to client and update name if changed
        const updatePayload = {
          nome: clientData.nomeImpianto,
          indirizzo: clientData.indirizzo || '',
          'dati cliente': [clientId]
        };
        await updateInstallation(installationId, updatePayload);
      }

      setSuccessMessage('✓ Dati salvati e collegati con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadClients();
      await loadInstallations();
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Errore nel salvare i dati');
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const query = clientSearchQuery.toLowerCase();
    return (
      (client.nome || '').toLowerCase().includes(query) ||
      (client.cognome || '').toLowerCase().includes(query) ||
      (client.email || '').toLowerCase().includes(query)
    );
  });

  const filteredInstallations = installations.filter(installation => {
    const query = installationSearchQuery.toLowerCase();
    return (
      (installation.nome || '').toLowerCase().includes(query) ||
      (installation.indirizzo || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="form-section">
      <style>{`
        @media (max-width: 768px) {
          .client-data-buttons {
            grid-template-columns: 1fr !important;
          }
          .client-data-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
          .client-data-header .header-buttons {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 0.5rem !important;
          }
          .client-data-header button {
            width: 100% !important;
          }
        }
      `}</style>
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between client-data-header">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Dati Cliente e Impianto
        </div>
        {online && (
          <div className="header-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowClientSelector(!showClientSelector);
                if (!showClientSelector && clients.length === 0) {
                  loadClients();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showClientSelector ? '✕ Chiudi' : '👥 Seleziona Cliente'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInstallationSelector(!showInstallationSelector);
                if (!showInstallationSelector && installations.length === 0) {
                  loadInstallations();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showInstallationSelector ? '✕ Chiudi' : '⚡ Seleziona Impianto'}
            </button>
          </div>
        )}
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          {successMessage}
        </div>
      )}

      {/* Client Selector */}
      {showClientSelector && online && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
            👥 Seleziona Cliente Esistente
          </h3>
          <input
            type="text"
            placeholder="🔍 Cerca cliente per nome o email..."
            value={clientSearchQuery}
            onChange={(e) => setClientSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #93c5fd',
              fontSize: '0.875rem',
              marginBottom: '0.75rem'
            }}
          />
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {loadingClients ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>Caricamento...</div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #93c5fd',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 'auto',
                    height: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#93c5fd';
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '0.5rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.5',
                    width: '100%'
                  }}>
                    {client.nome}{client.cognome && ` ${client.cognome}`}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                    width: '100%'
                  }}>
                    {client.email && `📧 ${client.email}`}
                    {client.telefono && ` • 📱 ${client.telefono}`}
                    {!client.telefono && client.cellulare && ` • 📱 ${client.cellulare}`}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Nessun cliente trovato
              </div>
            )}
          </div>
        </div>
      )}

      {/* Installation Selector */}
      {showInstallationSelector && online && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem', color: '#047857' }}>
            ⚡ Seleziona Impianto Esistente
          </h3>
          <input
            type="text"
            placeholder="🔍 Cerca impianto per nome o indirizzo..."
            value={installationSearchQuery}
            onChange={(e) => setInstallationSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #86efac',
              fontSize: '0.875rem',
              marginBottom: '0.75rem'
            }}
          />
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {loadingInstallations ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>Caricamento...</div>
            ) : filteredInstallations.length > 0 ? (
              filteredInstallations.map(installation => (
                <div
                  key={installation.id}
                  onClick={() => handleSelectInstallation(installation)}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #86efac',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 'auto',
                    height: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dcfce7';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#86efac';
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    color: '#047857',
                    marginBottom: '0.5rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.5',
                    width: '100%'
                  }}>
                    {installation.nome || installation.indirizzo}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.6',
                    width: '100%'
                  }}>
                    📍 {installation.indirizzo}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Nessun impianto trovato
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Items Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {selectedClientRecord && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 'auto',
            height: 'auto'
          }}>
            <div style={{
              flex: 1,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              marginRight: '0.5rem',
              lineHeight: '1.5'
            }}>
              <strong>👤 Cliente:</strong> {selectedClientRecord.nome}{selectedClientRecord.cognome && ` ${selectedClientRecord.cognome}`}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedClientRecord(null);
                setClientData(prev => ({ ...prev, airtableClientId: '', nome: '', cognome: '', email: '', telefono: '' }));
              }}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {selectedInstallation && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 'auto',
            height: 'auto'
          }}>
            <div style={{
              flex: 1,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              marginRight: '0.5rem',
              lineHeight: '1.5'
            }}>
              <strong>⚡ Impianto:</strong> {selectedInstallation.nome || selectedInstallation.indirizzo}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedInstallation(null);
                setClientData(prev => ({ ...prev, airtableInstallationId: '', nomeImpianto: '', indirizzo: '' }));
              }}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Data Section */}
        <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.5rem' }}>
            👤 Dati Cliente
          </h3>
        </div>

        <div className="form-group">
          <label className="form-label">Nome / Ragione Sociale *</label>
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

        {/* Impianto Data Section */}
        <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#047857', marginBottom: '0.5rem' }}>
            ⚡ Dati Impianto
          </h3>
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label">Nome Impianto *</label>
          <input
            type="text"
            name="nomeImpianto"
            value={clientData.nomeImpianto || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Inserisci nome identificativo dell'impianto"
            required
          />
        </div>
        <div className="form-group md:col-span-2">
          <label className="form-label">Indirizzo Impianto Completo *</label>
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

      {/* Save Button */}
      {online && (() => {
        // Determine the action and button state
        const hasClient = selectedClientRecord && clientData.airtableClientId;
        const hasInstallation = selectedInstallation && clientData.airtableInstallationId;
        const hasClientData = clientData.nome;
        const hasInstallationData = clientData.nomeImpianto;

        let buttonText = '';
        let buttonColor = '';
        let helpText = '';
        let isDisabled = false;

        if (hasClient && hasInstallation) {
          // Both selected - Update
          buttonText = '🔄 Aggiorna Cliente e Impianto Collegati';
          buttonColor = '#f59e0b'; // Amber
          helpText = 'Aggiornerà i dati del cliente e dell\'impianto selezionati e assicurerà che siano collegati.';
        } else if (hasClient && !hasInstallation) {
          if (!hasInstallationData) {
            buttonText = '⚠️ Inserisci Nome Impianto';
            buttonColor = '#9ca3af'; // Gray
            helpText = 'Inserisci il Nome Impianto (campo obbligatorio) per creare un nuovo impianto collegato al cliente selezionato.';
            isDisabled = true;
          } else {
            buttonText = '➕ Crea Nuovo Impianto e Collega';
            buttonColor = '#10b981'; // Green
            helpText = 'Creerà un nuovo impianto con i dati inseriti e lo collegherà automaticamente al cliente selezionato.';
          }
        } else if (!hasClient && hasInstallation) {
          if (!hasClientData) {
            buttonText = '⚠️ Inserisci Nome Cliente';
            buttonColor = '#9ca3af'; // Gray
            helpText = 'Inserisci il Nome del cliente per crearne uno nuovo collegato all\'impianto selezionato.';
            isDisabled = true;
          } else {
            buttonText = '➕ Crea Nuovo Cliente e Collega';
            buttonColor = '#3b82f6'; // Blue
            helpText = 'Creerà un nuovo cliente con i dati inseriti e lo collegherà automaticamente all\'impianto selezionato.';
          }
        } else {
          // Neither selected - Create both
          if (!hasClientData && !hasInstallationData) {
            buttonText = '⚠️ Inserisci Dati Cliente e Impianto';
            buttonColor = '#9ca3af'; // Gray
            helpText = 'Inserisci il Nome del cliente e il Nome Impianto (entrambi obbligatori) per creare entrambi.';
            isDisabled = true;
          } else if (!hasClientData) {
            buttonText = '⚠️ Inserisci Nome Cliente';
            buttonColor = '#9ca3af'; // Gray
            helpText = 'Inserisci il Nome del cliente per creare cliente e impianto collegati.';
            isDisabled = true;
          } else if (!hasInstallationData) {
            buttonText = '⚠️ Inserisci Nome Impianto';
            buttonColor = '#9ca3af'; // Gray
            helpText = 'Inserisci il Nome Impianto (campo obbligatorio) per creare cliente e impianto collegati.';
            isDisabled = true;
          } else {
            buttonText = '✨ Crea Cliente e Impianto Collegati';
            buttonColor = '#7c3aed'; // Purple
            helpText = 'Creerà un nuovo cliente e un nuovo impianto con i dati inseriti e li collegherà automaticamente.';
          }
        }

        return (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '2px dashed #e5e7eb'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
              💾 Salva e Collega
            </h3>
            <button
              type="button"
              onClick={handleSaveAndLink}
              disabled={saving || isDisabled}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: buttonColor,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (saving || isDisabled) ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {saving ? '⏳ Salvataggio...' : buttonText}
            </button>
            <div style={{
              marginTop: '0.75rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              <p style={{ margin: 0 }}>
                {helpText}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ClientData;
