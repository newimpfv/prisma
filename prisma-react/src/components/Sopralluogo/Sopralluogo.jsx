import { useState, useEffect, useRef } from 'react';
import { getOfflineManager } from '../../services/offlineManager';

function Sopralluogo() {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [pCloudLink, setPCloudLink] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Get GPS coordinates on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
          setCoordinates(coords);
          setLoading(false);
          showMessage('success', '📍 Posizione rilevata!');
        },
        (error) => {
          console.error('GPS error:', error);
          setLoading(false);
          showMessage('warning', '⚠️ GPS non disponibile - puoi inserire le coordinate manualmente');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    // Listen to online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotos((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              file,
              url: event.target.result,
              name: file.name,
              size: file.size,
              uploaded: false
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    showMessage('success', `✅ ${files.length} foto aggiunte`);
    e.target.value = ''; // Reset input
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setVideos((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              file,
              url: event.target.result,
              name: file.name,
              size: file.size,
              duration: 0
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    showMessage('success', `✅ ${files.length} video aggiunti`);
    e.target.value = ''; // Reset input
  };

  // Remove photo
  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showMessage('info', 'Foto rimossa');
  };

  // Remove video
  const removeVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    showMessage('info', 'Video rimosso');
  };

  // Upload to Airtable
  const uploadToAirtable = async () => {
    if (photos.length === 0 && !pCloudLink) {
      showMessage('warning', '⚠️ Aggiungi almeno una foto o un link video');
      return;
    }

    setUploading(true);

    try {
      const token = import.meta.env.VITE_AIRTABLE_TOKEN;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const tableId = 'tblU0P92KEZv9hQsK'; // dettagli_impianti

      // Prepare photo attachments for Airtable
      const photoAttachments = await Promise.all(
        photos.map(async (photo) => {
          // Convert blob to base64 for Airtable
          return {
            url: photo.url,
            filename: photo.name
          };
        })
      );

      // Create record in Airtable
      const record = {
        fields: {
          sopralluogoData: new Date().toISOString().split('T')[0],
          coordinate: coordinates || '',
          linkPCloud: pCloudLink || ''
        }
      };

      // Add photos if online
      if (isOnline && photoAttachments.length > 0) {
        record.fields.sopralluogoFoto = photoAttachments;
      }

      if (isOnline) {
        // Upload to Airtable
        const response = await fetch(
          `https://api.airtable.com/v0/${baseId}/${tableId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        console.log('Uploaded to Airtable:', data);

        // Mark photos as uploaded
        setPhotos((prev) =>
          prev.map((p) => ({ ...p, uploaded: true }))
        );

        showMessage('success', '✅ Sopralluogo salvato su Airtable!');
      } else {
        // Save offline
        const offlineManager = await getOfflineManager();

        await offlineManager.saveProject({
          type: 'sopralluogo',
          sopralluogoData: record.fields.sopralluogoData,
          coordinate: record.fields.coordinate,
          linkPCloud: record.fields.linkPCloud,
          photos: photos.map((p) => ({
            name: p.name,
            size: p.size,
            url: p.url
          })),
          videos: videos.map((v) => ({
            name: v.name,
            size: v.size
          }))
        });

        showMessage(
          'warning',
          '📴 Salvato offline - Verrà sincronizzato quando tornerà la connessione'
        );
      }

      // Clear form
      setTimeout(() => {
        setPhotos([]);
        setVideos([]);
        setPCloudLink('');
        setCoordinates(null);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', '❌ Errore durante il salvataggio: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      style={{
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#1f2937'
        }}
      >
        📸 Sopralluogo Impianto
      </h2>

      {/* Message notification */}
      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            backgroundColor:
              message.type === 'success'
                ? '#10b981'
                : message.type === 'warning'
                ? '#fbbf24'
                : message.type === 'error'
                ? '#ef4444'
                : '#3b82f6',
            color: 'white',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}
        >
          {message.text}
        </div>
      )}

      {/* GPS Coordinates */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          📍 Coordinate GPS
        </label>
        <input
          type="text"
          value={coordinates || ''}
          onChange={(e) => setCoordinates(e.target.value)}
          placeholder="45.0703,7.6869"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
        {loading && (
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Rilevamento posizione in corso...
          </p>
        )}
      </div>

      {/* Photo Upload */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1f2937'
          }}
        >
          📷 Foto Impianto
        </h3>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => photoInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📸</span>
          <span>Aggiungi Foto (Camera/Galleria)</span>
        </button>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem'
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: 'relative',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                >
                  <div>{photo.name}</div>
                  <div>{formatSize(photo.size)}</div>
                  {photo.uploaded && <div style={{ color: '#10b981' }}>✅ Caricata</div>}
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1f2937'
          }}
        >
          🎥 Video Impianto
        </h3>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          multiple
          onChange={handleVideoSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => videoInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#8b5cf6',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎥</span>
          <span>Aggiungi Video (Camera/Galleria)</span>
        </button>

        {/* Video List */}
        {videos.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {videos.map((video) => (
              <div
                key={video.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{video.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatSize(video.size)}
                  </div>
                </div>
                <button
                  onClick={() => removeVideo(video.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}

        {/* pCloud Link Input */}
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            ☁️ Link pCloud (dopo upload manuale)
          </label>
          <input
            type="url"
            value={pCloudLink}
            onChange={(e) => setPCloudLink(e.target.value)}
            placeholder="https://pcloud.com/..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b5cf6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Carica prima i video su pCloud, poi incolla qui il link condiviso
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div
        style={{
          backgroundColor: isOnline ? '#ecfdf5' : '#fef3c7',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: `2px solid ${isOnline ? '#10b981' : '#fbbf24'}`
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {isOnline ? '🌐 Online' : '📴 Offline'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          📸 {photos.length} foto • 🎥 {videos.length} video
          {coordinates && ' • 📍 GPS rilevato'}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={uploadToAirtable}
        disabled={uploading || (photos.length === 0 && !pCloudLink)}
        style={{
          width: '100%',
          padding: '1.25rem',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: 'white',
          backgroundColor:
            uploading || (photos.length === 0 && !pCloudLink) ? '#9ca3af' : '#10b981',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: uploading || (photos.length === 0 && !pCloudLink) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {uploading ? '⏳ Salvataggio...' : '💾 Salva Sopralluogo'}
      </button>
    </div>
  );
}

export default Sopralluogo;
