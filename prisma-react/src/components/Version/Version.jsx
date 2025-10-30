import { useState, useEffect } from 'react';

const Version = () => {
  const [showModal, setShowModal] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(0);

  useEffect(() => {
    loadVersionData();
  }, []);

  const loadVersionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/version.json');
      const data = await response.json();
      setVersionData(data);
    } catch (error) {
      console.error('Error loading version data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureIcon = (type) => {
    switch (type) {
      case 'new':
        return '✨';
      case 'improved':
        return '🔧';
      case 'fixed':
        return '🐛';
      default:
        return '📌';
    }
  };

  const getFeatureBadgeColor = (type) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'improved':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!versionData) return null;

  return (
    <>
      {/* Version Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#1f2937',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
        <span>v{versionData.version}</span>
      </button>

      {/* Version Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                color: 'white',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {versionData.appName}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                  {versionData.subtitle}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  Version {versionData.version} - {new Date(versionData.releaseDate).toLocaleDateString('it-IT')}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ×
              </button>
            </div>

            {/* Version Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                overflowX: 'auto'
              }}
            >
              {versionData.changelog.map((version, index) => (
                <button
                  key={version.version}
                  onClick={() => setSelectedVersion(index)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedVersion === index ? '#3b82f6' : '#f3f4f6',
                    color: selectedVersion === index ? 'white' : '#4b5563',
                    fontWeight: selectedVersion === index ? '600' : '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedVersion !== index) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVersion !== index) {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  v{version.version}
                </button>
              ))}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '24px'
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '2rem' }}>⏳</div>
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading version info...</p>
                </div>
              ) : (
                <>
                  {/* Selected Version Details */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}
                    >
                      {versionData.changelog[selectedVersion].title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '24px' }}>
                      Released on {new Date(versionData.changelog[selectedVersion].date).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>

                    {/* Features List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {versionData.changelog[selectedVersion].features.map((feature, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: '#f9fafb',
                            padding: '16px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{getFeatureIcon(feature.type)}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}
                                  className={getFeatureBadgeColor(feature.type)}
                                >
                                  {feature.type.toUpperCase()}
                                </span>
                                <h4
                                  style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                  }}
                                >
                                  {feature.title}
                                </h4>
                              </div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '0.875rem',
                                  color: '#4b5563',
                                  lineHeight: '1.5'
                                }}
                              >
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Section (only show on latest version) */}
                  {selectedVersion === 0 && (
                    <div
                      style={{
                        backgroundColor: '#eff6ff',
                        padding: '20px',
                        borderRadius: '8px',
                        marginTop: '24px'
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#1e40af',
                          marginBottom: '12px'
                        }}
                      >
                        About {versionData.appName}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.6', marginBottom: '16px' }}>
                        {versionData.about.description}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                        <div>
                          <strong style={{ color: '#1e40af' }}>Company:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#3730a3' }}>{versionData.about.company}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#1e40af' }}>Developer:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#3730a3' }}>{versionData.about.developer}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#1e40af' }}>Website:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#3730a3' }}>{versionData.about.website}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#1e40af' }}>Contact:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#3730a3' }}>{versionData.about.contact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for badge colors */}
      <style>{`
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }
      `}</style>
    </>
  );
};

export default Version;
