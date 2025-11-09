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

  const generateQuoteHTML = () => {
    const today = new Date().toLocaleDateString('it-IT');
    const clientName = clientData.nome && clientData.cognome
      ? `${clientData.nome} ${clientData.cognome}`.trim()
      : clientData.nome || clientData.nomeCognome || 'Cliente';
    const address = clientData.indirizzo || 'Indirizzo non specificato';
    const riferimentoPreventivo = quoteData.riferimentoPreventivo || 'N/A';
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

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Preventivo Impianto Fotovoltaico - ${clientName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20mm 16mm;
      background-color: #fff;
      font-size: 14px;
    }

    .header {
      background-color: #0F3460;
      color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .header-info {
      text-align: right;
      font-size: 14px;
    }

    .doc-title {
      color: white;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 8px;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 15px 0 10px 0;
      color: #0F3460;
    }

    p {
      margin: 5px 0;
    }

    .two-columns {
      width: 100%;
      margin-bottom: 30px;
      page-break-inside: avoid;
      page-break-after: avoid;
    }

    .client-box, .tech-box {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 15px;
      border-left: 4px solid #0F3460;
      page-break-inside: avoid;
    }

    .section-title {
      color: #0F3460;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2E8B57;
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
      margin-bottom: 8px;
    }

    .eco-impact {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
      border-left: 4px solid #2E8B57;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .eco-title {
      font-weight: 600;
      color: #2E8B57;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .eco-stats {
      width: 100%;
      text-align: center;
    }

    .eco-stat-item {
      display: inline-block;
      width: 30%;
      text-align: center;
      margin: 5px;
    }

    .eco-value {
      font-size: 17px;
      font-weight: 700;
      color: #2E8B57;
      display: block;
    }

    .eco-label {
      font-size: 11px;
      color: #718096;
      display: block;
    }

    .details-box {
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;
      margin: 25px 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      page-break-inside: avoid;
    }

    .details-heading {
      background-color: #0F3460;
      margin: -20px -20px 15px -20px;
      padding: 12px 20px;
      font-weight: 600;
      color: white;
      font-size: 16px;
      border-radius: 10px 10px 0 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      page-break-inside: avoid;
    }

    th {
      background-color: #0F3460;
      color: white;
      font-weight: bold;
      font-size: 13px;
      padding: 10px;
      text-align: left;
      border: 1px solid #0F3460;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    td {
      padding: 8px 10px;
      border: 1px solid #ddd;
      text-align: left;
      font-size: 13px;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .total-row {
      font-weight: bold;
      background-color: #e3f2fd !important;
      border-top: 2px solid #0F3460;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .final-price-container {
      background-color: #0F3460;
      color: white;
      border-radius: 10px;
      padding: 25px;
      margin-top: 25px;
      text-align: right;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .final-price {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-top: 10px;
    }

    .note-container {
      margin-top: 25px;
      padding: 18px;
      background-color: #fffde7;
      border-radius: 8px;
      border-left: 4px solid #f9a825;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .note-title {
      color: #f57f17;
      font-weight: 600;
      margin: 0 0 12px 0;
      font-size: 16px;
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
      border-top: 1px dashed rgba(15, 52, 96, 0.2);
      width: 100%;
      page-break-inside: avoid;
    }

    .signature-box {
      display: inline-block;
      width: 45%;
      min-height: 80px;
      border-bottom: 1px solid rgba(15, 52, 96, 0.3);
      padding-bottom: 10px;
      margin: 10px 2%;
      vertical-align: top;
    }

    .signature-label {
      font-size: 13px;
      color: #666;
      margin-top: 10px;
      display: block;
    }

    .footer {
      background-color: #0F3460;
      color: white;
      border-radius: 10px;
      padding: 25px;
      margin-top: 30px;
      text-align: center;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .contact-info {
      margin-top: 12px;
      font-size: 0.9em;
    }

    h4 {
      margin: 20px 0 10px 0;
      font-size: 15px;
    }

    @media print {
      body {
        padding: 0;
        margin: 0;
      }

      .no-print {
        display: none !important;
      }

      .details-box, .client-box, .tech-box, .note-container, .signature-area {
        page-break-inside: avoid;
      }

      @page {
        margin: 20mm 16mm;
        size: A4;
      }

      /* Ensure colors print correctly */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="doc-title">PREVENTIVO IMPIANTO FOTOVOLTAICO</h1>
      <p style="margin: 0;">SoleFacile S.r.l.</p>
    </div>
    <div class="header-info">
      <p><strong>Riferimento:</strong> ${riferimentoPreventivo}</p>
      <p><strong>Data:</strong> ${today}</p>
      <p><strong>Validità:</strong> ${validitaPreventivo} giorni</p>
    </div>
  </div>

  <div class="two-columns">
    <div class="client-box">
      <h2 class="section-title">Informazioni Cliente</h2>
      <div>
        <p class="info-label">Cliente</p>
        <p class="info-value">${clientName}</p>

        <p class="info-label">Indirizzo impianto</p>
        <p class="info-value">${address}</p>

        <p class="info-label">Tipologia</p>
        <p class="info-value">Impianto Residenziale ECO</p>

        <p class="info-label">Consulente</p>
        <p class="info-value">Debasis</p>
      </div>
    </div>

    <div class="tech-box">
      <h2 class="section-title">Dati Tecnici</h2>
      <div>
        <p class="info-label">Potenza totale</p>
        <p class="info-value">${potenzaTotale.toFixed(2)} kWp</p>

        <p class="info-label">Produzione stimata</p>
        <p class="info-value">${Math.round(produzioneAnnua)} kWh/anno</p>

        <p class="info-label">CO₂ evitata</p>
        <p class="info-value">${co2Saved} kg/anno</p>

        <p class="info-label">Classe energetica</p>
        <p class="info-value">A+</p>
      </div>

      <div class="eco-impact">
        <p class="eco-title">Impatto Ambientale</p>
        <div class="eco-stats">
          <div class="eco-stat-item">
            <span class="eco-value">${Math.round(co2Saved / 1000)}</span>
            <span class="eco-label">Tonn. CO₂</span>
          </div>
          <div class="eco-stat-item">
            <span class="eco-value">${treesEquivalent}</span>
            <span class="eco-label">Alberi equiv.</span>
          </div>
          <div class="eco-stat-item">
            <span class="eco-value">${carsAvoided}</span>
            <span class="eco-label">Viaggi evitati</span>
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

      return `
        <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #2E8B57; page-break-inside: avoid;">
          <h5 style="color: #0F3460; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">${falda.nomeFalda || `Falda ${idx + 1}`}</h5>
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
          <th style="text-align: right;">Costo</th>
        </tr>
      </thead>
      <tbody>
        ${inverters.map(inv => {
          const costoUnitario = inv.modello?.prezzo || 0;
          const costoTotale = (costoUnitario * (inv.quantita || 1)).toFixed(2);
          return `
          <tr>
            <td>${inv.modello?.marca || ''} ${inv.modello?.modello || ''}</td>
            <td style="text-align: center;">${inv.modello?.potenza || '-'} kW</td>
            <td style="text-align: center;">${inv.stringhe || '-'}</td>
            <td style="text-align: center; font-weight: 600;">${inv.quantita || 1}</td>
            <td style="text-align: right;">€ ${costoTotale}</td>
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
          <th style="text-align: right;">Costo</th>
        </tr>
      </thead>
      <tbody>
        ${batteries.map(batt => {
          const costoUnitario = batt.modello?.prezzo || 0;
          const costoTotale = (costoUnitario * (batt.quantita || 1)).toFixed(2);
          return `
          <tr>
            <td>${batt.modello?.marca || ''} ${batt.modello?.modello || ''}</td>
            <td style="text-align: center; font-weight: 600;">${batt.modello?.capacita || '-'}</td>
            <td style="text-align: center;">${batt.modello?.tensione || '-'}</td>
            <td style="text-align: center; font-weight: 600;">${batt.quantita || 1}</td>
            <td style="text-align: right;">€ ${costoTotale}</td>
          </tr>
        `;
        }).join('')}
        <tr style="background-color: #f0f9ff; font-weight: bold;">
          <td colspan="3">Capacità Totale</td>
          <td style="text-align: center; color: #2E8B57;">
            ${batteries.reduce((sum, b) => sum + ((b.modello?.capacita || 0) * (b.quantita || 1)), 0).toFixed(1)} kWh
          </td>
          <td></td>
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
        <tr><td>Moduli Fotovoltaici</td><td style="text-align: right;">${results?.costoModuli || '0.00'}</td></tr>
        <tr><td>Inverter</td><td style="text-align: right;">${results?.costoInverter || '0.00'}</td></tr>
        <tr><td>Batterie</td><td style="text-align: right;">${results?.costoBatterie || '0.00'}</td></tr>
        <tr><td>Accessori</td><td style="text-align: right;">${results?.costoAccessori || '0.00'}</td></tr>
        <tr><td>Strutture di Fissaggio</td><td style="text-align: right;">${results?.costoStrutturale || '0.00'}</td></tr>
        <tr><td>Cavi e Cablaggi</td><td style="text-align: right;">${results?.costoCavi || '0.00'}</td></tr>
        <tr><td>Quadri Elettrici</td><td style="text-align: right;">${results?.costoQuadri || '0.00'}</td></tr>
        <tr><td>Manodopera</td><td style="text-align: right;">${results?.costoManodopera || '0.00'}</td></tr>
        <tr><td>Fresia e Preparazione</td><td style="text-align: right;">${results?.costoFresia || '0.00'}</td></tr>
        <tr><td>Sicurezza</td><td style="text-align: right;">${results?.costoSicurezza || '0.00'}</td></tr>
        <tr><td>Mezzi e Trasporto</td><td style="text-align: right;">${results?.costoMezzi || '0.00'}</td></tr>
        <tr class="total-row"><td><strong>TOTALE BASE</strong></td><td style="text-align: right;"><strong>${results?.costoTotaleBase || '0.00'}</strong></td></tr>
        <tr class="total-row"><td><strong>TOTALE CON MARGINE</strong></td><td style="text-align: right;"><strong>${results?.costoTotaleConMargine || '0.00'}</strong></td></tr>
        <tr><td>IVA (${economicParams.percentualeIva}%)</td><td style="text-align: right;">${results?.iva || '0.00'}</td></tr>
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
        <tr><td>Prima Tranche (Anticipo)</td><td>${quoteData.percentualePrimaPagamento}%</td><td style="text-align: right;">${results?.primaTranche || '0.00'}</td></tr>
        <tr><td>Seconda Tranche</td><td>${quoteData.percentualeSecondaPagamento}%</td><td style="text-align: right;">${results?.secondaTranche || '0.00'}</td></tr>
        <tr><td>Terza Tranche (Saldo)</td><td>${quoteData.percentualeTerzaPagamento}%</td><td style="text-align: right;">${results?.terzaTranche || '0.00'}</td></tr>
      </tbody>
    </table>
  </div>

  ${energyData.consumoAnnuo > 0 ? `
  <div class="details-box">
    <h3 class="details-heading">Analisi Economica</h3>
    <table>
      <tr><td>Consumo energetico annuale</td><td style="text-align: right;">${energyData.consumoAnnuo} kWh</td></tr>
      <tr><td>Costo energia attuale</td><td style="text-align: right;">€ ${energyData.costoEnergiaAttuale}/kWh</td></tr>
      <tr><td>Spesa annua attuale</td><td style="text-align: right;">€ ${energyData.spesaAnnuaEnergia}</td></tr>
      <tr><td>Produzione impianto stimata</td><td style="text-align: right;">${Math.round(produzioneAnnua)} kWh</td></tr>
      <tr><td>Risparmio annuo stimato</td><td style="text-align: right;">€ ${results?.risparmioAnnuo || '0'}</td></tr>
      <tr class="total-row"><td><strong>Tempo di rientro</strong></td><td style="text-align: right;"><strong>${results?.paybackPeriod || 'N/A'} anni</strong></td></tr>
    </table>
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
    <p><strong>SoleFacile S.r.l.</strong> - P.IVA IT 09557480010</p>
    <p>Via Nizza 108, 10126 Torino, Italia</p>
    <div class="contact-info">
      <p>Tel: +39 3200103380 | Email: solefacilesrl@gmail.com</p>
      <p>Web: www.solefacilesrl.com</p>
    </div>
  </div>
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
