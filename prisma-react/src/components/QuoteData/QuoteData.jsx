import { useForm } from '../../context/FormContext';
import { useState, useEffect } from 'react';

const QuoteData = () => {
  const { quoteData, setQuoteData } = useForm();
  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setQuoteData({ ...quoteData, [field]: field === 'riferimentoPreventivo' ? value : parseFloat(value) || 0 });
  };

  // Validate payment tranches sum to 100%
  useEffect(() => {
    const sum = quoteData.percentualePrimaPagamento + quoteData.percentualeSecondaPagamento + quoteData.percentualeTerzaPagamento;
    if (sum !== 100) {
      setValidationError(`La somma delle percentuali è ${sum}% - deve essere 100%`);
    } else {
      setValidationError('');
    }
  }, [quoteData.percentualePrimaPagamento, quoteData.percentualeSecondaPagamento, quoteData.percentualeTerzaPagamento]);

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        Dati Preventivo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Validità Preventivo */}
        <div className="form-group">
          <label className="form-label">Validità Preventivo<br/>(giorni)</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={quoteData.validitaPreventivo}
            onChange={(e) => handleChange('validitaPreventivo', e.target.value)}
          />
        </div>

        {/* Riferimento Preventivo */}
        <div className="form-group">
          <label className="form-label">Riferimento Preventivo<br/>(lasciare vuoto per autogenerato)</label>
          <input
            type="text"
            className="form-input"
            placeholder="PRV-YYYYMMDD-HHMM"
            value={quoteData.riferimentoPreventivo}
            onChange={(e) => handleChange('riferimentoPreventivo', e.target.value)}
          />
        </div>
      </div>

      {/* Percentuali di Pagamento */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Percentuali di Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prima Tranche */}
          <div className="form-group">
            <label className="form-label">Prima Tranche<br/>(Ordine Materiali %)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="100"
              value={quoteData.percentualePrimaPagamento}
              onChange={(e) => handleChange('percentualePrimaPagamento', e.target.value)}
            />
          </div>

          {/* Seconda Tranche */}
          <div className="form-group">
            <label className="form-label">Seconda Tranche<br/>(Fine Lavori %)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="100"
              value={quoteData.percentualeSecondaPagamento}
              onChange={(e) => handleChange('percentualeSecondaPagamento', e.target.value)}
            />
          </div>

          {/* Terza Tranche */}
          <div className="form-group">
            <label className="form-label">Terza Tranche<br/>(Collaudo %)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="100"
              value={quoteData.percentualeTerzaPagamento}
              onChange={(e) => handleChange('percentualeTerzaPagamento', e.target.value)}
            />
          </div>
        </div>

        <p className="info-text mt-1">La somma delle percentuali deve essere 100%</p>
        {validationError && (
          <div className="mt-2 text-red-600 text-sm font-semibold">
            ⚠️ {validationError}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteData;
