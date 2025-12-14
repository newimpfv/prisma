import { useState } from 'react';
import { useForm } from '../../context/FormContext';

const ExportButtons = () => {
  const [saveStatus, setSaveStatus] = useState('');
  const {
    clientData,
    structureData,
    falde,
    inverters,
    batteries,
    components,
    laborSafety,
    unitCosts,
    energyData,
    economicParams,
    quoteData,
    customText,
    pvgisData,
    renderImages,
    results
  } = useForm();

  const handleSaveFile = () => {
    try {
      // Prepare all data for export
      const data = {
        clientData,
        structureData,
        falde,
        inverters,
        batteries,
        components,
        laborSafety,
        unitCosts,
        energyData,
        economicParams,
        quoteData,
        customText,
        pvgisData,
        renderImages,
        results,
        // Metadata
        nomeFile: (clientData.nome && clientData.cognome ? `${clientData.nome}_${clientData.cognome}` : clientData.nome || clientData.nomeCognome || 'Cliente'),
        riferimentoPreventivo: quoteData.riferimentoPreventivo || 'draft',
        dataCreazione: new Date().toISOString(),
        appVersion: '4.0.0',
        fileVersion: '2.0'
      };

      // Convert to JSON
      const jsonData = JSON.stringify(data, null, 2);

      // Create blob
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      const fileName = `Preventivo_${data.nomeFile.replace(/\s+/g, '_')}_${data.riferimentoPreventivo}.prisma`;
      a.download = fileName;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Show success message
      setSaveStatus('✅ File PRISMA scaricato con successo!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('❌ Errore nel salvataggio del file');
      console.error('Save error:', error);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSavePDF = async () => {
    try {
      setSaveStatus('⏳ Generazione PDF in corso...');

      // Generate filename
      const clientName = clientData.nome && clientData.cognome
        ? `${clientData.nome}_${clientData.cognome}`
        : clientData.nome || 'Cliente';
      const riferimento = quoteData.riferimentoPreventivo || 'draft';

      // Generate HTML preventivo
      const quoteHTML = generateQuoteHTML();

      // Open in new window for printing (preserves text selection)
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        throw new Error('Popup bloccato. Abilita i popup per questo sito.');
      }

      printWindow.document.write(quoteHTML);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

      setSaveStatus('✅ Finestra di stampa aperta. Usa "Salva come PDF" come destinazione.');
      setTimeout(() => setSaveStatus(''), 5000);

    } catch (error) {
      console.error('PDF generation error:', error);
      setSaveStatus('❌ Errore: ' + error.message);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const generateRiferimentoPreventivo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `PRV-${year}${month}${day}-${hours}${minutes}`;
  };

  const generateQuoteHTML = () => {
    const today = new Date().toLocaleDateString('it-IT');
    const clientName = clientData.nome && clientData.cognome
      ? `${clientData.nome} ${clientData.cognome}`.trim()
      : clientData.nome || clientData.nomeCognome || 'Cliente';
    const address = clientData.indirizzo || 'Indirizzo non specificato';
    const riferimentoPreventivo = quoteData.riferimentoPreventivo || generateRiferimentoPreventivo();
    const validitaPreventivo = quoteData.validitaPreventivo || 20;
    const potenzaTotale = parseFloat(results?.potenzaTotaleKw || 0);
    const produzioneAnnua = potenzaTotale * economicParams.produzioneAnnuaKw;

    // Environmental calculations
    const co2Saved = Math.round(produzioneAnnua * 0.5); // kg/anno
    const treesEquivalent = Math.round(potenzaTotale * 7);
    const carsAvoided = Math.round(produzioneAnnua / 50);

    // Calculate installation days
    const giorniMin = Math.max(3, Math.ceil(potenzaTotale / 3));
    const giorniMax = Math.max(5, Math.ceil(potenzaTotale / 2));

    // SoleFacile Logo SVG
    const logoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306.71 153.03" style="max-width: 180px; height: auto;">
      <defs><style>.cls-1{fill:#fff;}.cls-2{fill:none;}.cls-3{fill:#60b22f;}.cls-4{fill:#9cc42c;}.cls-5{fill:#bbd02c;}.cls-6{fill:#dadb1a;}.cls-7{fill:#ebe320;}</style></defs>
      <g id="Livello_2" data-name="Livello 2"><g id="Livello_1-2" data-name="Livello 1">
        <path class="cls-1" d="M33.34,83.42A72.18,72.18,0,0,1,14.52,81,48.77,48.77,0,0,1,0,74.83L7.35,58.22a51.66,51.66,0,0,0,12.26,5.6A45.55,45.55,0,0,0,33.45,66,28.26,28.26,0,0,0,41,65.23,8.43,8.43,0,0,0,45,63a5.14,5.14,0,0,0,1.29-3.5,4.64,4.64,0,0,0-2.48-4.13,24.64,24.64,0,0,0-6.5-2.6c-2.68-.71-5.57-1.39-8.7-2a86.34,86.34,0,0,1-9.55-2.55A36.22,36.22,0,0,1,10.28,44,19.94,19.94,0,0,1,3.9,37.2,20.64,20.64,0,0,1,1.47,26.69,22.47,22.47,0,0,1,5.32,13.92Q9.15,8.16,17,4.66T36.39,1.15A67.79,67.79,0,0,1,51.71,2.9,45.12,45.12,0,0,1,65,8.16L58.2,24.66A48.24,48.24,0,0,0,47,20a41.77,41.77,0,0,0-10.74-1.47,22.49,22.49,0,0,0-7.46,1,9,9,0,0,0-4.06,2.6,5.4,5.4,0,0,0-1.24,3.39A4.75,4.75,0,0,0,26,29.8a22.51,22.51,0,0,0,6.45,2.48q3.95,1,8.75,2a96.06,96.06,0,0,1,9.55,2.53,38.78,38.78,0,0,1,8.76,4.07A20.13,20.13,0,0,1,66,47.54a19.82,19.82,0,0,1,2.49,10.34,22.46,22.46,0,0,1-3.9,12.72,26.79,26.79,0,0,1-11.7,9.32C47.7,82.26,41.17,83.42,33.34,83.42Z"/><path class="cls-1" d="M174.37,81.84V2.73h22.38V64.1h37.63V81.84Z"/><polygon class="cls-1" points="265.35 64.44 265.35 49.97 300.49 49.97 300.49 33.36 265.35 33.36 265.35 20.14 305.24 20.14 305.24 2.73 243.3 2.73 243.3 81.84 306.71 81.84 306.71 64.44 265.35 64.44"/><polygon class="cls-1" points="46.19 105.84 46.19 92.86 0 92.86 0 151.85 16.69 151.85 16.69 131.63 42.65 131.63 42.65 118.73 16.69 118.73 16.69 105.84 46.19 105.84"/><path class="cls-1" d="M95.92,151.86h17.36l-26.13-59H70.72l-26,59h17l4.63-11.55h25ZM71.24,128.09l7.57-18.86,7.57,18.86Z"/><path class="cls-1" d="M146.58,153a36.11,36.11,0,0,1-12.9-2.23,31.22,31.22,0,0,1-10.29-6.32,28.77,28.77,0,0,1-6.82-9.73,32.68,32.68,0,0,1,0-24.78,28.81,28.81,0,0,1,6.82-9.74,31.22,31.22,0,0,1,10.29-6.32,38.89,38.89,0,0,1,27.52.59,27.42,27.42,0,0,1,10.74,8.3l-10.62,9.61a20.73,20.73,0,0,0-6.32-5.14,16.37,16.37,0,0,0-7.58-1.77,18.13,18.13,0,0,0-6.66,1.18,14.4,14.4,0,0,0-5.18,3.41,16,16,0,0,0-3.37,5.35,20.05,20.05,0,0,0,0,13.83,15.88,15.88,0,0,0,3.37,5.35,14.14,14.14,0,0,0,5.18,3.41,18.13,18.13,0,0,0,6.66,1.18,16.37,16.37,0,0,0,7.58-1.77,20.32,20.32,0,0,0,6.32-5.22l10.62,9.6a27.73,27.73,0,0,1-10.74,8.35A35.68,35.68,0,0,1,146.58,153Z"/><path class="cls-1" d="M179.44,151.86v-59h16.69v59Z"/><path class="cls-1" d="M208,151.86v-59H224.7v45.76h28.07v13.24Z"/><polygon class="cls-1" points="275.86 138.88 275.86 128.09 302.07 128.09 302.07 115.7 275.86 115.7 275.86 105.84 305.61 105.84 305.61 92.86 259.42 92.86 259.42 151.85 306.71 151.85 306.71 138.88 275.86 138.88"/><path class="cls-2" d="M118.55,83.42a48.93,48.93,0,0,1-17.47-3,41,41,0,0,1-14-8.65A40,40,0,0,1,74.59,42.18,39.47,39.47,0,0,1,77.92,25.9,40.74,40.74,0,0,1,101,4.2a51.82,51.82,0,0,1,35,0A41.59,41.59,0,0,1,150,12.79a40.17,40.17,0,0,1,9.21,13,39.57,39.57,0,0,1,3.34,16.39,41.22,41.22,0,0,1-3.27,16.55A39.11,39.11,0,0,1,150,71.78a41.93,41.93,0,0,1-14,8.59A48.69,48.69,0,0,1,118.55,83.42Z"/><path class="cls-1" d="M159.79,25a40.58,40.58,0,0,0-9.35-13.19A42,42,0,0,0,136.32,3.1a52.54,52.54,0,0,0-35.56,0,41.38,41.38,0,0,0-23.46,22,40.14,40.14,0,0,0-3.38,16.52,40.82,40.82,0,0,0,3.38,16.7,41.18,41.18,0,0,0,23.52,22.08,52.37,52.37,0,0,0,35.5,0A42.71,42.71,0,0,0,150.5,71.7a39.64,39.64,0,0,0,9.35-13.25,41.55,41.55,0,0,0,3.33-16.81A40.24,40.24,0,0,0,159.79,25Z"/><path class="cls-3" d="M146,22.77c0,.81.07,1.63.07,2.46a41.07,41.07,0,0,1-3.28,16.56,39.08,39.08,0,0,1-9.21,13.05,42,42,0,0,1-14,8.59,48.76,48.76,0,0,1-17.51,3.05c-1.82,0-3.6-.09-5.34-.26-.46-.35-.92-.71-1.36-1.07a31.47,31.47,0,0,0,9.17,5.27,41.85,41.85,0,0,0,27.91,0,32.15,32.15,0,0,0,10.68-6.54,28.93,28.93,0,0,0,6.85-9.72,30.85,30.85,0,0,0,2.43-12.53A29.36,29.36,0,0,0,150,29.37,30.21,30.21,0,0,0,146,22.77Z"/><path class="cls-4" d="M102.14,66.48a48.76,48.76,0,0,0,17.51-3.05,42,42,0,0,0,14-8.59,39.08,39.08,0,0,0,9.21-13.05,41.07,41.07,0,0,0,3.28-16.56c0-.83,0-1.65-.07-2.46h0c-.4-.5-.82-1-1.25-1.46L144.5,21c-.45-.48-.91-1-1.39-1.41-.75-.7-1.52-1.36-2.33-2a30.92,30.92,0,0,0-3.87-2.51c-.66-.37-1.35-.7-2-1,.62.29,1.24.59,1.83.91,0,.29,0,.57,0,.86a41,41,0,0,1-3.27,16.55,39.25,39.25,0,0,1-9.22,13.06,42.26,42.26,0,0,1-14,8.59,48.9,48.9,0,0,1-17.51,3c-1.42,0-2.81-.05-4.19-.16-.26-.46-.52-.93-.76-1.41a30.75,30.75,0,0,0,3.17,5,28.22,28.22,0,0,0,2,2.28c.36.37.72.73,1.09,1.09h0c.43.41.88.8,1.33,1.18l.08.07c.44.36.9.72,1.36,1.07C98.54,66.39,100.32,66.48,102.14,66.48Z"/><path class="cls-5" d="M87.8,55.52c.24.48.5.95.76,1.41,1.38.11,2.77.16,4.19.16a48.9,48.9,0,0,0,17.51-3,42.26,42.26,0,0,0,14-8.59,39.25,39.25,0,0,0,9.22-13.06,41,41,0,0,0,3.27-16.55c0-.29,0-.57,0-.86-.59-.32-1.21-.62-1.83-.91l-.37-.17c-.64-.28-1.29-.56-2-.82h0c-.52-.2-1.05-.38-1.59-.56-1.08-.35-2.19-.65-3.32-.9l-.57-.11a39.52,39.52,0,0,1-3,11.49,38.91,38.91,0,0,1-9.22,13.06,42.26,42.26,0,0,1-14,8.59,48,48,0,0,1-15.72,3c0,.15,0,.31.08.47A27.85,27.85,0,0,0,87.08,54c.23.51.46,1,.71,1.49Z"/><path class="cls-6" d="M85.15,47.67a48,48,0,0,0,15.72-3,42.26,42.26,0,0,0,14-8.59A38.91,38.91,0,0,0,124.05,23a39.52,39.52,0,0,0,3-11.49h0c-.64-.13-1.29-.24-1.94-.34l-.21,0c-.58-.08-1.17-.16-1.76-.22l-.37,0c-.55-.05-1.10-.09-1.66-.12l-.46,0c-.68,0-1.38-.05-2.08-.05h0c-1,0-1.88,0-2.81.09-.32,1-.68,1.91-1.08,2.83a38.91,38.91,0,0,1-9.22,13.06,42.16,42.16,0,0,1-14,8.59,45.69,45.69,0,0,1-6.57,1.93,33.57,33.57,0,0,0-.29,4.44c0,.54,0,1.08,0,1.6s0,.85.08,1.26c0,.09,0,.17,0,.25.09,1,.22,2,.4,2.92Z"/><path class="cls-7" d="M105.44,26.68a38.91,38.91,0,0,0,9.22-13.06c.4-.92.76-1.87,1.08-2.83h0a42,42,0,0,0-5.72.74l-.15,0c-.86.18-1.69.39-2.52.62l-.4.12c-.81.24-1.61.5-2.39.79h0A30.88,30.88,0,0,0,94,19.62a29.91,29.91,0,0,0-4.8,5.83c-.42.65-.8,1.33-1.17,2s-.69,1.33-1,2-.47,1.12-.68,1.69c0,.14-.09.28-.14.42-.17.47-.32.95-.46,1.43l-.09.33a28.07,28.07,0,0,0-.78,3.84h0a45.69,45.69,0,0,0,6.57-1.93A42.16,42.16,0,0,0,105.44,26.68Z"/>
      </g></g>
    </svg>`;

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Preventivo Impianto Fotovoltaico - ${clientName}</title>
  <style>
    :root {
      --primary-color: #0F3460;
      --secondary-color: #2E8B57;
      --accent-color: #E6B31E;
      --light-bg: #f8f9fa;
      --text-color: #333;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      margin: 0;
      padding: 0;
      background-color: #fff;
      font-size: 13px;
    }

    /* Page setup with running headers and footers */
    @page {
      size: A4;
      margin: 25mm 16mm 25mm 16mm;
    }

    /* Main content area */
    .page-content {
      padding: 0 5mm;
    }

    .header {
      background: linear-gradient(135deg, var(--primary-color), #243b55);
      color: white;
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 12px rgba(15, 52, 96, 0.15);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .header-info {
      text-align: right;
      font-size: 13px;
    }

    .doc-title {
      color: white;
      font-weight: 700;
      font-size: 22px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 15px 0 10px 0;
      color: var(--primary-color);
    }

    p {
      margin: 5px 0;
    }

    .two-columns {
      width: 100%;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
      page-break-after: auto;
    }

    .client-box, .tech-box {
      background-color: var(--light-bg);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 18px;
      border-left: 4px solid var(--primary-color);
      page-break-inside: avoid;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .section-title {
      color: var(--primary-color);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--secondary-color);
      position: relative;
      padding-left: 12px;
    }

    .section-title::before {
      content: "";
      position: absolute;
      left: 0;
      top: 2px;
      width: 4px;
      height: 20px;
      background-color: var(--secondary-color);
      border-radius: 2px;
    }

    .info-label {
      color: #718096;
      font-size: 13px;
      margin: 10px 0 3px 0;
    }

    .info-value {
      font-weight: 600;
      font-size: 15px;
      color: #2D3748;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-value svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      fill: var(--primary-color);
    }

    .section-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 15px;
    }

    .stats-container {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .stat-item {
      flex: 1;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 11px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    }

    .badge-eco {
      background: linear-gradient(135deg, var(--secondary-color) 0%, #3fa55f 100%);
      color: white;
    }

    .badge-eco svg {
      width: 14px;
      height: 14px;
      fill: white;
    }

    .eco-impact {
      background: linear-gradient(135deg, #e6f7ed 0%, #f0f9ff 100%);
      border-radius: 10px;
      padding: 18px;
      margin-top: 18px;
      border-left: 4px solid var(--secondary-color);
      box-shadow: 0 2px 4px rgba(46, 139, 87, 0.1);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .eco-title {
      font-weight: 600;
      color: var(--secondary-color);
      margin-bottom: 15px;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .eco-title svg {
      width: 18px;
      height: 18px;
      fill: var(--secondary-color);
    }

    .eco-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
      gap: 12px;
    }

    .eco-stat-item, .eco-stat {
      flex: 1;
      text-align: center;
      padding: 10px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
    }

    .eco-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--secondary-color);
      display: block;
      margin-bottom: 5px;
    }

    .eco-label {
      font-size: 10px;
      color: #718096;
      display: block;
      line-height: 1.3;
    }

    .details-box {
      background-color: #fff;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border: 1px solid rgba(15, 52, 96, 0.08);
    }

    .details-heading {
      background: linear-gradient(135deg, var(--primary-color) 0%, #1e4976 100%);
      margin: -20px -20px 18px -20px;
      padding: 14px 20px;
      font-weight: 600;
      color: white;
      font-size: 17px;
      border-radius: 12px 12px 0 0;
      letter-spacing: 0.3px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      page-break-after: avoid;
      break-after: avoid;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      page-break-inside: avoid;
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: linear-gradient(135deg, var(--primary-color) 0%, #1e4976 100%);
      color: white;
      font-weight: 600;
      font-size: 13px;
      padding: 12px 10px;
      text-align: left;
      border: none;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    td {
      padding: 10px;
      border: 1px solid #e5e7eb;
      text-align: left;
      font-size: 12px;
    }

    tbody tr {
      transition: background-color 0.2s;
    }

    tbody tr:nth-child(even) {
      background-color: #fafafa;
    }

    tbody tr:hover {
      background-color: #f5f5f5;
    }

    .total-row {
      font-weight: bold;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
      border-top: 2px solid var(--primary-color);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .final-price-container {
      background: linear-gradient(135deg, var(--primary-color) 0%, #1e4976 100%);
      color: white;
      border-radius: 12px;
      padding: 25px;
      margin-top: 25px;
      text-align: right;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(15, 52, 96, 0.2);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .final-price {
      font-size: 30px;
      font-weight: 700;
      color: white;
      margin-top: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .note-container {
      margin-top: 25px;
      padding: 20px;
      background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%);
      border-radius: 10px;
      border-left: 4px solid var(--accent-color);
      page-break-inside: avoid;
      box-shadow: 0 2px 6px rgba(249, 168, 37, 0.1);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .note-title {
      color: #f57f17;
      font-weight: 600;
      margin: 0 0 12px 0;
      font-size: 16px;
      display: flex;
      align-items: center;
    }

    .note-list {
      padding-left: 20px;
      margin: 0;
    }

    .note-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .signature-area {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px dashed rgba(15, 52, 96, 0.2);
      width: 100%;
      page-break-inside: avoid;
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }

    .signature-box {
      flex: 1;
      min-height: 90px;
      border-bottom: 2px solid rgba(15, 52, 96, 0.4);
      padding-bottom: 10px;
      text-align: center;
    }

    .signature-label {
      font-size: 13px;
      color: #666;
      margin-top: 10px;
      display: block;
      font-weight: 500;
    }

    .footer {
      background: linear-gradient(135deg, var(--primary-color) 0%, #1e4976 100%);
      color: white;
      border-radius: 12px;
      padding: 28px;
      margin-top: 30px;
      text-align: center;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(15, 52, 96, 0.15);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .contact-info {
      margin-top: 12px;
      font-size: 0.9em;
      line-height: 1.8;
    }

    h4 {
      margin: 20px 0 12px 0;
      font-size: 15px;
      font-weight: 600;
    }

    /* Print styles with page headers and footers */
    @media print {
      body {
        padding: 0;
        margin: 0;
        font-size: 12px;
      }

      .no-print {
        display: none !important;
      }

      .page-content {
        padding: 0 2mm;
      }

      /* Small sections that should never break */
      .client-box, .tech-box, .note-container, .signature-area, .two-columns {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Large sections can break, but only at subsection boundaries */
      .details-box {
        page-break-inside: auto;
        break-inside: auto;
      }

      /* Maintain 2-column layout on first page */
      .two-columns {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        page-break-after: always;
      }

      /* Enhanced page setup with better spacing for headers/footers */
      @page {
        size: A4;
        margin: 25mm 18mm 22mm 18mm;
      }

      /* Print header on every page except first */
      @page :not(:first) {
        @top-center {
          content: "Preventivo Fotovoltaico - ${riferimentoPreventivo}";
          font-size: 10px;
          color: var(--primary-color);
          font-family: 'Segoe UI', sans-serif;
          padding-bottom: 5mm;
          border-bottom: 1px solid #e5e7eb;
        }
      }

      /* Print footer on every page */
      @page {
        @bottom-left {
          content: "SoleFacile S.r.l. | P.IVA IT 09557480010";
          font-size: 9px;
          color: #666;
          font-family: 'Segoe UI', sans-serif;
        }

        @bottom-center {
          content: "Tel: +39 3200103380 | solefacilesrl@gmail.com";
          font-size: 9px;
          color: #666;
          font-family: 'Segoe UI', sans-serif;
        }

        @bottom-right {
          content: "Pag. " counter(page) " di " counter(pages);
          font-size: 9px;
          color: #666;
          font-family: 'Segoe UI', sans-serif;
        }
      }

      /* First page header styling */
      .header {
        page-break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 20px;
        padding: 20px;
      }

      .doc-title {
        font-size: 20px;
      }

      /* Ensure colors print correctly */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Control orphans and widows */
      p, li, div {
        orphans: 3;
        widows: 3;
      }

      /* Prevent list items from breaking */
      li {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Keep lists together when possible */
      ul, ol {
        page-break-before: auto;
        page-break-after: auto;
      }

      /* Footer should stay together */
      .footer {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Better table handling in print */
      table {
        font-size: 11px;
        page-break-inside: auto;
        page-break-before: auto;
      }

      /* Keep table header with at least one row */
      thead {
        page-break-after: avoid;
      }

      th {
        padding: 10px 8px;
        font-size: 12px;
      }

      td {
        padding: 8px;
        font-size: 11px;
      }

      /* Prevent table rows from splitting, but allow breaks between rows */
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid-page !important;
        page-break-after: auto;
      }

      /* Don't break total rows from the content above */
      tr.total-row {
        page-break-before: avoid;
      }

      /* Prevent nested sections from splitting - these are individual subsections */
      .details-box > div[style*="background-color: #f8f9fa"],
      .details-box > div[style*="background-color: #fff"],
      .details-box > div > div[style*="background-color: #f8f9fa"] {
        page-break-inside: avoid !important;
        break-inside: avoid-page !important;
        page-break-before: auto;
        page-break-after: auto;
      }

      /* Keep headings with following content */
      .details-box h4,
      .details-box h5,
      h4, h5 {
        page-break-after: avoid !important;
        break-after: avoid-page !important;
        page-break-inside: avoid;
      }

      /* Ensure at least some content follows a heading */
      h4 + *, h5 + * {
        page-break-before: avoid;
      }

      /* Optimize spacing in print */
      .details-box {
        margin: 18px 0;
        padding: 16px;
        box-shadow: none;
        border: 1px solid #e5e7eb;
        page-break-before: auto;
        page-break-after: auto;
        page-break-inside: avoid;
        break-inside: avoid-page;
        overflow: visible;
      }

      /* Additional page-break controls for sections */
      .note-container {
        page-break-before: auto;
        page-break-after: auto;
      }

      .final-price-container {
        page-break-before: auto;
      }

      /* Eco impact section */
      .eco-impact {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .eco-stats {
        page-break-inside: avoid;
      }

      /* Signature area */
      .signature-area {
        page-break-before: auto;
        margin-top: 40px;
      }

      .signature-box {
        page-break-inside: avoid;
      }

      .details-heading {
        padding: 10px 16px;
        font-size: 15px;
        page-break-after: avoid;
        break-after: avoid-page;
        page-break-inside: avoid;
      }

      /* Section content grid in print */
      .section-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      /* Stats container in print */
      .stats-container {
        display: flex;
        gap: 10px;
        page-break-inside: avoid;
      }

      .stat-item {
        font-size: 11px;
        page-break-inside: avoid;
      }

      .stat-value {
        font-size: 16px;
      }

      /* Info values with icons */
      .info-value {
        font-size: 13px;
      }

      .info-value svg {
        width: 14px;
        height: 14px;
      }

      /* Badge in print */
      .badge {
        font-size: 9px;
        padding: 3px 8px;
      }

      .badge-eco svg {
        width: 12px;
        height: 12px;
      }

      /* Eco impact in print */
      .eco-title {
        font-size: 13px;
      }

      .eco-value {
        font-size: 18px;
      }

      .eco-label {
        font-size: 9px;
      }

      /* Footer stays at document end, not on every page content */
      .footer {
        margin-top: 25px;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="page-content">
    <div class="header">
      <div style="flex: 0 0 40%;">
        ${logoSVG}
      </div>
      <div class="header-info" style="flex: 0 0 55%;">
        <h1 class="doc-title">Preventivo Impianto Fotovoltaico</h1>
        <p style="margin: 5px 0;"><strong>Riferimento:</strong> ${riferimentoPreventivo}</p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${today}</p>
        <p style="margin: 5px 0;"><strong>Validità:</strong> ${validitaPreventivo} giorni</p>
      </div>
    </div>

  <div class="two-columns">
    <div class="client-box">
      <h2 class="section-title">Informazioni Cliente</h2>
      <div class="section-content">
        <div>
          <p class="info-label">Cliente</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            ${clientName}
          </p>

          <p class="info-label">Indirizzo impianto</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            ${address}
          </p>
        </div>
        <div>
          <p class="info-label">Tipologia</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Impianto Residenziale
              <span class="badge badge-eco">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>
                </svg>
                ECO
              </span>
            </span>
          </p>

          <p class="info-label">Consulente</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            Debasis
          </p>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">${riferimentoPreventivo}</div>
          <div class="stat-label">Riferimento</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${validitaPreventivo} giorni</div>
          <div class="stat-label">Validità Offerta</div>
        </div>
      </div>
    </div>

    <div class="tech-box">
      <h2 class="section-title">Dati Tecnici</h2>
      <div class="section-content">
        <div>
          <p class="info-label">Potenza totale</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
            ${potenzaTotale.toFixed(2)} kWp
          </p>

          <p class="info-label">Produzione stimata</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
            </svg>
            ${Math.round(produzioneAnnua)} kWh/anno
          </p>
        </div>
        <div>
          <p class="info-label">CO₂ evitata</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
            </svg>
            ${co2Saved} kg/anno
          </p>

          <p class="info-label">Classe energetica</p>
          <p class="info-value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            A+
          </p>
        </div>
      </div>

      <div class="eco-impact">
        <p class="eco-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>
          </svg>
          Impatto Ambientale
        </p>
        <div class="eco-stats">
          <div class="eco-stat">
            <div class="eco-value">${Math.round(co2Saved / 1000)}</div>
            <div class="eco-label">Tonnellate CO₂ risparmiate</div>
          </div>
          <div class="eco-stat">
            <div class="eco-value">${treesEquivalent}</div>
            <div class="eco-label">Alberi equivalenti</div>
          </div>
          <div class="eco-stat">
            <div class="eco-value">${carsAvoided}</div>
            <div class="eco-label">Viaggi in auto risparmiati</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Premessa -->
  <div class="details-box">
    <h3 class="details-heading">Premessa</h3>
    <div>
      ${customText.premessaPersonalizzata ? customText.premessaPersonalizzata.replace(/\n/g, '<br>') : `
        Gentile ${clientName},<br><br>
        Siamo lieti di presentarLe la nostra proposta tecnico-economica per la realizzazione di un impianto fotovoltaico presso la Sua proprietà ubicata in ${address}.<br><br>
        Questa offerta è il risultato di un'attenta analisi delle caratteristiche strutturali dell'edificio, dell'esposizione solare del sito e delle Sue specifiche esigenze energetiche.<br><br>
        SoleFacile S.r.l., forte della propria esperienza pluriennale nel settore, si impegna a fornire un servizio completo che include progettazione, installazione, pratiche burocratiche e assistenza post-vendita.
      `}
    </div>
  </div>

  <!-- System Configuration -->
  <div class="details-box">
    <h3 class="details-heading">Configurazione Impianto</h3>

    <h4 style="color: #0F3460; margin-top: 20px; margin-bottom: 15px; font-size: 16px;">Moduli Fotovoltaici - Dettaglio Falde</h4>
    ${falde.map((falda, idx) => {
      const totalePotenzaFalda = falda.gruppiModuli.reduce((sum, g) => {
        const modulo = g.modulo;
        const numeroModuli = g.numeroFile * g.moduliPerFila;
        return sum + (modulo ? numeroModuli * (modulo.potenza / 1000) : 0);
      }, 0);
      const totaleModuliFalda = falda.gruppiModuli.reduce((sum, g) => sum + (g.numeroFile * g.moduliPerFila), 0);

      // Generate correct name based on type
      let faldaNome;
      if (falda.tettoiaIndex !== undefined) {
        const isATerra = structureData.tipoTetto === 'a terra';
        const baseNome = isATerra ? 'Struttura' : 'Tettoia';
        faldaNome = `${baseNome} ${falda.tettoiaIndex + 1}`;
      } else {
        faldaNome = falda.nome || `Falda ${idx + 1}`;
      }

      return `
        <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #2E8B57; page-break-inside: avoid;">
          <h5 style="color: #0F3460; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">${faldaNome}</h5>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 10px;">
            <div>
              <span style="color: #718096; font-size: 12px;">Inclinazione:</span>
              <span style="font-weight: 600; display: block;">${falda.inclinazione || 0}°</span>
            </div>
            <div>
              <span style="color: #718096; font-size: 12px;">Orientamento:</span>
              <span style="font-weight: 600; display: block;">${falda.orientamento || 0}°</span>
            </div>
            <div>
              <span style="color: #718096; font-size: 12px;">Dimensioni:</span>
              <span style="font-weight: 600; display: block;">${falda.lunghezza || 0}m × ${falda.larghezza || 0}m</span>
            </div>
            <div>
              <span style="color: #718096; font-size: 12px;">N° Moduli:</span>
              <span style="font-weight: 600; display: block; color: #2E8B57;">${totaleModuliFalda}</span>
            </div>
            <div>
              <span style="color: #718096; font-size: 12px;">Potenza Totale:</span>
              <span style="font-weight: 600; display: block; color: #2E8B57;">${totalePotenzaFalda.toFixed(2)} kWp</span>
            </div>
          </div>
          ${falda.gruppiModuli && falda.gruppiModuli.length > 0 ? `
            <div style="margin-top: 10px;">
              <span style="color: #718096; font-size: 12px; font-weight: 600;">Gruppi Moduli:</span>
              ${falda.gruppiModuli.map((gruppo, gIdx) => {
                const modulo = gruppo.modulo;
                const numModuli = gruppo.numeroFile * gruppo.moduliPerFila;
                const potenzaGruppo = modulo ? (numModuli * modulo.potenza / 1000).toFixed(2) : 0;
                return `
                  <div style="background-color: white; padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 12px;">
                    <strong>Gruppo ${gIdx + 1}:</strong> ${modulo?.marca || ''} ${modulo?.modello || ''} (${modulo?.potenza || 0}W)
                    <br><span style="color: #718096;">${gruppo.numeroFile} file × ${gruppo.moduliPerFila} moduli = ${numModuli} moduli → ${potenzaGruppo} kWp</span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}

    <h4 style="color: #0F3460; margin-top: 25px; margin-bottom: 10px; font-size: 16px;">Riepilogo Moduli</h4>
    <table style="margin-top: 10px;">
      <thead>
        <tr>
          <th>Falda</th>
          <th style="text-align: center;">N° Moduli</th>
          <th style="text-align: center;">Potenza (kWp)</th>
        </tr>
      </thead>
      <tbody>
        ${falde.map((falda, idx) => {
          const totalePotenzaFalda = falda.gruppiModuli.reduce((sum, g) => {
            const modulo = g.modulo;
            const numeroModuli = g.numeroFile * g.moduliPerFila;
            return sum + (modulo ? numeroModuli * (modulo.potenza / 1000) : 0);
          }, 0);
          const totaleModuliFalda = falda.gruppiModuli.reduce((sum, g) => sum + (g.numeroFile * g.moduliPerFila), 0);

          return `
            <tr>
              <td>${falda.nomeFalda || `Falda ${idx + 1}`}</td>
              <td style="text-align: center; font-weight: 600;">${totaleModuliFalda}</td>
              <td style="text-align: center; font-weight: 600; color: #2E8B57;">${totalePotenzaFalda.toFixed(2)}</td>
            </tr>
          `;
        }).join('')}
        <tr style="background-color: #eef2ff; font-weight: bold; border-top: 2px solid #0F3460;">
          <td>TOTALE</td>
          <td style="text-align: center;">${falde.reduce((sum, f) => sum + f.gruppiModuli.reduce((s, g) => s + (g.numeroFile * g.moduliPerFila), 0), 0)}</td>
          <td style="text-align: center; color: #2E8B57;">${potenzaTotale.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    ${inverters.length > 0 ? `
    <h4 style="color: #0F3460; margin-top: 25px; margin-bottom: 10px; font-size: 16px;">Inverter</h4>
    <table>
      <thead>
        <tr>
          <th>Modello</th>
          <th style="text-align: center;">Potenza</th>
          <th style="text-align: center;">Stringhe</th>
          <th style="text-align: center;">Quantità</th>
        </tr>
      </thead>
      <tbody>
        ${inverters.map(inv => {
          return `
          <tr>
            <td>${inv.modello?.marca || ''} ${inv.modello?.modello || ''}</td>
            <td style="text-align: center;">${inv.modello?.potenza || '-'} kW</td>
            <td style="text-align: center;">${inv.stringhe || '-'}</td>
            <td style="text-align: center; font-weight: 600;">${inv.quantita || 1}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>
    ` : ''}

    ${batteries.length > 0 ? `
    <h4 style="color: #0F3460; margin-top: 25px; margin-bottom: 10px; font-size: 16px;">Sistema di Accumulo</h4>
    <table>
      <thead>
        <tr>
          <th>Modello</th>
          <th style="text-align: center;">Capacità (kWh)</th>
          <th style="text-align: center;">Tensione (V)</th>
          <th style="text-align: center;">Quantità</th>
        </tr>
      </thead>
      <tbody>
        ${batteries.map(batt => {
          return `
          <tr>
            <td>${batt.modello?.marca || ''} ${batt.modello?.modello || ''}</td>
            <td style="text-align: center; font-weight: 600;">${batt.modello?.capacita || '-'}</td>
            <td style="text-align: center;">${batt.modello?.tensione || '-'}</td>
            <td style="text-align: center; font-weight: 600;">${batt.quantita || 1}</td>
          </tr>
        `;
        }).join('')}
        <tr style="background-color: #f0f9ff; font-weight: bold; border-top: 2px solid #0F3460;">
          <td colspan="3">Capacità Totale</td>
          <td style="text-align: center; color: #2E8B57; font-size: 16px;">
            ${batteries.reduce((sum, b) => sum + ((b.modello?.capacita || 0) * (b.quantita || 1)), 0).toFixed(1)} kWh
          </td>
        </tr>
      </tbody>
    </table>
    ` : ''}

    ${(components?.evCharger && components.evCharger !== 'none') ||
      (components?.essCabinet && components.essCabinet !== 'none') ||
      (components?.parallelBox && components.parallelBox !== 'none') ||
      (components?.connettivita && components.connettivita !== 'none') ||
      (components?.backupControllo && components.backupControllo !== 'none') ? `
    <h4 style="color: #0F3460; margin-top: 25px; margin-bottom: 10px; font-size: 16px;">Accessori e Componenti Aggiuntivi</h4>
    <table>
      <thead>
        <tr>
          <th>Componente</th>
          <th style="text-align: center;">Modello</th>
          <th style="text-align: center;">Quantità</th>
        </tr>
      </thead>
      <tbody>
        ${components?.evCharger && components.evCharger !== 'none' ? `
          <tr>
            <td>Caricatore EV</td>
            <td style="text-align: center;">${components.evCharger}</td>
            <td style="text-align: center;">${components.numeroEvCharger || 1}</td>
          </tr>
        ` : ''}
        ${components?.essCabinet && components.essCabinet !== 'none' ? `
          <tr>
            <td>ESS Cabinet</td>
            <td style="text-align: center;">${components.essCabinet}</td>
            <td style="text-align: center;">${components.numeroEssCabinet || 1}</td>
          </tr>
        ` : ''}
        ${components?.parallelBox && components.parallelBox !== 'none' ? `
          <tr>
            <td>Parallel Box</td>
            <td style="text-align: center;">${components.parallelBox}</td>
            <td style="text-align: center;">${components.numeroParallelBox || 1}</td>
          </tr>
        ` : ''}
        ${components?.connettivita && components.connettivita !== 'none' ? `
          <tr>
            <td>Connettività</td>
            <td style="text-align: center;">${components.connettivita}</td>
            <td style="text-align: center;">${components.numeroConnettivita || 1}</td>
          </tr>
        ` : ''}
        ${components?.backupControllo && components.backupControllo !== 'none' ? `
          <tr>
            <td>Backup Controllo</td>
            <td style="text-align: center;">${components.backupControllo}</td>
            <td style="text-align: center;">${components.numeroBackupControllo || 1}</td>
          </tr>
        ` : ''}
        ${components?.meterCT && components.meterCT !== 'none' ? `
          <tr>
            <td>Meter CT</td>
            <td style="text-align: center;">${components.meterCT}</td>
            <td style="text-align: center;">${components.numeroMeterCT || 1}</td>
          </tr>
        ` : ''}
        ${components?.caviAccessori && components.caviAccessori !== 'none' ? `
          <tr>
            <td>Cavi e Accessori</td>
            <td style="text-align: center;">${components.caviAccessori}</td>
            <td style="text-align: center;">${components.numeroCaviAccessori || 1}</td>
          </tr>
        ` : ''}
      </tbody>
    </table>
    ` : ''}
  </div>

  <!-- Monthly Production Chart -->
  <div class="details-box">
    <h3 class="details-heading">Produzione Energetica Stimata${pvgisData?.outputs ? ' (PVGIS)' : ''}</h3>
    <div style="height: 320px; position: relative; margin-top: 25px;">
      <div style="display: flex; height: 250px; align-items: flex-end; justify-content: space-between; margin-top: 20px;">
        ${(() => {
          const monthNames = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
          let monthlyData = [];

          // Use PVGIS data if available
          if (pvgisData?.outputs?.monthly?.fixed) {
            monthlyData = pvgisData.outputs.monthly.fixed.map(m => m.E_m || 0);
          } else {
            // Fallback to estimated pattern (higher in summer, lower in winter)
            const estimatedPattern = [40, 50, 70, 80, 90, 100, 100, 95, 80, 60, 45, 35];
            const avgProduction = produzioneAnnua / 12;
            monthlyData = estimatedPattern.map(val => (val / 100) * avgProduction * 1.5);
          }

          const maxProduction = Math.max(...monthlyData);

          return monthlyData.map((production, i) => {
            const percentage = (production / maxProduction) * 100;
            const height = Math.max(5, (percentage * 230) / 100);
            const mese = monthNames[i];

            return `
              <div style="display: flex; flex-direction: column; align-items: center; width: 30px;">
                <div style="height: ${height}px; width: 25px; background: linear-gradient(180deg, var(--accent-color) 0%, #d4a21a 100%); border-radius: 2px 2px 0 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;" title="${Math.round(production)} kWh"></div>
                <div style="margin-top: 5px; font-size: 12px; font-weight: 500;">${mese}</div>
                <div style="font-size: 10px; margin-top: 2px; color: #666;">${Math.round(production)}</div>
              </div>`;
          }).join('');
        })()}
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #666; background-color: rgba(248, 249, 250, 0.9); padding: 8px; border-radius: 4px;">
        Produzione annuale stimata: ${Math.round(produzioneAnnua)} kWh${pvgisData?.outputs ? ' (dati PVGIS)' : ''}
      </div>
    </div>
  </div>

  <!-- Cost Breakdown -->
  <div class="details-box">
    <h3 class="details-heading">Dettaglio Costi</h3>
    <table>
      <thead>
        <tr>
          <th>Voce</th>
          <th style="text-align: right;">Importo (€)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Moduli Fotovoltaici</td><td style="text-align: right;">€ ${results?.costoModuli || '0.00'}</td></tr>
        ${(() => {
          const breakdown = results?.breakdown?.strutturale || {};
          return breakdown.totaleMorsetti > 0 || breakdown.totaleGuide > 0 || breakdown.totaleStaffe > 0 || breakdown.totaleProlunghe > 0 ? `
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Morsetti</td><td style="text-align: right; font-size: 12px;">€ ${breakdown.costoMorsetti?.toFixed(2) || '0.00'}</td></tr>
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Guide di montaggio</td><td style="text-align: right; font-size: 12px;">€ ${breakdown.costoGuide?.toFixed(2) || '0.00'}</td></tr>
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Staffe</td><td style="text-align: right; font-size: 12px;">€ ${breakdown.costoStaffe?.toFixed(2) || '0.00'}</td></tr>
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Prolunghe</td><td style="text-align: right; font-size: 12px;">€ ${breakdown.costoProlunghe?.toFixed(2) || '0.00'}</td></tr>
          ` : '';
        })()}
        <tr><td>Inverter</td><td style="text-align: right;">€ ${results?.costoInverter || '0.00'}</td></tr>
        <tr><td>Batterie</td><td style="text-align: right;">€ ${results?.costoBatterie || '0.00'}</td></tr>
        <tr><td>Accessori</td><td style="text-align: right;">€ ${results?.costoAccessori || '0.00'}</td></tr>
        <tr><td>Strutture di Fissaggio</td><td style="text-align: right;">€ ${results?.costoStrutturale || '0.00'}</td></tr>
        <tr><td>Cavi e Cablaggi</td><td style="text-align: right;">€ ${results?.costoCavi || '0.00'}</td></tr>
        ${(() => {
          const cavi = results?.breakdown?.cavi || {};
          return cavi.lunghezzaCaviDC > 0 || cavi.lunghezzaCaviAC > 0 ? `
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Cavi DC (${cavi.lunghezzaCaviDC?.toFixed(0) || 0}m)</td><td style="text-align: right; font-size: 12px;">€ ${cavi.costoCaviDC?.toFixed(2) || '0.00'}</td></tr>
            <tr><td style="padding-left: 20px; font-size: 12px; color: #666;">→ Cavi AC (${cavi.lunghezzaCaviAC?.toFixed(0) || 0}m)</td><td style="text-align: right; font-size: 12px;">€ ${cavi.costoCaviAC?.toFixed(2) || '0.00'}</td></tr>
          ` : '';
        })()}
        <tr><td>Quadri Elettrici</td><td style="text-align: right;">€ ${results?.costoQuadri || '0.00'}</td></tr>
        <tr><td>Manodopera</td><td style="text-align: right;">€ ${results?.costoManodopera || '0.00'}</td></tr>
        ${parseFloat(results?.costoFresia || 0) > 0 ? `<tr><td>Fresia e Preparazione</td><td style="text-align: right;">€ ${results?.costoFresia || '0.00'}</td></tr>` : ''}
        ${parseFloat(results?.costoSicurezza || 0) > 0 ? `<tr><td>Sicurezza</td><td style="text-align: right;">€ ${results?.costoSicurezza || '0.00'}</td></tr>` : ''}
        <tr><td>Mezzi e Trasporto</td><td style="text-align: right;">€ ${results?.costoMezzi || '0.00'}</td></tr>
        <tr class="total-row"><td><strong>TOTALE BASE</strong></td><td style="text-align: right;"><strong>€ ${results?.costoTotaleBase || '0.00'}</strong></td></tr>
        <tr class="total-row"><td><strong>TOTALE CON MARGINE (${laborSafety?.margineGuadagno || 0}%)</strong></td><td style="text-align: right;"><strong>€ ${results?.costoTotaleConMargine || '0.00'}</strong></td></tr>
        <tr><td>IVA (${economicParams.percentualeIva}%)</td><td style="text-align: right;">€ ${results?.iva || '0.00'}</td></tr>
      </tbody>
    </table>

    <div class="final-price-container">
      <p>Prezzo Finale (IVA esclusa): € ${results?.costoTotaleConMargine || '0.00'}</p>
      <p class="final-price">Totale IVA inclusa: € ${results?.costoTotaleConIva || '0.00'}</p>
    </div>
  </div>

  <!-- Payment Plan -->
  <div class="details-box">
    <h3 class="details-heading">Piano di Pagamento</h3>
    <table>
      <thead>
        <tr>
          <th>Tranche</th>
          <th>Percentuale</th>
          <th style="text-align: right;">Importo (€)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Prima Tranche (Anticipo)</td><td>${quoteData.percentualePrimaPagamento}%</td><td style="text-align: right; font-weight: 600;">€ ${results?.primaTranche || '0.00'}</td></tr>
        <tr><td>Seconda Tranche</td><td>${quoteData.percentualeSecondaPagamento}%</td><td style="text-align: right; font-weight: 600;">€ ${results?.secondaTranche || '0.00'}</td></tr>
        <tr><td>Terza Tranche (Saldo)</td><td>${quoteData.percentualeTerzaPagamento}%</td><td style="text-align: right; font-weight: 600;">€ ${results?.terzaTranche || '0.00'}</td></tr>
      </tbody>
    </table>
  </div>

  ${energyData.consumoAnnuo > 0 ? `
  <div class="details-box">
    <h3 class="details-heading">Analisi Economica</h3>
    <div style="display: grid; grid-template-columns: 1fr 200px; gap: 20px;">
      <div>
        <table>
          <tr><td>Consumo energetico annuale</td><td style="text-align: right; font-weight: 600;">${energyData.consumoAnnuo} kWh</td></tr>
          <tr><td>Costo energia attuale</td><td style="text-align: right; font-weight: 600;">€ ${energyData.costoEnergiaAttuale}/kWh</td></tr>
          <tr><td>Spesa annua attuale</td><td style="text-align: right; font-weight: 600;">€ ${energyData.spesaAnnuaEnergia}</td></tr>
          <tr><td>Produzione impianto stimata</td><td style="text-align: right; font-weight: 600;">${Math.round(produzioneAnnua)} kWh</td></tr>
          ${(() => {
            const autoconsumoPerc = energyData.autoconsumoStimato || 70;
            const energiaAutoconsumata = produzioneAnnua * (autoconsumoPerc / 100);
            const energiaImmessa = produzioneAnnua - energiaAutoconsumata;
            const risparmioAutoconsumo = energiaAutoconsumata * parseFloat(energyData.costoEnergiaAttuale || 0);
            const risparmioScambio = energiaImmessa * (parseFloat(energyData.costoEnergiaAttuale || 0) * 0.7);
            const risparmioTotale = risparmioAutoconsumo + risparmioScambio;

            return `
              <tr><td>Autoconsumo stimato (${autoconsumoPerc}%)</td><td style="text-align: right; font-weight: 600;">${Math.round(energiaAutoconsumata)} kWh</td></tr>
              <tr><td>Energia immessa in rete</td><td style="text-align: right; font-weight: 600;">${Math.round(energiaImmessa)} kWh</td></tr>
              <tr><td>Risparmio da autoconsumo</td><td style="text-align: right; font-weight: 600;">€ ${risparmioAutoconsumo.toFixed(2)}</td></tr>
              <tr><td>Risparmio da scambio sul posto</td><td style="text-align: right; font-weight: 600;">€ ${risparmioScambio.toFixed(2)}</td></tr>
              <tr class="total-row"><td><strong>Risparmio annuo totale</strong></td><td style="text-align: right; color: #2E8B57;"><strong>€ ${risparmioTotale.toFixed(2)}</strong></td></tr>
            `;
          })()}
        </table>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px;">
        <div style="font-size: 12px; font-weight: 600; margin-bottom: 10px; color: #0F3460;">Tempo di Rientro</div>
        <div style="width: 140px; height: 140px; border-radius: 50%; border: 14px solid var(--secondary-color); position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <div style="position: absolute; background-color: white; width: 105px; height: 105px; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; flex-direction: column;">
            <span style="font-size: 32px; font-weight: 700; color: #0F3460;">${results?.paybackPeriod || 'N/A'}</span>
            <span style="font-size: 12px; color: #666;">anni</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Render Images -->
  ${renderImages.some(img => img) ? `
  <div class="details-box">
    <h3 class="details-heading">Render dell'Impianto</h3>
    <div style="text-align: center;">
      ${renderImages.map((img, index) => img ? `
        <img src="${img}" alt="Render ${index + 1}" style="max-width: 90%; margin: 10px auto; display: block; border: 1px solid #ccc;">
      ` : '').join('')}
    </div>
  </div>
  ` : ''}

  <!-- Notes and Conditions -->
  <div class="note-container">
    <h3 class="note-title">Note e Condizioni</h3>
    <ul class="note-list">
      <li>La Sole Facile può applicare l'Art. 17 c.6 lett.a ter DPR 633/72.</li>
      <li>Il presente preventivo è valido per ${validitaPreventivo} giorni dalla data di sopralluogo.</li>
      ${economicParams.percentualeDetrazione > 0 ? `
      <li>Le detrazioni fiscali del ${economicParams.percentualeDetrazione}% sono ripartite in ${economicParams.anniDetrazione} anni come previsto dalla normativa vigente.</li>
      ` : ''}
      <li>I tempi di realizzazione dell'impianto sono stimati in ${giorniMin}-${giorniMax} giorni lavorativi dalla data di conferma dell'ordine.</li>
      <li>Nel preventivo sono inclusi tutti i materiali necessari per l'installazione, la manodopera specializzata e le pratiche amministrative.</li>
      <li>Pagamento: ${quoteData.percentualePrimaPagamento}% anticipo, ${quoteData.percentualeSecondaPagamento}% a fine lavori, ${quoteData.percentualeTerzaPagamento}% al collaudo.</li>
      <li>Garanzie: 10 anni per inverter e batterie, 25 anni sulla durata della potenza dei moduli, 15 anni sulla qualità del prodotto.</li>
      <li>L'impianto verrà realizzato in conformità alle normative vigenti in materia di impianti fotovoltaici.</li>
      <li>Copertura assicurativa per eventuali danni provocati in fase di esecuzione lavori con regolare polizza presso la REALE MUTUA ASSICURAZIONI.</li>
      ${customText.notePersonalizzate ? `
      <li style="border-top: 1px dashed #f9a825; margin-top: 15px; padding-top: 15px; font-style: italic;">
        ${customText.notePersonalizzate.replace(/\n/g, '<br>')}
      </li>
      ` : ''}
    </ul>

    <!-- Incentivi e Risparmio Section -->
    <div class="details-box" style="margin-top: 20px; background-color: #f8f9fa;">
      <h3 class="details-heading">Incentivi e Risparmio Stimato</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="padding-right: 15px;">
          ${economicParams.percentualeDetrazione > 0 ? `
            <p style="margin-bottom: 10px;"><strong>Detrazioni Fiscali:</strong> ${economicParams.percentualeDetrazione}% in ${economicParams.anniDetrazione} anni</p>
          ` : ''}
          <p style="margin-bottom: 10px;"><strong>Risparmio annuo stimato:</strong> ~ € ${Math.round(potenzaTotale * economicParams.produzioneAnnuaKw * parseFloat(energyData.costoEnergiaAttuale || 0.15))}</p>
          <p style="margin-bottom: 10px;"><strong>Ritorno dell'investimento stimato:</strong> ~ ${results?.paybackPeriod || 'N/A'} anni</p>
        </div>
        <div style="padding-left: 15px; border-left: 2px solid #e5e7eb;">
          <p style="margin-bottom: 10px;"><strong>Cessione Energia:</strong> Scambio sul Posto</p>
          <p style="margin-bottom: 10px;"><strong>Capacità Accumulo:</strong> ${batteries.length > 0 ? '✓ Presente' : '✗ Non Presente'}</p>
          <p style="margin-bottom: 10px;"><strong>Monitoraggio Remoto:</strong> ✓ Incluso</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Why Choose SoleFacile -->
  <div class="details-box">
    <h3 class="details-heading">Perché Scegliere SoleFacile</h3>
    <div>
      <p><strong>✓ Esperienza Comprovata</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Oltre 500 impianti installati in tutta Italia</p>

      <p><strong>✓ Assistenza Continuativa</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Supporto tecnico dedicato per 5 anni</p>

      <p><strong>✓ Materiali Premium</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Utilizziamo solo componenti certificati di alta qualità</p>

      <p><strong>✓ Installatori Qualificati</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Team di tecnici specializzati e certificati</p>

      <p><strong>✓ Monitoraggio Avanzato</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Sistema di controllo remoto incluso</p>

      <p><strong>✓ Pratiche Amministrative</strong></p>
      <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Gestiamo tutte le procedure burocratiche</p>
    </div>
  </div>

  <!-- Signatures -->
  <div class="signature-area">
    <div class="signature-box">
      <p style="color: #666; font-size: 14px; margin-bottom: 5px;">Timbro e firma</p>
      <p class="signature-label">SoleFacile S.r.l.</p>
    </div>
    <div class="signature-box">
      <p style="color: #666; font-size: 14px; margin-bottom: 5px;">Per accettazione</p>
      <p class="signature-label">Firma Cliente</p>
    </div>
  </div>

  <!-- Print Button (shown on screen, hidden on print) -->
  <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px;" class="no-print">
    <button onclick="window.print()" style="background: #0F3460; color: white; padding: 15px 40px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      🖨️ Stampa / Salva come PDF
    </button>
    <p style="margin-top: 10px; color: #718096; font-size: 14px;">Usa "Salva come PDF" come destinazione nella finestra di stampa</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 0 0 35%; text-align: left;">
        ${logoSVG}
      </div>
      <div style="flex: 0 0 60%; text-align: right;">
        <p style="margin: 5px 0;"><strong>SoleFacile S.r.l.</strong> - P.IVA IT 09557480010</p>
        <p style="margin: 5px 0;">Via Nizza 108, 10126 Torino, Italia</p>
        <div class="contact-info">
          <p style="margin: 3px 0;">Tel: +39 3200103380 | Email: solefacilesrl@gmail.com</p>
          <p style="margin: 3px 0;">Web: www.solefacilesrl.com</p>
        </div>
      </div>
    </div>
  </div>
  </div> <!-- close page-content -->
</body>
</html>`;
  };

  return (
    <div className="mt-6 mb-6 flex flex-col items-center gap-4">
      {/* Export .prisma File Button */}
      <button
        onClick={handleSaveFile}
        className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 flex items-center w-full max-w-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Esporta file .prisma
      </button>

      {/* Save PDF Button */}
      <button
        onClick={handleSavePDF}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 flex items-center w-full max-w-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Salva PDF
      </button>

      {/* Status Message */}
      {saveStatus && (
        <div className={`mt-2 p-3 rounded-lg transition-opacity text-center ${
          saveStatus.startsWith('✅')
            ? 'bg-green-100 text-green-800'
            : saveStatus.startsWith('⏳')
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {saveStatus}
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
