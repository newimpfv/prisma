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

// Generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const FormProvider = ({ children }) => {
  // Session Management
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [hasCheckedDuplicates, setHasCheckedDuplicates] = useState(false);
  const [duplicateCheckDecision, setDuplicateCheckDecision] = useState(null);

  // Client Data
  const [clientData, setClientData] = useState({
    nome: '',
    cognome: '',
    indirizzo: '',
    email: '',
    telefono: '',
    comune: '',
    airtableClientId: '' // Store the Airtable client ID for linking
  });

  // Selected Client Record (full client object from Gestione Clienti)
  const [selectedClientRecord, setSelectedClientRecord] = useState(null);

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
          sessionId,
          clientData,
          selectedClientRecord,
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

        const nomeCliente = clientData.nome || clientData.cognome ? `${clientData.nome}_${clientData.cognome}` : 'unnamed';
        const numeroPreventivo = quoteData.riferimentoPreventivo || 'draft';
        const key = `prisma_autosave_${nomeCliente}_${numeroPreventivo}`;

        localStorage.setItem(key, JSON.stringify(dataToSave));
        localStorage.setItem(`prisma_session_${sessionId}`, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    };

    const autoSaveInterval = setInterval(saveToLocalStorage, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [
    sessionId,
    clientData,
    selectedClientRecord,
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

  // Auto-sync to Airtable every 2 minutes (after first-time duplicate check)
  useEffect(() => {
    const syncToAirtable = async () => {
      // Only sync if we have client data
      if (!clientData.nome && !clientData.cognome) {
        return;
      }

      // Check if online
      const { isOnline } = await import('../services/airtable');
      if (!isOnline()) {
        return;
      }

      try {
        const { createSession, updateSession, findSessionById } = await import('../services/sessions');

        // Check for duplicate check decision
        if (!hasCheckedDuplicates) {
          // This will be handled by a separate component/modal
          return;
        }

        const sessionData = {
          session_id: sessionId,
          nome_cliente: clientData.nome || '',
          cognome_cliente: clientData.cognome || '',
          riferimento_preventivo: quoteData.riferimentoPreventivo || '',
          session_data: {
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
          },
          status: 'in_progress',
          client_record: clientData.airtableClientId ? [clientData.airtableClientId] : undefined
        };

        // Check if session already exists
        const existingSession = await findSessionById(sessionId);

        if (existingSession) {
          // Update existing session
          await updateSession(existingSession.airtableId, sessionData);
          console.log('Session synced to Airtable (updated)');
        } else {
          // Create new session
          await createSession(sessionData);
          console.log('Session synced to Airtable (created)');
        }
      } catch (error) {
        console.error('Airtable sync error:', error);
      }
    };

    const syncInterval = setInterval(syncToAirtable, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(syncInterval);
  }, [
    sessionId,
    hasCheckedDuplicates,
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
    sessionId,
    setSessionId,
    hasCheckedDuplicates,
    setHasCheckedDuplicates,
    duplicateCheckDecision,
    setDuplicateCheckDecision,
    clientData,
    setClientData,
    selectedClientRecord,
    setSelectedClientRecord,
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
