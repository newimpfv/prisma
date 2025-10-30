import { useForm } from '../../context/FormContext';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to recenter map when coordinates change
function MapRecenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

const PVGISData = () => {
  const { pvgisData, setPvgisData, economicParams, setEconomicParams } = useForm();
  const [uploadStatus, setUploadStatus] = useState('');
  const [mapLocation, setMapLocation] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setPvgisData(json);

        // Extract location data for map
        if (json.inputs && json.inputs.location) {
          const { latitude, longitude, elevation } = json.inputs.location;
          if (latitude && longitude) {
            setMapLocation({
              lat: latitude,
              lon: longitude,
              elevation: elevation || 'N/A'
            });
          }
        }

        // Try to extract production data from PVGIS JSON
        // PVGIS format varies, this is a basic extraction
        if (json.outputs && json.outputs.totals) {
          const yearlyProduction = json.outputs.totals.fixed?.E_y || json.outputs.totals.E_y;
          if (yearlyProduction) {
            setEconomicParams({ ...economicParams, produzioneAnnuaKw: Math.round(yearlyProduction) });
            setUploadStatus(`✅ PVGIS caricato con successo! Produzione annua: ${Math.round(yearlyProduction)} kWh`);
          } else {
            setUploadStatus('⚠️ File PVGIS caricato ma impossibile estrarre la produzione annua. Inserirla manualmente.');
          }
        } else {
          setUploadStatus('⚠️ File JSON caricato ma formato PVGIS non riconosciuto. Inserire produzione manualmente.');
        }
      } catch (error) {
        setUploadStatus(`❌ Errore nel parsing del file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        Dati PVGIS
      </h2>

      <div className="form-group">
        <label className="form-label">
          Carica File JSON da PVGIS
        </label>
        <input
          type="file"
          accept=".json"
          className="form-input"
          onChange={handleFileUpload}
        />
        <p className="info-text mt-1">
          Scarica i dati da{' '}
          <a
            href="https://re.jrc.ec.europa.eu/pvg_tools/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            PVGIS
          </a>
          {' '}in formato JSON e caricali qui per compilare automaticamente la produzione annua stimata
        </p>

        {uploadStatus && (
          <div className={`mt-3 p-3 rounded-lg ${
            uploadStatus.startsWith('✅') ? 'bg-green-100 text-green-800' :
            uploadStatus.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {uploadStatus}
          </div>
        )}

        {pvgisData && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>File PVGIS caricato:</strong>
            </p>
            <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(pvgisData, null, 2)}
            </pre>
          </div>
        )}

        {/* Interactive Map */}
        {mapLocation && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Posizione Installazione</h3>
            <div className="mb-2 text-sm text-gray-700">
              <p><strong>Latitudine:</strong> {mapLocation.lat}°</p>
              <p><strong>Longitudine:</strong> {mapLocation.lon}°</p>
              <p><strong>Elevazione:</strong> {mapLocation.elevation} m</p>
            </div>
            <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer
                center={[mapLocation.lat, mapLocation.lon]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[mapLocation.lat, mapLocation.lon]}>
                  <Popup>
                    Installazione Impianto<br />
                    Lat: {mapLocation.lat}°<br />
                    Lon: {mapLocation.lon}°<br />
                    Elevazione: {mapLocation.elevation} m
                  </Popup>
                </Marker>
                <MapRecenter lat={mapLocation.lat} lon={mapLocation.lon} />
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PVGISData;
