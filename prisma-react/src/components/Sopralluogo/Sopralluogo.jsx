import { useState, useEffect, useRef } from 'react';
import { getOfflineManager } from '../../services/offlineManager';
import airtableService from '../../services/airtableService';
import { createClient, updateClient } from '../../services/clients';
import { useForm } from '../../context/FormContext';

function Sopralluogo() {
  // Get selected client from context
  const { selectedClientRecord, setSelectedClientRecord } = useForm();

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [pCloudLink, setPCloudLink] = useState('');
  const [notes, setNotes] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
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

  // Schedule site visit state
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Pre-populate client from context if available
  useEffect(() => {
    if (selectedClientRecord && !clientSearch) {
      const clientName = selectedClientRecord.nome || 'Cliente';
      setClientSearch(clientName);
      showMessage('info', `📋 Cliente selezionato: ${clientName}`);
    }
  }, [selectedClientRecord]);

  // Get GPS coordinates on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
          setCoordinates(coords);
          setLoading(false);
          showMessage('success', '📍 Posizione rilevata!');
        },
        (error) => {
          console.error('GPS error:', error);
          setLoading(false);
          showMessage('warning', '⚠️ GPS non disponibile - puoi inserire le coordinate manualmente');
        },
        {
          enableHighAccuracy: false, // False is faster
          timeout: 30000, // 30 seconds
          maximumAge: 300000 // Accept cached position up to 5 minutes old
        }
      );
    }

    // Listen to online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const allClients = await airtableService.clients.getAll({
        maxRecords: 100
      });
      setClients(allClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      showMessage('warning', '⚠️ Impossibile caricare i clienti');
    } finally {
      setLoadingClients(false);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    if (!clientSearch.trim()) return false;
    const searchLower = clientSearch.toLowerCase();
    const name = client.fields['nome / ragione sociale'] || '';
    const email = client.fields.email || '';
    const phone = client.fields.telefono || '';
    const mobile = client.fields.cellulare || '';

    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.includes(searchLower) ||
      mobile.includes(searchLower)
    );
  });

  // Handle client selection from search results
  const handleSelectClient = (client) => {
    setSelectedClientRecord(client); // Save to context
    setClientSearch(client.fields['nome / ragione sociale'] || '');
    showMessage('success', `✅ Cliente "${client.fields['nome / ragione sociale']}" selezionato`);
  };

  // Handle creating a new client
  const handleCreateNewClient = async (e) => {
    e.preventDefault();

    if (!newClientData.nome && !newClientData.cognome) {
      showMessage('warning', '⚠️ Inserisci almeno il nome o cognome');
      return;
    }

    if (!newClientData.telefono && !newClientData.cellulare && !newClientData.email) {
      showMessage('warning', '⚠️ Inserisci almeno un contatto (telefono, cellulare o email)');
      return;
    }

    setCreatingClient(true);
    try {
      const clientData = {
        ...newClientData,
        nome: newClientData.cognome
          ? `${newClientData.nome} ${newClientData.cognome}`.trim()
          : newClientData.nome,
        nome_first: newClientData.nome
      };

      const result = await createClient(clientData);

      // Reload clients list
      await loadClients();

      // Find and select the newly created client
      const newClient = await airtableService.clients.getById(result.id);
      setSelectedClientRecord(newClient); // Save to context
      setClientSearch(newClient.fields['nome / ragione sociale'] || '');

      // Reset form
      setNewClientData({
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
      setShowNewClientForm(false);

      showMessage('success', '✅ Cliente creato e selezionato!');
    } catch (error) {
      console.error('Error creating client:', error);
      showMessage('error', '❌ Errore durante la creazione del cliente: ' + error.message);
    } finally {
      setCreatingClient(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle scheduling site visit
  const handleScheduleVisit = async () => {
    if (!selectedClientRecord) {
      showMessage('error', '❌ Seleziona un cliente prima di programmare il sopralluogo');
      return;
    }

    if (!scheduledDate) {
      showMessage('error', '❌ Inserisci una data per il sopralluogo');
      return;
    }

    if (!isOnline) {
      showMessage('error', '❌ Devi essere online per programmare un sopralluogo');
      return;
    }

    setScheduling(true);
    try {
      // Combine date and time
      const fullDateTime = scheduledTime
        ? `${scheduledDate} ${scheduledTime}`
        : scheduledDate;

      // Update client with scheduled date
      await updateClient(selectedClientRecord.id || selectedClientRecord.airtableId, {
        ...selectedClientRecord,
        data_sopralluogo: fullDateTime,
        note: scheduleNotes ? `${selectedClientRecord.note || ''}\n\nSopralluogo programmato: ${fullDateTime}\n${scheduleNotes}`.trim() : selectedClientRecord.note
      });

      showMessage('success', `✅ Sopralluogo programmato per ${fullDateTime}`);

      // Clear scheduling form
      setScheduledDate('');
      setScheduledTime('');
      setScheduleNotes('');
    } catch (error) {
      console.error('Error scheduling visit:', error);
      showMessage('error', `❌ Errore: ${error.message}`);
    } finally {
      setScheduling(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotos((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              file,
              url: event.target.result,
              name: file.name,
              size: file.size,
              uploaded: false
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    showMessage('success', `✅ ${files.length} foto aggiunte`);
    e.target.value = ''; // Reset input
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setVideos((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              file,
              url: event.target.result,
              name: file.name,
              size: file.size,
              duration: 0
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    showMessage('success', `✅ ${files.length} video aggiunti`);
    e.target.value = ''; // Reset input
  };

  // Remove photo
  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showMessage('info', 'Foto rimossa');
  };

  // Remove video
  const removeVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    showMessage('info', 'Video rimosso');
  };

  // Upload to Airtable
  const uploadToAirtable = async () => {
    if (!selectedClientRecord) {
      showMessage('warning', '⚠️ Seleziona un cliente');
      return;
    }

    if (photos.length === 0 && !pCloudLink) {
      showMessage('warning', '⚠️ Aggiungi almeno una foto o un link video');
      return;
    }

    setUploading(true);

    try {
      // Save photos to IndexedDB first
      const offlineManager = await getOfflineManager();
      const photoIds = [];

      for (const photo of photos) {
        const photoId = await offlineManager.savePhoto(
          'temp-project-' + Date.now(),
          photo.file,
          {
            tipo: 'sopralluogo',
            descrizione: photo.name,
            gps: coordinates
          }
        );
        photoIds.push(photoId);
      }

      // Prepare fields for Airtable
      const fields = {};

      // Required: Link to client (Airtable linked record field expects array of IDs)
      fields.cliente = [selectedClientRecord.id];

      // Add fields only if they have values
      if (coordinates) {
        fields.coordinate = coordinates;
      }

      if (pCloudLink) {
        fields.linkPCloud = pCloudLink;
      }

      if (notes) {
        fields['dettagli moduli e note'] = notes;
      }

      // Always add date
      fields.sopralluogoData = airtableService.formatDate(new Date());

      if (isOnline) {
        // Upload to Airtable using service
        const data = await airtableService.installations.create(fields);
        console.log('Uploaded to Airtable:', data);

        showMessage(
          'success',
          `✅ Sopralluogo salvato! ${photos.length} foto in IndexedDB (caricare manualmente)`
        );
      } else {
        // Save offline
        await offlineManager.saveProject({
          type: 'sopralluogo',
          sopralluogoData: fields.sopralluogoData,
          coordinate: fields.coordinate,
          linkPCloud: fields.linkPCloud,
          photoIds,
          photoCount: photos.length,
          videoCount: videos.length
        });

        showMessage(
          'warning',
          '📴 Salvato offline - Verrà sincronizzato quando tornerà la connessione'
        );
      }

      // Clear form
      setTimeout(() => {
        setPhotos([]);
        setVideos([]);
        setPCloudLink('');
        setNotes('');
        // Note: Don't clear selectedClientRecord - it persists across pages
        setClientSearch('');
        // Don't clear coordinates - keep for next sopralluogo
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', '❌ Errore durante il salvataggio: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Recalculate GPS position manually
  const handleRecalculatePosition = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      showMessage('info', '📍 Rilevamento posizione in corso...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
          setCoordinates(coords);
          setLoading(false);
          showMessage('success', '📍 Posizione aggiornata!');
        },
        (error) => {
          console.error('GPS error:', error);
          setLoading(false);
          showMessage('error', '❌ Impossibile rilevare la posizione GPS');
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0 // Don't use cached position for manual refresh
        }
      );
    } else {
      showMessage('error', '❌ GPS non disponibile su questo dispositivo');
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#1f2937'
        }}
      >
        📸 Sopralluogo Impianto
      </h2>

      {/* Client Search and Selection */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          👤 Cerca Cliente *
        </label>

        {/* Search Input */}
        <input
          type="text"
          value={clientSearch}
          onChange={(e) => {
            setClientSearch(e.target.value);
            // Clear selected client when user starts typing a different name
            if (selectedClientRecord) {
              const currentClientName = selectedClientRecord.nome || '';
              if (e.target.value !== currentClientName) {
                setSelectedClientRecord(null);
              }
            }
          }}
          placeholder="Cerca per nome, email o telefono..."
          disabled={loadingClients}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: `2px solid ${selectedClientRecord ? '#10b981' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            outline: 'none',
            backgroundColor: loadingClients ? '#f3f4f6' : 'white'
          }}
          onFocus={(e) => {
            if (!selectedClientRecord) e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            if (!selectedClientRecord) e.target.style.borderColor = '#e5e7eb';
          }}
        />

        {/* Selected Client Display */}
        {selectedClientRecord && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: '600', color: '#065f46' }}>
                ✅ {selectedClientRecord.nome || 'Cliente'}
              </div>
              {selectedClientRecord.email && (
                <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                  {selectedClientRecord.email}
                </div>
              )}
              {(selectedClientRecord.telefono || selectedClientRecord.cellulare) && (
                <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                  {selectedClientRecord.cellulare || selectedClientRecord.telefono}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedClientRecord(null);
                setClientSearch('');
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Cambia
            </button>
          </div>
        )}

        {/* Search Results */}
        {!selectedClientRecord && clientSearch.trim() && filteredClients.length > 0 && (
          <div
            style={{
              marginTop: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          >
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client)}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {client.fields['nome / ragione sociale'] || 'Cliente senza nome'}
                </div>
                {client.fields.email && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {client.fields.email}
                  </div>
                )}
                {client.fields.telefono && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    📞 {client.fields.telefono}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results + Create Button */}
        {!selectedClientRecord && clientSearch.trim() && filteredClients.length === 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
              Nessun cliente trovato con "{clientSearch}"
            </p>
            <button
              onClick={() => setShowNewClientForm(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              ➕ Crea Nuovo Cliente
            </button>
          </div>
        )}

        {/* Create Button when no search */}
        {!selectedClientRecord && !clientSearch.trim() && !showNewClientForm && (
          <button
            onClick={() => setShowNewClientForm(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#10b981',
              backgroundColor: 'white',
              border: '2px solid #10b981',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginTop: '0.75rem'
            }}
          >
            ➕ Crea Nuovo Cliente
          </button>
        )}
      </div>

      {/* New Client Form */}
      {showNewClientForm && !selectedClientRecord && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '2px solid #10b981'
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#065f46'
            }}
          >
            ➕ Crea Nuovo Cliente
          </h3>

          <form onSubmit={handleCreateNewClient}>
            {/* Nome e Cognome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={newClientData.nome}
                  onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Cognome
                </label>
                <input
                  type="text"
                  value={newClientData.cognome}
                  onChange={(e) => setNewClientData({ ...newClientData, cognome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Telefono e Cellulare */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Telefono
                </label>
                <input
                  type="tel"
                  value={newClientData.telefono}
                  onChange={(e) => setNewClientData({ ...newClientData, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Cellulare *
                </label>
                <input
                  type="tel"
                  value={newClientData.cellulare}
                  onChange={(e) => setNewClientData({ ...newClientData, cellulare: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Indirizzo Impianto */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Indirizzo Impianto
              </label>
              <input
                type="text"
                value={newClientData.indirizzo_impianto}
                onChange={(e) => setNewClientData({ ...newClientData, indirizzo_impianto: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Città e CAP Impianto */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Città Impianto
                </label>
                <input
                  type="text"
                  value={newClientData.citta_impianto}
                  onChange={(e) => setNewClientData({ ...newClientData, citta_impianto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  CAP
                </label>
                <input
                  type="text"
                  value={newClientData.cap_impianto}
                  onChange={(e) => setNewClientData({ ...newClientData, cap_impianto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowNewClientForm(false);
                  setNewClientData({
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
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={creatingClient}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: creatingClient ? '#9ca3af' : '#10b981',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: creatingClient ? 'not-allowed' : 'pointer'
                }}
              >
                {creatingClient ? '⏳ Creazione...' : '✅ Crea e Seleziona'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Message notification */}
      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            backgroundColor:
              message.type === 'success'
                ? '#10b981'
                : message.type === 'warning'
                ? '#fbbf24'
                : message.type === 'error'
                ? '#ef4444'
                : '#3b82f6',
            color: 'white',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}
        >
          {message.text}
        </div>
      )}

      {/* GPS Coordinates */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          📍 Coordinate GPS
        </label>
        <input
          type="text"
          value={coordinates || ''}
          onChange={(e) => setCoordinates(e.target.value)}
          placeholder="45.0703,7.6869"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            outline: 'none',
            marginBottom: '0.75rem'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
        <button
          onClick={handleRecalculatePosition}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📍</span>
          <span>{loading ? 'Rilevamento in corso...' : 'Ricalcola Posizione GPS'}</span>
        </button>
        {loading && (
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Rilevamento posizione in corso...
          </p>
        )}
      </div>

      {/* Schedule Site Visit */}
      {selectedClientRecord && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid #f59e0b'
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📅 Programma Sopralluogo
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}
              >
                📆 Data Sopralluogo *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}
              >
                ⏰ Ora
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              📝 Note Aggiuntive
            </label>
            <textarea
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Es: Portare scala, verificare accesso tetto, ecc..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                resize: 'vertical'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          <button
            onClick={handleScheduleVisit}
            disabled={scheduling || !scheduledDate || !isOnline}
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: scheduling || !scheduledDate || !isOnline ? '#9ca3af' : '#f59e0b',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: scheduling || !scheduledDate || !isOnline ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!scheduling && scheduledDate && isOnline) {
                e.target.style.backgroundColor = '#d97706';
              }
            }}
            onMouseLeave={(e) => {
              if (!scheduling && scheduledDate && isOnline) {
                e.target.style.backgroundColor = '#f59e0b';
              }
            }}
          >
            {scheduling ? '⏳ Programmazione...' : '📅 Programma Sopralluogo'}
          </button>

          {!isOnline && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#92400e' }}>
              ⚠️ Devi essere online per programmare un sopralluogo
            </div>
          )}
        </div>
      )}

      {/* Photo Upload */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1f2937'
          }}
        >
          📷 Foto Impianto
        </h3>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => photoInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📸</span>
          <span>Aggiungi Foto (Camera/Galleria)</span>
        </button>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem'
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: 'relative',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                >
                  <div>{photo.name}</div>
                  <div>{formatSize(photo.size)}</div>
                  {photo.uploaded && <div style={{ color: '#10b981' }}>✅ Caricata</div>}
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1f2937'
          }}
        >
          🎥 Video Impianto
        </h3>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => videoInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#8b5cf6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎥</span>
          <span>Aggiungi Video (Camera/Galleria)</span>
        </button>

        {/* Video List */}
        {videos.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {videos.map((video) => (
              <div
                key={video.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{video.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatSize(video.size)}
                  </div>
                </div>
                <button
                  onClick={() => removeVideo(video.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}

        {/* pCloud Link Input */}
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            ☁️ Link pCloud (dopo upload manuale)
          </label>
          <input
            type="url"
            value={pCloudLink}
            onChange={(e) => setPCloudLink(e.target.value)}
            placeholder="https://pcloud.com/..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b5cf6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Carica prima i video su pCloud, poi incolla qui il link condiviso
          </p>
        </div>

        {/* Notes Input */}
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            📝 Note (dettagli moduli e note)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inserisci note sul sopralluogo, dettagli moduli, osservazioni..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b5cf6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Aggiungi eventuali note, dettagli sui moduli o osservazioni dal sopralluogo
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div
        style={{
          backgroundColor: isOnline ? '#ecfdf5' : '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: `2px solid ${isOnline ? '#10b981' : '#fbbf24'}`
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {isOnline ? '🌐 Online' : '📴 Offline'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          📸 {photos.length} foto • 🎥 {videos.length} video
          {coordinates && ' • 📍 GPS rilevato'}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={uploadToAirtable}
        disabled={uploading || !selectedClientRecord || (photos.length === 0 && !pCloudLink)}
        style={{
          width: '100%',
          padding: '1.25rem',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: 'white',
          backgroundColor:
            uploading || !selectedClientRecord || (photos.length === 0 && !pCloudLink) ? '#9ca3af' : '#10b981',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: uploading || !selectedClientRecord || (photos.length === 0 && !pCloudLink) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {uploading ? '⏳ Salvataggio...' : '💾 Salva Sopralluogo'}
      </button>
    </div>
  );
}

export default Sopralluogo;
