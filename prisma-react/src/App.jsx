import { useState, useRef, useEffect } from 'react';
import { FormProvider } from './context/FormContext';
import { useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import ClientManager from './components/ClientManager/ClientManager';
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
      name: 'Sopralluogo',
      icon: '📸',
      component: <Sopralluogo />
    },
    {
      id: 2,
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
      id: 3,
      name: 'Configurazione Tetto',
      icon: '🏠',
      component: <Falde />
    },
    {
      id: 4,
      name: 'Apparecchiature',
      icon: '⚡',
      component: <Components />
    },
    {
      id: 5,
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
      id: 6,
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
      id: 7,
      name: 'Preventivo',
      icon: '📋',
      component: <QuoteData />
    },
    {
      id: 8,
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
      id: 9,
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
      id: 10,
      name: 'Checklist Intervento',
      icon: '✅',
      component: <InstallationChecklist />
    },
    {
      id: 11,
      name: 'Contratto Manutenzione',
      icon: '🔧',
      component: <MaintenanceContract />
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
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        minHeight: '100vh',
        padding: '1rem',
        paddingBottom: '80px'
      }}>
        <div ref={containerRef} style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1rem'
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

          {/* Tab Content with Swipe Support */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: '400px'
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              containerRef.current.touchStartX = touch.clientX;
            }}
            onTouchEnd={(e) => {
              const touch = e.changedTouches[0];
              const diff = containerRef.current.touchStartX - touch.clientX;

              // Swipe left (next tab)
              if (diff > 50 && selectedIndex < tabs.length - 1) {
                handleTabChange(selectedIndex + 1);
              }
              // Swipe right (previous tab)
              else if (diff < -50 && selectedIndex > 0) {
                handleTabChange(selectedIndex - 1);
              }
            }}
          >
            <div ref={formRef} style={{
              padding: '0 2rem 2rem 2rem',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              {tabs[selectedIndex].component}
            </div>
          </div>

          {/* Tab Navigation Arrows */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
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

      {/* Add animations */}
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
      `}</style>
    </FormProvider>
  );
}

export default App;
