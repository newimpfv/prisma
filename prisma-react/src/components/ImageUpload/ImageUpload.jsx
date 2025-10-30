import { useForm } from '../../context/FormContext';

const ImageUpload = () => {
  const { renderImages, setRenderImages } = useForm();

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Ridimensiona solo se l'immagine è più grande del necessario
        if (width > 800 || height > 600) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calcola le nuove dimensioni mantenendo il rapporto d'aspetto
          let newWidth = width;
          let newHeight = height;
          if (width > 800) {
            newWidth = 800;
            newHeight = (height * 800) / width;
          }
          if (newHeight > 600) {
            newHeight = 600;
            newWidth = (width * 600) / height;
          }

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Disegna l'immagine ridimensionata sul canvas
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Converti in base64 con qualità compressa
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          // Salva l'immagine ottimizzata
          const newImages = [...renderImages];
          newImages[index] = compressedBase64;
          setRenderImages(newImages);
        } else {
          // Usa l'immagine originale se è già piccola
          const newImages = [...renderImages];
          newImages[index] = e.target.result;
          setRenderImages(newImages);
        }
      };
      img.onerror = () => {
        alert("Impossibile visualizzare l'anteprima dell'immagine.");
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert("Problema nel caricamento dell'immagine.");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const newImages = [...renderImages];
    newImages[index] = '';
    setRenderImages(newImages);
    // Reset the file input
    const input = document.getElementById(`renderImage${index + 1}`);
    if (input) input.value = '';
  };

  return (
    <div className="form-section">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="#0F3460">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Immagini Render (Opzionale)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="form-group">
            <label className="form-label">Immagine Render {index + 1}</label>
            <input
              type="file"
              id={`renderImage${index + 1}`}
              accept="image/*"
              className="form-input"
              onChange={(e) => handleImageUpload(e, index)}
            />
            {renderImages[index] && (
              <div className="mt-2">
                <img
                  src={renderImages[index]}
                  alt={`Anteprima immagine ${index + 1}`}
                  className="max-h-32 border rounded shadow-sm"
                />
                <button
                  type="button"
                  className="mt-1 text-red-500 text-sm hover:text-red-700"
                  onClick={() => removeImage(index)}
                >
                  Rimuovi
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="info-text mt-3">
        Carica fino a 3 immagini render dell'impianto. Le immagini verranno automaticamente
        ottimizzate per ridurre le dimensioni del file.
      </p>
    </div>
  );
};

export default ImageUpload;
