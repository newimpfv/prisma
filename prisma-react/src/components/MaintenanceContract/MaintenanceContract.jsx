import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import html2pdf from 'html2pdf.js';
import { generateContractHTML } from '../../utils/maintenanceContractPDF';

function MaintenanceContract() {
  const { selectedClientRecord } = useForm();

  // Form state
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    contractDuration: '1',
    power: '',
    price1: '',
    description1: '',
    price2: '',
    description2: '',
    price3: '',
    description3: ''
  });

  // Service types (checkboxes)
  const [services, setServices] = useState({
    lavaggio_pannelli: false,
    monitoraggio_remoto: false,
    intervento_base: false,
    intervento_plus: false
  });

  // Pre-fill client data if available
  useEffect(() => {
    if (selectedClientRecord) {
      // Client is already in flattened format from clients.js service
      // You can pre-fill power from installation data if available
    }
  }, [selectedClientRecord]);

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
      [serviceName]: !prev[serviceName]
    }));
  };

  const getSelectedServices = () => {
    const selected = [];
    if (services.lavaggio_pannelli) selected.push('Lavaggio Pannelli');
    if (services.monitoraggio_remoto) selected.push('Monitoraggio Remoto');
    if (services.intervento_base) selected.push('Intervento Base (1x/anno)');
    if (services.intervento_plus) selected.push('Intervento Plus (2x/anno)');
    return selected;
  };

  const hasSelectedServices = () => {
    return Object.values(services).some(v => v === true);
  };

  const calculateTotal = () => {
    const p1 = parseFloat(formData.price1) || 0;
    const p2 = parseFloat(formData.price2) || 0;
    const p3 = parseFloat(formData.price3) || 0;
    return (p1 + p2 + p3).toFixed(2);
  };

  const generatePDF = () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di generare il PDF');
      return;
    }

    if (!hasSelectedServices() || !formData.power) {
      alert('⚠️ Seleziona almeno un servizio e inserisci la potenza dell\'impianto');
      return;
    }

    // Generate HTML content (pass services as well)
    const htmlContent = generateContractHTML(selectedClientRecord, { ...formData, services: getSelectedServices() });

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Contratto_Manutenzione_${selectedClientRecord.nome}_${formData.startDate}.pdf`,
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

  const saveContract = async () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di salvare il contratto');
      return;
    }

    if (!hasSelectedServices() || !formData.power) {
      alert('⚠️ Seleziona almeno un servizio e compila tutti i campi obbligatori');
      return;
    }

    try {
      const selectedServices = getSelectedServices();

      // Prepare data for Airtable
      const contractData = {
        fields: {
          Name: `${selectedClientRecord.nome} - ${selectedServices.join(', ')} - ${formData.startDate}`,
          inizio_contratto: formData.startDate,
          Cliente: [selectedClientRecord.id],
          tipo_servizio: selectedServices.join(', '),
          durata_anni: parseInt(formData.contractDuration),
          potenza_impianto_kwp: parseFloat(formData.power),
          stato: 'Bozza'
        }
      };

      // Add end date if provided
      if (formData.endDate) {
        contractData.fields.fine_contratto = formData.endDate;
      }

      // Add prices and descriptions if provided
      if (formData.price1) {
        contractData.fields.prezzo_1 = parseFloat(formData.price1);
        contractData.fields.descrizione_1 = formData.description1 || '';
      }
      if (formData.price2) {
        contractData.fields.prezzo_2 = parseFloat(formData.price2);
        contractData.fields.descrizione_2 = formData.description2 || '';
      }
      if (formData.price3) {
        contractData.fields.prezzo_3 = parseFloat(formData.price3);
        contractData.fields.descrizione_3 = formData.description3 || '';
      }

      // Save to Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_CONTRACTS_TABLE_ID}`,
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

      alert(`✅ Contratto salvato su Airtable!\n\nID: ${result.id}\nStato: Bozza`);

      // Reset form
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        contractDuration: '1',
        power: '',
        price1: '',
        description1: '',
        price2: '',
        description2: '',
        price3: '',
        description3: ''
      });

      // Reset services
      setServices({
        lavaggio_pannelli: false,
        monitoraggio_remoto: false,
        intervento_base: false,
        intervento_plus: false
      });

    } catch (error) {
      console.error('Save error:', error);
      alert(`❌ Errore durante il salvataggio: ${error.message}`);
    }
  };

  if (!selectedClientRecord) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b7280' }}>
          ⚠️ Nessun Cliente Selezionato
        </h2>
        <p style={{ color: '#9ca3af' }}>
          Vai alla sezione "Gestione Clienti" e seleziona un cliente per creare un contratto di manutenzione.
        </p>
      </div>
    );
  }

  // Client is already in flattened format from clients.js service
  const client = selectedClientRecord;

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
        🔧 Contratto di Manutenzione
      </h2>

      {/* Client Info Banner */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '2px solid #10b981',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.5rem' }}>
          Cliente: {client.nome || 'N/A'}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
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
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
            Tipo di Servizio * (seleziona uno o più)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.lavaggio_pannelli ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.lavaggio_pannelli ? '#3b82f6' : '#e5e7eb'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.lavaggio_pannelli}
                onChange={() => handleServiceChange('lavaggio_pannelli')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.lavaggio_pannelli ? '#1e40af' : '#374151',
                fontWeight: services.lavaggio_pannelli ? '600' : '400'
              }}>
                Lavaggio Pannelli
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.monitoraggio_remoto ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.monitoraggio_remoto ? '#3b82f6' : '#e5e7eb'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.monitoraggio_remoto}
                onChange={() => handleServiceChange('monitoraggio_remoto')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.monitoraggio_remoto ? '#1e40af' : '#374151',
                fontWeight: services.monitoraggio_remoto ? '600' : '400'
              }}>
                Monitoraggio Remoto
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.intervento_base ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.intervento_base ? '#3b82f6' : '#e5e7eb'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.intervento_base}
                onChange={() => handleServiceChange('intervento_base')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.intervento_base ? '#1e40af' : '#374151',
                fontWeight: services.intervento_base ? '600' : '400'
              }}>
                Intervento Base di Manutenzione (una volta all'anno)
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: services.intervento_plus ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${services.intervento_plus ? '#3b82f6' : '#e5e7eb'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={services.intervento_plus}
                onChange={() => handleServiceChange('intervento_plus')}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: services.intervento_plus ? '#1e40af' : '#374151',
                fontWeight: services.intervento_plus ? '600' : '400'
              }}>
                Intervento Plus di Manutenzione (2 volte all'anno)
              </span>
            </label>
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
        </div>

        <div style={{ borderTop: '2px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Listino Prezzi
          </h4>

          {/* Price 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Prezzo 1 (€)
              </label>
              <input
                type="number"
                name="price1"
                value={formData.price1}
                onChange={handleInputChange}
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
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Descrizione 1
              </label>
              <input
                type="text"
                name="description1"
                value={formData.description1}
                onChange={handleInputChange}
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
          </div>

          {/* Price 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Prezzo 2 (€)
              </label>
              <input
                type="number"
                name="price2"
                value={formData.price2}
                onChange={handleInputChange}
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
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Descrizione 2
              </label>
              <input
                type="text"
                name="description2"
                value={formData.description2}
                onChange={handleInputChange}
                placeholder="Descrizione aggiuntiva"
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

          {/* Price 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Prezzo 3 (€)
              </label>
              <input
                type="number"
                name="price3"
                value={formData.price3}
                onChange={handleInputChange}
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
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Descrizione 3
              </label>
              <input
                type="text"
                name="description3"
                value={formData.description3}
                onChange={handleInputChange}
                placeholder="Descrizione aggiuntiva"
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

          {/* Total */}
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '700',
            fontSize: '1.125rem'
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
