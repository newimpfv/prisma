import { useState, useRef, useEffect } from 'react';
import { FormProvider } from './context/FormContext';
import { useAuth } from './context/AuthContext';
import { useProducts } from './context/ProductsContext';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import ClientManager from './components/ClientManager/ClientManager';
import ImpiantiManager from './components/ImpiantiManager/ImpiantiManager';
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
import DuplicateCheckModal from './components/DuplicateCheckModal/DuplicateCheckModal';
import Sopralluogo from './components/Sopralluogo/Sopralluogo';
import MaintenanceContract from './components/MaintenanceContract/MaintenanceContract';
import InstallationChecklist from './components/InstallationChecklist/InstallationChecklist';
import { getOfflineManager } from './services/offlineManager';
import { getOfflineQueue } from './services/offlineQueue';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { products, loading: productsLoading, error: productsError, refresh: refreshProducts } = useProducts();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Initialize offline support
  useEffect(() => {
    const initOfflineSupport = async () => {
      try {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New Service Worker available! Refresh to update.');
              }
            });
          });
        }

        // Initialize OfflineManager
        await getOfflineManager();
        console.log('✅ OfflineManager initialized');

        // Initialize OfflineQueue
        const queue = getOfflineQueue();

        // Listen to sync status changes
        queue.onSyncStatusChange((status) => {
          setSyncStatus(status);
          console.log('Sync status:', status);
        });

        console.log('✅ OfflineQueue initialized');

      } catch (error) {
        console.error('❌ Error initializing offline support:', error);
      }
    };

    initOfflineSupport();

    // Listen to online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'
      }}>
        <div style={{
          fontSize: '3rem',
          color: 'white'
        }}>
          ⚡
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }


  const tabs = [
    {
      id: 0,
      name: 'Gestione Clienti',
      icon: '👥',
      component: <ClientManager />
    },
    {
      id: 1,
      name: 'Gestione Impianti',
      icon: '⚡',
      component: <ImpiantiManager />
    },
    {
      id: 2,
      name: 'Sopralluogo',
      icon: '📸',
      component: <Sopralluogo />
    },
    {
      id: 3,
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
      id: 4,
      name: 'Configurazione Tetto',
      icon: '🏠',
      component: <Falde />
    },
    {
      id: 5,
      name: 'Apparecchiature',
      icon: '🔌',
      component: <Components />
    },
    {
      id: 6,
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
      id: 7,
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
      id: 8,
      name: 'Preventivo',
      icon: '📋',
      component: <QuoteData />
    },
    {
      id: 9,
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
      id: 10,
      name: 'Risultati ed Export',
      icon: '📄',
      component: (
        <>
          <Results />
          <ExportButtons />
        </>
      )
    },
    {
      id: 11,
      name: 'Contratto Manutenzione',
      icon: '🔧',
      component: <MaintenanceContract />
    },
    {
      id: 12,
      name: 'Checklist Intervento',
      icon: '✅',
      component: <InstallationChecklist />
    }
  ];

  const handleTabChange = (index) => {
    setSelectedIndex(index);
    // Scroll to top when changing tabs
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <FormProvider>
      <div className="app-background" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        minHeight: '100vh',
        padding: '0.5rem',
        paddingBottom: '80px'
      }}>
        <div ref={containerRef} className="app-container" style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '0.75rem'
        }}>
          <Header />

          {/* Offline Status Indicator */}
          {!isOnline && (
            <div style={{
              backgroundColor: '#fbbf24',
              color: '#78350f',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ fontSize: '1.25rem' }}>📴</span>
              <span>Modalità Offline - I dati verranno sincronizzati al ripristino della connessione</span>
            </div>
          )}

          {/* Sync Status Indicator */}
          {syncStatus?.status === 'syncing' && (
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔄</span>
              <span>Sincronizzazione in corso...</span>
            </div>
          )}

          {syncStatus?.status === 'completed' && isOnline && (
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              animation: 'slideInDown 0.3s ease-out'
            }}>
              <span style={{ fontSize: '1.25rem' }}>✅</span>
              <span>Dati sincronizzati con successo!</span>
            </div>
          )}

          {/* Products Loading Indicator */}
          {productsLoading && (
            <div style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              animation: 'slideInDown 0.3s ease-out'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⏳</span>
              <span>Caricamento listino prezzi da Airtable...</span>
            </div>
          )}

          {/* Products Error Indicator */}
          {productsError && (
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span>Errore nel caricamento del listino: {productsError}. Uso dati in cache.</span>
              </div>
              <button
                onClick={() => refreshProducts(true)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid white',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                🔄 Riprova
              </button>
            </div>
          )}

          {/* Utility Buttons */}
          <UtilityBar />

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '1rem 0',
            marginBottom: '1rem',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: selectedIndex === tab.id
                    ? 'white'
                    : 'rgba(255, 255, 255, 0.3)',
                  color: selectedIndex === tab.id ? '#1f2937' : '#4b5563',
                  fontWeight: selectedIndex === tab.id ? '600' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedIndex === tab.id
                    ? '0 4px 6px rgba(0, 0, 0, 0.1)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  transform: selectedIndex === tab.id ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (selectedIndex !== tab.id) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== tab.id) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: '400px'
            }}
          >
            <div ref={formRef} className="tab-content" style={{
              padding: '0 1.5rem 1.5rem 1.5rem',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              <style>{`
                @media (max-width: 768px) {
                  .tab-content {
                    padding: 0 !important;
                  }
                }
              `}</style>
              {tabs[selectedIndex].component}
            </div>
          </div>

          {/* Tab Navigation Arrows */}
          <div className="nav-arrows" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => selectedIndex > 0 && handleTabChange(selectedIndex - 1)}
              disabled={selectedIndex === 0}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: selectedIndex === 0 ? '#e5e7eb' : 'white',
                color: selectedIndex === 0 ? '#9ca3af' : '#1f2937',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: selectedIndex === 0 ? 'not-allowed' : 'pointer',
                boxShadow: selectedIndex === 0 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s'
              }}
            >
              ← Precedente
            </button>

            <span style={{
              alignSelf: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {selectedIndex + 1} / {tabs.length}
            </span>

            <button
              onClick={() => selectedIndex < tabs.length - 1 && handleTabChange(selectedIndex + 1)}
              disabled={selectedIndex === tabs.length - 1}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: selectedIndex === tabs.length - 1 ? '#e5e7eb' : 'white',
                color: selectedIndex === tabs.length - 1 ? '#9ca3af' : '#1f2937',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: selectedIndex === tabs.length - 1 ? 'not-allowed' : 'pointer',
                boxShadow: selectedIndex === tabs.length - 1 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s'
              }}
            >
              Successivo →
            </button>
          </div>
        </div>
      </div>

      {/* Session Manager - floating button */}
      <SessionManager />

      {/* Duplicate Check Modal - shown once per session */}
      <DuplicateCheckModal />

      {/* Add animations and mobile responsive styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile responsive improvements */
        @media (max-width: 768px) {
          /* Increase font sizes for better readability */
          body {
            font-size: 16px;
          }

          /* App container - full width on mobile */
          .app-container {
            max-width: 100% !important;
            padding: 0.5rem !important;
            border-radius: 0 !important;
          }

          /* Tab content - less padding on mobile */
          .tab-content {
            padding: 0 0.75rem 1rem 0.75rem !important;
          }

          /* Make sections more visible */
          .mobile-section {
            font-size: 1.1rem !important;
            line-height: 1.6 !important;
            padding: 1.25rem !important;
          }

          /* Larger input fields */
          input, select, textarea {
            font-size: 16px !important;
            padding: 0.875rem !important;
            min-height: 48px !important;
          }

          /* Specific dropdown optimizations */
          select {
            appearance: none !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 1.25rem !important;
            padding-right: 3rem !important;
            cursor: pointer !important;
            font-weight: 500 !important;
          }

          /* Dropdown options larger */
          select option {
            font-size: 16px !important;
            padding: 0.75rem !important;
            min-height: 48px !important;
          }

          /* Larger buttons for easier tapping */
          button {
            font-size: 1rem !important;
            padding: 1rem 1.25rem !important;
            min-height: 48px !important;
          }

          /* Label text more readable */
          label {
            font-size: 1.05rem !important;
            font-weight: 600 !important;
            margin-bottom: 0.5rem !important;
            display: block !important;
          }

          /* Section headers larger and more prominent */
          h2 {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
            font-weight: 700 !important;
          }

          h3 {
            font-size: 1.3rem !important;
            margin-bottom: 0.875rem !important;
            font-weight: 600 !important;
          }

          h4 {
            font-size: 1.15rem !important;
            margin-bottom: 0.75rem !important;
            font-weight: 600 !important;
          }

          /* Paragraph text larger */
          p {
            font-size: 1.05rem !important;
            line-height: 1.6 !important;
          }

          /* White background sections more prominent */
          div[style*="backgroundColor: 'white'"],
          div[style*="background-color: white"],
          div[style*="backgroundColor: white"] {
            padding: 1.25rem !important;
            margin-bottom: 1.25rem !important;
          }

          /* Navigation arrows - less padding on mobile */
          .nav-arrows {
            padding: 0.75rem 0.5rem !important;
            gap: 0.5rem;
          }

          .nav-arrows button {
            flex: 1;
            max-width: 45%;
          }

          /* Tab navigation buttons - better scrolling */
          div[style*="overflowX"] {
            padding: 0.75rem 0 !important;
          }
        }
      `}</style>
    </FormProvider>
  );
}

export default App;
