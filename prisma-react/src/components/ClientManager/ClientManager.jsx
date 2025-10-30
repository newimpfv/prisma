import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient, searchClients, findExistingClient } from '../../services/clients';
import { saveQuoteToAirtable } from '../../services/installations';
import { useForm } from '../../context/FormContext';
import { isOnline } from '../../services/airtable';

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [online, setOnline] = useState(isOnline());
  const [saving, setSaving] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const formContext = useForm();

  // Form state for adding/editing clients
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    cellulare: '',
    email: '',
    indirizzo_residenza: '',
    citta_residenza: '',
    indirizzo_impianto: '',
    citta_impianto: '',
    cap_impianto: '',
    iban: '',
    note: ''
  });

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await getClients();
      setClients(result.clients);
    } catch (error) {
      alert(`Errore caricamento clienti: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      loadClients();
    } else {
      try {
        const results = await searchClients(query);
        setClients(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  // Check for duplicate clients when nome, cognome, or email changes
  const checkForDuplicates = async () => {
    if (!online || editingClient) return; // Don't check when editing

    const nomeCompleto = formData.cognome
      ? `${formData.nome} ${formData.cognome}`.trim()
      : formData.nome;

    if (!nomeCompleto && !formData.email) {
      setDuplicateMatches([]);
      setShowDuplicateWarning(false);
      return;
    }

    try {
      // Search for potential duplicates
      const matches = [];

      // Check by name
      if (nomeCompleto) {
        const nameMatches = clients.filter(client =>
          client.nome.toLowerCase().includes(nomeCompleto.toLowerCase()) ||
          nomeCompleto.toLowerCase().includes(client.nome.toLowerCase())
        );
        matches.push(...nameMatches);
      }

      // Check by email
      if (formData.email) {
        const emailMatches = clients.filter(client =>
          client.email && client.email.toLowerCase() === formData.email.toLowerCase()
        );
        matches.push(...emailMatches);
      }

      // Remove duplicates from matches array
      const uniqueMatches = Array.from(new Set(matches.map(m => m.id)))
        .map(id => matches.find(m => m.id === id));

      if (uniqueMatches.length > 0) {
        setDuplicateMatches(uniqueMatches);
        setShowDuplicateWarning(true);
      } else {
        setDuplicateMatches([]);
        setShowDuplicateWarning(false);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  // Use effect to check for duplicates when form data changes
  useEffect(() => {
    if (showAddForm && !editingClient) {
      const timeoutId = setTimeout(() => {
        checkForDuplicates();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [formData.nome, formData.cognome, formData.email, showAddForm, editingClient]);

  const handleUseExistingClient = (client) => {
    // Load the existing client data
    handleSelectClient(client);
    // Close the add form
    setShowAddForm(false);
    setDuplicateMatches([]);
    setShowDuplicateWarning(false);
    alert(`✅ Cliente "${client.nome}" selezionato!\n\nI suoi dati sono stati caricati. Puoi creare un nuovo preventivo per questo cliente.`);
  };

  const handleUpdateExistingClient = async (client) => {
    // Switch to edit mode with the existing client
    setEditingClient(client);
    setFormData({
      nome: client.nome || '',
      cognome: client.cognome || '',
      telefono: client.telefono || '',
      cellulare: client.cellulare || '',
      email: client.email || '',
      indirizzo_residenza: client.indirizzo_residenza || '',
      citta_residenza: client.citta_residenza || '',
      indirizzo_impianto: client.indirizzo_impianto || '',
      citta_impianto: client.citta_impianto || '',
      cap_impianto: client.cap_impianto || '',
      iban: client.iban || '',
      note: client.note || ''
    });
    setShowAddForm(false);
    setDuplicateMatches([]);
    setShowDuplicateWarning(false);
  };

  const handleContinueWithNew = () => {
    // User confirmed they want to create a new client despite duplicates
    setShowDuplicateWarning(false);
    setDuplicateMatches([]);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!online) {
      alert('Impossibile aggiungere un cliente mentre sei offline');
      return;
    }

    // Check if there are duplicates and warn user
    if (duplicateMatches.length > 0 && showDuplicateWarning) {
      alert('⚠️ Sono stati trovati clienti simili. Seleziona un cliente esistente o clicca su "Continua con nuovo cliente" per procedere.');
      return;
    }

    try {
      await createClient(formData);
      alert('✅ Cliente aggiunto con successo!');
      setShowAddForm(false);
      setFormData({
        nome: '',
        cognome: '',
        telefono: '',
        cellulare: '',
        email: '',
        indirizzo_residenza: '',
        citta_residenza: '',
        indirizzo_impianto: '',
        citta_impianto: '',
        cap_impianto: '',
        iban: '',
        note: ''
      });
      setDuplicateMatches([]);
      setShowDuplicateWarning(false);
      loadClients();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!online) {
      alert('Impossibile modificare un cliente mentre sei offline');
      return;
    }

    try {
      await updateClient(editingClient.id, formData);
      alert('✅ Cliente aggiornato con successo!');
      setEditingClient(null);
      setFormData({
        nome: '',
        cognome: '',
        telefono: '',
        cellulare: '',
        email: '',
        indirizzo_residenza: '',
        citta_residenza: '',
        indirizzo_impianto: '',
        citta_impianto: '',
        cap_impianto: '',
        iban: '',
        note: ''
      });
      loadClients();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!online) {
      alert('Impossibile eliminare un cliente mentre sei offline');
      return;
    }

    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) {
      return;
    }

    try {
      await deleteClient(clientId);
      alert('✅ Cliente eliminato con successo!');
      loadClients();
    } catch (error) {
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setFormData({
      nome: client.nome || '',
      cognome: client.cognome || '',
      telefono: client.telefono || '',
      cellulare: client.cellulare || '',
      email: client.email || '',
      indirizzo_residenza: client.indirizzo_residenza || '',
      citta_residenza: client.citta_residenza || '',
      indirizzo_impianto: client.indirizzo_impianto || '',
      citta_impianto: client.citta_impianto || '',
      cap_impianto: client.cap_impianto || '',
      iban: client.iban || '',
      note: client.note || ''
    });
    setShowAddForm(false);
  };

  const handleSaveCurrentQuote = async () => {
    if (!online) {
      alert('Impossibile salvare mentre sei offline');
      return;
    }

    // Check if client data is filled
    const hasClientData = formContext.clientData?.nome || formContext.clientData?.nomeCognome;
    if (!hasClientData) {
      alert('⚠️ Inserisci i dati del cliente nella sezione "Cliente e Struttura" prima di salvare il preventivo.');
      return;
    }

    const confirmMessage = formContext.clientData?.airtableClientId
      ? 'Salvare il preventivo per il cliente selezionato?'
      : 'Salvare il preventivo corrente su Airtable? Verrà verificato se il cliente esiste già.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    try {
      const quoteData = {
        clientData: formContext.clientData,
        structureData: formContext.structureData,
        falde: formContext.falde,
        inverters: formContext.inverters,
        batteries: formContext.batteries,
        components: formContext.components,
        quoteData: formContext.quoteData,
        energyData: formContext.energyData
      };

      const result = await saveQuoteToAirtable(quoteData);

      const statusMessage = result.wasExisting
        ? '(Cliente esistente)'
        : '(Nuovo cliente creato)';

      alert(`✅ Preventivo salvato su Airtable!\n\nCliente: ${result.client.nome} ${statusMessage}\nImpianto: ${result.installation.nome}`);

      loadClients();
    } catch (error) {
      alert(`❌ Errore salvataggio: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);

    // Auto-fill client data in the form
    const nomeCompleto = client.cognome
      ? `${client.nome} ${client.cognome}`.trim()
      : client.nome;

    // Combine indirizzo_impianto and citta_impianto for complete address
    const indirizzoCompleto = client.citta_impianto
      ? `${client.indirizzo_impianto || ''}, ${client.citta_impianto}`.trim()
      : client.indirizzo_impianto || '';

    // Extract nome from client - handle 'nome / ragione sociale' field
    // If client has nome_first, use that, otherwise parse from nome field
    const nome = client.nome_first || client.nome || '';
    const cognome = client.cognome || '';

    formContext.setClientData({
      nome: nome,
      cognome: cognome,
      indirizzo: indirizzoCompleto,
      email: client.email || '',
      telefono: client.cellulare || client.telefono || '',
      comune: client.citta_impianto || '',
      airtableClientId: client.airtableId || client.id || ''
    });

    alert(`✅ Cliente selezionato: ${nomeCompleto}\n\nI dati del cliente sono stati caricati nel modulo "Cliente e Struttura".`);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Compact Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.25rem'
            }}>👥 Gestione Clienti</h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
              {!searchQuery && !showAllClients && clients.length > 3
                ? `Ultimi 3 di ${clients.length} clienti`
                : `${clients.length} clienti`} • {online ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Nuovo button clicked, showAddForm:', showAddForm);
              setShowAddForm(!showAddForm);
              setEditingClient(null);
              setDuplicateMatches([]);
              setShowDuplicateWarning(false);
              setFormData({
                nome: '',
                cognome: '',
                telefono: '',
                cellulare: '',
                email: '',
                indirizzo_residenza: '',
                citta_residenza: '',
                indirizzo_impianto: '',
                citta_impianto: '',
                cap_impianto: '',
                iban: '',
                note: ''
              });
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
            placeholder="Cerca per nome, email, telefono..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
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
                loadClients();
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
      <div style={{ padding: '1.5rem' }}>

        {/* Quick Action: Save Current Quote */}
        {!showAddForm && !editingClient && (
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '2px solid #86efac',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', margin: 0, marginBottom: '0.25rem' }}>
                💾 Salva Preventivo Corrente
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#15803d', margin: 0 }}>
                Crea cliente e impianto da questo preventivo
              </p>
            </div>
            <button
              onClick={handleSaveCurrentQuote}
              disabled={saving || !online}
              style={{
                background: saving ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: saving || !online ? 'not-allowed' : 'pointer',
                opacity: saving || !online ? 0.6 : 1,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        )}

        {/* Add/Edit Form - Compact */}
        {(showAddForm || editingClient) && (
          <form
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
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
              {editingClient ? '✏️ Modifica Cliente' : '✨ Nuovo Cliente'}
            </h3>

            {/* Main Fields - Always Visible */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.875rem'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  👤 Nome / Ragione Sociale *
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
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  👤 Cognome
                </label>
                <input
                  type="text"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  📱 Cellulare
                </label>
                <input
                  type="tel"
                  value={formData.cellulare}
                  onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  📧 Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  🏠 Indirizzo Impianto
                </label>
                <input
                  type="text"
                  value={formData.indirizzo_impianto}
                  onChange={(e) => setFormData({ ...formData, indirizzo_impianto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                  📍 Città Impianto
                </label>
                <input
                  type="text"
                  value={formData.citta_impianto}
                  onChange={(e) => setFormData({ ...formData, citta_impianto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.875rem',
                paddingTop: '0.5rem',
                borderTop: '2px dashed #e5e7eb'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    ☎️ Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    📮 CAP Impianto
                  </label>
                  <input
                    type="text"
                    value={formData.cap_impianto}
                    onChange={(e) => setFormData({ ...formData, cap_impianto: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    🏘️ Indirizzo di Residenza
                  </label>
                  <input
                    type="text"
                    value={formData.indirizzo_residenza}
                    onChange={(e) => setFormData({ ...formData, indirizzo_residenza: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    🏙️ Città di Residenza
                  </label>
                  <input
                    type="text"
                    value={formData.citta_residenza}
                    onChange={(e) => setFormData({ ...formData, citta_residenza: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    💳 IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                    📝 Ulteriori Informazioni
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicateMatches.length > 0 && !editingClient && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#92400e',
                    margin: 0
                  }}>
                    Possibili duplicati trovati ({duplicateMatches.length})
                  </h4>
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#78350f',
                  marginBottom: '0.75rem'
                }}>
                  Clienti simili già presenti nel database:
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  {duplicateMatches.slice(0, 3).map(match => (
                    <div
                      key={match.id}
                      style={{
                        backgroundColor: 'white',
                        padding: '0.625rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #fbbf24',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {match.nome}
                      </div>
                      <div style={{ color: '#6b7280' }}>
                        {match.email && <span>📧 {match.email}</span>}
                        {match.cellulare && <span style={{ marginLeft: '0.5rem' }}>📱 {match.cellulare}</span>}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleUseExistingClient(match)}
                          style={{
                            flex: 1,
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          📝 Usa questo (nuovo preventivo)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateExistingClient(match)}
                          style={{
                            flex: 1,
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Modifica dati
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleContinueWithNew}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: 'white',
                    color: '#92400e',
                    border: '2px solid #f59e0b',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Continua con nuovo cliente
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="submit"
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
                {editingClient ? '✓ Aggiorna' : '+ Aggiungi'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingClient(null);
                  setShowAddForm(false);
                  setDuplicateMatches([]);
                  setShowDuplicateWarning(false);
                  setFormData({
                    nome: '',
                    cognome: '',
                    telefono: '',
                    cellulare: '',
                    email: '',
                    indirizzo_residenza: '',
                    citta_residenza: '',
                    indirizzo_impianto: '',
                    citta_impianto: '',
                    cap_impianto: '',
                    iban: '',
                    note: ''
                  });
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

        {/* Clients List */}
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
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Caricamento clienti...</p>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        ) : clients.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>
              {searchQuery ? 'Nessun risultato' : 'Nessun cliente'}
            </p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {searchQuery ? 'Prova con un\'altra ricerca' : 'Clicca "+ Nuovo" per aggiungere il primo cliente'}
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {(() => {
                // Sort clients by creation date (most recent first)
                const sortedClients = [...clients].sort((a, b) =>
                  new Date(b.createdTime) - new Date(a.createdTime)
                );

                // Show only last 3 if not searching and not showing all
                const displayClients = searchQuery || showAllClients
                  ? sortedClients
                  : sortedClients.slice(0, 3);

                return displayClients.map(client => (
              <div
                key={client.id}
                style={{
                  backgroundColor: selectedClient?.id === client.id ? '#eff6ff' : 'white',
                  border: selectedClient?.id === client.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleSelectClient(client)}
                onMouseEnter={(e) => {
                  if (selectedClient?.id !== client.id) {
                    e.currentTarget.style.borderColor = '#bfdbfe';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedClient?.id !== client.id) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Selected indicator */}
                {selectedClient?.id === client.id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)'
                  }} />
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <h4 style={{
                    fontSize: '0.9375rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {client.nome}
                  </h4>

                  <div style={{ display: 'flex', gap: '0.125rem', marginLeft: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(client);
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
                        handleDeleteClient(client.id);
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

                <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: '1.6' }}>
                  {client.email && (
                    <div style={{
                      marginBottom: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>📧</span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{client.email}</span>
                    </div>
                  )}
                  {client.cellulare && (
                    <div style={{
                      marginBottom: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>📱</span>
                      <span>{client.cellulare}</span>
                    </div>
                  )}
                  {client.citta_impianto && (
                    <div style={{
                      marginBottom: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>📍</span>
                      <span>{client.citta_impianto}</span>
                    </div>
                  )}
                  {client.impianto && client.impianto.length > 0 && (
                    <div style={{
                      marginTop: '0.625rem',
                      padding: '0.375rem 0.625rem',
                      background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#166534',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>⚡</span>
                      <span>{client.impianto.length} impianto{client.impianto.length > 1 ? 'i' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
                ));
              })()}
            </div>

            {/* Show All / Show Less Button */}
            {!searchQuery && clients.length > 3 && (
              <div style={{
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowAllClients(!showAllClients)}
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
                  {showAllClients ? (
                    <>
                      <span>⬆️</span>
                      <span>Mostra solo ultimi 3</span>
                    </>
                  ) : (
                    <>
                      <span>⬇️</span>
                      <span>Mostra tutti ({clients.length} clienti)</span>
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

export default ClientManager;
