/**
 * PDF Generator Service
 * Generates PDF-ready HTML using the PRISMA.html template
 * and populates it with data from the form
 */

/**
 * Loads the PRISMA.html template
 * @returns {Promise<string>} The HTML template content
 */
export const loadPrismaTemplate = async () => {
  try {
    // For development, we'll fetch from the public folder
    // The PRISMA.html should be copied to /public/templates/
    const response = await fetch('/templates/PRISMA.html');
    if (!response.ok) {
      throw new Error('Failed to load PRISMA template');
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading PRISMA template:', error);
    throw error;
  }
};

/**
 * Populates the PRISMA template with form data
 * @param {string} templateHTML - The PRISMA.html template
 * @param {object} formData - All form data from FormContext
 * @returns {string} The populated HTML ready for PDF generation
 */
export const populatePrismaTemplate = (templateHTML, formData) => {
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
  } = formData;

  // Parse the HTML template
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHTML, 'text/html');

  // Helper function to safely set input value
  const setInputValue = (id, value) => {
    const element = doc.getElementById(id);
    if (element) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = value || '';
        element.setAttribute('value', value || '');
      } else if (element.tagName === 'SELECT') {
        element.value = value || '';
        // Also set the selected attribute on the option
        const options = element.querySelectorAll('option');
        options.forEach(opt => {
          if (opt.value === value) {
            opt.setAttribute('selected', 'selected');
          } else {
            opt.removeAttribute('selected');
          }
        });
      } else {
        element.textContent = value || '';
      }
    }
  };

  // Helper function to set text content
  const setTextContent = (id, value) => {
    const element = doc.getElementById(id);
    if (element) {
      element.textContent = value || '';
    }
  };

  // SECTION 1: Client and Installation Data
  const fullName = clientData.nome && clientData.cognome
    ? `${clientData.nome} ${clientData.cognome}`.trim()
    : clientData.nome || clientData.nomeCognome || '';

  const fullAddress = clientData.indirizzo && clientData.citta
    ? `${clientData.indirizzo}, ${clientData.citta}`
    : clientData.indirizzo || '';

  setInputValue('nomeCognomeCliente', fullName);
  setInputValue('indirizzoImpianto', fullAddress);
  setInputValue('riferimentoPreventivo', quoteData.riferimentoPreventivo || '');

  // SECTION 2: Structure Data
  setInputValue('tipoTetto', structureData.tipoTetto || 'lamiera');
  setInputValue('altezzaCapannone', structureData.altezzaEdificio || '10');
  setInputValue('profonditaCapannone', structureData.lunghezzaEdificio || '40');

  // SECTION 3: Falde (Roof Sections)
  // Remove existing falde and recreate them
  const faldeContainer = doc.getElementById('faldeContainer');
  if (faldeContainer && falde && falde.length > 0) {
    faldeContainer.innerHTML = ''; // Clear existing falde

    falde.forEach((falda, index) => {
      const faldaHTML = createFaldaHTML(falda, index, doc);
      faldeContainer.insertAdjacentHTML('beforeend', faldaHTML);
    });
  }

  // SECTION 4: Inverters
  // For simplicity, we'll set the first inverter if exists
  if (inverters && inverters.length > 0) {
    const firstInverter = inverters[0];
    if (firstInverter.modello) {
      // Try to match the inverter model in the select
      const inverterSelect = doc.getElementById('inverter');
      if (inverterSelect) {
        const options = inverterSelect.querySelectorAll('option');
        options.forEach(opt => {
          const optText = opt.textContent.toLowerCase();
          const modelText = (firstInverter.modello.modello || '').toLowerCase();
          if (optText.includes(modelText)) {
            opt.setAttribute('selected', 'selected');
          }
        });
      }
    }
  }

  // SECTION 5: Batteries
  if (batteries && batteries.length > 0) {
    const firstBattery = batteries[0];
    if (firstBattery.modello) {
      const batterySelect = doc.getElementById('batteria');
      if (batterySelect) {
        const options = batterySelect.querySelectorAll('option');
        options.forEach(opt => {
          const optText = opt.textContent.toLowerCase();
          const modelText = (firstBattery.modello.modello || '').toLowerCase();
          if (optText.includes(modelText)) {
            opt.setAttribute('selected', 'selected');
          }
        });
      }
      // Set quantity
      setInputValue('numeroBatterie', firstBattery.quantita || '1');
    }
  }

  // SECTION 6: Components
  if (components) {
    // EV Charger
    if (components.evCharger && components.evCharger !== 'none') {
      setInputValue('evCharger', components.evCharger);
      setInputValue('numeroEvCharger', components.numeroEvCharger || '1');
    }

    // ESS Cabinet
    if (components.essCabinet && components.essCabinet !== 'none') {
      setInputValue('essCabinet', components.essCabinet);
      setInputValue('numeroEssCabinet', components.numeroEssCabinet || '1');
    }

    // Parallel Box
    if (components.parallelBox && components.parallelBox !== 'none') {
      setInputValue('parallelBox', components.parallelBox);
      setInputValue('numeroParallelBox', components.numeroParallelBox || '1');
    }

    // Connectivity
    if (components.connettivita && components.connettivita !== 'none') {
      setInputValue('connettivita', components.connettivita);
      setInputValue('numeroConnettivita', components.numeroConnettivita || '1');
    }

    // Backup Control
    if (components.backupControllo && components.backupControllo !== 'none') {
      setInputValue('backupControllo', components.backupControllo);
      setInputValue('numeroBackupControllo', components.numeroBackupControllo || '1');
    }

    // Meter CT
    if (components.meterCT && components.meterCT !== 'none') {
      setInputValue('meterCT', components.meterCT);
      setInputValue('numeroMeterCT', components.numeroMeterCT || '1');
    }

    // Cables and Accessories
    if (components.caviAccessori && components.caviAccessori !== 'none') {
      setInputValue('caviAccessori', components.caviAccessori);
      setInputValue('numeroCaviAccessori', components.numeroCaviAccessori || '1');
    }
  }

  // SECTION 7: Labor and Safety
  if (laborSafety) {
    setInputValue('costoManodopera', laborSafety.costoManodoperaKw || '180');
    setInputValue('costoFresia', laborSafety.costoFresia || '800');
    setInputValue('costoSicurezza', laborSafety.costoSicurezza || '2500');
    setInputValue('margineGuadagno', laborSafety.margineGuadagno || '30');
  }

  // SECTION 8: Unit Costs
  if (unitCosts) {
    setInputValue('costoMorsettiCentrali', unitCosts.costoMorsettiCentrali || '1.3');
    setInputValue('costoMorsettiFinali', unitCosts.costoMorsettiFinali || '1.5');
    setInputValue('costoStrutturaleLamiera', unitCosts.costoStrutturaleLamiera || '14');
    setInputValue('costoStrutturaleTegole', unitCosts.costoStrutturaleTegole || '23');
    setInputValue('costoCaviCC', unitCosts.costoCaviCC || '1.2');
    setInputValue('costoCaviCA', unitCosts.costoCaviCA || '1.5');
    setInputValue('costoQuadri', unitCosts.costoQuadri || '300');
    setInputValue('costoMezzi', unitCosts.costoMezzi || '300');
  }

  // SECTION 9: Energy Data
  if (energyData) {
    setInputValue('consumoAnnuo', energyData.consumoAnnuo || '0');
    setInputValue('costoEnergiaAttuale', energyData.costoEnergiaAttuale || '0.25');
    setInputValue('percentualeAutoconsumo', energyData.percentualeAutoconsumo || '70');
  }

  // SECTION 10: Economic Parameters
  if (economicParams) {
    setInputValue('produzioneAnnuaKw', economicParams.produzioneAnnuaKw || '1200');
    setInputValue('percentualeIva', economicParams.percentualeIva || '10');
    setInputValue('incentivoPv', economicParams.incentivoPv || '0.12');
    setInputValue('percentualeDetrazione', economicParams.percentualeDetrazione || '50');
    setInputValue('anniDetrazione', economicParams.anniDetrazione || '10');
  }

  // SECTION 11: Quote Data
  if (quoteData) {
    setInputValue('validitaPreventivo', quoteData.validitaPreventivo || '20');
    setInputValue('percentualePrimaPagamento', quoteData.percentualePrimaPagamento || '30');
    setInputValue('percentualeSecondaPagamento', quoteData.percentualeSecondaPagamento || '30');
    setInputValue('percentualeTerzaPagamento', quoteData.percentualeTerzaPagamento || '40');
  }

  // SECTION 12: Custom Text
  if (customText) {
    setInputValue('premessaPersonalizzata', customText.premessaPersonalizzata || '');
    setInputValue('notePersonalizzate', customText.notePersonalizzate || '');
  }

  // SECTION 13: Render Images
  if (renderImages && renderImages.length > 0) {
    const renderGallery = doc.querySelector('.render-gallery');
    if (renderGallery) {
      renderGallery.innerHTML = '';
      renderImages.forEach((imgSrc, index) => {
        if (imgSrc) {
          const img = doc.createElement('img');
          img.src = imgSrc;
          img.alt = `Render ${index + 1}`;
          img.className = 'render-image';
          renderGallery.appendChild(img);
        }
      });
    }
  }

  // SECTION 14: Results (read-only display values)
  // These will be calculated by the JavaScript in the template
  // But we can pre-fill them for static PDF
  if (results) {
    setTextContent('displayPotenzaTotale', `${results.potenzaTotaleKw || '0'} kW`);
    setTextContent('displayCostoTotale', `€ ${results.costoTotaleConIva || '0'}`);
    setTextContent('displayCostoTotaleBase', `€ ${results.costoTotaleBase || '0'}`);
    setTextContent('displayCostoTotaleConMargine', `€ ${results.costoTotaleConMargine || '0'}`);
  }

  // Remove all script tags to prevent execution and reduce size
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Add print-specific styles
  const printStyles = doc.createElement('style');
  printStyles.textContent = `
    @media print {
      @page {
        margin: 15mm 10mm;
        size: A4;
      }

      body {
        padding: 0;
        margin: 0;
      }

      /* Hide interactive elements */
      button, .save-controls, #aggiungiFalda, #aggiungiInverter {
        display: none !important;
      }

      /* Ensure colors print correctly */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Prevent page breaks inside important sections */
      .form-section {
        page-break-inside: avoid;
      }
    }
  `;
  doc.head.appendChild(printStyles);

  // Add a print button at the top
  const printButton = doc.createElement('button');
  printButton.textContent = 'Stampa / Salva come PDF';
  printButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  printButton.onclick = () => window.print();
  doc.body.insertBefore(printButton, doc.body.firstChild);

  // Serialize back to HTML string
  return new XMLSerializer().serializeToString(doc);
};

/**
 * Helper function to create HTML for a single falda
 */
const createFaldaHTML = (falda, index, doc) => {
  let html = `
    <div class="falda-item" data-falda-index="${index}" style="background-color: rgba(255, 255, 255, 0.5); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
      <h4 style="color: #1f2937; margin-bottom: 10px; font-weight: 600;">
        ${falda.nomeFalda || `Falda ${index + 1}`}
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;">
        <div>
          <label style="font-size: 0.875rem; color: #4b5563;">Inclinazione (°)</label>
          <input type="number" value="${falda.inclinazione || '0'}" readonly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; background-color: #f9fafb;">
        </div>
        <div>
          <label style="font-size: 0.875rem; color: #4b5563;">Orientamento (°)</label>
          <input type="number" value="${falda.orientamento || '0'}" readonly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; background-color: #f9fafb;">
        </div>
        <div>
          <label style="font-size: 0.875rem; color: #4b5563;">Lunghezza (m)</label>
          <input type="number" value="${falda.lunghezza || '0'}" readonly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; background-color: #f9fafb;">
        </div>
        <div>
          <label style="font-size: 0.875rem; color: #4b5563;">Larghezza (m)</label>
          <input type="number" value="${falda.larghezza || '0'}" readonly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; background-color: #f9fafb;">
        </div>
      </div>
  `;

  // Add module groups
  if (falda.gruppiModuli && falda.gruppiModuli.length > 0) {
    falda.gruppiModuli.forEach((gruppo, gIndex) => {
      const moduloNome = gruppo.modulo ? `${gruppo.modulo.marca} ${gruppo.modulo.modello}` : 'Nessun modulo';
      const potenzaModulo = gruppo.modulo ? gruppo.modulo.potenza : 0;
      const numeroModuli = gruppo.numeroFile * gruppo.moduliPerFila;
      const potenzaTotale = ((potenzaModulo / 1000) * numeroModuli).toFixed(2);

      html += `
        <div style="background-color: rgba(59, 130, 246, 0.1); padding: 10px; border-radius: 6px; margin-top: 10px;">
          <p style="font-size: 0.875rem; color: #1f2937; margin: 5px 0;"><strong>Gruppo ${gIndex + 1}:</strong> ${moduloNome}</p>
          <p style="font-size: 0.875rem; color: #4b5563; margin: 5px 0;">File: ${gruppo.numeroFile} × Moduli per fila: ${gruppo.moduliPerFila} = ${numeroModuli} moduli</p>
          <p style="font-size: 0.875rem; color: #4b5563; margin: 5px 0;">Potenza: ${potenzaTotale} kW</p>
        </div>
      `;
    });
  }

  html += `</div>`;
  return html;
};

/**
 * Generates a PDF using the PRISMA template
 * @param {object} formData - All form data from FormContext
 * @returns {Promise<void>} Opens the PDF in a new window for printing
 */
export const generatePDFFromTemplate = async (formData) => {
  try {
    // Load the template
    const template = await loadPrismaTemplate();

    // Populate it with form data
    const populatedHTML = populatePrismaTemplate(template, formData);

    // Open in new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window. Please allow popups for this site.');
    }

    printWindow.document.write(populatedHTML);
    printWindow.document.close();

    // Wait for content to load, then auto-print
    printWindow.onload = () => {
      // Small delay to ensure all styles are applied
      setTimeout(() => {
        printWindow.focus();
        // Don't auto-print, let user click the button
        // printWindow.print();
      }, 500);
    };

    return printWindow;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
