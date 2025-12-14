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
export const populatePrismaTemplate = (templateHTML, formData, modules = []) => {
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
      const faldaHTML = createFaldaHTML(falda, index, doc, structureData.tipoTetto, modules);
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

    // Apply bold styling to custom text elements
    const premessaElement = doc.getElementById('premessaPersonalizzata');
    if (premessaElement) {
      premessaElement.style.fontWeight = 'bold';
    }

    const noteElement = doc.getElementById('notePersonalizzate');
    if (noteElement) {
      noteElement.style.fontWeight = 'bold';
    }
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

  // Remove external CSS links (like Tailwind) that might have unsupported features
  const links = doc.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.includes('tailwind') || href.includes('cdn'))) {
      link.remove();
    }
  });

  // Remove or convert unsupported CSS color functions (oklch, etc.) for html2pdf
  const styles = doc.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent) {
      // Replace oklch colors with fallback colors
      style.textContent = style.textContent
        .replace(/oklch\([^)]+\)/g, '#0F3460') // Replace oklch with primary color
        .replace(/color-mix\([^)]+\)/g, 'rgba(15, 52, 96, 0.1)') // Replace color-mix with fallback
        .replace(/lab\([^)]+\)/g, '#0F3460') // Replace lab colors
        .replace(/lch\([^)]+\)/g, '#0F3460'); // Replace lch colors
    }
  });

  // Remove inline style attributes with unsupported color functions
  const elementsWithStyle = doc.querySelectorAll('[style]');
  elementsWithStyle.forEach(element => {
    const styleAttr = element.getAttribute('style');
    if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('color-mix') || styleAttr.includes('lab(') || styleAttr.includes('lch('))) {
      const cleanedStyle = styleAttr
        .replace(/oklch\([^)]+\)/g, '#0F3460')
        .replace(/color-mix\([^)]+\)/g, 'rgba(15, 52, 96, 0.1)')
        .replace(/lab\([^)]+\)/g, '#0F3460')
        .replace(/lch\([^)]+\)/g, '#0F3460');
      element.setAttribute('style', cleanedStyle);
    }
  });

  // Add print-specific styles matching PRISMA template formatting
  const printStyles = doc.createElement('style');
  printStyles.textContent = `
    @media print {
      @page {
        margin: 20mm 16mm;
        size: A4;
      }

      body {
        padding: 0;
        margin: 0;
        font-size: 14px;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Hide interactive elements */
      button, .save-controls, #aggiungiFalda, #aggiungiInverter, .no-print {
        display: none !important;
      }

      /* Ensure colors print correctly everywhere */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Prevent page breaks inside important sections */
      .form-section, .falda-item, .client-box, .tech-box, .details-box {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Header styling with gradient */
      .header {
        background: linear-gradient(135deg, #0F3460, #243b55) !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        padding: 15px 20px;
        margin-bottom: 20px;
      }

      /* Footer styling */
      .footer, .footer-info {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        background: linear-gradient(135deg, #0F3460, #243b55) !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        border-radius: 12px;
        padding: 30px;
        margin-top: 30px;
      }

      /* Section titles */
      .section-title, h2 {
        background-color: #0F3460 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        padding: 8px !important;
        font-size: 18px;
        page-break-after: avoid;
        break-after: avoid;
      }

      /* Tables */
      table {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      table th {
        background-color: #0F3460 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        padding: 8px !important;
      }

      th, td {
        background-color: transparent !important;
        print-color-adjust: exact !important;
        text-align: center;
      }

      /* Gradients and backgrounds */
      [style*="background:"],
      [style*="background-color:"],
      [style*="background: linear-gradient"] {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Price and highlight boxes */
      .final-price-container, .highlight-box {
        background: linear-gradient(135deg, #0F3460, #243b55) !important;
        color: white !important;
        page-break-inside: avoid;
        break-inside: avoid;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Note containers */
      .note-container {
        background-color: #fffde7 !important;
        border-left: 4px solid #f9a825 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Signature area */
      .signature-area, .signature-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin-top: 60px !important;
      }

      /* Badges */
      .badge-eco {
        background-color: #2E8B57 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .badge-accent {
        background-color: #E6B31E !important;
        color: #2D3748 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
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
const createFaldaHTML = (falda, index, doc, tipoTetto, modules = []) => {
  // Generate correct name based on type
  let faldaNome;
  if (falda.tettoiaIndex !== undefined) {
    const isATerra = tipoTetto === 'a terra';
    const baseNome = isATerra ? 'Struttura' : 'Tettoia';
    faldaNome = `${baseNome} ${falda.tettoiaIndex + 1}`;
  } else {
    faldaNome = falda.nome || `Falda ${index + 1}`;
  }

  let html = `
    <div class="falda-item" data-falda-index="${index}" style="background-color: rgba(255, 255, 255, 0.5); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
      <h4 style="color: #1f2937; margin-bottom: 10px; font-weight: 600;">
        ${faldaNome}
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
      const moduloObj = modules.find(m => m.id === gruppo.modulo) || modules[0] || {};
      const moduloNome = moduloObj.name || 'Nessun modulo';
      const potenzaModulo = moduloObj.potenza || 0;
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
 * @param {array} modules - Array of available solar modules
 * @returns {Promise<void>} Opens the PDF in a new window for printing
 */
export const generatePDFFromTemplate = async (formData, modules = []) => {
  try {
    // Load the template
    const template = await loadPrismaTemplate();

    // Populate it with form data
    const populatedHTML = populatePrismaTemplate(template, formData, modules);

    // Create blob and open in new tab (more reliable than popup)
    const blob = new Blob([populatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');

    if (!printWindow) {
      // If popup blocked, download as HTML file
      const clientName = formData.clientData?.nome || 'Cliente';
      const riferimento = formData.quoteData?.riferimentoPreventivo || 'draft';
      const a = document.createElement('a');
      a.href = url;
      a.download = `Preventivo_PRISMA_${clientName}_${riferimento}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      throw new Error('Popup blocked. Preventivo HTML downloaded instead.');
    }

    // Cleanup blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    return printWindow;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
