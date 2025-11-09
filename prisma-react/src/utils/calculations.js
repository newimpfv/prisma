/**
 * PRISMA Calculation Engine
 * All calculation functions for solar installation quoting
 *
 * Now uses dynamic product data from Airtable instead of static imports
 */

import {
  essCabinet,
  parallelBox,
  evCharger,
  connettivita,
  backupControllo,
  meterCT,
  caviAccessori
} from '../data/accessories';

// Helper function to find product by ID
const findProductById = (data, id) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.find(item => item.id === id);
  }
  // If data is object with categories
  for (const category of Object.values(data)) {
    if (Array.isArray(category)) {
      const found = category.find(item => item.id === id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 1. Calculate Total Modules
 * Sums all modules across all Falde and Gruppi Moduli
 */
export const calculateTotalModules = (falde) => {
  let total = 0;
  falde.forEach(falda => {
    falda.gruppiModuli.forEach(gruppo => {
      const numeroModuli = (gruppo.numeroFile || 0) * (gruppo.moduliPerFila || 0);
      total += numeroModuli;
    });
  });
  return total;
};

/**
 * 2. Calculate Total Power (kW)
 * Total power from all modules
 */
export const calculateTotalPower = (falde, modulesData = []) => {
  let totalWatts = 0;
  falde.forEach(falda => {
    falda.gruppiModuli.forEach(gruppo => {
      const module = modulesData.find(m => m.id === gruppo.modulo);
      if (module) {
        const numeroModuli = (gruppo.numeroFile || 0) * (gruppo.moduliPerFila || 0);
        totalWatts += (module.potenza * numeroModuli);
      }
    });
  });
  return totalWatts / 1000; // Convert to kW
};

/**
 * 3. Calculate Module Costs
 * Total cost of all solar modules
 */
export const calculateModuleCosts = (falde, modulesData = []) => {
  let total = 0;
  falde.forEach(falda => {
    falda.gruppiModuli.forEach(gruppo => {
      const module = modulesData.find(m => m.id === gruppo.modulo);
      if (module) {
        const numeroModuli = (gruppo.numeroFile || 0) * (gruppo.moduliPerFila || 0);
        total += (module.prezzo * numeroModuli);
      }
    });
  });
  return total;
};

/**
 * 4. Calculate Inverter Costs
 * Total cost of all inverters
 */
export const calculateInverterCosts = (invertersList, invertersData = []) => {
  let total = 0;
  invertersList.forEach(inv => {
    if (inv.tipo !== 'none') {
      const inverter = findProductById(invertersData, inv.tipo);
      if (inverter) {
        total += (inverter.prezzo * (inv.quantita || 1));
      }
    }
  });
  return total;
};

/**
 * 5. Calculate Battery Costs
 * Total cost of all batteries
 */
export const calculateBatteryCosts = (batteriesList, batteriesData = []) => {
  let total = 0;
  batteriesList.forEach(bat => {
    if (bat.tipo !== 'none') {
      const battery = findProductById(batteriesData, bat.tipo);
      if (battery) {
        total += (battery.prezzo * (bat.quantita || 1));
      }
    }
  });
  return total;
};

/**
 * 6. Calculate Accessory Costs
 * Total cost of all accessories (ESS Cabinet, Parallel Box, EV Charger, etc.)
 */
export const calculateAccessoryCosts = (components) => {
  let total = 0;

  // ESS Cabinet
  if (components.essCabinet !== 'none') {
    const product = findProductById(essCabinet, components.essCabinet);
    if (product) {
      total += product.prezzo * (components.numeroEssCabinet || 1);
    }
  }

  // Parallel Box
  if (components.parallelBox !== 'none') {
    const product = findProductById(parallelBox, components.parallelBox);
    if (product) {
      total += product.prezzo * (components.numeroParallelBox || 1);
    }
  }

  // EV Charger
  if (components.evCharger !== 'none') {
    const product = findProductById(evCharger, components.evCharger);
    if (product) {
      total += product.prezzo * (components.numeroEvCharger || 1);
    }
  }

  // Connettività
  if (components.connettivita !== 'none') {
    const product = findProductById(connettivita, components.connettivita);
    if (product) {
      total += product.prezzo * (components.numeroConnettivita || 1);
    }
  }

  // Backup e Controllo
  if (components.backupControllo !== 'none') {
    const product = findProductById(backupControllo, components.backupControllo);
    if (product) {
      total += product.prezzo * (components.numeroBackupControllo || 1);
    }
  }

  // Meter e CT
  if (components.meterCT !== 'none') {
    const product = findProductById(meterCT, components.meterCT);
    if (product) {
      total += product.prezzo * (components.numeroMeterCT || 1);
    }
  }

  // Cavi e Accessori
  if (components.caviAccessori !== 'none') {
    const product = findProductById(caviAccessori, components.caviAccessori);
    if (product) {
      total += product.prezzo * (components.numeroCaviAccessori || 1);
    }
  }

  return total;
};

/**
 * 7. Calculate Structural Components
 * Rails, clamps, brackets based on modules and roof type
 */
export const calculateStructuralComponents = (falde, structureData, unitCosts, totalModules, modulesData = []) => {
  const tipoTetto = structureData.tipoTetto;
  const lunghezzaGuida = 3.1; // meters per rail

  // Calculate clamps, rails, staffe, and prolunghe based on actual module layout
  let morsettiCentrali = 0;
  let morsettiFinali = 0;
  let guideTotali = 0;
  let staffeTotali = 0;
  let prolungheTotali = 0;

  falde.forEach(falda => {
    falda.gruppiModuli.forEach(gruppo => {
      const numeroFile = gruppo.numeroFile || 0;
      const moduliPerFila = gruppo.moduliPerFila || 0;

      if (numeroFile && moduliPerFila) {
        // Central clamps: 2 for each gap between modules in a row
        const morsettiCentraliPerFila = (moduliPerFila - 1) * 2;
        morsettiCentrali += morsettiCentraliPerFila * numeroFile;

        // End clamps: 4 per row (2 at start + 2 at end)
        const morsettiFinaliPerFila = 4;
        morsettiFinali += morsettiFinaliPerFila * numeroFile;

        // Calculate rails based on actual module dimensions
        const module = modulesData.find(m => m.id === gruppo.modulo);
        if (module) {
          const orientamento = gruppo.orientamento || 'verticale';
          const larghezzaEffettiva = orientamento === 'verticale' ? module.larghezza : module.altezza;

          // Total row length: start gap + (modules × width) + gaps between modules + end gap
          const lunghezzaTotaleFila = 0.03 + (moduliPerFila * larghezzaEffettiva) +
                                      ((moduliPerFila - 1) * 0.03) + 0.03;

          // Rails needed to cover row length (2 rails per row)
          const guidePerCoprituraLunghezza = Math.ceil(lunghezzaTotaleFila / lunghezzaGuida);
          const guideFalda = guidePerCoprituraLunghezza * 2 * numeroFile;
          guideTotali += guideFalda;

          // For tegole roofs: calculate staffe and prolunghe
          if (tipoTetto === 'tegole') {
            staffeTotali += Math.ceil((guideFalda * lunghezzaGuida) / 2);
            prolungheTotali += (guidePerCoprituraLunghezza - 1) * 2 * numeroFile;
          }
        }
      }
    });
  });

  // Calculate costs
  const costoMorsetti = (morsettiCentrali * unitCosts.costoMorsettiCentrali) +
                        (morsettiFinali * unitCosts.costoMorsettiFinali);

  const costoGuide = tipoTetto === 'lamiera' ?
                     guideTotali * unitCosts.costoGuideLamiera :
                     guideTotali * unitCosts.costoGuideTegole;

  const costoStaffe = staffeTotali * unitCosts.costoStaffeTegole;
  const costoProlunghe = prolungheTotali * (unitCosts.costoProlungaGuide || 0);

  return {
    morsettiCentrali,
    morsettiFinali,
    guideTotali,
    staffe: staffeTotali,
    prolunghe: prolungheTotali,
    costoMorsetti,
    costoGuide,
    costoStaffe,
    costoProlunghe,
    totaleCostoStrutturale: costoMorsetti + costoGuide + costoStaffe + costoProlunghe
  };
};

/**
 * 8. Calculate Cable Lengths and Costs
 * DC and AC cables based on building dimensions
 */
export const calculateCableLengths = (structureData, unitCosts, totalModules) => {
  const altezza = structureData.altezzaEdificio || 10;
  const lunghezza = structureData.lunghezzaEdificio || 40;

  // AC cable length: height + horizontal distance + safety margin
  const lunghezzaCaviCA = unitCosts.lunghezzaCaviCA || (altezza + lunghezza * 0.5);
  const costoCaviCA = lunghezzaCaviCA * unitCosts.costoCaviCA;

  // DC cable length: approximately 10m per module × 2 for DC+ and DC-
  const lunghezzaCaviDC = totalModules * 10 * 2;
  const costoCaviDC = lunghezzaCaviDC * unitCosts.costoCaviDC;

  return {
    lunghezzaCaviCA,
    costoCaviCA,
    lunghezzaCaviDC,
    costoCaviDC,
    totaleCostoCavi: costoCaviCA + costoCaviDC
  };
};

/**
 * 9. Calculate Installation Days
 * Estimate installation time based on power, roof type, batteries, inverters, and building size
 */
export const calculateInstallationDays = (totalPowerKw, tipoTetto, numeroBatterie, numeroInverter, altezzaCapannone, lunghezzaCapannone) => {
  // Base days based on power and roof type
  let giorniBase;

  if (totalPowerKw <= 6) {
    giorniBase = tipoTetto === 'lamiera' ? 3 : 5;
  } else if (totalPowerKw <= 15) {
    giorniBase = tipoTetto === 'lamiera' ? 5 : 8;
  } else if (totalPowerKw <= 30) {
    giorniBase = tipoTetto === 'lamiera' ? 10 : 15;
  } else if (totalPowerKw <= 50) {
    giorniBase = tipoTetto === 'lamiera' ? 15 : 25;
  } else {
    giorniBase = tipoTetto === 'lamiera' ? 25 : 35;
  }

  // Adjustment factors
  let fattoreBatterie = 0;
  if (numeroBatterie > 0) {
    // Each battery adds time, with diminishing returns
    fattoreBatterie = Math.min(numeroBatterie * 0.5, 3); // Max 3 extra days for batteries
  }

  let fattoreInverter = 0;
  if (numeroInverter > 1) {
    // Additional inverters require more configuration
    fattoreInverter = (numeroInverter - 1) * 0.5; // 0.5 days per inverter beyond the first
  }

  // Building factor: larger buildings require more time for wiring and logistics
  const fattoreEdificio = Math.sqrt(altezzaCapannone * lunghezzaCapannone) / 20; // Normalized

  // Contingency tolerance (10-20% of total time)
  const tolleranzaMin = 0.1;
  const tolleranzaMax = 0.2;

  // Calculate total days
  const giorniTotali = giorniBase + fattoreBatterie + fattoreInverter + fattoreEdificio;

  // Calculate range with tolerance
  const giorniMin = Math.ceil(giorniTotali * (1 + tolleranzaMin));
  const giorniMax = Math.ceil(giorniTotali * (1 + tolleranzaMax));

  // Ensure at least 3 days difference between min and max
  if (giorniMax - giorniMin < 3) {
    return { giorniMin, giorniMax: giorniMin + 3 };
  }

  return { giorniMin, giorniMax };
};

/**
 * 10. Calculate Labor Costs
 * Based on total power and labor rate
 */
export const calculateLaborCosts = (totalPowerKw, laborSafety) => {
  return totalPowerKw * laborSafety.costoManodopera;
};

/**
 * 10. Calculate Total Base Cost
 * Sum of all component costs before margin
 */
export const calculateTotalCostBase = (
  costoModuli,
  costoInverter,
  costoBatterie,
  costoAccessori,
  costoStrutturale,
  costoCavi,
  costoManodopera,
  laborSafety,
  unitCosts
) => {
  return (
    costoModuli +
    costoInverter +
    costoBatterie +
    costoAccessori +
    costoStrutturale +
    costoCavi +
    unitCosts.costoQuadri +
    costoManodopera +
    laborSafety.costoFresia +
    laborSafety.costoSicurezza +
    (unitCosts.costoMezzi * unitCosts.giorniMezzi)
  );
};

/**
 * 11. Calculate Total Cost With Margin
 * Applies profit margin to base cost
 */
export const calculateTotalCostWithMargin = (baseCost, margineGuadagno) => {
  return baseCost * (1 + (margineGuadagno / 100));
};

/**
 * 12. Calculate IVA
 * VAT amount based on percentage
 */
export const calculateIVA = (totalCost, percentualeIva) => {
  return totalCost * (percentualeIva / 100);
};

/**
 * 13. Calculate Total With IVA
 * Final total including VAT
 */
export const calculateTotalWithIVA = (totalCost, ivaAmount) => {
  return totalCost + ivaAmount;
};

/**
 * 14. Calculate Payment Tranches
 * Split total into payment installments
 */
export const calculatePaymentTranches = (totalWithIVA, quoteData) => {
  return {
    primaTranche: totalWithIVA * (quoteData.percentualePrimaPagamento / 100),
    secondaTranche: totalWithIVA * (quoteData.percentualeSecondaPagamento / 100),
    terzaTranche: totalWithIVA * (quoteData.percentualeTerzaPagamento / 100)
  };
};

/**
 * 15. Calculate Annual Savings
 * Expected energy cost savings per year including self-consumption and grid feed-in
 */
export const calculateAnnualSavings = (energyData, economicParams, totalPowerKw) => {
  const produzioneAnnua = totalPowerKw * economicParams.produzioneAnnuaKw;
  const consumoAnnuo = energyData.consumoAnnuo || 0;
  const autoconsumo = energyData.autoconsumoStimato / 100;
  const costoEnergia = energyData.costoEnergiaAttuale;

  // Energy self-consumed from the system
  const energiaAutoconsumata = consumoAnnuo * autoconsumo;

  // Energy fed back to the grid (production minus self-consumed)
  const energiaImmessa = produzioneAnnua - energiaAutoconsumata;

  // Savings from self-consumption at full energy cost
  const risparmioAutoconsumo = energiaAutoconsumata * costoEnergia;

  // Savings from grid feed-in at 70% of energy cost (scambio sul posto)
  const risparmioScambioSulPosto = energiaImmessa * (costoEnergia * 0.7);

  // Total annual savings
  return risparmioAutoconsumo + risparmioScambioSulPosto;
};

/**
 * 16. Calculate ROI / Payback Period
 * Years to recoup investment
 */
export const calculateROI = (totalWithIVA, annualSavings, economicParams) => {
  if (annualSavings === 0) return 0;

  // Factor in tax deductions
  const detrazioneAnnua = (totalWithIVA * (economicParams.percentualeDetrazione / 100)) / economicParams.anniDetrazione;
  const savingsWithDeduction = annualSavings + detrazioneAnnua;

  return totalWithIVA / savingsWithDeduction;
};

/**
 * MASTER CALCULATION FUNCTION
 * Performs all calculations and returns complete results
 * @param {Object} formData - Form data from FormContext
 * @param {Object} productsData - Products data from Airtable (modules, inverters, batteries)
 */
export const calculateAllResults = (formData, productsData = {}) => {
  const {
    falde,
    inverters: invertersList,
    batteries: batteriesList,
    components,
    structureData,
    laborSafety,
    unitCosts,
    energyData,
    economicParams,
    quoteData
  } = formData;

  // Extract product arrays from organized data
  const modules = productsData.modules || [];
  const inverters = productsData.inverters || [];
  const batteries = productsData.batteries || [];

  // Basic calculations
  const totaleModuli = calculateTotalModules(falde);
  const potenzaTotaleKw = calculateTotalPower(falde, modules);

  // Cost calculations
  const costoModuli = calculateModuleCosts(falde, modules);
  const costoInverter = calculateInverterCosts(invertersList, inverters);
  const costoBatterie = calculateBatteryCosts(batteriesList, batteries);
  const costoAccessori = calculateAccessoryCosts(components);

  // Structural calculations
  const strutturale = calculateStructuralComponents(falde, structureData, unitCosts, totaleModuli, modules);
  const cavi = calculateCableLengths(structureData, unitCosts, totaleModuli);

  // Labor
  const costoManodopera = calculateLaborCosts(potenzaTotaleKw, laborSafety);

  // Totals
  const costoTotaleBase = calculateTotalCostBase(
    costoModuli,
    costoInverter,
    costoBatterie,
    costoAccessori,
    strutturale.totaleCostoStrutturale,
    cavi.totaleCostoCavi,
    costoManodopera,
    laborSafety,
    unitCosts
  );

  const costoTotaleConMargine = calculateTotalCostWithMargin(costoTotaleBase, laborSafety.margineGuadagno);
  const iva = calculateIVA(costoTotaleConMargine, economicParams.percentualeIva);
  const costoTotaleConIva = calculateTotalWithIVA(costoTotaleConMargine, iva);

  // Payment tranches
  const tranches = calculatePaymentTranches(costoTotaleConIva, quoteData);

  // Economic analysis
  const risparmioAnnuo = calculateAnnualSavings(energyData, economicParams, potenzaTotaleKw);
  const paybackPeriod = calculateROI(costoTotaleConIva, risparmioAnnuo, economicParams);

  return {
    // Basics
    totaleModuli,
    potenzaTotaleKw: potenzaTotaleKw.toFixed(2),

    // Costs breakdown
    costoModuli: costoModuli.toFixed(2),
    costoInverter: costoInverter.toFixed(2),
    costoBatterie: costoBatterie.toFixed(2),
    costoAccessori: costoAccessori.toFixed(2),
    costoStrutturale: strutturale.totaleCostoStrutturale.toFixed(2),
    costoCavi: cavi.totaleCostoCavi.toFixed(2),
    costoManodopera: costoManodopera.toFixed(2),
    costoQuadri: unitCosts.costoQuadri.toFixed(2),
    costoFresia: laborSafety.costoFresia.toFixed(2),
    costoSicurezza: laborSafety.costoSicurezza.toFixed(2),
    costoMezzi: (unitCosts.costoMezzi * unitCosts.giorniMezzi).toFixed(2),

    // Totals
    costoTotaleBase: costoTotaleBase.toFixed(2),
    costoTotaleConMargine: costoTotaleConMargine.toFixed(2),
    iva: iva.toFixed(2),
    costoTotaleConIva: costoTotaleConIva.toFixed(2),

    // Payment tranches
    primaTranche: tranches.primaTranche.toFixed(2),
    secondaTranche: tranches.secondaTranche.toFixed(2),
    terzaTranche: tranches.terzaTranche.toFixed(2),

    // Economic analysis
    risparmioAnnuo: risparmioAnnuo.toFixed(2),
    paybackPeriod: paybackPeriod.toFixed(1),

    // Detailed breakdown for display
    breakdown: {
      strutturale,
      cavi
    }
  };
};
