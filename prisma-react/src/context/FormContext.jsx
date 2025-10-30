import { createContext, useContext, useState, useEffect } from 'react';
import { calculateAllResults } from '../utils/calculations';

const FormContext = createContext();

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export const FormProvider = ({ children }) => {
  // Client Data
  const [clientData, setClientData] = useState({
    nomeCognome: '',
    indirizzo: ''
  });

  // Structure Data
  const [structureData, setStructureData] = useState({
    tipoTetto: 'lamiera', // 'lamiera' or 'tegole'
    altezzaEdificio: 10,
    lunghezzaEdificio: 40
  });

  // Roof sections (Falde)
  const [falde, setFalde] = useState([]);

  // Inverters
  const [inverters, setInverters] = useState([]);

  // Batteries
  const [batteries, setBatteries] = useState([]);

  // Other components
  const [components, setComponents] = useState({
    // ESS Cabinet
    essCabinet: 'none',
    numeroEssCabinet: 1,
    // Parallel Box
    parallelBox: 'none',
    numeroParallelBox: 1,
    // EV Charger
    evCharger: 'none',
    numeroEvCharger: 1,
    // Connectivity
    connettivita: 'none',
    numeroConnettivita: 1,
    // Backup and Control
    backupControllo: 'none',
    numeroBackupControllo: 1,
    // Meter and CT
    meterCT: 'none',
    numeroMeterCT: 1,
    // Cables and Accessories
    caviAccessori: 'none',
    numeroCaviAccessori: 1
  });

  // Labor and Safety
  const [laborSafety, setLaborSafety] = useState({
    costoManodopera: 180,
    costoFresia: 800,
    costoSicurezza: 2500,
    margineGuadagno: 30
  });

  // Unit Costs
  const [unitCosts, setUnitCosts] = useState({
    costoMorsettiCentrali: 1.3,
    costoMorsettiFinali: 1.5,
    costoGuideLamiera: 17.2,
    costoGuideTegole: 17,
    costoProlungaGuide: 3,
    costoStaffeTegole: 8.4,
    costoCaviCA: 5,
    lunghezzaCaviCA: 10,
    costoCaviDC: 3,
    costoQuadri: 500,
    costoMezzi: 0,
    giorniMezzi: 1
  });

  // Energy Data
  const [energyData, setEnergyData] = useState({
    consumoAnnuo: 0,
    costoEnergiaAttuale: 0.16,
    spesaAnnuaEnergia: 0,
    autoconsumoStimato: 0
  });

  // Economic Parameters
  const [economicParams, setEconomicParams] = useState({
    produzioneAnnuaKw: 1200,
    percentualeIva: 10,
    percentualeDetrazione: 50,
    anniDetrazione: 10,
    risparmioStimato: 80,
    tipoCessione: 'ritiro'
  });

  // Quote Data
  const [quoteData, setQuoteData] = useState({
    validitaPreventivo: 20,
    riferimentoPreventivo: '',
    percentualePrimaPagamento: 50,
    percentualeSecondaPagamento: 40,
    percentualeTerzaPagamento: 10
  });

  // Custom Text
  const [customText, setCustomText] = useState({
    premessaPersonalizzata: '',
    notePersonalizzate: ''
  });

  // PVGIS Data
  const [pvgisData, setPvgisData] = useState(null);

  // Render Images
  const [renderImages, setRenderImages] = useState(['', '', '']);

  // Calculated results
  const [results, setResults] = useState(null);

  // Auto-calculate results when data changes
  useEffect(() => {
    try {
      const formData = {
        falde,
        inverters,
        batteries,
        components,
        structureData,
        laborSafety,
        unitCosts,
        energyData,
        economicParams,
        quoteData
      };

      const calculatedResults = calculateAllResults(formData);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [
    falde,
    inverters,
    batteries,
    components,
    structureData,
    laborSafety,
    unitCosts,
    energyData,
    economicParams,
    quoteData
  ]);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        const dataToSave = {
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
          lastSaved: new Date().toISOString()
        };

        const nomeCliente = clientData.nomeCognome || 'unnamed';
        const numeroPreventivo = quoteData.riferimentoPreventivo || 'draft';
        const key = `prisma_autosave_${nomeCliente}_${numeroPreventivo}`;

        localStorage.setItem(key, JSON.stringify(dataToSave));
        console.log('Auto-saved at:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    };

    const autoSaveInterval = setInterval(saveToLocalStorage, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [
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
    renderImages
  ]);

  const value = {
    clientData,
    setClientData,
    structureData,
    setStructureData,
    falde,
    setFalde,
    inverters,
    setInverters,
    batteries,
    setBatteries,
    components,
    setComponents,
    laborSafety,
    setLaborSafety,
    unitCosts,
    setUnitCosts,
    energyData,
    setEnergyData,
    economicParams,
    setEconomicParams,
    quoteData,
    setQuoteData,
    customText,
    setCustomText,
    pvgisData,
    setPvgisData,
    renderImages,
    setRenderImages,
    results,
    setResults
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};
