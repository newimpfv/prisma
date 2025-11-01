import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import html2pdf from 'html2pdf.js';

function InstallationChecklist() {
  const { selectedClientRecord } = useForm();

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [luogoImpianto, setLuogoImpianto] = useState('');
  const [tecnicoResponsabile, setTecnicoResponsabile] = useState('');
  const [condizioniMeteo, setCondizioniMeteo] = useState('');

  // Section 1: Pulizia pannelli
  const [ultimaPulizia, setUltimaPulizia] = useState('');
  const [statoPannelli, setStatoPannelli] = useState('');
  const [interventoNecessario, setInterventoNecessario] = useState('');
  const [notePulizia, setNotePulizia] = useState('');

  // Section 2: Ispezione visiva
  const [danniFisici, setDanniFisici] = useState('');
  const [telaioSupporti, setTelaioSupporti] = useState('');
  const [cabblaggiConnettori, setCabblaggiConnettori] = useState('');
  const [noteIspezione, setNoteIspezione] = useState('');

  // Section 3: Inverter
  const [modelloInverter, setModelloInverter] = useState('');
  const [messaggiErrore, setMessaggiErrore] = useState('');
  const [produzioneAttuale, setProduzioneAttuale] = useState('');
  const [ventoleRaffreddamento, setVentoleRaffreddamento] = useState('');
  const [noteInverter, setNoteInverter] = useState('');

  // Section 4: Connessioni elettriche
  const [contattiSerrati, setContattiSerrati] = useState('');
  const [quadroElettrico, setQuadroElettrico] = useState('');
  const [noteConnessioni, setNoteConnessioni] = useState('');

  // Section 5: Sistema di accumulo
  const [tipoBatteria, setTipoBatteria] = useState('');
  const [statoCarica, setStatoCarica] = useState('');
  const [anomalieRilevate, setAnomalieRilevate] = useState('');
  const [noteAccumulo, setNoteAccumulo] = useState('');

  // Section 6: Produzione e rendimento
  const [produzioneGiornaliera, setProduzioneGiornaliera] = useState('');
  const [produzioneMensile, setProduzioneMensile] = useState('');
  const [scostamentoValori, setScostamentoValori] = useState('');
  const [noteProduzione, setNoteProduzione] = useState('');

  // Section 7: Strutture e sicurezza
  const [supportiStaffe, setSupportiStaffe] = useState('');
  const [accessoImpianto, setAccessoImpianto] = useState('');
  const [protezioniSovratensione, setProtezioniSovratensione] = useState('');
  const [noteStrutture, setNoteStrutture] = useState('');

  // Section 8: Aggiornamenti e firmware
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState('');
  const [aggiornamentoNecessario, setAggiornamentoNecessario] = useState('');
  const [noteFirmware, setNoteFirmware] = useState('');

  // Section 9: Osservazioni generali
  const [osservazioniGenerali, setOsservazioniGenerali] = useState('');

  // Signatures
  const [confermatoTecnico, setConfermatoTecnico] = useState(false);
  const [accettazioneProprietario, setAccettazioneProprietario] = useState(false);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);


  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);

    // Create preview URLs for the photos
    const photoPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file: file,
            preview: reader.result,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(newPhotos => {
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    });
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getCompletionPercentage = () => {
    // Count filled fields across all sections
    let total = 0;
    let filled = 0;

    // Basic fields (4)
    total += 4;
    if (luogoImpianto) filled++;
    if (tecnicoResponsabile) filled++;
    if (condizioniMeteo) filled++;
    if (visitDate) filled++;

    // Section 1 (4 fields)
    total += 4;
    if (ultimaPulizia) filled++;
    if (statoPannelli) filled++;
    if (interventoNecessario) filled++;
    if (notePulizia) filled++;

    // Section 2 (4 fields)
    total += 4;
    if (danniFisici) filled++;
    if (telaioSupporti) filled++;
    if (cabblaggiConnettori) filled++;
    if (noteIspezione) filled++;

    // Section 3 (5 fields)
    total += 5;
    if (modelloInverter) filled++;
    if (messaggiErrore) filled++;
    if (produzioneAttuale) filled++;
    if (ventoleRaffreddamento) filled++;
    if (noteInverter) filled++;

    // Section 4 (3 fields)
    total += 3;
    if (contattiSerrati) filled++;
    if (quadroElettrico) filled++;
    if (noteConnessioni) filled++;

    // Section 5 (4 fields)
    total += 4;
    if (tipoBatteria) filled++;
    if (statoCarica) filled++;
    if (anomalieRilevate) filled++;
    if (noteAccumulo) filled++;

    // Section 6 (4 fields)
    total += 4;
    if (produzioneGiornaliera) filled++;
    if (produzioneMensile) filled++;
    if (scostamentoValori) filled++;
    if (noteProduzione) filled++;

    // Section 7 (4 fields)
    total += 4;
    if (supportiStaffe) filled++;
    if (accessoImpianto) filled++;
    if (protezioniSovratensione) filled++;
    if (noteStrutture) filled++;

    // Section 8 (3 fields)
    total += 3;
    if (ultimoAggiornamento) filled++;
    if (aggiornamentoNecessario) filled++;
    if (noteFirmware) filled++;

    // Section 9 & signatures (3 fields)
    total += 3;
    if (osservazioniGenerali) filled++;
    if (confermatoTecnico) filled++;
    if (accettazioneProprietario) filled++;

    return Math.round((filled / total) * 100);
  };

  const saveChecklist = () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di salvare');
      return;
    }

    // Save to localStorage
    const reportData = {
      client: selectedClientRecord.nome,
      clientId: selectedClientRecord.id,
      visitDate,
      luogoImpianto,
      tecnicoResponsabile,
      condizioniMeteo,

      // Section 1
      ultimaPulizia,
      statoPannelli,
      interventoNecessario,
      notePulizia,

      // Section 2
      danniFisici,
      telaioSupporti,
      cabblaggiConnettori,
      noteIspezione,

      // Section 3
      modelloInverter,
      messaggiErrore,
      produzioneAttuale,
      ventoleRaffreddamento,
      noteInverter,

      // Section 4
      contattiSerrati,
      quadroElettrico,
      noteConnessioni,

      // Section 5
      tipoBatteria,
      statoCarica,
      anomalieRilevate,
      noteAccumulo,

      // Section 6
      produzioneGiornaliera,
      produzioneMensile,
      scostamentoValori,
      noteProduzione,

      // Section 7
      supportiStaffe,
      accessoImpianto,
      protezioniSovratensione,
      noteStrutture,

      // Section 8
      ultimoAggiornamento,
      aggiornamentoNecessario,
      noteFirmware,

      // Section 9
      osservazioniGenerali,

      // Signatures
      confermatoTecnico,
      accettazioneProprietario,

      photos: uploadedPhotos.map(p => ({
        name: p.name,
        size: p.size,
        type: p.type,
        uploadedAt: p.uploadedAt,
        preview: p.preview
      })),
      completedAt: new Date().toISOString(),
      completion: getCompletionPercentage()
    };

    const saved = localStorage.getItem('maintenance_reports');
    const reports = saved ? JSON.parse(saved) : [];
    reports.push(reportData);
    localStorage.setItem('maintenance_reports', JSON.stringify(reports));

    alert(`✅ Report salvato!\n\nCompletamento: ${getCompletionPercentage()}%\nFoto: ${uploadedPhotos.length}`);

    // Reset all fields
    setVisitDate(new Date().toISOString().split('T')[0]);
    setLuogoImpianto('');
    setTecnicoResponsabile('');
    setCondizioniMeteo('');
    setUltimaPulizia('');
    setStatoPannelli('');
    setInterventoNecessario('');
    setNotePulizia('');
    setDanniFisici('');
    setTelaioSupporti('');
    setCabblaggiConnettori('');
    setNoteIspezione('');
    setModelloInverter('');
    setMessaggiErrore('');
    setProduzioneAttuale('');
    setVentoleRaffreddamento('');
    setNoteInverter('');
    setContattiSerrati('');
    setQuadroElettrico('');
    setNoteConnessioni('');
    setTipoBatteria('');
    setStatoCarica('');
    setAnomalieRilevate('');
    setNoteAccumulo('');
    setProduzioneGiornaliera('');
    setProduzioneMensile('');
    setScostamentoValori('');
    setNoteProduzione('');
    setSupportiStaffe('');
    setAccessoImpianto('');
    setProtezioniSovratensione('');
    setNoteStrutture('');
    setUltimoAggiornamento('');
    setAggiornamentoNecessario('');
    setNoteFirmware('');
    setOsservazioniGenerali('');
    setConfermatoTecnico(false);
    setAccettazioneProprietario(false);
    setUploadedPhotos([]);
  };

  const generateChecklistHTML = () => {
    const client = selectedClientRecord;
    const completionPercentage = getCompletionPercentage();

    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Report di Manutenzione - ${client.nome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #10b981;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 20px;
            color: #1f2937;
            margin-top: 10px;
          }
          .info-section {
            background-color: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 2px solid #10b981;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            font-weight: 600;
            color: #065f46;
          }
          .info-value {
            color: #047857;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title {
            color: #1f2937;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 5px;
          }
          .field-row {
            padding: 8px 4px;
            border-bottom: 1px solid #e5e7eb;
          }
          .field-label {
            font-weight: 600;
            color: #374151;
          }
          .field-value {
            color: #065f46;
            margin-left: 10px;
          }
          .notes {
            background-color: #fffbeb;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            font-size: 14px;
            color: #78350f;
            white-space: pre-wrap;
          }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            border-top: 2px solid #374151;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PRISMA - Impianti Fotovoltaici</div>
          <div class="document-title">Report di Manutenzione Impianto Fotovoltaico</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Cliente:</span>
            <span class="info-value">${client.nome || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data del controllo:</span>
            <span class="info-value">${new Date(visitDate).toLocaleDateString('it-IT')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Luogo dell'impianto:</span>
            <span class="info-value">${luogoImpianto || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tecnico / Responsabile:</span>
            <span class="info-value">${tecnicoResponsabile || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Condizioni meteo:</span>
            <span class="info-value">${condizioniMeteo || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🔹 1. Pulizia pannelli</div>
          <div class="field-row">
            <span class="field-label">Ultima pulizia effettuata:</span>
            <span class="field-value">${ultimaPulizia || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Stato pannelli:</span>
            <span class="field-value">${statoPannelli || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Intervento necessario?</span>
            <span class="field-value">${interventoNecessario || 'N/A'}</span>
          </div>
          ${notePulizia ? `<div class="notes"><strong>Note:</strong><br>${notePulizia}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 2. Ispezione visiva</div>
          <div class="field-row">
            <span class="field-label">Danni fisici ai moduli:</span>
            <span class="field-value">${danniFisici || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Telaio / supporti integri:</span>
            <span class="field-value">${telaioSupporti || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Cablaggi e connettori integri:</span>
            <span class="field-value">${cabblaggiConnettori || 'N/A'}</span>
          </div>
          ${noteIspezione ? `<div class="notes"><strong>Note:</strong><br>${noteIspezione}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 3. Inverter</div>
          <div class="field-row">
            <span class="field-label">Modello:</span>
            <span class="field-value">${modelloInverter || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Messaggi di errore presenti?</span>
            <span class="field-value">${messaggiErrore || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Produzione attuale:</span>
            <span class="field-value">${produzioneAttuale ? produzioneAttuale + ' kWh' : 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Ventole / raffreddamento funzionanti:</span>
            <span class="field-value">${ventoleRaffreddamento || 'N/A'}</span>
          </div>
          ${noteInverter ? `<div class="notes"><strong>Note:</strong><br>${noteInverter}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 4. Connessioni elettriche</div>
          <div class="field-row">
            <span class="field-label">Contatti serrati e privi di corrosione:</span>
            <span class="field-value">${contattiSerrati || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Quadro elettrico in buone condizioni:</span>
            <span class="field-value">${quadroElettrico || 'N/A'}</span>
          </div>
          ${noteConnessioni ? `<div class="notes"><strong>Note:</strong><br>${noteConnessioni}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 5. Sistema di accumulo (se presente)</div>
          <div class="field-row">
            <span class="field-label">Tipo di batteria:</span>
            <span class="field-value">${tipoBatteria || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Stato di carica medio:</span>
            <span class="field-value">${statoCarica ? statoCarica + '%' : 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Anomalie rilevate:</span>
            <span class="field-value">${anomalieRilevate || 'N/A'}</span>
          </div>
          ${noteAccumulo ? `<div class="notes"><strong>Note:</strong><br>${noteAccumulo}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 6. Produzione e rendimento</div>
          <div class="field-row">
            <span class="field-label">Produzione giornaliera:</span>
            <span class="field-value">${produzioneGiornaliera ? produzioneGiornaliera + ' kWh' : 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Produzione mensile:</span>
            <span class="field-value">${produzioneMensile ? produzioneMensile + ' kWh' : 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Scostamento dai valori attesi:</span>
            <span class="field-value">${scostamentoValori ? scostamentoValori + '%' : 'N/A'}</span>
          </div>
          ${noteProduzione ? `<div class="notes"><strong>Note:</strong><br>${noteProduzione}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 7. Strutture e sicurezza</div>
          <div class="field-row">
            <span class="field-label">Supporti e staffe stabili:</span>
            <span class="field-value">${supportiStaffe || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Accesso all'impianto sicuro:</span>
            <span class="field-value">${accessoImpianto || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Protezioni da sovratensione funzionanti:</span>
            <span class="field-value">${protezioniSovratensione || 'N/A'}</span>
          </div>
          ${noteStrutture ? `<div class="notes"><strong>Note:</strong><br>${noteStrutture}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 8. Aggiornamenti e firmware</div>
          <div class="field-row">
            <span class="field-label">Ultimo aggiornamento inverter:</span>
            <span class="field-value">${ultimoAggiornamento || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Aggiornamento necessario?</span>
            <span class="field-value">${aggiornamentoNecessario || 'N/A'}</span>
          </div>
          ${noteFirmware ? `<div class="notes"><strong>Note:</strong><br>${noteFirmware}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 9. Osservazioni generali</div>
          ${osservazioniGenerali ? `<div class="notes">${osservazioniGenerali}</div>` : '<p style="color: #9ca3af; font-style: italic;">Nessuna osservazione</p>'}
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Confermato dal tecnico ${confermatoTecnico ? '☑' : '☐'}</div>
          </div>
          <div class="signature-box">
            <div>Accettazione proprietario ${accettazioneProprietario ? '☑' : '☐'}</div>
          </div>
        </div>

        <div class="footer">
          Documento generato automaticamente dal sistema PRISMA<br>
          Data: ${new Date().toLocaleDateString('it-IT')} - Ora: ${new Date().toLocaleTimeString('it-IT')}
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di generare il PDF');
      return;
    }

    setGeneratingPDF(true);

    try {
      // Generate HTML content
      const htmlContent = generateChecklistHTML();

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      // PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Report_Manutenzione_${selectedClientRecord.nome.replace(/\s+/g, '_')}_${visitDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF
      await html2pdf().set(opt).from(tempContainer).save();

      // Clean up
      document.body.removeChild(tempContainer);

      alert('✅ PDF generato e scaricato con successo!');

      // TODO: Upload to Airtable
      // This would require implementing file upload to Airtable attachments
      // For now, the PDF is downloaded locally

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`❌ Errore durante la generazione del PDF: ${error.message}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!selectedClientRecord) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b7280' }}>
          ⚠️ Nessun Cliente Selezionato
        </h2>
        <p style={{ color: '#9ca3af' }}>
          Vai alla sezione "Gestione Clienti" e seleziona un cliente per iniziare la checklist.
        </p>
      </div>
    );
  }

  // Client is already in flattened format from clients.js service
  const client = selectedClientRecord;
  const completionPercentage = getCompletionPercentage();

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
        📋 Report di Manutenzione
      </h2>

      {/* Client Info */}
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
        <div style={{ fontSize: '0.875rem', color: '#047857' }}>
          📅 Data intervento: {visitDate}
        </div>
      </div>

      {/* Informazioni Generali */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          ℹ️ Informazioni Generali
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Data del controllo
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
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
              Luogo dell'impianto
            </label>
            <input
              type="text"
              value={luogoImpianto}
              onChange={(e) => setLuogoImpianto(e.target.value)}
              placeholder="Indirizzo impianto"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Tecnico / Responsabile
            </label>
            <input
              type="text"
              value={tecnicoResponsabile}
              onChange={(e) => setTecnicoResponsabile(e.target.value)}
              placeholder="Nome tecnico"
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
              Condizioni Meteo
            </label>
            <select
              value={condizioniMeteo}
              onChange={(e) => setCondizioniMeteo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            >
              <option value="">Seleziona...</option>
              <option value="☀️">☀️ Soleggiato</option>
              <option value="🌤️">🌤️ Parzialmente nuvoloso</option>
              <option value="☁️">☁️ Nuvoloso</option>
              <option value="🌧️">🌧️ Pioggia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>Completamento Report</span>
          <span style={{ fontWeight: '700', color: '#10b981' }}>{completionPercentage}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '1rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Section 1: Pulizia pannelli */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 1. Pulizia pannelli
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Ultima pulizia effettuata
            </label>
            <input
              type="text"
              value={ultimaPulizia}
              onChange={(e) => setUltimaPulizia(e.target.value)}
              placeholder="es. 15/10/2024"
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
              Stato pannelli
            </label>
            <select
              value={statoPannelli}
              onChange={(e) => setStatoPannelli(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            >
              <option value="">Seleziona...</option>
              <option value="puliti">Puliti</option>
              <option value="polvere">Polvere</option>
              <option value="foglie">Foglie</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Intervento necessario?
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="interventoNecessario"
                value="Sì"
                checked={interventoNecessario === 'Sì'}
                onChange={(e) => setInterventoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="interventoNecessario"
                value="No"
                checked={interventoNecessario === 'No'}
                onChange={(e) => setInterventoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={notePulizia}
            onChange={(e) => setNotePulizia(e.target.value)}
            placeholder="Note sulla pulizia dei pannelli..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 2: Ispezione visiva */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 2. Ispezione visiva
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Danni fisici ai moduli
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="danniFisici"
                value="Sì"
                checked={danniFisici === 'Sì'}
                onChange={(e) => setDanniFisici(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="danniFisici"
                value="No"
                checked={danniFisici === 'No'}
                onChange={(e) => setDanniFisici(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Telaio / supporti integri
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="telaioSupporti"
                value="Sì"
                checked={telaioSupporti === 'Sì'}
                onChange={(e) => setTelaioSupporti(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="telaioSupporti"
                value="No"
                checked={telaioSupporti === 'No'}
                onChange={(e) => setTelaioSupporti(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Cablaggi e connettori integri
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="cabblaggiConnettori"
                value="Sì"
                checked={cabblaggiConnettori === 'Sì'}
                onChange={(e) => setCabblaggiConnettori(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="cabblaggiConnettori"
                value="No"
                checked={cabblaggiConnettori === 'No'}
                onChange={(e) => setCabblaggiConnettori(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteIspezione}
            onChange={(e) => setNoteIspezione(e.target.value)}
            placeholder="Note sull'ispezione visiva..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 3: Inverter */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 3. Inverter
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Modello
            </label>
            <input
              type="text"
              value={modelloInverter}
              onChange={(e) => setModelloInverter(e.target.value)}
              placeholder="Marca e modello inverter"
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
              Produzione attuale (kWh)
            </label>
            <input
              type="number"
              value={produzioneAttuale}
              onChange={(e) => setProduzioneAttuale(e.target.value)}
              placeholder="es. 1500"
              step="0.1"
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Messaggi di errore presenti?
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="messaggiErrore"
                value="Sì"
                checked={messaggiErrore === 'Sì'}
                onChange={(e) => setMessaggiErrore(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="messaggiErrore"
                value="No"
                checked={messaggiErrore === 'No'}
                onChange={(e) => setMessaggiErrore(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Ventole / raffreddamento funzionanti
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="ventoleRaffreddamento"
                value="Sì"
                checked={ventoleRaffreddamento === 'Sì'}
                onChange={(e) => setVentoleRaffreddamento(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="ventoleRaffreddamento"
                value="No"
                checked={ventoleRaffreddamento === 'No'}
                onChange={(e) => setVentoleRaffreddamento(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteInverter}
            onChange={(e) => setNoteInverter(e.target.value)}
            placeholder="Note sull'inverter..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 4: Connessioni elettriche */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 4. Connessioni elettriche
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Contatti serrati e privi di corrosione
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="contattiSerrati"
                value="Sì"
                checked={contattiSerrati === 'Sì'}
                onChange={(e) => setContattiSerrati(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="contattiSerrati"
                value="No"
                checked={contattiSerrati === 'No'}
                onChange={(e) => setContattiSerrati(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Quadro elettrico in buone condizioni
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="quadroElettrico"
                value="Sì"
                checked={quadroElettrico === 'Sì'}
                onChange={(e) => setQuadroElettrico(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="quadroElettrico"
                value="No"
                checked={quadroElettrico === 'No'}
                onChange={(e) => setQuadroElettrico(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteConnessioni}
            onChange={(e) => setNoteConnessioni(e.target.value)}
            placeholder="Note sulle connessioni elettriche..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 5: Sistema di accumulo */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 5. Sistema di accumulo (se presente)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Tipo di batteria
            </label>
            <input
              type="text"
              value={tipoBatteria}
              onChange={(e) => setTipoBatteria(e.target.value)}
              placeholder="es. Li-ion 10kWh"
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
              Stato di carica medio (%)
            </label>
            <input
              type="text"
              value={statoCarica}
              onChange={(e) => setStatoCarica(e.target.value)}
              placeholder="es. 85"
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Anomalie rilevate
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="anomalieRilevate"
                value="Sì"
                checked={anomalieRilevate === 'Sì'}
                onChange={(e) => setAnomalieRilevate(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="anomalieRilevate"
                value="No"
                checked={anomalieRilevate === 'No'}
                onChange={(e) => setAnomalieRilevate(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteAccumulo}
            onChange={(e) => setNoteAccumulo(e.target.value)}
            placeholder="Note sul sistema di accumulo..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 6: Produzione e rendimento */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 6. Produzione e rendimento
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Produzione giornaliera (kWh)
            </label>
            <input
              type="number"
              value={produzioneGiornaliera}
              onChange={(e) => setProduzioneGiornaliera(e.target.value)}
              placeholder="es. 25"
              step="0.1"
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
              Produzione mensile (kWh)
            </label>
            <input
              type="number"
              value={produzioneMensile}
              onChange={(e) => setProduzioneMensile(e.target.value)}
              placeholder="es. 750"
              step="0.1"
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
              Scostamento valori attesi (%)
            </label>
            <input
              type="text"
              value={scostamentoValori}
              onChange={(e) => setScostamentoValori(e.target.value)}
              placeholder="es. +5%"
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

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteProduzione}
            onChange={(e) => setNoteProduzione(e.target.value)}
            placeholder="Note sulla produzione e rendimento..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 7: Strutture e sicurezza */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 7. Strutture e sicurezza
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Supporti e staffe stabili
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="supportiStaffe"
                value="Sì"
                checked={supportiStaffe === 'Sì'}
                onChange={(e) => setSupportiStaffe(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="supportiStaffe"
                value="No"
                checked={supportiStaffe === 'No'}
                onChange={(e) => setSupportiStaffe(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Accesso all'impianto sicuro
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="accessoImpianto"
                value="Sì"
                checked={accessoImpianto === 'Sì'}
                onChange={(e) => setAccessoImpianto(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="accessoImpianto"
                value="No"
                checked={accessoImpianto === 'No'}
                onChange={(e) => setAccessoImpianto(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Protezioni da sovratensione funzionanti
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="protezioniSovratensione"
                value="Sì"
                checked={protezioniSovratensione === 'Sì'}
                onChange={(e) => setProtezioniSovratensione(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="protezioniSovratensione"
                value="No"
                checked={protezioniSovratensione === 'No'}
                onChange={(e) => setProtezioniSovratensione(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteStrutture}
            onChange={(e) => setNoteStrutture(e.target.value)}
            placeholder="Note su strutture e sicurezza..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 8: Aggiornamenti e firmware */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 8. Aggiornamenti e firmware
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Ultimo aggiornamento inverter
          </label>
          <input
            type="text"
            value={ultimoAggiornamento}
            onChange={(e) => setUltimoAggiornamento(e.target.value)}
            placeholder="es. 01/10/2024"
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Aggiornamento necessario?
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="aggiornamentoNecessario"
                value="Sì"
                checked={aggiornamentoNecessario === 'Sì'}
                onChange={(e) => setAggiornamentoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="aggiornamentoNecessario"
                value="No"
                checked={aggiornamentoNecessario === 'No'}
                onChange={(e) => setAggiornamentoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981' }}
              />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📝 Note
          </label>
          <textarea
            value={noteFirmware}
            onChange={(e) => setNoteFirmware(e.target.value)}
            placeholder="Note su aggiornamenti e firmware..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Section 9: Osservazioni generali */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          🔹 9. Osservazioni generali
        </h3>

        <textarea
          value={osservazioniGenerali}
          onChange={(e) => setOsservazioniGenerali(e.target.value)}
          placeholder="Inserisci osservazioni generali sull'impianto, raccomandazioni, prossimi interventi previsti..."
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
        />
      </div>

      {/* Signatures */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          ✍️ Firme e Accettazione
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: confermatoTecnico ? '#f0fdf4' : '#f9fafb',
            border: `2px solid ${confermatoTecnico ? '#10b981' : '#e5e7eb'}`,
            transition: 'all 0.2s'
          }}>
            <input
              type="checkbox"
              checked={confermatoTecnico}
              onChange={(e) => setConfermatoTecnico(e.target.checked)}
              style={{
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: confermatoTecnico ? '#065f46' : '#374151',
              fontWeight: confermatoTecnico ? '600' : '400'
            }}>
              Confermato dal tecnico (firma per accettazione)
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: accettazioneProprietario ? '#f0fdf4' : '#f9fafb',
            border: `2px solid ${accettazioneProprietario ? '#10b981' : '#e5e7eb'}`,
            transition: 'all 0.2s'
          }}>
            <input
              type="checkbox"
              checked={accettazioneProprietario}
              onChange={(e) => setAccettazioneProprietario(e.target.checked)}
              style={{
                width: '1.25rem',
                height: '1.25rem',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: accettazioneProprietario ? '#065f46' : '#374151',
              fontWeight: accettazioneProprietario ? '600' : '400'
            }}>
              Accettazione proprietario (firma per accettazione)
            </span>
          </label>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          📸 Documentazione Fotografica
        </h3>

        {/* Upload Button */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            📷 Carica Foto
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
          <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'foto caricata' : 'foto caricate'}
          </span>
        </div>

        {/* Photo Gallery */}
        {uploadedPhotos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {uploadedPhotos.map((photo, index) => (
              <div key={index} style={{
                position: 'relative',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <img
                  src={photo.preview}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '1.5rem',
                    height: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  title="Rimuovi foto"
                >
                  ✕
                </button>
                <div style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {photo.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadedPhotos.length === 0 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '2px dashed #e5e7eb'
          }}>
            Nessuna foto caricata. Carica foto dell'impianto per la documentazione.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={saveChecklist}
          style={{
            flex: 1,
            padding: '1.25rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'white',
            backgroundColor: '#10b981',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          💾 Salva Report ({completionPercentage}% completato)
        </button>

        <button
          onClick={generatePDF}
          disabled={generatingPDF}
          style={{
            flex: 1,
            padding: '1.25rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'white',
            backgroundColor: generatingPDF ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: generatingPDF ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!generatingPDF) e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            if (!generatingPDF) e.target.style.backgroundColor = '#3b82f6';
          }}
        >
          {generatingPDF ? '⏳ Generazione PDF...' : '📄 Genera PDF'}
        </button>
      </div>
    </div>
  );
}

export default InstallationChecklist;
