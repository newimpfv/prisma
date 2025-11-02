import { useState, useEffect, useRef } from 'react';
import { useForm } from '../../context/FormContext';
import html2pdf from 'html2pdf.js';
import SignatureCanvas from 'react-signature-canvas';
import { getInstallationsForClient, createInstallation, updateInstallation, getInstallations, linkInstallationToClient } from '../../services/installations';
import { isOnline } from '../../services/airtable';

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

  // Signature canvas refs (react-signature-canvas)
  const tecnicoSigPad = useRef(null);
  const proprietarioSigPad = useRef(null);
  const [tecnicoSignature, setTecnicoSignature] = useState(null);
  const [proprietarioSignature, setProprietarioSignature] = useState(null);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Installation/Impianto management
  const [clientInstallations, setClientInstallations] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [showInstallationSelector, setShowInstallationSelector] = useState(false);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [creatingInstallation, setCreatingInstallation] = useState(false);
  const [newInstallationName, setNewInstallationName] = useState('');

  // Search all installations
  const [allInstallations, setAllInstallations] = useState([]);
  const [installationSearchQuery, setInstallationSearchQuery] = useState('');
  const [showSearchAllInstallations, setShowSearchAllInstallations] = useState(false);
  const [loadingAllInstallations, setLoadingAllInstallations] = useState(false);

  // Auto-populate location from selected client
  useEffect(() => {
    if (selectedClientRecord) {
      // Build address from client's installation location
      const addressParts = [];

      if (selectedClientRecord.indirizzo_impianto) {
        addressParts.push(selectedClientRecord.indirizzo_impianto);
      }

      if (selectedClientRecord.citta_impianto) {
        addressParts.push(selectedClientRecord.citta_impianto);
      }

      if (selectedClientRecord.cap_impianto) {
        addressParts.push(selectedClientRecord.cap_impianto);
      }

      const fullAddress = addressParts.join(', ');

      if (fullAddress && !luogoImpianto) {
        setLuogoImpianto(fullAddress);
      }
    }
  }, [selectedClientRecord]);

  // Load installations for selected client
  useEffect(() => {
    const loadInstallations = async () => {
      if (!selectedClientRecord || !isOnline()) {
        setClientInstallations([]);
        setSelectedInstallation(null);
        return;
      }

      setLoadingInstallations(true);
      try {
        const installations = await getInstallationsForClient(selectedClientRecord.id || selectedClientRecord.airtableId);
        setClientInstallations(installations);

        // Auto-select if only one installation
        if (installations.length === 1) {
          setSelectedInstallation(installations[0]);
        } else {
          setSelectedInstallation(null);
        }
      } catch (error) {
        console.error('Error loading installations:', error);
        setClientInstallations([]);
      } finally {
        setLoadingInstallations(false);
      }
    };

    loadInstallations();
  }, [selectedClientRecord]);

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
    // Count only essential/required fields (excluding optional notes)
    let total = 0;
    let filled = 0;

    // Basic fields (4) - All required
    total += 4;
    if (luogoImpianto) filled++;
    if (tecnicoResponsabile) filled++;
    if (condizioniMeteo) filled++;
    if (visitDate) filled++;

    // Section 1: Pulizia pannelli (3 essential fields, notes optional)
    total += 3;
    if (ultimaPulizia) filled++;
    if (statoPannelli) filled++;
    if (interventoNecessario) filled++;

    // Section 2: Ispezione visiva (3 essential fields, notes optional)
    total += 3;
    if (danniFisici) filled++;
    if (telaioSupporti) filled++;
    if (cabblaggiConnettori) filled++;

    // Section 3: Inverter (4 essential fields, notes optional)
    total += 4;
    if (modelloInverter) filled++;
    if (messaggiErrore) filled++;
    if (produzioneAttuale) filled++;
    if (ventoleRaffreddamento) filled++;

    // Section 4: Connessioni elettriche (2 essential fields, notes optional)
    total += 2;
    if (contattiSerrati) filled++;
    if (quadroElettrico) filled++;

    // Section 5: Sistema di accumulo (3 essential fields, notes optional)
    total += 3;
    if (tipoBatteria) filled++;
    if (statoCarica) filled++;
    if (anomalieRilevate) filled++;

    // Section 6: Produzione e rendimento (3 essential fields, notes optional)
    total += 3;
    if (produzioneGiornaliera) filled++;
    if (produzioneMensile) filled++;
    if (scostamentoValori) filled++;

    // Section 7: Strutture e sicurezza (3 essential fields, notes optional)
    total += 3;
    if (supportiStaffe) filled++;
    if (accessoImpianto) filled++;
    if (protezioniSovratensione) filled++;

    // Section 8: Aggiornamenti e firmware (2 essential fields, notes optional)
    total += 2;
    if (ultimoAggiornamento) filled++;
    if (aggiornamentoNecessario) filled++;

    // Signatures (2 fields - osservazioni generali is optional)
    total += 2;
    if (confermatoTecnico) filled++;
    if (accettazioneProprietario) filled++;

    // Total: 29 essential fields
    return Math.round((filled / total) * 100);
  };

  const getSectionCompletion = (section) => {
    // Helper to show completion per section
    switch(section) {
      case 1: // Pulizia pannelli
        return [ultimaPulizia, statoPannelli, interventoNecessario].filter(Boolean).length;
      case 2: // Ispezione visiva
        return [danniFisici, telaioSupporti, cabblaggiConnettori].filter(Boolean).length;
      case 3: // Inverter
        return [modelloInverter, messaggiErrore, produzioneAttuale, ventoleRaffreddamento].filter(Boolean).length;
      case 4: // Connessioni elettriche
        return [contattiSerrati, quadroElettrico].filter(Boolean).length;
      case 5: // Sistema di accumulo
        return [tipoBatteria, statoCarica, anomalieRilevate].filter(Boolean).length;
      case 6: // Produzione e rendimento
        return [produzioneGiornaliera, produzioneMensile, scostamentoValori].filter(Boolean).length;
      case 7: // Strutture e sicurezza
        return [supportiStaffe, accessoImpianto, protezioniSovratensione].filter(Boolean).length;
      case 8: // Aggiornamenti e firmware
        return [ultimoAggiornamento, aggiornamentoNecessario].filter(Boolean).length;
      default:
        return 0;
    }
  };

  // Signature functions using react-signature-canvas
  const clearTecnicoSignature = () => {
    if (tecnicoSigPad.current) {
      tecnicoSigPad.current.clear();
    }
    setTecnicoSignature(null);
  };

  const saveTecnicoSignature = () => {
    if (tecnicoSigPad.current && !tecnicoSigPad.current.isEmpty()) {
      const dataURL = tecnicoSigPad.current.toDataURL('image/png');
      setTecnicoSignature(dataURL);
    } else {
      alert('⚠️ Per favore firma prima di salvare');
    }
  };

  const clearProprietarioSignature = () => {
    if (proprietarioSigPad.current) {
      proprietarioSigPad.current.clear();
    }
    setProprietarioSignature(null);
  };

  const saveProprietarioSignature = () => {
    if (proprietarioSigPad.current && !proprietarioSigPad.current.isEmpty()) {
      const dataURL = proprietarioSigPad.current.toDataURL('image/png');
      setProprietarioSignature(dataURL);
    } else {
      alert('⚠️ Per favore firma prima di salvare');
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
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
          @page { margin: 15mm; }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #10b981;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 18px;
            color: #1f2937;
            margin-top: 8px;
          }
          .info-section {
            background-color: #f0fdf4;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border: 2px solid #10b981;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          .info-label {
            font-weight: 600;
            color: #065f46;
          }
          .info-value {
            color: #047857;
            text-align: right;
          }
          .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            background-color: #ffffff;
          }
          .section-title {
            color: #1f2937;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #10b981;
          }
          .field-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 4px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 11px;
          }
          .field-row:last-of-type {
            border-bottom: none;
          }
          .field-label {
            font-weight: 600;
            color: #374151;
            flex: 1;
          }
          .field-value {
            color: #065f46;
            font-weight: 500;
            text-align: right;
            flex: 0 0 auto;
            max-width: 50%;
          }
          .notes {
            background-color: #fffbeb;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
            font-size: 10px;
            color: #78350f;
            white-space: pre-wrap;
            border-left: 3px solid #f59e0b;
          }
          .notes strong {
            color: #92400e;
          }
          .photos-section {
            margin-top: 20px;
            page-break-before: always;
          }
          .photos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          .photo-item {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          .photo-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          .photo-caption {
            padding: 5px;
            font-size: 9px;
            color: #6b7280;
            background-color: #f9fafb;
            text-align: center;
          }
          .signature-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 45%;
            border-top: 2px solid #374151;
            padding-top: 10px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            min-height: 60px;
          }
          .signature-status {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
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
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${client.nome || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data del controllo:</span>
              <span class="info-value">${formatDate(visitDate)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Luogo impianto:</span>
              <span class="info-value">${luogoImpianto || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tecnico:</span>
              <span class="info-value">${tecnicoResponsabile || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Condizioni meteo:</span>
              <span class="info-value">${condizioniMeteo || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Completamento:</span>
              <span class="info-value">${completionPercentage}%</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🔹 1. Pulizia pannelli</div>
          <div class="field-row">
            <span class="field-label">Ultima pulizia effettuata:</span>
            <span class="field-value">${formatDate(ultimaPulizia)}</span>
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
            <span class="field-value">${scostamentoValori || 'N/A'}</span>
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
            <span class="field-value">${formatDate(ultimoAggiornamento)}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Aggiornamento necessario?</span>
            <span class="field-value">${aggiornamentoNecessario || 'N/A'}</span>
          </div>
          ${noteFirmware ? `<div class="notes"><strong>Note:</strong><br>${noteFirmware}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">🔹 9. Osservazioni generali</div>
          ${osservazioniGenerali ? `<div class="notes">${osservazioniGenerali}</div>` : '<p style="color: #9ca3af; font-style: italic; margin: 0;">Nessuna osservazione</p>'}
        </div>

        ${uploadedPhotos.length > 0 ? `
        <div class="photos-section">
          <div class="section-title">📸 Documentazione Fotografica</div>
          <div class="photos-grid">
            ${uploadedPhotos.map((photo, index) => `
              <div class="photo-item">
                <img src="${photo.preview}" alt="Foto ${index + 1}" />
                <div class="photo-caption">Foto ${index + 1} - ${photo.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-status">${confermatoTecnico ? '☑' : '☐'} Confermato dal tecnico</div>
            ${tecnicoSignature ? `
              <div style="margin-top: 10px; border: 1px solid #ddd; padding: 5px; background: white;">
                <img src="${tecnicoSignature}" alt="Firma Tecnico" style="max-width: 200px; max-height: 80px; display: block;" />
              </div>
            ` : `
              <div style="margin-top: 10px;">_______________________</div>
              <div style="margin-top: 5px; font-size: 9px;">Firma e data</div>
            `}
          </div>
          <div class="signature-box">
            <div class="signature-status">${accettazioneProprietario ? '☑' : '☐'} Accettazione proprietario</div>
            ${proprietarioSignature ? `
              <div style="margin-top: 10px; border: 1px solid #ddd; padding: 5px; background: white;">
                <img src="${proprietarioSignature}" alt="Firma Proprietario" style="max-width: 200px; max-height: 80px; display: block;" />
              </div>
            ` : `
              <div style="margin-top: 10px;">_______________________</div>
              <div style="margin-top: 5px; font-size: 9px;">Firma e data</div>
            `}
          </div>
        </div>

        <div class="footer">
          Documento generato automaticamente dal sistema PRISMA<br>
          Data di generazione: ${new Date().toLocaleDateString('it-IT')} - Ora: ${new Date().toLocaleTimeString('it-IT')}
        </div>
      </body>
      </html>
    `;
  };

  // Handle creating new installation
  const handleCreateInstallation = async () => {
    if (!newInstallationName.trim()) {
      alert('⚠️ Inserisci un nome per l\'impianto');
      return;
    }

    if (!isOnline()) {
      alert('❌ Impossibile creare impianto offline');
      return;
    }

    setCreatingInstallation(true);
    try {
      const installationData = {
        nome: newInstallationName,
        indirizzo: luogoImpianto || selectedClientRecord.indirizzo_impianto || '',
        dettagli_moduli: 'Da definire',
        n_moduli_totali: 0,
        status_offerta: 'attivo',
        status_realizzazione: 'completato',
        simulazione_render: 'N/A',
        impianto_completato: true,
        compenso: 0
      };

      const newInstallation = await createInstallation(
        installationData,
        selectedClientRecord.id || selectedClientRecord.airtableId
      );

      // Add to list and select it
      setClientInstallations(prev => [...prev, newInstallation]);
      setSelectedInstallation(newInstallation);
      setNewInstallationName('');
      setShowInstallationSelector(false);
      alert('✅ Impianto creato e selezionato!');
    } catch (error) {
      console.error('Error creating installation:', error);
      alert(`❌ Errore durante la creazione dell'impianto: ${error.message}`);
    } finally {
      setCreatingInstallation(false);
    }
  };

  // Check if we need to show installation selector
  const needsInstallationSelection = () => {
    return !selectedInstallation && clientInstallations.length !== 1;
  };

  // Load all installations
  const loadAllInstallations = async () => {
    if (!isOnline()) return;

    setLoadingAllInstallations(true);
    try {
      const { installations } = await getInstallations();
      setAllInstallations(installations);
    } catch (error) {
      console.error('Error loading all installations:', error);
      setAllInstallations([]);
    } finally {
      setLoadingAllInstallations(false);
    }
  };

  // Toggle search all installations
  const toggleSearchAllInstallations = async () => {
    if (!showSearchAllInstallations && allInstallations.length === 0) {
      await loadAllInstallations();
    }
    setShowSearchAllInstallations(!showSearchAllInstallations);
    setInstallationSearchQuery('');
  };

  // Filter installations by search query
  const getFilteredInstallations = () => {
    const clientInstallatiosIds = clientInstallations.map(i => i.id || i.airtableId);

    // Show all installations, not just unlinked ones
    let filteredInstallations = allInstallations;

    if (!installationSearchQuery.trim()) {
      return filteredInstallations;
    }

    const query = installationSearchQuery.toLowerCase();
    return filteredInstallations.filter(installation =>
      (installation.nome && installation.nome.toLowerCase().includes(query)) ||
      (installation.indirizzo && installation.indirizzo.toLowerCase().includes(query))
    );
  };

  // Handle selecting an installation from search
  const handleSelectInstallationFromSearch = async (installation) => {
    const clientId = selectedClientRecord.id || selectedClientRecord.airtableId;
    const isAlreadyLinked = clientInstallations.some(i => (i.id || i.airtableId) === (installation.id || installation.airtableId));

    if (!isAlreadyLinked) {
      // Link installation to client
      try {
        await linkInstallationToClient(installation.id || installation.airtableId, clientId);
        // Add to client installations
        setClientInstallations(prev => [...prev, installation]);
        alert(`✅ Impianto "${installation.nome}" collegato al cliente!`);
      } catch (error) {
        console.error('Error linking installation:', error);
        alert(`❌ Errore nel collegamento dell'impianto: ${error.message}`);
        return;
      }
    }

    setSelectedInstallation(installation);
    setShowSearchAllInstallations(false);
    setShowInstallationSelector(false);
    setInstallationSearchQuery('');
  };

  // Generate PDF and download locally
  const generatePDF = async () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di generare il PDF');
      return;
    }

    setGeneratingPDF(true);

    try {
      // Generate HTML content
      const htmlContent = generateChecklistHTML();

      // Create a temporary container with inner wrapper
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm'; // A4 width

      // Create inner content div
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = htmlContent;
      contentDiv.style.backgroundColor = 'white';
      contentDiv.style.padding = '20px';

      tempContainer.appendChild(contentDiv);
      document.body.appendChild(tempContainer);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Report_Manutenzione_${selectedClientRecord.nome.replace(/\s+/g, '_')}_${visitDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF - use contentDiv directly
      await html2pdf().set(opt).from(contentDiv).save();

      // Clean up
      document.body.removeChild(tempContainer);

      alert('✅ PDF generato e scaricato con successo!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`❌ Errore durante la generazione del PDF: ${error.message}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Generate PDF and save to Airtable
  const generateAndSavePDFToAirtable = async () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di salvare il report');
      return;
    }

    if (!isOnline()) {
      alert('❌ Impossibile salvare su Airtable offline');
      return;
    }

    // Check if installation is selected
    if (!selectedInstallation) {
      if (clientInstallations.length === 0) {
        // No installations, need to create one
        alert('⚠️ Nessun impianto trovato per questo cliente.\n\nCrea un nuovo impianto prima di salvare il report.');
        setShowInstallationSelector(true);
        return;
      } else if (clientInstallations.length > 1) {
        // Multiple installations, need to select one
        alert('⚠️ Questo cliente ha più impianti.\n\nSeleziona l\'impianto a cui associare il report.');
        setShowInstallationSelector(true);
        return;
      }
    }

    setGeneratingPDF(true);

    try {
      // Generate HTML content
      const htmlContent = generateChecklistHTML();

      // Create a temporary container with inner wrapper
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm'; // A4 width

      // Create inner content div
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = htmlContent;
      contentDiv.style.backgroundColor = 'white';
      contentDiv.style.padding = '20px';

      tempContainer.appendChild(contentDiv);
      document.body.appendChild(tempContainer);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF and get the jsPDF object
      const pdf = await html2pdf().set(opt).from(contentDiv).toPdf().get('pdf');

      // Get PDF as Blob
      const pdfBlob = pdf.output('blob');

      // Clean up
      document.body.removeChild(tempContainer);

      const filename = `Report_Manutenzione_${selectedClientRecord.nome.replace(/\s+/g, '_')}_${visitDate}.pdf`;

      // Upload PDF to temporary hosting to get a public URL for Airtable
      // Using file.io - free temporary file hosting
      const formData = new FormData();
      formData.append('file', pdfBlob, filename);

      const uploadResponse = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        throw new Error(`Errore upload file: ${uploadResponse.status} - ${errorData}`);
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(`Errore upload: ${uploadData.message || 'Upload fallito'}`);
      }

      const pdfUrl = uploadData.link;
      console.log('PDF uploaded to temporary storage:', pdfUrl);

      // Now save to Airtable with the public URL
      const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
      const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const INSTALLATIONS_TABLE = 'tblp0aOjMtrn7kCv1';

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${INSTALLATIONS_TABLE}/${selectedInstallation.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              report_manutenzione: [
                {
                  url: pdfUrl,
                  filename: filename
                }
              ]
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
      }

      // Also save to localStorage
      saveChecklist();

      alert(`✅ Report salvato con successo!\n\n📍 Impianto: ${selectedInstallation.nome}\n📄 File: ${filename}\n\nIl PDF è stato caricato su Airtable.`);

    } catch (error) {
      console.error('Error saving PDF to Airtable:', error);
      alert(`❌ Errore durante il salvataggio del report: ${error.message}`);
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

      {/* Installation Selection */}
      {isOnline() && (
        <div style={{
          backgroundColor: selectedInstallation ? '#f0fdf4' : '#fef3c7',
          border: `2px solid ${selectedInstallation ? '#10b981' : '#f59e0b'}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: selectedInstallation ? '#065f46' : '#92400e',
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                🏠 Impianto di destinazione
              </h3>
              {selectedInstallation ? (
                <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                  ✅ <strong>{selectedInstallation.nome}</strong>
                  {selectedInstallation.indirizzo && <span> - {selectedInstallation.indirizzo}</span>}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                  {loadingInstallations ? '⏳ Caricamento impianti...' : '⚠️ Nessun impianto selezionato'}
                </div>
              )}
            </div>
            {!loadingInstallations && (
              <button
                onClick={() => setShowInstallationSelector(!showInstallationSelector)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                {showInstallationSelector ? '✕ Chiudi' : clientInstallations.length === 0 ? '+ Crea' : '🔄 Cambia'}
              </button>
            )}
          </div>

          {/* Installation Selector UI */}
          {showInstallationSelector && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              {/* Existing Installations */}
              {clientInstallations.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                    Seleziona Impianto ({clientInstallations.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {clientInstallations.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          setSelectedInstallation(inst);
                          setShowInstallationSelector(false);
                        }}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          backgroundColor: selectedInstallation?.id === inst.id ? '#eff6ff' : '#f9fafb',
                          border: selectedInstallation?.id === inst.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                          {selectedInstallation?.id === inst.id && '✓ '}{inst.nome}
                        </div>
                        {inst.indirizzo && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📍 {inst.indirizzo}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Installation */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                  {clientInstallations.length > 0 ? 'Oppure Crea Nuovo Impianto' : 'Crea Nuovo Impianto'}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newInstallationName}
                    onChange={(e) => setNewInstallationName(e.target.value)}
                    placeholder="Nome impianto (es: Impianto Villa)"
                    disabled={creatingInstallation}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleCreateInstallation}
                    disabled={creatingInstallation || !newInstallationName.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: creatingInstallation || !newInstallationName.trim() ? '#9ca3af' : '#10b981',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: creatingInstallation || !newInstallationName.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {creatingInstallation ? '⏳' : '✓ Crea'}
                  </button>
                </div>
              </div>

              {/* Search All Installations */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.5rem',
                border: '2px dashed #3b82f6'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: showSearchAllInstallations ? '0.75rem' : '0'
                }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: 0 }}>
                    🔍 Cerca tra tutti gli impianti
                  </h4>
                  <button
                    onClick={toggleSearchAllInstallations}
                    disabled={loadingAllInstallations}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: loadingAllInstallations ? '#9ca3af' : '#3b82f6',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: loadingAllInstallations ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loadingAllInstallations ? '⏳' : showSearchAllInstallations ? '✕ Chiudi' : '🔍 Cerca'}
                  </button>
                </div>

                {showSearchAllInstallations && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="🔍 Cerca impianto per nome o indirizzo..."
                      value={installationSearchQuery}
                      onChange={(e) => setInstallationSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '2px solid #bfdbfe',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#bfdbfe'}
                    />

                    <div style={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {getFilteredInstallations().length > 0 ? (
                        getFilteredInstallations().map(installation => {
                          const isLinked = clientInstallations.some(i => (i.id || i.airtableId) === (installation.id || installation.airtableId));
                          return (
                            <div
                              key={installation.id || installation.airtableId}
                              style={{
                                padding: '0.75rem',
                                border: `2px solid ${isLinked ? '#10b981' : '#e2e8f0'}`,
                                borderRadius: '0.375rem',
                                backgroundColor: isLinked ? '#f0fdf4' : 'white'
                              }}
                            >
                              <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                                  {isLinked && '✓ '}{installation.nome || 'Impianto senza nome'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {installation.indirizzo || 'Indirizzo non specificato'}
                                </div>
                                {isLinked && (
                                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem', fontWeight: '600' }}>
                                    ✓ Già collegato a questo cliente
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectInstallationFromSearch(installation)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <span>{isLinked ? '✓ Seleziona' : '+ Collega e Seleziona'}</span>
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
                          {installationSearchQuery ? '🔍 Nessun impianto trovato' : '📋 Digita per cercare tra tutti gli impianti'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Ultima pulizia effettuata
            </label>
            <input
              type="date"
              value={ultimaPulizia}
              onChange={(e) => setUltimaPulizia(e.target.value)}
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
              <option value="sporchi">Sporchi</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Intervento necessario?
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: interventoNecessario === 'Sì' ? '#f0fdf4' : 'white', borderRadius: '0.5rem', border: interventoNecessario === 'Sì' ? '2px solid #10b981' : '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500', minWidth: '100px', justifyContent: 'center' }}>
              <input
                type="radio"
                name="interventoNecessario"
                value="Sì"
                checked={interventoNecessario === 'Sì'}
                onChange={(e) => setInterventoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: interventoNecessario === 'No' ? '#f0fdf4' : 'white', borderRadius: '0.5rem', border: interventoNecessario === 'No' ? '2px solid #10b981' : '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500', minWidth: '100px', justifyContent: 'center' }}>
              <input
                type="radio"
                name="interventoNecessario"
                value="No"
                checked={interventoNecessario === 'No'}
                onChange={(e) => setInterventoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="danniFisici"
                value="Sì"
                checked={danniFisici === 'Sì'}
                onChange={(e) => setDanniFisici(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="danniFisici"
                value="No"
                checked={danniFisici === 'No'}
                onChange={(e) => setDanniFisici(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="telaioSupporti"
                value="Sì"
                checked={telaioSupporti === 'Sì'}
                onChange={(e) => setTelaioSupporti(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="telaioSupporti"
                value="No"
                checked={telaioSupporti === 'No'}
                onChange={(e) => setTelaioSupporti(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="cabblaggiConnettori"
                value="Sì"
                checked={cabblaggiConnettori === 'Sì'}
                onChange={(e) => setCabblaggiConnettori(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="cabblaggiConnettori"
                value="No"
                checked={cabblaggiConnettori === 'No'}
                onChange={(e) => setCabblaggiConnettori(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="messaggiErrore"
                value="Sì"
                checked={messaggiErrore === 'Sì'}
                onChange={(e) => setMessaggiErrore(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="messaggiErrore"
                value="No"
                checked={messaggiErrore === 'No'}
                onChange={(e) => setMessaggiErrore(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="ventoleRaffreddamento"
                value="Sì"
                checked={ventoleRaffreddamento === 'Sì'}
                onChange={(e) => setVentoleRaffreddamento(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="ventoleRaffreddamento"
                value="No"
                checked={ventoleRaffreddamento === 'No'}
                onChange={(e) => setVentoleRaffreddamento(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="contattiSerrati"
                value="Sì"
                checked={contattiSerrati === 'Sì'}
                onChange={(e) => setContattiSerrati(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="contattiSerrati"
                value="No"
                checked={contattiSerrati === 'No'}
                onChange={(e) => setContattiSerrati(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="quadroElettrico"
                value="Sì"
                checked={quadroElettrico === 'Sì'}
                onChange={(e) => setQuadroElettrico(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="quadroElettrico"
                value="No"
                checked={quadroElettrico === 'No'}
                onChange={(e) => setQuadroElettrico(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="anomalieRilevate"
                value="Sì"
                checked={anomalieRilevate === 'Sì'}
                onChange={(e) => setAnomalieRilevate(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="anomalieRilevate"
                value="No"
                checked={anomalieRilevate === 'No'}
                onChange={(e) => setAnomalieRilevate(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="supportiStaffe"
                value="Sì"
                checked={supportiStaffe === 'Sì'}
                onChange={(e) => setSupportiStaffe(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="supportiStaffe"
                value="No"
                checked={supportiStaffe === 'No'}
                onChange={(e) => setSupportiStaffe(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="accessoImpianto"
                value="Sì"
                checked={accessoImpianto === 'Sì'}
                onChange={(e) => setAccessoImpianto(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="accessoImpianto"
                value="No"
                checked={accessoImpianto === 'No'}
                onChange={(e) => setAccessoImpianto(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="protezioniSovratensione"
                value="Sì"
                checked={protezioniSovratensione === 'Sì'}
                onChange={(e) => setProtezioniSovratensione(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="protezioniSovratensione"
                value="No"
                checked={protezioniSovratensione === 'No'}
                onChange={(e) => setProtezioniSovratensione(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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
            type="date"
            value={ultimoAggiornamento}
            onChange={(e) => setUltimoAggiornamento(e.target.value)}
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
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="aggiornamentoNecessario"
                value="Sì"
                checked={aggiornamentoNecessario === 'Sì'}
                onChange={(e) => setAggiornamentoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              Sì
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500' }}>
              <input
                type="radio"
                name="aggiornamentoNecessario"
                value="No"
                checked={aggiornamentoNecessario === 'No'}
                onChange={(e) => setAggiornamentoNecessario(e.target.value)}
                style={{ marginRight: '0.5rem', accentColor: '#10b981', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
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

          {/* Digital Signature - Tecnico */}
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f9fafb',
            border: '2px solid #e5e7eb'
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              ✍️ Firma Digitale Tecnico (opzionale)
            </label>

            {tecnicoSignature ? (
              <div>
                <img
                  src={tecnicoSignature}
                  alt="Firma Tecnico"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white'
                  }}
                />
                <button
                  type="button"
                  onClick={clearTecnicoSignature}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Cancella Firma
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  display: 'inline-block'
                }}>
                  <SignatureCanvas
                    ref={tecnicoSigPad}
                    canvasProps={{
                      width: 400,
                      height: 150,
                      className: 'signature-canvas'
                    }}
                    backgroundColor="white"
                    penColor="black"
                  />
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  👆 Firma qui con il dito o il mouse
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    type="button"
                    onClick={saveTecnicoSignature}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    ✅ Salva Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => tecnicoSigPad.current?.clear()}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    🔄 Ricomincia
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Digital Signature - Proprietario */}
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f9fafb',
            border: '2px solid #e5e7eb'
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              ✍️ Firma Digitale Proprietario (opzionale)
            </label>

            {proprietarioSignature ? (
              <div>
                <img
                  src={proprietarioSignature}
                  alt="Firma Proprietario"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white'
                  }}
                />
                <button
                  type="button"
                  onClick={clearProprietarioSignature}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Cancella Firma
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  display: 'inline-block'
                }}>
                  <SignatureCanvas
                    ref={proprietarioSigPad}
                    canvasProps={{
                      width: 400,
                      height: 150,
                      className: 'signature-canvas'
                    }}
                    backgroundColor="white"
                    penColor="black"
                  />
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  👆 Firma qui con il dito o il mouse
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    type="button"
                    onClick={saveProprietarioSignature}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    ✅ Salva Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => proprietarioSigPad.current?.clear()}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    🔄 Ricomincia
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Progress Bar */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#1f2937' }}>Completamento Report</span>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              29 campi essenziali (note escluse)
            </div>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: completionPercentage >= 100 ? '#10b981' : completionPercentage >= 75 ? '#3b82f6' : completionPercentage >= 50 ? '#f59e0b' : '#ef4444'
          }}>
            {completionPercentage}%
          </div>
        </div>

        {/* Main Progress Bar */}
        <div style={{
          width: '100%',
          height: '1.5rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '1rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            backgroundColor: completionPercentage >= 100 ? '#10b981' : completionPercentage >= 75 ? '#3b82f6' : completionPercentage >= 50 ? '#f59e0b' : '#ef4444',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'white'
          }}>
            {completionPercentage > 10 && `${completionPercentage}%`}
          </div>
        </div>

        {/* Section Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          {[
            { num: 1, name: 'Pulizia pannelli', total: 3 },
            { num: 2, name: 'Ispezione visiva', total: 3 },
            { num: 3, name: 'Inverter', total: 4 },
            { num: 4, name: 'Connessioni', total: 2 },
            { num: 5, name: 'Accumulo', total: 3 },
            { num: 6, name: 'Produzione', total: 3 },
            { num: 7, name: 'Strutture', total: 3 },
            { num: 8, name: 'Firmware', total: 2 }
          ].map(section => {
            const completed = getSectionCompletion(section.num);
            const isComplete = completed === section.total;
            return (
              <div key={section.num} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                padding: '0.5rem',
                backgroundColor: isComplete ? '#f0fdf4' : '#f9fafb',
                borderRadius: '0.375rem',
                border: `1px solid ${isComplete ? '#10b981' : '#e5e7eb'}`
              }}>
                <span style={{
                  fontSize: '1rem',
                  color: isComplete ? '#10b981' : '#9ca3af'
                }}>
                  {isComplete ? '✓' : '○'}
                </span>
                <span style={{
                  flex: 1,
                  color: isComplete ? '#065f46' : '#6b7280',
                  fontWeight: isComplete ? '600' : '400'
                }}>
                  {section.name}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: isComplete ? '#10b981' : '#9ca3af'
                }}>
                  {completed}/{section.total}
                </span>
              </div>
            );
          })}

          {/* Signatures */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            padding: '0.5rem',
            backgroundColor: (confermatoTecnico && accettazioneProprietario) ? '#f0fdf4' : '#f9fafb',
            borderRadius: '0.375rem',
            border: `1px solid ${(confermatoTecnico && accettazioneProprietario) ? '#10b981' : '#e5e7eb'}`
          }}>
            <span style={{
              fontSize: '1rem',
              color: (confermatoTecnico && accettazioneProprietario) ? '#10b981' : '#9ca3af'
            }}>
              {(confermatoTecnico && accettazioneProprietario) ? '✓' : '○'}
            </span>
            <span style={{
              flex: 1,
              color: (confermatoTecnico && accettazioneProprietario) ? '#065f46' : '#6b7280',
              fontWeight: (confermatoTecnico && accettazioneProprietario) ? '600' : '400'
            }}>
              Firme
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: (confermatoTecnico && accettazioneProprietario) ? '#10b981' : '#9ca3af'
            }}>
              {[confermatoTecnico, accettazioneProprietario].filter(Boolean).length}/2
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={generateAndSavePDFToAirtable}
          disabled={generatingPDF || !isOnline()}
          style={{
            width: '100%',
            padding: '1.25rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'white',
            backgroundColor: (generatingPDF || !isOnline()) ? '#9ca3af' : '#10b981',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (generatingPDF || !isOnline()) ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!generatingPDF && isOnline()) e.target.style.backgroundColor = '#059669';
          }}
          onMouseOut={(e) => {
            if (!generatingPDF && isOnline()) e.target.style.backgroundColor = '#10b981';
          }}
        >
          {generatingPDF ? '⏳ Salvataggio in corso...' : !isOnline() ? '📡 Offline - Impossibile salvare' : `💾 Salva Report su Airtable (${completionPercentage}% completato)`}
        </button>

        <button
          onClick={generatePDF}
          disabled={generatingPDF}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: generatingPDF ? '#6b7280' : '#3b82f6',
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            cursor: generatingPDF ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!generatingPDF) {
              e.target.style.backgroundColor = '#eff6ff';
            }
          }}
          onMouseOut={(e) => {
            if (!generatingPDF) {
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          {generatingPDF ? '⏳ Generazione PDF...' : '📄 Scarica PDF (solo locale)'}
        </button>
      </div>
    </div>
  );
}

export default InstallationChecklist;
