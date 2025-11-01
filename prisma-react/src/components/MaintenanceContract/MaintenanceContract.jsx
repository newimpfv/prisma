import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import html2pdf from 'html2pdf.js';
import { generateContractHTML } from '../../utils/maintenanceContractPDF';

function MaintenanceContract() {
  const { selectedClientRecord } = useForm();

  // Form state
  const [formData, setFormData] = useState({
    contractDate: new Date().toISOString().split('T')[0],
    serviceType: '',
    contractDuration: '1',
    moduleType: 'standard',
    power: '',
    price1: '',
    description1: '',
    price2: '',
    description2: '',
    price3: '',
    description3: ''
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

    if (!formData.serviceType || !formData.power) {
      alert('⚠️ Compila tutti i campi obbligatori prima di generare il PDF');
      return;
    }

    // Generate HTML content
    const htmlContent = generateContractHTML(selectedClientRecord, formData);

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Contratto_Manutenzione_${selectedClientRecord.nome}_${formData.contractDate}.pdf`,
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

    if (!formData.serviceType || !formData.power) {
      alert('⚠️ Compila tutti i campi obbligatori');
      return;
    }

    try {
      // Prepare data for Airtable
      const contractData = {
        fields: {
          Name: `${selectedClientRecord.nome} - ${formData.serviceType} - ${formData.contractDate}`,
          data_contratto: formData.contractDate,
          Cliente: [selectedClientRecord.id],
          tipo_servizio: formData.serviceType === 'pulizia' ? 'Pulizia Impianto Fotovoltaico' :
                        formData.serviceType === 'service_base' ? 'Service Base' : 'Service Plus',
          durata_anni: parseInt(formData.contractDuration),
          potenza_impianto_kwp: parseFloat(formData.power),
          tipo_moduli: formData.moduleType === 'standard' ? 'Standard (≥ 350 WP/cad)' : 'Piccoli (< 350 WP/cad)',
          stato: 'Bozza'
        }
      };

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
        contractDate: new Date().toISOString().split('T')[0],
        serviceType: '',
        contractDuration: '1',
        moduleType: 'standard',
        power: '',
        price1: '',
        description1: '',
        price2: '',
        description2: '',
        price3: '',
        description3: ''
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

        {/* Contract Date */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Data Contratto
          </label>
          <input
            type="date"
            name="contractDate"
            value={formData.contractDate}
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

        {/* Service Type */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Tipo di Servizio *
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
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
          >
            <option value="">Seleziona servizio</option>
            <option value="pulizia">Pulizia Impianto Fotovoltaico</option>
            <option value="service_base">Service Base</option>
            <option value="service_plus">Service Plus</option>
          </select>
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

        {/* Module Type */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Tipo Moduli
          </label>
          <select
            name="moduleType"
            value={formData.moduleType}
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
            <option value="standard">Standard (≥ 350 WP/cad)</option>
            <option value="small">Piccoli (&lt; 350 WP/cad - Maggiorazione)</option>
          </select>
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
          disabled={!formData.serviceType || !formData.power}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: (!formData.serviceType || !formData.power) ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (!formData.serviceType || !formData.power) ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          📄 Genera PDF
        </button>
        <button
          onClick={saveContract}
          disabled={!formData.serviceType || !formData.power}
          style={{
            flex: 1,
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: (!formData.serviceType || !formData.power) ? '#9ca3af' : '#10b981',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (!formData.serviceType || !formData.power) ? 'not-allowed' : 'pointer',
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
