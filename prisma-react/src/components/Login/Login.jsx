import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const success = login(username, password);

      if (!success) {
        setError('Username o password non corretti');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2.5rem',
          borderRadius: '1rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem'
          }}>
            ⚡
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#0F3460',
            marginBottom: '0.5rem'
          }}>
            Prisma Solar
          </h1>
          <p style={{
            margin: 0,
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Accedi per continuare
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '0.5rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isLoading ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 8px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          Sistema di gestione preventivi fotovoltaici
        </div>
      </div>
    </div>
  );
};

export default Login;
