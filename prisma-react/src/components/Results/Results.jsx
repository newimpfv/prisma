import { useForm } from '../../context/FormContext';

const Results = () => {
  const { results } = useForm();

  if (!results) {
    return null;
  }

  return (
    <div className="form-section bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-500">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        RIEPILOGO IMPIANTO E PREVENTIVO
      </h2>

      {/* System Overview */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Dati Impianto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Numero Totale Moduli</p>
            <p className="text-xl font-bold text-blue-700">{results.totaleModuli}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Potenza Totale Impianto</p>
            <p className="text-xl font-bold text-blue-700">{results.potenzaTotaleKw} kW</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Dettaglio Costi</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Moduli Fotovoltaici</span>
            <span className="font-semibold">€ {results.costoModuli}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Inverter</span>
            <span className="font-semibold">€ {results.costoInverter}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Batterie</span>
            <span className="font-semibold">€ {results.costoBatterie}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Accessori</span>
            <span className="font-semibold">€ {results.costoAccessori}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Strutture di Fissaggio</span>
            <span className="font-semibold">€ {results.costoStrutturale}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Cavi e Cablaggi</span>
            <span className="font-semibold">€ {results.costoCavi}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Quadri Elettrici</span>
            <span className="font-semibold">€ {results.costoQuadri}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Manodopera</span>
            <span className="font-semibold">€ {results.costoManodopera}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Fresia e Preparazione</span>
            <span className="font-semibold">€ {results.costoFresia}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Sicurezza</span>
            <span className="font-semibold">€ {results.costoSicurezza}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Mezzi e Trasporto</span>
            <span className="font-semibold">€ {results.costoMezzi}</span>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Totali</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 text-lg">
            <span className="text-gray-700">TOTALE BASE</span>
            <span className="font-bold text-blue-700">€ {results.costoTotaleBase}</span>
          </div>
          <div className="flex justify-between py-2 text-lg">
            <span className="text-gray-700">TOTALE CON MARGINE</span>
            <span className="font-bold text-blue-700">€ {results.costoTotaleConMargine}</span>
          </div>
          <div className="flex justify-between py-2 text-lg">
            <span className="text-gray-700">IVA</span>
            <span className="font-bold text-blue-700">€ {results.iva}</span>
          </div>
          <div className="flex justify-between py-3 text-xl border-t-2 border-green-500">
            <span className="font-bold text-green-700">TOTALE PREVENTIVO (IVA Inclusa)</span>
            <span className="font-bold text-green-700">€ {results.costoTotaleConIva}</span>
          </div>
        </div>
      </div>

      {/* Payment Tranches */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Piano Pagamenti</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Prima Tranche (Anticipo)</span>
            <span className="font-semibold text-blue-700">€ {results.primaTranche}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Seconda Tranche</span>
            <span className="font-semibold text-blue-700">€ {results.secondaTranche}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Terza Tranche (Saldo)</span>
            <span className="font-semibold text-blue-700">€ {results.terzaTranche}</span>
          </div>
        </div>
      </div>

      {/* Economic Analysis */}
      {results.risparmioAnnuo > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Analisi Economica</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Risparmio Annuo Stimato</span>
              <span className="font-bold text-green-600">€ {results.risparmioAnnuo}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Periodo di Rientro (Payback)</span>
              <span className="font-bold text-green-600">{results.paybackPeriod} anni</span>
            </div>
          </div>
        </div>
      )}

      {/* Structural Details */}
      {results.breakdown && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <details>
            <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
              Dettagli Tecnici Strutturali
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              {results.breakdown.strutturale.costoKitStruttura > 0 ? (
                <>
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span className="text-gray-700 font-medium">Kit Struttura (Tettoie/A Terra)</span>
                    <span className="font-semibold">€ {results.breakdown.strutturale.costoKitStruttura.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Il kit struttura include: guide, morsetti, staffe e prolunghe
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Morsetti Centrali</span>
                    <span>{results.breakdown.strutturale.morsettiCentrali} pz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Morsetti Finali</span>
                    <span>{results.breakdown.strutturale.morsettiFinali} pz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guide di Fissaggio</span>
                    <span>{results.breakdown.strutturale.guideTotali} pz</span>
                  </div>
                  {results.breakdown.strutturale.staffe > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staffe per Tegole</span>
                      <span>{results.breakdown.strutturale.staffe} pz</span>
                    </div>
                  )}
                  {results.breakdown.strutturale.prolunghe > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prolunghe Guide</span>
                      <span>{results.breakdown.strutturale.prolunghe} pz</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between mt-2 pt-2 border-t">
                <span className="text-gray-600">Lunghezza Cavi DC</span>
                <span>{results.breakdown.cavi.lunghezzaCaviDC.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lunghezza Cavi AC</span>
                <span>{results.breakdown.cavi.lunghezzaCaviCA.toFixed(1)} m</span>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default Results;
