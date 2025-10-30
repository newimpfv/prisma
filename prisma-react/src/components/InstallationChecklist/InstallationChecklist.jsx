import { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';

function InstallationChecklist() {
  const { selectedClientRecord } = useForm();

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    // Ispezione Pannelli
    panels_condition: false,
    panels_damage: false,
    panels_dirt: false,
    panels_shadows: false,

    // Inverter
    inverter_status: false,
    inverter_error_codes: false,
    inverter_temperature: false,
    inverter_display: false,

    // Collegamenti Elettrici
    connections_tight: false,
    cables_damage: false,
    junction_boxes: false,
    grounding: false,

    // Sicurezza
    safety_switches: false,
    safety_labels: false,
    fire_extinguisher: false,
    emergency_shutdown: false,

    // Pulizia/Manutenzione
    cleaning_panels: false,
    cleaning_inverter: false,
    vegetation_removal: false,
    drainage_check: false,

    // Test e Misurazioni
    voltage_test: false,
    current_test: false,
    production_test: false,
    performance_check: false,

    // Documentazione
    photos_taken: false,
    measurements_recorded: false,
    report_completed: false,
    client_signature: false
  });

  const [measurements, setMeasurements] = useState({
    voltage_dc: '',
    current_dc: '',
    voltage_ac: '',
    power_output: '',
    temperature: ''
  });

  const checklistSections = [
    {
      title: '🔍 Ispezione Pannelli',
      items: [
        { key: 'panels_condition', label: 'Condizione generale pannelli' },
        { key: 'panels_damage', label: 'Verifica danni/crepe' },
        { key: 'panels_dirt', label: 'Controllo sporcizia/depositi' },
        { key: 'panels_shadows', label: 'Verifica ombreggiamenti' }
      ]
    },
    {
      title: '⚡ Inverter',
      items: [
        { key: 'inverter_status', label: 'Stato operativo inverter' },
        { key: 'inverter_error_codes', label: 'Controllo codici errore' },
        { key: 'inverter_temperature', label: 'Temperatura inverter' },
        { key: 'inverter_display', label: 'Verifica display/LED' }
      ]
    },
    {
      title: '🔌 Collegamenti Elettrici',
      items: [
        { key: 'connections_tight', label: 'Serraggio collegamenti' },
        { key: 'cables_damage', label: 'Verifica danni cavi' },
        { key: 'junction_boxes', label: 'Controllo cassette giunzione' },
        { key: 'grounding', label: 'Verifica messa a terra' }
      ]
    },
    {
      title: '🛡️ Sicurezza',
      items: [
        { key: 'safety_switches', label: 'Funzionamento interruttori' },
        { key: 'safety_labels', label: 'Presenza etichette' },
        { key: 'fire_extinguisher', label: 'Estintore presente/valido' },
        { key: 'emergency_shutdown', label: 'Test arresto emergenza' }
      ]
    },
    {
      title: '🧹 Pulizia/Manutenzione',
      items: [
        { key: 'cleaning_panels', label: 'Pulizia pannelli eseguita' },
        { key: 'cleaning_inverter', label: 'Pulizia inverter/ventole' },
        { key: 'vegetation_removal', label: 'Rimozione vegetazione' },
        { key: 'drainage_check', label: 'Verifica drenaggi' }
      ]
    },
    {
      title: '📊 Test e Misurazioni',
      items: [
        { key: 'voltage_test', label: 'Test tensione' },
        { key: 'current_test', label: 'Test corrente' },
        { key: 'production_test', label: 'Test produzione' },
        { key: 'performance_check', label: 'Verifica performance' }
      ]
    },
    {
      title: '📝 Documentazione',
      items: [
        { key: 'photos_taken', label: 'Foto scattate' },
        { key: 'measurements_recorded', label: 'Misurazioni registrate' },
        { key: 'report_completed', label: 'Rapporto compilato' },
        { key: 'client_signature', label: 'Firma cliente' }
      ]
    }
  ];

  const handleCheckboxChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMeasurementChange = (key, value) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getCompletionPercentage = () => {
    const total = Object.keys(checklist).length;
    const completed = Object.values(checklist).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const saveChecklist = () => {
    if (!selectedClientRecord) {
      alert('⚠️ Seleziona un cliente prima di salvare');
      return;
    }

    // Save to localStorage for now
    const checklistData = {
      client: selectedClientRecord.nome,
      clientId: selectedClientRecord.id,
      visitDate,
      checklist,
      measurements,
      notes,
      completedAt: new Date().toISOString(),
      completion: getCompletionPercentage()
    };

    const saved = localStorage.getItem('installation_checklists');
    const checklists = saved ? JSON.parse(saved) : [];
    checklists.push(checklistData);
    localStorage.setItem('installation_checklists', JSON.stringify(checklists));

    alert(`✅ Checklist salvata!\n\nCompletamento: ${getCompletionPercentage()}%`);

    // Reset
    setChecklist(Object.keys(checklist).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    setMeasurements({
      voltage_dc: '',
      current_dc: '',
      voltage_ac: '',
      power_output: '',
      temperature: ''
    });
    setNotes('');
  };

  if (!selectedClientRecord) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b7280' }}>
          ⚠️ Nessun Cliente Selezionato
        </h2>
        <p style={{ color: '#9ca3af' }}>
          Vai alla sezione "Gestione Clienti" e seleziona un cliente per iniziare la checklist.
        </p>
      </div>
    );
  }

  // Client is already in flattened format from clients.js service
  const client = selectedClientRecord;
  const completionPercentage = getCompletionPercentage();

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
        ✅ Checklist Intervento Impianto
      </h2>

      {/* Client Info */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '2px solid #10b981',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.5rem' }}>
          Cliente: {client.nome || 'N/A'}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#047857' }}>
          📅 Data intervento: {visitDate}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>Completamento</span>
          <span style={{ fontWeight: '700', color: '#10b981' }}>{completionPercentage}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '1rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Visit Date */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Data Intervento
        </label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Checklist Sections */}
      {checklistSections.map((section, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            {section.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {section.items.map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: checklist[item.key] ? '#f0fdf4' : '#f9fafb',
                  border: `2px solid ${checklist[item.key] ? '#10b981' : '#e5e7eb'}`,
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => handleCheckboxChange(item.key)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    cursor: 'pointer',
                    accentColor: '#10b981'
                  }}
                />
                <span style={{
                  fontSize: '0.875rem',
                  color: checklist[item.key] ? '#065f46' : '#374151',
                  fontWeight: checklist[item.key] ? '600' : '400'
                }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Measurements */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          📊 Misurazioni
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Tensione DC (V)
            </label>
            <input
              type="number"
              value={measurements.voltage_dc}
              onChange={(e) => handleMeasurementChange('voltage_dc', e.target.value)}
              placeholder="es. 400"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Corrente DC (A)
            </label>
            <input
              type="number"
              value={measurements.current_dc}
              onChange={(e) => handleMeasurementChange('current_dc', e.target.value)}
              placeholder="es. 10"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Tensione AC (V)
            </label>
            <input
              type="number"
              value={measurements.voltage_ac}
              onChange={(e) => handleMeasurementChange('voltage_ac', e.target.value)}
              placeholder="es. 230"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Potenza Output (kW)
            </label>
            <input
              type="number"
              value={measurements.power_output}
              onChange={(e) => handleMeasurementChange('power_output', e.target.value)}
              placeholder="es. 5.5"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Temperatura Inverter (°C)
            </label>
            <input
              type="number"
              value={measurements.temperature}
              onChange={(e) => handleMeasurementChange('temperature', e.target.value)}
              placeholder="es. 45"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          📝 Note e Osservazioni
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Inserisci note sull'intervento, problemi riscontrati, azioni eseguite..."
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={saveChecklist}
        style={{
          width: '100%',
          padding: '1.25rem',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: 'white',
          backgroundColor: '#10b981',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        💾 Salva Checklist ({completionPercentage}% completata)
      </button>
    </div>
  );
}

export default InstallationChecklist;
