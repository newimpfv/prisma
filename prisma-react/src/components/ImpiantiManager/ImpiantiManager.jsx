import { useState, useEffect } from 'react';
import { getInstallations, createInstallation, updateInstallation, deleteInstallation, linkInstallationToClient, unlinkInstallationFromClient } from '../../services/installations';
import { getClients, createClient } from '../../services/clients';
import { isOnline } from '../../services/airtable';

const ImpiantiManager = () => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState(null);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [online, setOnline] = useState(isOnline());
  const [showAllInstallations, setShowAllInstallations] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  // Client linking state
  const [linkedClients, setLinkedClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [showClientLinking, setShowClientLinking] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [linkedClientsFilter, setLinkedClientsFilter] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);

  // Form state for adding/editing installations
  const [formData, setFormData] = useState({
    nome: '',
    indirizzo: '',
    coordinate: '',
    dettagli_moduli: '',
    n_moduli_totali: 0,
    status_offerta: 'in preparazione',
    status_realizzazione: 'preventivo',
    simulazione_render: 'Da fare',
    impianto_completato: false,
    compenso: 0
  });

  // New client form state
  const [newClientData, setNewClientData] = useState({
    nome: '',
    cognome: '',
    email: '',
    cellulare: '',
    indirizzo_impianto: '',
    citta_impianto: ''
  });

  // Load installations on mount
  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    setLoading(true);
    try {
      const result = await getInstallations();
      setInstallations(result.installations);
    } catch (error) {
      alert(`Errore caricamento impianti: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const getFilteredInstallations = () => {
    if (!searchQuery.trim()) {
      // Sort by creation date (most recent first) and show only last 3 if not showing all
      const sortedInstallations = [...installations].sort((a, b) =>
        new Date(b.createdTime) - new Date(a.createdTime)
      );
      return showAllInstallations ? sortedInstallations : sortedInstallations.slice(0, 3);
    }

    const query = searchQuery.toLowerCase();
    return installations.filter(installation =>
      (installation.nome && installation.nome.toLowerCase().includes(query)) ||
      (installation.indirizzo && installation.indirizzo.toLowerCase().includes(query))
    );
  };

  const handleAddInstallation = async (e) => {
    e.preventDefault();
    if (!online) {
      alert('Impossibile aggiungere un impianto mentre sei offline');
      return;
    }

    try {
      await createInstallation(formData);
      alert('✅ Impianto aggiunto con successo!');
      setShowAddForm(false);
      resetForm();
      loadInstallations();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleUpdateInstallation = async (e) => {
    e.preventDefault();
    if (!online) {
      alert('Impossibile modificare un impianto mentre sei offline');
      return;
    }

    try {
      await updateInstallation(editingInstallation.id, formData);
      alert('✅ Impianto aggiornato con successo!');
      setEditingInstallation(null);
      resetForm();
      resetClientLinkingState();
      loadInstallations();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleDeleteInstallation = async (installationId) => {
    if (!online) {
      alert('Impossibile eliminare un impianto mentre sei offline');
      return;
    }

    if (!confirm('Sei sicuro di voler eliminare questo impianto?')) {
      return;
    }

    try {
      await deleteInstallation(installationId);
      alert('✅ Impianto eliminato con successo!');
      loadInstallations();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleEditClick = async (installation) => {
    setEditingInstallation(installation);
    setFormData({
      nome: installation.nome || '',
      indirizzo: installation.indirizzo || '',
      coordinate: installation.coordinate || '',
      dettagli_moduli: installation.dettagli_moduli || '',
      n_moduli_totali: installation.n_moduli_totali || 0,
      status_offerta: installation.status_offerta || 'in preparazione',
      status_realizzazione: installation.status_realizzazione || 'preventivo',
      simulazione_render: installation.simulazione_render || 'Da fare',
      impianto_completato: installation.impianto_completato || false,
      compenso: installation.compenso || 0
    });
    setShowAddForm(false);

    // Load linked clients for this installation
    await loadLinkedClients(installation);
  };

  const handleSelectInstallation = (installation) => {
    setSelectedInstallation(installation);
    alert(`✅ Impianto selezionato: ${installation.nome || 'Senza nome'}\n\nIndirizzo: ${installation.indirizzo || 'Non specificato'}`);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      indirizzo: '',
      coordinate: '',
      dettagli_moduli: '',
      n_moduli_totali: 0,
      status_offerta: 'in preparazione',
      status_realizzazione: 'preventivo',
      simulazione_render: 'Da fare',
      impianto_completato: false,
      compenso: 0
    });
  };

  const resetClientLinkingState = () => {
    setLinkedClients([]);
    setShowClientLinking(false);
    setClientSearchQuery('');
    setLinkedClientsFilter('');
    setShowCreateClientForm(false);
    setNewClientData({
      nome: '',
      cognome: '',
      email: '',
      cellulare: '',
      indirizzo_impianto: '',
      citta_impianto: ''
    });
  };

  // Client management functions
  const loadLinkedClients = async (installation) => {
    if (!online) {
      setLinkedClients([]);
      return;
    }

    setLoadingClients(true);
    try {
      const { clients } = await getClients();
      // Filter clients that are linked to this installation
      const linked = clients.filter(client =>
        client.impianto && client.impianto.includes(installation.id || installation.airtableId)
      );
      setLinkedClients(linked);
    } catch (error) {
      console.error('Error loading linked clients:', error);
      setLinkedClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadAllClients = async () => {
    if (!online) return;

    setLoadingClients(true);
    try {
      const { clients } = await getClients();
      setAllClients(clients);
    } catch (error) {
      console.error('Error loading all clients:', error);
      alert(`❌ Errore caricamento clienti: ${error.message}`);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleLinkClient = async (clientId) => {
    if (!editingInstallation) return;

    try {
      await linkInstallationToClient(editingInstallation.id || editingInstallation.airtableId, clientId);
      alert('✅ Cliente collegato con successo!');
      await loadLinkedClients(editingInstallation);
      setShowClientLinking(false);
      setClientSearchQuery('');
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleUnlinkClient = async (clientId) => {
    if (!editingInstallation) return;

    if (!confirm('Vuoi davvero scollegare questo cliente dall\'impianto?')) return;

    try {
      await unlinkInstallationFromClient(editingInstallation.id || editingInstallation.airtableId, clientId);
      alert('✅ Cliente scollegato con successo!');
      await loadLinkedClients(editingInstallation);
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const toggleClientLinking = async () => {
    if (!showClientLinking && allClients.length === 0) {
      await loadAllClients();
    }
    setShowClientLinking(!showClientLinking);
    setClientSearchQuery('');
    setShowCreateClientForm(false);
  };

  const getFilteredClients = () => {
    const linkedIds = linkedClients.map(c => c.id || c.airtableId);
    const unlinkedClients = allClients.filter(c => !linkedIds.includes(c.id || c.airtableId));

    if (!clientSearchQuery.trim()) {
      return unlinkedClients;
    }

    const query = clientSearchQuery.toLowerCase();
    return unlinkedClients.filter(client =>
      (client.nome && client.nome.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query))
    );
  };

  const getFilteredLinkedClients = () => {
    if (!linkedClientsFilter.trim()) {
      return linkedClients;
    }

    const query = linkedClientsFilter.toLowerCase();
    return linkedClients.filter(client =>
      (client.nome && client.nome.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query))
    );
  };

  const handleCreateAndLinkClient = async (e) => {
    e.preventDefault();
    if (!online) {
      alert('Impossibile creare un cliente mentre sei offline');
      return;
    }

    if (!editingInstallation) return;

    try {
      const client = await createClient(newClientData);
      alert('✅ Cliente creato con successo!');

      // Link the new client to the installation
      await linkInstallationToClient(editingInstallation.id || editingInstallation.airtableId, client.airtableId || client.id);

      // Reload linked clients
      await loadLinkedClients(editingInstallation);

      // Reset form and hide create client form
      setShowCreateClientForm(false);
      setNewClientData({
        nome: '',
        cognome: '',
        email: '',
        cellulare: '',
        indirizzo_impianto: '',
        citta_impianto: ''
      });
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  return (
    <div className="impianti-manager-container" style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <style>{`
        @media (max-width: 768px) {
          .impianti-manager-container {
            border-radius: 0 !important;
            margin: 0 -1.5rem !important;
            width: calc(100% + 3rem) !important;
            max-width: calc(100% + 3rem) !important;
          }
          .impianti-manager-container .header-section {
            padding: 1rem !important;
            border-radius: 0 !important;
          }
          .impianti-manager-container .header-title {
            font-size: 1.375rem !important;
          }
          .impianti-manager-container .header-subtitle {
            font-size: 0.875rem !important;
          }
          .impianti-manager-container .action-button {
            padding: 0.625rem 0.875rem !important;
            font-size: 0.9375rem !important;
          }
          .impianti-manager-container .search-input {
            padding: 0.75rem 0.875rem 0.75rem 2.5rem !important;
            font-size: 0.9375rem !important;
          }
          .impianti-manager-container .content-section {
            padding: 1rem !important;
          }
          .impianti-manager-container .form-container {
            padding: 1rem !important;
          }
          .impianti-manager-container .form-grid {
            grid-template-columns: 1fr !important;
          }
          .impianti-manager-container .cards-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .impianti-manager-container .impianto-card {
            width: 100% !important;
          }
          .impianti-manager-container .card-title {
            font-size: 1rem !important;
          }
          .impianti-manager-container .card-text {
            font-size: 0.875rem !important;
          }
          .impianti-manager-container .form-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          .impianti-manager-container .form-button {
            width: 100% !important;
            padding: 0.875rem 1rem !important;
            font-size: 1rem !important;
          }
          .impianti-manager-container .linked-section {
            padding: 0.75rem !important;
          }
          .impianti-manager-container .linked-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          .impianti-manager-container .linked-header .linked-button {
            width: 100% !important;
            text-align: center !important;
          }
          .impianti-manager-container .linked-item {
            padding: 0.75rem !important;
            flex-direction: column !important;
            align-items: stretch !important;
            min-height: auto !important;
            height: auto !important;
          }
          .impianti-manager-container .linked-item-content {
            margin-bottom: 0.75rem !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            width: 100% !important;
            display: block !important;
          }
          .impianti-manager-container .linked-item-title {
            font-size: 0.9375rem !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            line-height: 1.4 !important;
            margin-bottom: 0.375rem !important;
          }
          .impianti-manager-container .linked-item-text {
            font-size: 0.875rem !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            line-height: 1.5 !important;
            margin-bottom: 0.25rem !important;
          }
          .impianti-manager-container .linked-item button {
            width: 100% !important;
            font-size: 0.9375rem !important;
            padding: 0.75rem 1rem !important;
            margin-top: 0.25rem !important;
          }
          .impianti-manager-container .linked-search {
            font-size: 0.875rem !important;
            padding: 0.625rem !important;
          }
          .impianti-manager-container .create-form-grid {
            gap: 0.375rem !important;
          }
          .impianti-manager-container .create-form-input {
            padding: 0.5rem !important;
            font-size: 0.75rem !important;
          }
          .impianti-manager-container .create-client-button {
            flex-shrink: 0 !important;
            min-width: auto !important;
            width: auto !important;
          }
          .impianti-manager-container .client-search-wrapper {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          .impianti-manager-container .client-search-wrapper .create-client-button {
            width: 100% !important;
          }
        }
      `}</style>
      {/* Compact Header */}
      <div className="header-section" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '1.5rem',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <h2 className="header-title" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.25rem'
            }}>⚡ Gestione Impianti</h2>
            <p className="header-subtitle" style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
              {!searchQuery && !showAllInstallations && installations.length > 3
                ? `Ultimi 3 di ${installations.length} impianti`
                : `${installations.length} impianti`} • {online ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>

          <button
            type="button"
            className="action-button"
            onClick={(e) => {
              e.preventDefault();
              setShowAddForm(!showAddForm);
              setEditingInstallation(null);
              resetForm();
            }}
            style={{
              background: showAddForm ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = showAddForm ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = showAddForm ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)';
            }}
          >
            {showAddForm ? '✕ Chiudi' : '+ Nuovo'}
          </button>
        </div>

        {/* Search Bar in Header */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Cerca per nome, indirizzo..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#1f2937'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem'
          }}>🔍</span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1.25rem',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-section" style={{ padding: '1.5rem' }}>

        {/* Add/Edit Form - Compact */}
        {(showAddForm || editingInstallation) && (
          <form
            onSubmit={editingInstallation ? handleUpdateInstallation : handleAddInstallation}
            className="form-container"
            style={{
              backgroundColor: '#f9fafb',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              border: '2px solid #e5e7eb'
            }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {editingInstallation ? '✏️ Modifica Impianto' : '✨ Nuovo Impianto'}
            </h3>

            {/* Main Fields - Always Visible */}
            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.875rem'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  ⚡ Nome Impianto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    transition: 'border 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  🏠 Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  📦 N. Moduli Totali
                </label>
                <input
                  type="number"
                  value={formData.n_moduli_totali}
                  onChange={(e) => setFormData({ ...formData, n_moduli_totali: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  💰 Compenso (€)
                </label>
                <input
                  type="number"
                  value={formData.compenso}
                  onChange={(e) => setFormData({ ...formData, compenso: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Expand Button */}
            <div style={{ marginTop: '0.875rem', marginBottom: '0.875rem' }}>
              <button
                type="button"
                onClick={() => setShowAllFields(!showAllFields)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  background: showAllFields ? '#f3f4f6' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  color: '#374151',
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.background = showAllFields ? '#f3f4f6' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                }}
              >
                <span>{showAllFields ? '⬆️' : '⬇️'}</span>
                <span>{showAllFields ? 'Nascondi campi aggiuntivi' : 'Mostra altri campi'}</span>
              </button>
            </div>

            {/* Additional Fields - Conditionally Visible */}
            {showAllFields && (
              <div className="form-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.875rem',
                paddingTop: '0.5rem',
                borderTop: '2px dashed #e5e7eb'
              }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    📍 Coordinate
                  </label>
                  <input
                    type="text"
                    value={formData.coordinate}
                    onChange={(e) => setFormData({ ...formData, coordinate: e.target.value })}
                    placeholder="es. 45.4642, 9.1900"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    📊 Status Offerta
                  </label>
                  <select
                    value={formData.status_offerta}
                    onChange={(e) => setFormData({ ...formData, status_offerta: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="in preparazione">in preparazione</option>
                    <option value="da mandare">da mandare</option>
                    <option value="in attesa di risposta">in attesa di risposta</option>
                    <option value="mandata">mandata</option>
                    <option value="non si fa">non si fa</option>
                    <option value="da rivedere">da rivedere</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    🔨 Status Realizzazione
                  </label>
                  <select
                    value={formData.status_realizzazione}
                    onChange={(e) => setFormData({ ...formData, status_realizzazione: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="preventivo">preventivo</option>
                    <option value="da montare">da montare</option>
                    <option value="in corso">in corso</option>
                    <option value="montato">montato</option>
                    <option value="non si fa">non si fa</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    🎨 Simulazione/Render
                  </label>
                  <select
                    value={formData.simulazione_render}
                    onChange={(e) => setFormData({ ...formData, simulazione_render: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="Da fare">Da fare</option>
                    <option value="In costruzione">In costruzione</option>
                    <option value="Da revisionare">Da revisionare</option>
                    <option value="Fatto">Fatto</option>
                    <option value="Rimandato">Rimandato</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.impianto_completato}
                      onChange={(e) => setFormData({ ...formData, impianto_completato: e.target.checked })}
                      style={{
                        width: '1.125rem',
                        height: '1.125rem',
                        cursor: 'pointer'
                      }}
                    />
                    ✅ Impianto Completato
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    📝 Dettagli Moduli e Note
                  </label>
                  <textarea
                    value={formData.dettagli_moduli}
                    onChange={(e) => setFormData({ ...formData, dettagli_moduli: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            )}

            {/* Linked Clients Section - Only show when editing an installation */}
            {editingInstallation && online && (
              <div className="linked-section" style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem'
              }}>
                <div className="linked-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#1e40af',
                      margin: 0
                    }}>
                      🔗 Clienti Collegati
                    </h4>
                    {linkedClients.length > 0 && (
                      <span style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {linkedClients.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="linked-button"
                    onClick={toggleClientLinking}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {showClientLinking ? '✕ Chiudi' : '+ Collega Cliente'}
                  </button>
                </div>

                {/* Linked Clients List */}
                {loadingClients ? (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                    ⏳ Caricamento clienti...
                  </div>
                ) : linkedClients.length > 0 ? (
                  <>
                    {/* Search bar for linked clients */}
                    <input
                      type="text"
                      className="linked-search"
                      placeholder="🔍 Filtra clienti collegati..."
                      value={linkedClientsFilter}
                      onChange={(e) => setLinkedClientsFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #93c5fd',
                        fontSize: '0.75rem',
                        marginBottom: '0.5rem',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#93c5fd'}
                    />

                    {getFilteredLinkedClients().length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginBottom: showClientLinking ? '0.75rem' : 0
                      }}>
                        {getFilteredLinkedClients().map(client => (
                          <div
                            key={client.id || client.airtableId}
                            className="linked-item"
                            style={{
                              backgroundColor: 'white',
                              padding: '0.75rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #93c5fd',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div className="linked-item-content" style={{ flex: 1 }}>
                              <div className="linked-item-title" style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem' }}>
                                {client.nome || 'Cliente senza nome'}
                              </div>
                              <div className="linked-item-text" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {client.email || 'Email non specificata'}
                              </div>
                              {client.cellulare && (
                                <div className="linked-item-text" style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                  📱 {client.cellulare}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnlinkClient(client.id || client.airtableId)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Scollega
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>
                        {linkedClientsFilter ? '🔍 Nessun cliente corrisponde alla ricerca' : 'Nessun cliente collegato'}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>
                    Nessun cliente collegato
                  </div>
                )}

                {/* Client Search and Link Interface */}
                {showClientLinking && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1'
                  }}>
                    {!showCreateClientForm ? (
                      <>
                        <div className="client-search-wrapper" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <input
                            type="text"
                            className="linked-search"
                            placeholder="🔍 Cerca cliente per nome o email..."
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                          />
                          <button
                            type="button"
                            className="create-client-button"
                            onClick={() => setShowCreateClientForm(true)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            + Nuovo
                          </button>
                        </div>

                        <div style={{
                          maxHeight: '250px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {getFilteredClients().length > 0 ? (
                            getFilteredClients().map(client => (
                              <div
                                key={client.id || client.airtableId}
                                className="linked-item"
                                style={{
                                  padding: '0.625rem',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '0.375rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: '#f8fafc'
                                }}
                              >
                                <div className="linked-item-content" style={{ flex: 1 }}>
                                  <div className="linked-item-title" style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                                    {client.nome || 'Cliente senza nome'}
                                  </div>
                                  <div className="linked-item-text" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {client.email || 'Email non specificata'}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleLinkClient(client.id || client.airtableId)}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Collega
                                </button>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                              {clientSearchQuery ? 'Nessun cliente trovato' : 'Tutti i clienti sono già collegati'}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem'
                        }}>
                          <h5 style={{
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            ✨ Crea Nuovo Cliente
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowCreateClientForm(false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: '#6b7280'
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="create-form-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '0.5rem'
                        }}>
                          <input
                            type="text"
                            className="create-form-input"
                            placeholder="Nome / Ragione Sociale *"
                            required
                            value={newClientData.nome}
                            onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="text"
                            className="create-form-input"
                            placeholder="Cognome"
                            value={newClientData.cognome}
                            onChange={(e) => setNewClientData({ ...newClientData, cognome: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="email"
                            className="create-form-input"
                            placeholder="Email"
                            value={newClientData.email}
                            onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="tel"
                            className="create-form-input"
                            placeholder="Cellulare"
                            value={newClientData.cellulare}
                            onChange={(e) => setNewClientData({ ...newClientData, cellulare: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="text"
                            className="create-form-input"
                            placeholder="Indirizzo Impianto"
                            value={newClientData.indirizzo_impianto}
                            onChange={(e) => setNewClientData({ ...newClientData, indirizzo_impianto: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="text"
                            className="create-form-input"
                            placeholder="Città Impianto"
                            value={newClientData.citta_impianto}
                            onChange={(e) => setNewClientData({ ...newClientData, citta_impianto: e.target.value })}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          />

                          <button
                            type="button"
                            onClick={handleCreateAndLinkClient}
                            style={{
                              padding: '0.625rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.8125rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginTop: '0.25rem'
                            }}
                          >
                            ✓ Crea e Collega
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="form-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="form-button"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  color: 'white',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  flex: 1
                }}
              >
                {editingInstallation ? '✓ Aggiorna' : '+ Aggiungi'}
              </button>

              <button
                type="button"
                className="form-button"
                onClick={() => {
                  setEditingInstallation(null);
                  setShowAddForm(false);
                  resetForm();
                  resetClientLinkingState();
                }}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #d1d5db',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ✕ Annulla
              </button>
            </div>
          </form>
        )}

        {/* Installations List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>⏳</div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Caricamento impianti...</p>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        ) : getFilteredInstallations().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>
              {searchQuery ? 'Nessun risultato' : 'Nessun impianto'}
            </p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {searchQuery ? 'Prova con un\'altra ricerca' : 'Clicca "+ Nuovo" per aggiungere il primo impianto'}
            </p>
          </div>
        ) : (
          <>
            <div className="cards-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '1rem'
            }}>
              {getFilteredInstallations().map(installation => (
                <div
                  key={installation.id}
                  className="impianto-card"
                  style={{
                    backgroundColor: selectedInstallation?.id === installation.id ? '#f0fdf4' : 'white',
                    border: selectedInstallation?.id === installation.id ? '3px solid #10b981' : '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleSelectInstallation(installation)}
                  onMouseEnter={(e) => {
                    if (selectedInstallation?.id !== installation.id) {
                      e.currentTarget.style.borderColor = '#bbf7d0';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedInstallation?.id !== installation.id) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Selected indicator */}
                  {selectedInstallation?.id === installation.id && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                    }} />
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 className="card-title" style={{
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: 0,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 'calc(100% - 70px)'
                    }}>
                      {installation.nome || 'Impianto senza nome'}
                    </h4>

                    <div style={{ display: 'flex', gap: '0.125rem', marginLeft: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(installation);
                        }}
                        style={{
                          background: '#f3f4f6',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.375rem',
                          fontSize: '0.875rem',
                          borderRadius: '0.375rem',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Modifica"
                        onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInstallation(installation.id);
                        }}
                        style={{
                          background: '#fee2e2',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.375rem',
                          fontSize: '0.875rem',
                          borderRadius: '0.375rem',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Elimina"
                        onMouseEnter={(e) => e.target.style.background = '#fecaca'}
                        onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="card-text" style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: '1.6' }}>
                    {installation.indirizzo && (
                      <div style={{
                        marginBottom: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <span style={{ fontSize: '0.875rem' }}>🏠</span>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{installation.indirizzo}</span>
                      </div>
                    )}
                    {installation.n_moduli_totali > 0 && (
                      <div style={{
                        marginBottom: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <span style={{ fontSize: '0.875rem' }}>📦</span>
                        <span>{installation.n_moduli_totali} moduli</span>
                      </div>
                    )}
                    {installation.status_offerta && (
                      <div style={{
                        marginTop: '0.625rem',
                        padding: '0.375rem 0.625rem',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#1e40af',
                        display: 'inline-block'
                      }}>
                        📊 {installation.status_offerta}
                      </div>
                    )}
                    {installation.dati_cliente && installation.dati_cliente.length > 0 && (
                      <div style={{
                        marginTop: '0.625rem',
                        padding: '0.375rem 0.625rem',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#166534',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginLeft: '0.5rem'
                      }}>
                        <span>👥</span>
                        <span>{installation.dati_cliente.length} cliente{installation.dati_cliente.length > 1 ? 'i' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Show All / Show Less Button */}
            {!searchQuery && installations.length > 3 && (
              <div style={{
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowAllInstallations(!showAllInstallations)}
                  style={{
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    color: '#374151',
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #d1d5db',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {showAllInstallations ? (
                    <>
                      <span>⬆️</span>
                      <span>Mostra solo ultimi 3</span>
                    </>
                  ) : (
                    <>
                      <span>⬇️</span>
                      <span>Mostra tutti ({installations.length} impianti)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImpiantiManager;
