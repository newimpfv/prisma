import { useState } from 'react';
import { useForm } from '../../context/FormContext';
import { generatePDFFromTemplate } from '../../services/pdfGenerator';

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

  const handleGeneratePDF = async () => {
    try {
      setSaveStatus('⏳ Generazione PDF in corso...');

      // Prepare all form data
      const formData = {
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
      };

      // Try to generate PDF using PRISMA template
      await generatePDFFromTemplate(formData);

      setSaveStatus('✅ PDF generato con successo!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error generating PDF from template:', error);
      setSaveStatus('⚠️ Errore template, uso versione semplificata...');

      // Fallback to simple HTML version
      setTimeout(() => {
        try {
          const quoteHTML = generateQuoteHTML();
          const printWindow = window.open('', '_blank');
          printWindow.document.write(quoteHTML);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
          setSaveStatus('✅ PDF semplificato generato!');
          setTimeout(() => setSaveStatus(''), 3000);
        } catch (fallbackError) {
          setSaveStatus('❌ Errore nella generazione del PDF');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      }, 1000);
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
    :root {
      --primary-color: #0F3460;
      --secondary-color: #2E8B57;
      --accent-color: #E6B31E;
      --light-bg: #f8f9fa;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
    }

    .header {
      background: linear-gradient(135deg, #0F3460, #243b55);
      color: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info {
      text-align: right;
    }

    .doc-title {
      color: white;
      font-weight: 700;
      font-size: 24px;
      margin-bottom: 15px;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .client-box, .tech-box {
      background-color: var(--light-bg);
      border-radius: 8px;
      padding: 25px;
      border-left: 4px solid var(--primary-color);
    }

    .section-title {
      color: var(--primary-color);
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--secondary-color);
    }

    .info-label {
      color: #718096;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .info-value {
      font-weight: 600;
      font-size: 16px;
      color: #2D3748;
      margin-bottom: 15px;
    }

    .eco-impact {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      border-left: 4px solid var(--secondary-color);
    }

    .eco-title {
      font-weight: 600;
      color: var(--secondary-color);
      margin-bottom: 10px;
    }

    .eco-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .eco-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--secondary-color);
    }

    .eco-label {
      font-size: 12px;
      color: #718096;
    }

    .details-box {
      background-color: #fff;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(15, 52, 96, 0.05);
    }

    .details-heading {
      background-color: #f8f9fc;
      margin: -20px -20px 20px -20px;
      padding: 15px 20px;
      font-weight: 600;
      color: var(--primary-color);
    }

    table {
      border-collapse: collapse;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background-color: #0F3460;
      color: white;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 14px;
      padding: 12px;
      text-align: left;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #edf2f7;
      text-align: left;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .total-row {
      font-weight: bold;
      background-color: #eef2ff !important;
      border-top: 2px solid var(--primary-color);
    }

    .final-price-container {
      background: linear-gradient(135deg, #0F3460, #243b55);
      color: white;
      border-radius: 12px;
      padding: 30px;
      margin-top: 30px;
      text-align: right;
    }

    .final-price {
      font-size: 32px;
      font-weight: 700;
      color: white;
    }

    .note-container {
      margin-top: 30px;
      padding: 20px;
      background-color: #fffde7;
      border-radius: 8px;
      border-left: 4px solid #f9a825;
    }

    .note-title {
      color: #f57f17;
      font-weight: 600;
      margin-top: 0;
    }

    .note-list {
      padding-left: 20px;
    }

    .note-list li {
      margin-bottom: 8px;
    }

    .signature-area {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 1px dashed rgba(15, 52, 96, 0.2);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .signature-box {
      min-height: 100px;
      border-bottom: 1px solid rgba(15, 52, 96, 0.2);
      padding-bottom: 15px;
    }

    .signature-label {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }

    .footer {
      background-color: #0F3460;
      color: white;
      border-radius: 12px;
      padding: 30px;
      margin-top: 40px;
      text-align: center;
    }

    .contact-info {
      margin-top: 15px;
      font-size: 0.9em;
    }

    .print-button {
      background-color: #1a56db;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      margin: 20px 0;
    }

    .print-button:hover {
      background-color: #1e40af;
    }

    @media print {
      @page {
        margin: 20mm 16mm;
        size: A4;
      }

      body {
        padding: 0;
        margin: 0;
        font-size: 14px;
      }

      .print-button {
        display: none;
      }

      .header, .footer {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
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
          <div>
            <div class="eco-value">${Math.round(co2Saved / 1000)}</div>
            <div class="eco-label">Tonn. CO₂</div>
          </div>
          <div>
            <div class="eco-value">${treesEquivalent}</div>
            <div class="eco-label">Alberi equiv.</div>
          </div>
          <div>
            <div class="eco-value">${carsAvoided}</div>
            <div class="eco-label">Viaggi evitati</div>
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

    <h4>Moduli Fotovoltaici</h4>
    <table>
      <thead>
        <tr>
          <th>Falda</th>
          <th>Moduli</th>
          <th>Potenza</th>
        </tr>
      </thead>
      <tbody>
        ${falde.map(falda => {
          const totalePotenzaFalda = falda.gruppiModuli.reduce((sum, g) => {
            const modulo = g.modulo;
            const numeroModuli = g.numeroFile * g.moduliPerFila;
            return sum + (modulo ? numeroModuli * (modulo.potenza / 1000) : 0);
          }, 0);

          return `
            <tr>
              <td>${falda.nomeFalda}</td>
              <td>${falda.gruppiModuli.reduce((sum, g) => sum + (g.numeroFile * g.moduliPerFila), 0)}</td>
              <td>${totalePotenzaFalda.toFixed(2)} kW</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    ${inverters.length > 0 ? `
    <h4 style="margin-top: 20px;">Inverter</h4>
    <table>
      <thead>
        <tr>
          <th>Modello</th>
          <th>Stringhe</th>
          <th>Quantità</th>
        </tr>
      </thead>
      <tbody>
        ${inverters.map(inv => `
          <tr>
            <td>${inv.modello?.marca || ''} ${inv.modello?.modello || ''}</td>
            <td>${inv.stringhe}</td>
            <td>${inv.quantita}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${batteries.length > 0 ? `
    <h4 style="margin-top: 20px;">Sistema di Accumulo</h4>
    <table>
      <thead>
        <tr>
          <th>Modello</th>
          <th>Capacità</th>
          <th>Quantità</th>
        </tr>
      </thead>
      <tbody>
        ${batteries.map(batt => `
          <tr>
            <td>${batt.modello?.marca || ''} ${batt.modello?.modello || ''}</td>
            <td>${batt.modello?.capacita || ''} kWh</td>
            <td>${batt.quantita}</td>
          </tr>
        `).join('')}
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
    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
      ${renderImages.map((img, index) => img ? `
        <img src="${img}" alt="Render ${index + 1}" style="max-width: 45%; border-radius: 8px; border: 1px solid #e2e8f0;">
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
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <p><strong>✓ Esperienza Comprovata</strong></p>
        <p style="color: #666; font-size: 14px;">Oltre 500 impianti installati in tutta Italia</p>

        <p><strong>✓ Assistenza Continuativa</strong></p>
        <p style="color: #666; font-size: 14px;">Supporto tecnico dedicato per 5 anni</p>

        <p><strong>✓ Materiali Premium</strong></p>
        <p style="color: #666; font-size: 14px;">Utilizziamo solo componenti certificati di alta qualità</p>
      </div>
      <div>
        <p><strong>✓ Installatori Qualificati</strong></p>
        <p style="color: #666; font-size: 14px;">Team di tecnici specializzati e certificati</p>

        <p><strong>✓ Monitoraggio Avanzato</strong></p>
        <p style="color: #666; font-size: 14px;">Sistema di controllo remoto incluso</p>

        <p><strong>✓ Pratiche Amministrative</strong></p>
        <p style="color: #666; font-size: 14px;">Gestiamo tutte le procedure burocratiche</p>
      </div>
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

  <!-- Footer -->
  <div class="footer">
    <p><strong>SoleFacile S.r.l.</strong> - P.IVA IT 09557480010</p>
    <p>Via Nizza 108, 10126 Torino, Italia</p>
    <div class="contact-info">
      <p>Tel: +39 3200103380 | Email: solefacilesrl@gmail.com</p>
      <p>Web: www.solefacilesrl.com</p>
    </div>
    <p style="margin-top: 20px;">
      <button class="print-button" onclick="window.print()">Stampa / Salva come PDF</button>
    </p>
  </div>
</body>
</html>`;
  };

  return (
    <div className="mt-6 mb-6 flex flex-col items-center gap-4">
      {/* Save File Button */}
      <button
        onClick={handleSaveFile}
        className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 flex items-center w-full max-w-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Salva File
      </button>

      {/* Generate PDF Button */}
      <button
        onClick={handleGeneratePDF}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 flex items-center w-full max-w-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Genera Preventivo
      </button>

      {/* Status Message */}
      {saveStatus && (
        <div className={`mt-2 p-3 rounded-lg transition-opacity ${
          saveStatus.startsWith('✅')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {saveStatus}
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
