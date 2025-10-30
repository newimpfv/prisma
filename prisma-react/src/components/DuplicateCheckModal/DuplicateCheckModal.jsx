import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { findExistingClient } from '../../services/clients';
import { isOnline } from '../../services/airtable';

const DuplicateCheckModal = () => {
  const {
    clientData,
    setClientData,
    hasCheckedDuplicates,
    setHasCheckedDuplicates,
    duplicateCheckDecision,
    setDuplicateCheckDecision
  } = useForm();

  const [showModal, setShowModal] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [checking, setChecking] = useState(false);

  // Check for duplicates when nome/cognome is entered (first time only)
  useEffect(() => {
    const checkForDuplicates = async () => {
      // Only check if haven't checked before and we have client name
      if (hasCheckedDuplicates || (!clientData.nome && !clientData.cognome)) {
        return;
      }

      // Must be online to check
      if (!isOnline()) {
        // Mark as checked (offline mode - skip check)
        setHasCheckedDuplicates(true);
        return;
      }

      // Wait a bit to let user finish typing
      const timer = setTimeout(async () => {
        setChecking(true);
        try {
          const nomeCompleto = clientData.nome && clientData.cognome
            ? `${clientData.nome} ${clientData.cognome}`.trim()
            : clientData.nome || clientData.cognome;

          const existingClient = await findExistingClient(nomeCompleto, clientData.email);

          if (existingClient) {
            // Found duplicate
            setDuplicates([existingClient]);
            setShowModal(true);
          } else {
            // No duplicates - mark as checked and proceed
            setHasCheckedDuplicates(true);
            setDuplicateCheckDecision('create_new');
          }
        } catch (error) {
          console.error('Error checking duplicates:', error);
          // On error, mark as checked and proceed
          setHasCheckedDuplicates(true);
        } finally {
          setChecking(false);
        }
      }, 2000); // Wait 2 seconds after user stops typing

      return () => clearTimeout(timer);
    };

    checkForDuplicates();
  }, [clientData.nome, clientData.cognome, clientData.email, hasCheckedDuplicates]);

  const handleUseExisting = (client) => {
    // Use existing client data
    setClientData({
      nome: client.nome_first || client.nome || '',
      cognome: client.cognome || '',
      indirizzo: client.indirizzo_impianto || '',
      email: client.email || '',
      telefono: client.cellulare || client.telefono || '',
      comune: client.citta_impianto || '',
      airtableClientId: client.airtableId || client.id
    });

    setHasCheckedDuplicates(true);
    setDuplicateCheckDecision('use_existing');
    setShowModal(false);

    alert(`✅ Cliente esistente selezionato!\n\nNome: ${client.nome}\n\nPuoi procedere con la creazione di un nuovo preventivo per questo cliente.`);
  };

  const handleUpdateExisting = (client) => {
    // Keep current form data but link to existing client
    setClientData(prev => ({
      ...prev,
      airtableClientId: client.airtableId || client.id
    }));

    setHasCheckedDuplicates(true);
    setDuplicateCheckDecision('update_existing');
    setShowModal(false);

    alert(`✅ Aggiornamento dati cliente esistente\n\nI dati attuali del form verranno usati per aggiornare il cliente "${client.nome}" in Airtable quando salvi.`);
  };

  const handleCreateNew = () => {
    // Proceed with creating new client
    setHasCheckedDuplicates(true);
    setDuplicateCheckDecision('create_new');
    setShowModal(false);

    alert('✅ Nuovo cliente\n\nVerrà creato un nuovo record cliente in Airtable quando salvi.');
  };

  if (!showModal) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#0F3460',
            marginBottom: '0.5rem'
          }}>
            ⚠️ Cliente già esistente
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Trovato un cliente con nome/email simile in Airtable. Cosa vuoi fare?
          </p>
        </div>

        {duplicates.map((client) => (
          <div
            key={client.id}
            style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
              {client.nome}
            </div>
            {client.email && (
              <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                Email: {client.email}
              </div>
            )}
            {client.cellulare && (
              <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                Telefono: {client.cellulare}
              </div>
            )}
            {client.citta_impianto && (
              <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                Città: {client.citta_impianto}
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => handleUseExisting(duplicates[0])}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            📋 Usa cliente esistente (nuovo preventivo)
          </button>

          <button
            onClick={() => handleUpdateExisting(duplicates[0])}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            ✏️ Aggiorna dati cliente esistente
          </button>

          <button
            onClick={handleCreateNew}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            ➕ Crea nuovo cliente
          </button>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          💡 <strong>Suggerimento:</strong> Questa verifica viene mostrata solo una volta per sessione.
        </div>
      </div>
    </div>
  );
};

export default DuplicateCheckModal;
