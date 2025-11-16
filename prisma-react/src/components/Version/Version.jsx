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
          className="version-modal-overlay"
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
            className="version-modal-container"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '92vh',
              height: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="version-modal-header"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                color: 'white',
                padding: '24px',
                textAlign: 'center'
              }}
            >
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

            {/* Version Tabs */}
            <div
              className="version-modal-tabs"
              style={{
                display: 'flex',
                gap: '8px',
                padding: '16px 24px 20px 24px',
                borderBottom: '1px solid #e5e7eb',
                overflowX: 'auto',
                overflowY: 'hidden'
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
              className="version-modal-content"
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
                          className="version-feature-card"
                          style={{
                            backgroundColor: '#f9fafb',
                            padding: '16px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span className="version-feature-icon" style={{ fontSize: '1.5rem' }}>{getFeatureIcon(feature.type)}</span>
                            <div style={{ flex: 1 }}>
                              <div className="version-feature-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                                  className="version-feature-title"
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
                                className="version-feature-description"
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
                      className="version-about-section"
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
                      <div className="version-about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
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
              className="version-modal-footer"
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                className="version-close-btn"
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

      {/* Inline styles for badge colors and mobile optimization */}
      <style>{`
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }

        /* Hide scrollbar for version tabs while keeping scroll functionality */
        .version-modal-tabs {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          position: relative;
        }
        .version-modal-tabs::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* Visual indicator for scrollable content */
        .version-modal-tabs::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to left, rgba(255,255,255,0.95), transparent);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .version-modal-overlay {
            padding: 8px !important;
            background-color: rgba(0, 0, 0, 0.7) !important;
          }
          .version-modal-container {
            max-width: 100% !important;
            width: 100% !important;
            max-height: calc(100vh - 16px) !important;
            height: calc(100vh - 16px) !important;
            margin: 0 !important;
            border-radius: 16px !important;
          }
          .version-modal-header {
            padding: 20px 16px !important;
            text-align: center !important;
            border-radius: 16px 16px 0 0 !important;
          }
          .version-modal-header h2 {
            font-size: 1.25rem !important;
          }
          .version-modal-header p {
            font-size: 0.8125rem !important;
            margin: 6px 0 0 0 !important;
          }
          .version-modal-header p:last-child {
            margin-top: 8px !important;
          }
          .version-modal-tabs {
            padding: 14px 16px !important;
            padding-bottom: 18px !important;
            gap: 8px !important;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          .version-modal-tabs button {
            padding: 10px 16px !important;
            font-size: 0.875rem !important;
            min-width: fit-content !important;
            flex-shrink: 0 !important;
            border-radius: 8px !important;
          }
          .version-modal-content {
            padding: 20px 16px !important;
            -webkit-overflow-scrolling: touch;
          }
          .version-modal-content h3 {
            font-size: 1.125rem !important;
            margin-bottom: 8px !important;
          }
          .version-modal-content > div > p {
            font-size: 0.875rem !important;
            margin-bottom: 20px !important;
          }
          .version-feature-card {
            padding: 14px !important;
            margin-bottom: 12px !important;
            border-radius: 10px !important;
          }
          .version-feature-card > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .version-feature-icon {
            font-size: 1.5rem !important;
            margin-bottom: 0 !important;
          }
          .version-feature-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .version-feature-header span {
            border-radius: 6px !important;
            padding: 4px 10px !important;
            font-size: 0.75rem !important;
          }
          .version-feature-title {
            font-size: 1rem !important;
            line-height: 1.4 !important;
          }
          .version-feature-description {
            font-size: 0.875rem !important;
            line-height: 1.6 !important;
          }
          .version-about-section {
            padding: 18px !important;
            margin-top: 20px !important;
            border-radius: 10px !important;
          }
          .version-about-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .version-about-section h4 {
            font-size: 1rem !important;
            margin-bottom: 10px !important;
          }
          .version-about-section p {
            font-size: 0.875rem !important;
            line-height: 1.6 !important;
          }
          .version-modal-footer {
            padding: 16px !important;
            background: white !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05) !important;
            border-radius: 0 0 16px 16px !important;
          }
          .version-close-btn {
            width: 100% !important;
            padding: 14px 24px !important;
            font-size: 1rem !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
          }
        }
      `}</style>
    </>
  );
};

export default Version;
