import { useState, useEffect, useRef } from 'react';
import { FormProvider } from './context/FormContext';
import Header from './components/Header/Header';
import ClientData from './components/ClientData/ClientData';
import StructureData from './components/StructureData/StructureData';
import Falde from './components/Falde/Falde';
import Components from './components/Components/Components';
import LaborSafety from './components/LaborSafety/LaborSafety';
import UnitCosts from './components/UnitCosts/UnitCosts';
import EnergyData from './components/EnergyData/EnergyData';
import EconomicParams from './components/EconomicParams/EconomicParams';
import QuoteData from './components/QuoteData/QuoteData';
import CustomPremise from './components/CustomPremise/CustomPremise';
import CustomNotes from './components/CustomNotes/CustomNotes';
import PVGISData from './components/PVGISData/PVGISData';
import ImageUpload from './components/ImageUpload/ImageUpload';
import Results from './components/Results/Results';
import SessionManager from './components/SessionManager/SessionManager';
import UtilityBar from './components/UtilityBar/UtilityBar';
import ExportButtons from './components/ExportButtons/ExportButtons';

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && formRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const formWidth = formRef.current.offsetWidth;
      const formSection = formRef.current.querySelector('.form-section');
      const formSectionWidth = formSection ? formSection.offsetWidth : 'N/A';

      console.log('=== LAYOUT DEBUG ===');
      console.log('Container (max-w-2xl) width:', containerWidth);
      console.log('Form (px-8) width:', formWidth);
      console.log('Form section (.form-section) width:', formSectionWidth);
      console.log('Container computed styles:', window.getComputedStyle(containerRef.current).maxWidth);
      console.log('Form computed padding:', window.getComputedStyle(formRef.current).paddingLeft, window.getComputedStyle(formRef.current).paddingRight);
    }
  }, []);

  const tabs = [
    {
      id: 0,
      name: 'Cliente e Struttura',
      icon: '👤',
      component: (
        <>
          <ClientData />
          <StructureData />
        </>
      )
    },
    {
      id: 1,
      name: 'Configurazione Tetto',
      icon: '🏠',
      component: <Falde />
    },
    {
      id: 2,
      name: 'Apparecchiature',
      icon: '⚡',
      component: <Components />
    },
    {
      id: 3,
      name: 'Costi',
      icon: '💰',
      component: (
        <>
          <LaborSafety />
          <UnitCosts />
        </>
      )
    },
    {
      id: 4,
      name: 'Energia ed Economia',
      icon: '📊',
      component: (
        <>
          <EnergyData />
          <EconomicParams />
        </>
      )
    },
    {
      id: 5,
      name: 'Preventivo',
      icon: '📋',
      component: <QuoteData />
    },
    {
      id: 6,
      name: 'Personalizzazione',
      icon: '✏️',
      component: (
        <>
          <CustomPremise />
          <CustomNotes />
          <PVGISData />
          <ImageUpload />
        </>
      )
    },
    {
      id: 7,
      name: 'Risultati ed Export',
      icon: '📄',
      component: (
        <>
          <Results />
          <ExportButtons />
        </>
      )
    }
  ];

  return (
    <FormProvider>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        minHeight: '100vh',
        padding: '1rem'
      }}>
        <div ref={containerRef} style={{
          maxWidth: '672px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1rem'
        }}>
          <Header />

          {/* Utility Buttons */}
          <UtilityBar />

          {/* Form Content - No Tabs, Just Sections */}
          <form ref={formRef} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <ClientData />
            <StructureData />
            <Falde />
            <Components />
            <LaborSafety />
            <UnitCosts />
            <EnergyData />
            <EconomicParams />
            <QuoteData />
            <CustomPremise />
            <CustomNotes />
            <PVGISData />
            <ImageUpload />
            <Results />
            <ExportButtons />
          </form>
        </div>
      </div>

      {/* Session Manager - floating button */}
      <SessionManager />
    </FormProvider>
  );
}

export default App;
