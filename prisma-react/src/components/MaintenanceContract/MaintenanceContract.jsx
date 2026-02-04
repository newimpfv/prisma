import { useState, useEffect, useMemo } from 'react';
import { useForm } from '../../context/FormContext';
import html2pdf from 'html2pdf.js';
import { generateContractHTML } from '../../utils/maintenanceContractPDF';
import { fetchClients } from '../../services/clients';
import { fetchInstallations } from '../../services/installations';

function MaintenanceContract() {
  const {
    selectedClientRecord,
    setSelectedClientRecord,
    clientData,
    setClientData,
    selectedInstallation,
    setSelectedInstallation
  } = useForm();

  // Client and Installation selectors state
  const [clients, setClients] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showInstallationSelector, setShowInstallationSelector] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [installationSearchQuery, setInstallationSearchQuery] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  // Online status effect
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

  // Load clients function
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

  // Load installations function
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

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    const query = clientSearchQuery.toLowerCase();
    return (
      (client.nome || '').toLowerCase().includes(query) ||
      (client.cognome || '').toLowerCase().includes(query) ||
      (client.email || '').toLowerCase().includes(query) ||
      (client.cellulare || '').includes(clientSearchQuery) ||
      (client.telefono || '').includes(clientSearchQuery)
    );
  });

  // Filter installations based on search
  const filteredInstallations = installations.filter(installation => {
    const query = installationSearchQuery.toLowerCase();
    return (
      (installation.nome || '').toLowerCase().includes(query) ||
      (installation.indirizzo || '').toLowerCase().includes(query)
    );
  });

  // Handle client selection
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
        // Load installations directly to get the latest list
        let installationsList = installations;
        if (installationsList.length === 0) {
          const loadedInstallations = await fetchInstallations();
          setInstallations(loadedInstallations);
          installationsList = loadedInstallations;
        }

        // Find the linked installation
        const linkedInstallationId = client.impianto[0];
        const linkedInstallation = installationsList.find(
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
        }
      } catch (error) {
        console.error('Error loading linked installation:', error);
      }
    }
  };

  // Handle installation selection
  const handleSelectInstallation = (installation) => {
    setSelectedInstallation(installation);
    setClientData(prev => ({
      ...prev,
      nomeImpianto: installation.nome || '',
      indirizzo: installation.indirizzo || '',
      airtableInstallationId: installation.airtableId || installation.id
    }));
    setShowInstallationSelector(false);
  };

  // Use selectedClientRecord if available, otherwise build from clientData
  const clientInfo = useMemo(() => {
    if (selectedClientRecord) {
      return selectedClientRecord;
    }
    // Fallback to clientData from "Cliente e Struttura" tab
    if (clientData && (clientData.nome || clientData.cognome)) {
      return {
        nome: clientData.cognome
          ? `${clientData.nome} ${clientData.cognome}`.trim()
          : clientData.nome,
        email: clientData.email,
        telefono: clientData.telefono,
        cellulare: clientData.telefono,
        indirizzo: clientData.indirizzo,
        id: clientData.airtableClientId
      };
    }
    return null;
  }, [selectedClientRecord, clientData]);

  // Form state
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    contractDuration: '1',
    power: ''
  });

  // Service types (checkboxes) with prices per kW
  const [services, setServices] = useState({
    pulizia: { selected: false, pricePerKw: '' },
    service_base: { selected: false, pricePerKw: '' },
    service_plus: { selected: false, pricePerKw: '' },
    monitoraggio_remoto: { selected: false, pricePerKw: '' }
  });

  // Track if prices have been manually modified
  const [pricesManuallyModified, setPricesManuallyModified] = useState({
    pulizia: false,
    service_base: false,
    service_plus: false,
    monitoraggio_remoto: false
  });

  // Price list items (dynamic array)
  const [priceItems, setPriceItems] = useState([
    { id: 1, price: '', description: '' }
  ]);

  // Pre-fill client data if available
  useEffect(() => {
    if (clientInfo) {
      // Client is already in flattened format from clients.js service
      // You can pre-fill power from installation data if available
    }
  }, [clientInfo]);

  // Calculate default prices based on power (only if not manually modified)
  const calculateDefaultPrices = (power) => {
    const powerNum = parseFloat(power);

    if (!powerNum || powerNum <= 0) {
      return null;
    }

    // Over 20 kW = manual entry (no defaults)
    if (powerNum > 20) {
      return null;
    }

    let defaultPrices;

    if (powerNum <= 6) {
      // <= 6 kW
      defaultPrices = {
        pulizia_total: 250,
        service_base_total: 150,
        service_plus_total: 400,
        monitoraggio_remoto_total: 50
      };
    } else if (powerNum > 6 && powerNum <= 20) {
      // > 6 kW and <= 20 kW
      defaultPrices = {
        pulizia_total: 350,
        service_base_total: 250,
        service_plus_total: 600,
        monitoraggio_remoto_total: 50
      };
    }

    // Convert total prices to price per kW
    return {
      pulizia: (defaultPrices.pulizia_total / powerNum).toFixed(2),
      service_base: (defaultPrices.service_base_total / powerNum).toFixed(2),
      service_plus: (defaultPrices.service_plus_total / powerNum).toFixed(2),
      monitoraggio_remoto: (defaultPrices.monitoraggio_remoto_total / powerNum).toFixed(2)
    };
  };

  // Auto-fill prices when power changes (only if not manually modified)
  useEffect(() => {
    if (formData.power) {
      const defaultPrices = calculateDefaultPrices(formData.power);

      if (defaultPrices) {
        setServices(prev => ({
          pulizia: {
            selected: prev.pulizia.selected,
            pricePerKw: pricesManuallyModified.pulizia ? prev.pulizia.pricePerKw : defaultPrices.pulizia
          },
          service_base: {
            selected: prev.service_base.selected,
            pricePerKw: pricesManuallyModified.service_base ? prev.service_base.pricePerKw : defaultPrices.service_base
          },
          service_plus: {
            selected: prev.service_plus.selected,
            pricePerKw: pricesManuallyModified.service_plus ? prev.service_plus.pricePerKw : defaultPrices.service_plus
          },
          monitoraggio_remoto: {
            selected: prev.monitoraggio_remoto.selected,
            pricePerKw: pricesManuallyModified.monitoraggio_remoto ? prev.monitoraggio_remoto.pricePerKw : defaultPrices.monitoraggio_remoto
          }
        }));
      } else if (parseFloat(formData.power) > 20) {
        // Clear prices for manual entry when power > 20 kW
        if (!pricesManuallyModified.pulizia && !pricesManuallyModified.service_base &&
            !pricesManuallyModified.service_plus && !pricesManuallyModified.monitoraggio_remoto) {
          setServices(prev => ({
            pulizia: { selected: prev.pulizia.selected, pricePerKw: '' },
            service_base: { selected: prev.service_base.selected, pricePerKw: '' },
            service_plus: { selected: prev.service_plus.selected, pricePerKw: '' },
            monitoraggio_remoto: { selected: prev.monitoraggio_remoto.selected, pricePerKw: '' }
          }));
        }
      }
    }
  }, [formData.power]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        selected: !prev[serviceName].selected
      }
    }));
  };

  const handleServicePriceChange = (serviceName, price) => {
    // Mark as manually modified when user changes the price
    setPricesManuallyModified(prev => ({
      ...prev,
      [serviceName]: true
    }));

    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        pricePerKw: price
      }
    }));
  };

  const getSelectedServices = () => {
    const selected = [];
    if (services.pulizia.selected) selected.push('Pulizia Impianto Fotovoltaico');
    if (services.service_base.selected) selected.push('Manutenzione Ordinaria SERVICE BASE');
    if (services.service_plus.selected) selected.push('Manutenzione Ordinaria SERVICE PLUS');
    if (services.monitoraggio_remoto.selected) selected.push('Monitoraggio Remoto');
    return selected;
  };

  const hasSelectedServices = () => {
    return Object.values(services).some(v => v.selected === true);
  };

  // Price item management
  const addPriceItem = () => {
    const newId = Math.max(...priceItems.map(item => item.id), 0) + 1;
    setPriceItems([...priceItems, { id: newId, price: '', description: '' }]);
  };

  const removePriceItem = (id) => {
    if (priceItems.length > 1) {
      setPriceItems(priceItems.filter(item => item.id !== id));
    }
  };

  const handlePriceItemChange = (id, field, value) => {
    setPriceItems(priceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateServicesPrices = () => {
    const power = parseFloat(formData.power) || 0;
    let servicesTotal = 0;

    Object.entries(services).forEach(([key, value]) => {
      if (value.selected && value.pricePerKw) {
        servicesTotal += (parseFloat(value.pricePerKw) || 0) * power;
      }
    });

    return servicesTotal;
  };

  const calculateTotal = () => {
    const priceItemsTotal = priceItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const servicesTotal = calculateServicesPrices();

    return (priceItemsTotal + servicesTotal).toFixed(2);
  };

  const generatePDF = () => {
    if (!clientInfo) {
      alert('⚠️ Seleziona un cliente prima di generare il PDF');
      return;
    }

    if (!hasSelectedServices() || !formData.power) {
      alert('⚠️ Seleziona almeno un servizio e inserisci la potenza dell\'impianto');
      return;
    }

    // Generate HTML content (pass services and priceItems)
    const htmlContent = generateContractHTML(clientInfo, { ...formData, services: getSelectedServices(), priceItems });

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Contratto_Manutenzione_${clientInfo.nome}_${formData.startDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    html2pdf()
      .from(tempContainer)
      .set(options)
      .save()
      .then(() => {
        // Clean up
        document.body.removeChild(tempContainer);
        alert('✅ PDF generato con successo!');
      })
      .catch((error) => {
        console.error('PDF generation error:', error);
        document.body.removeChild(tempContainer);
        alert('❌ Errore durante la generazione del PDF');
      });
  };

  const generatePDFBlob = async () => {
    // Generate HTML content
    const htmlContent = generateContractHTML(clientInfo, { ...formData, services: getSelectedServices(), priceItems });

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Contratto_Manutenzione_${clientInfo.nome}_${formData.startDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF as blob
    return new Promise((resolve, reject) => {
      html2pdf()
        .from(tempContainer)
        .set(options)
        .outputPdf('blob')
        .then((blob) => {
          // Clean up
          document.body.removeChild(tempContainer);
          resolve(blob);
        })
        .catch((error) => {
          document.body.removeChild(tempContainer);
          reject(error);
        });
    });
  };

  const uploadPDFToTemporaryStorage = async (blob, filename) => {
    // Upload to file.io (temporary file hosting - 1 download, then deleted)
    const formData = new FormData();
    formData.append('file', blob, filename);

    try {
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF to temporary storage');
      }

      const result = await response.json();
      if (result.success && result.link) {
        return result.link;
      } else {
        throw new Error('No URL returned from file hosting service');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Impossibile caricare il PDF. Prova di nuovo.');
    }
  };

  const saveContract = async () => {
    if (!clientInfo) {
      alert('⚠️ Seleziona un cliente prima di salvare il contratto');
      return;
    }

    if (!hasSelectedServices() || !formData.power) {
      alert('⚠️ Seleziona almeno un servizio e compila tutti i campi obbligatori');
      return;
    }

    try {
      const selectedServices = getSelectedServices();

      // Show loading message
      alert('📄 Generazione PDF in corso...');

      // Generate PDF
      const pdfBlob = await generatePDFBlob();
      const pdfFilename = `Contratto_Manutenzione_${clientInfo.nome}_${formData.startDate}.pdf`;

      // Upload PDF to temporary storage to get public URL
      alert('☁️ Caricamento PDF in corso...');
      const pdfUrl = await uploadPDFToTemporaryStorage(pdfBlob, pdfFilename);

      // Prepare data for Airtable
      const contractData = {
        fields: {
          Name: `${clientInfo.nome} - ${selectedServices.join(', ')} - ${formData.startDate}`,
          inizio_contratto: formData.startDate,
          Cliente: clientInfo.id ? [clientInfo.id] : undefined,
          tipo_servizio: selectedServices.join(', '),
          durata_anni: parseInt(formData.contractDuration),
          potenza_impianto_kwp: parseFloat(formData.power),
          stato: 'Bozza',
          contract_pdf: [
            {
              url: pdfUrl,
              filename: pdfFilename
            }
          ]
        }
      };

      // Add end date if provided
      if (formData.endDate) {
        contractData.fields.fine_contratto = formData.endDate;
      }

      // Add prices and descriptions from dynamic priceItems array
      priceItems.forEach((item, index) => {
        if (item.price) {
          contractData.fields[`prezzo_${index + 1}`] = parseFloat(item.price);
          contractData.fields[`descrizione_${index + 1}`] = item.description || '';
        }
      });

      // Save to Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/tblXFnfZhmClzRRLz`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contractData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Errore durante il salvataggio');
      }

      const result = await response.json();

      alert(`✅ Contratto e PDF salvati su Airtable!\n\nID: ${result.id}\nStato: Bozza`);

      // Reset form
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        contractDuration: '1',
        power: ''
      });

      // Reset services
      setServices({
        pulizia: { selected: false, pricePerKw: '' },
        service_base: { selected: false, pricePerKw: '' },
        service_plus: { selected: false, pricePerKw: '' },
        monitoraggio_remoto: { selected: false, pricePerKw: '' }
      });

      // Reset manual modification tracking
      setPricesManuallyModified({
        pulizia: false,
        service_base: false,
        service_plus: false,
        monitoraggio_remoto: false
      });

      // Reset price items
      setPriceItems([
        { id: 1, price: '', description: '' }
      ]);

    } catch (error) {
      console.error('Save error:', error);
      alert(`❌ Errore durante il salvataggio: ${error.message}`);
    }
  };

  // Use clientInfo which can come from selectedClientRecord or clientData
  const client = clientInfo;

  return (
    <div style={{ padding: '1rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .maintenance-header-buttons {
            flex-direction: column !important;
            width: 100% !important;
          }
          .maintenance-header-buttons button {
            width: 100% !important;
          }
        }
      `}</style>

      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span>🔧 Contratto di Manutenzione</span>
        {online && (
          <div className="maintenance-header-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowClientSelector(!showClientSelector);
                setShowInstallationSelector(false);
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
                setShowClientSelector(false);
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
            placeholder="🔍 Cerca cliente per nome, cognome, email, telefono..."
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
              filteredClients.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #93c5fd',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                  <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                    {c.nome}{c.cognome && ` ${c.cognome}`}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {c.email && `📧 ${c.email}`}
                    {c.telefono && ` • 📱 ${c.telefono}`}
                    {!c.telefono && c.cellulare && ` • 📱 ${c.cellulare}`}
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
              filteredInstallations.map(inst => (
                <div
                  key={inst.id}
                  onClick={() => handleSelectInstallation(inst)}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #86efac',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                  <div style={{ fontWeight: '600', color: '#047857', marginBottom: '0.5rem' }}>
                    {inst.nome || inst.indirizzo}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    📍 {inst.indirizzo}
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

      {/* Warning if no client selected */}
      {!client && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
            ⚠️ Nessun Cliente Selezionato
          </div>
          <p style={{ color: '#a16207', fontSize: '0.875rem', margin: 0 }}>
            Usa il pulsante "Seleziona Cliente" sopra per scegliere un cliente, oppure vai alla tab "Gestione Clienti" o "Cliente e Struttura".
          </p>
        </div>
      )}

      {/* Client Info Banner */}
      {client && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '2px solid #10b981',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.5rem' }}>
              👤 Cliente: {client.nome || 'N/A'}
            </div>
            {client.email && (
              <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                📧 {client.email}
              </div>
            )}
            {(client.telefono || client.cellulare) && (
              <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                📞 {client.cellulare || client.telefono}
              </div>
            )}
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
            ✕ Rimuovi
          </button>
        </div>
      )}

      {/* Installation Info Banner */}
      {selectedInstallation && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
              ⚡ Impianto: {selectedInstallation.nome || selectedInstallation.indirizzo}
            </div>
            {selectedInstallation.indirizzo && (
              <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                📍 {selectedInstallation.indirizzo}
              </div>
            )}
            {selectedInstallation.potenza && (
              <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                ⚡ Potenza: {selectedInstallation.potenza} kWp
              </div>
            )}
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
            ✕ Rimuovi
          </button>
        </div>
      )}

      {/* Form Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Dettagli Contratto
        </h3>

        {/* Contract Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Inizio Contratto *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Fine Contratto
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Service Types - Checkboxes */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Tipo di Servizio * (seleziona uno o più)
          </label>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            I prezzi vengono calcolati automaticamente in base alla potenza dell'impianto ma sono sempre modificabili
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.pulizia.selected ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.pulizia.selected ? '#3b82f6' : '#e5e7eb'}`,
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.pulizia.selected}
                onChange={() => handleServiceChange('pulizia')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.pulizia.selected ? '#1e40af' : '#374151',
                fontWeight: services.pulizia.selected ? '600' : '400',
                flex: 1
              }}>
                PULIZIA - Pulizia Impianto Fotovoltaico
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={services.pulizia.pricePerKw}
                  onChange={(e) => handleServicePriceChange('pulizia', e.target.value)}
                  step="0.01"
                  placeholder="€/kW"
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>€/kW</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.service_base.selected ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.service_base.selected ? '#3b82f6' : '#e5e7eb'}`,
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.service_base.selected}
                onChange={() => handleServiceChange('service_base')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.service_base.selected ? '#1e40af' : '#374151',
                fontWeight: services.service_base.selected ? '600' : '400',
                flex: 1
              }}>
                SERVICE BASE - Manutenzione Ordinaria
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={services.service_base.pricePerKw}
                  onChange={(e) => handleServicePriceChange('service_base', e.target.value)}
                  step="0.01"
                  placeholder="€/kW"
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>€/kW</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.service_plus.selected ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.service_plus.selected ? '#3b82f6' : '#e5e7eb'}`,
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.service_plus.selected}
                onChange={() => handleServiceChange('service_plus')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.service_plus.selected ? '#1e40af' : '#374151',
                fontWeight: services.service_plus.selected ? '600' : '400',
                flex: 1
              }}>
                SERVICE PLUS - Manutenzione Ordinaria con servizi aggiuntivi
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={services.service_plus.pricePerKw}
                  onChange={(e) => handleServicePriceChange('service_plus', e.target.value)}
                  step="0.01"
                  placeholder="€/kW"
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>€/kW</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.monitoraggio_remoto.selected ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.monitoraggio_remoto.selected ? '#3b82f6' : '#e5e7eb'}`,
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.monitoraggio_remoto.selected}
                onChange={() => handleServiceChange('monitoraggio_remoto')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.monitoraggio_remoto.selected ? '#1e40af' : '#374151',
                fontWeight: services.monitoraggio_remoto.selected ? '600' : '400',
                flex: 1
              }}>
                MONITORAGGIO REMOTO
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={services.monitoraggio_remoto.pricePerKw}
                  onChange={(e) => handleServicePriceChange('monitoraggio_remoto', e.target.value)}
                  step="0.01"
                  placeholder="€/kW"
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>€/kW</span>
              </div>
            </div>
          </div>

          {hasSelectedServices() && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#1e40af'
            }}>
              ✓ Servizi selezionati: {getSelectedServices().join(', ')}
            </div>
          )}
        </div>

        {/* Contract Duration */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Durata Contratto
          </label>
          <select
            name="contractDuration"
            value={formData.contractDuration}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          >
            <option value="1">1 Anno</option>
            <option value="2">2 Anni</option>
            <option value="3">3 Anni</option>
            <option value="4">4 Anni</option>
            <option value="5">5 Anni</option>
          </select>
        </div>

        {/* Power */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Potenza Impianto (kWp) *
          </label>
          <input
            type="number"
            name="power"
            value={formData.power}
            onChange={handleInputChange}
            step="0.01"
            placeholder="es. 6.00"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          />

          {/* Show pricing tier indicator */}
          {formData.power && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: parseFloat(formData.power) <= 6 ? '#dbeafe' :
                              parseFloat(formData.power) <= 20 ? '#e0e7ff' : '#fef3c7',
              color: parseFloat(formData.power) <= 6 ? '#1e40af' :
                     parseFloat(formData.power) <= 20 ? '#4338ca' : '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {parseFloat(formData.power) <= 6 ? (
                <>
                  <span>💡</span>
                  <span><strong>Fascia 1:</strong> Impianto ≤ 6 kW - Prezzi standard applicati automaticamente</span>
                </>
              ) : parseFloat(formData.power) <= 20 ? (
                <>
                  <span>⚡</span>
                  <span><strong>Fascia 2:</strong> Impianto 6-20 kW - Prezzi standard applicati automaticamente</span>
                </>
              ) : (
                <>
                  <span>⚠️</span>
                  <span><strong>Fascia 3:</strong> Impianto &gt; 20 kW - Inserire prezzi manualmente</span>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
              Listino Prezzi
            </h4>
            <button
              type="button"
              onClick={addPriceItem}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              + Aggiungi Prezzo
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Aggiungi altri prodotti e servizi a quelli standard
          </p>

          {/* Dynamic Price Items */}
          {priceItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '0.75rem',
                marginBottom: priceItems.length > 1 ? '0.75rem' : '0'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Descrizione {index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handlePriceItemChange(item.id, 'description', e.target.value)}
                    placeholder="Descrizione servizio"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Prezzo {index + 1} (€)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceItemChange(item.id, 'price', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              {priceItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    color: '#ef4444',
                    backgroundColor: 'white',
                    border: '2px solid #ef4444',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  title="Rimuovi prezzo"
                >
                  <span style={{ fontSize: '1.25rem' }}>×</span>
                  <span>Rimuovi</span>
                </button>
              )}
            </div>
          ))}

          {/* Services Prices */}
          {hasSelectedServices() && formData.power && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '0.5rem',
              border: '2px solid #3b82f6'
            }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
                Servizi Standard Selezionati (Potenza: {formData.power} kW)
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {services.pulizia.selected && services.pulizia.pricePerKw && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#374151' }}>
                    <span>PULIZIA - Pulizia Impianto Fotovoltaico ({services.pulizia.pricePerKw}€/kW × {formData.power} kW)</span>
                    <span style={{ fontWeight: '600' }}>€ {((parseFloat(services.pulizia.pricePerKw) || 0) * (parseFloat(formData.power) || 0)).toFixed(2)}</span>
                  </div>
                )}
                {services.service_base.selected && services.service_base.pricePerKw && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#374151' }}>
                    <span>SERVICE BASE - Manutenzione Ordinaria ({services.service_base.pricePerKw}€/kW × {formData.power} kW)</span>
                    <span style={{ fontWeight: '600' }}>€ {((parseFloat(services.service_base.pricePerKw) || 0) * (parseFloat(formData.power) || 0)).toFixed(2)}</span>
                  </div>
                )}
                {services.service_plus.selected && services.service_plus.pricePerKw && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#374151' }}>
                    <span>SERVICE PLUS - Manutenzione Ordinaria con servizi aggiuntivi ({services.service_plus.pricePerKw}€/kW × {formData.power} kW)</span>
                    <span style={{ fontWeight: '600' }}>€ {((parseFloat(services.service_plus.pricePerKw) || 0) * (parseFloat(formData.power) || 0)).toFixed(2)}</span>
                  </div>
                )}
                {services.monitoraggio_remoto.selected && services.monitoraggio_remoto.pricePerKw && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#374151' }}>
                    <span>MONITORAGGIO REMOTO ({services.monitoraggio_remoto.pricePerKw}€/kW × {formData.power} kW)</span>
                    <span style={{ fontWeight: '600' }}>€ {((parseFloat(services.monitoraggio_remoto.pricePerKw) || 0) * (parseFloat(formData.power) || 0)).toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color: '#1e40af',
                  fontWeight: '700',
                  borderTop: '1px solid #93c5fd',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem'
                }}>
                  <span>Subtotale Servizi:</span>
                  <span>€ {calculateServicesPrices().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '700',
            fontSize: '1.125rem',
            marginTop: '1rem'
          }}>
            <span>Totale:</span>
            <span style={{ color: '#10b981' }}>€ {calculateTotal()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={generatePDF}
          disabled={!hasSelectedServices() || !formData.power}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: (!hasSelectedServices() || !formData.power) ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (!hasSelectedServices() || !formData.power) ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          📄 Genera PDF
        </button>
        <button
          onClick={saveContract}
          disabled={!hasSelectedServices() || !formData.power}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: (!hasSelectedServices() || !formData.power) ? '#9ca3af' : '#10b981',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (!hasSelectedServices() || !formData.power) ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          💾 Salva su Airtable
        </button>
      </div>
    </div>
  );
}

export default MaintenanceContract;
