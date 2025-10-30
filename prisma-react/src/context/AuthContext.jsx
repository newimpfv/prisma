import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AUTH_SESSION_KEY = 'prisma_auth_session';
const SESSION_EXPIRY_HOURS = 24; // Session expires after 24 hours

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = () => {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (session) {
        const sessionData = JSON.parse(session);
        const now = Date.now();

        // Check if session is still valid (not expired)
        if (sessionData.expiresAt && now < sessionData.expiresAt) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear it
          localStorage.removeItem(AUTH_SESSION_KEY);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username, password) => {
    const validUsername = import.meta.env.VITE_LOGIN_NAME;
    const validPassword = import.meta.env.VITE_LOGIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      // Create session with expiry
      const expiresAt = Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
      const sessionData = {
        authenticated: true,
        loginTime: Date.now(),
        expiresAt
      };

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
