import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken } from '../services/api';
import { AlertTriangle, LogOut } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  handleTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
    setTokenExpired(false);
  };

  const logout = () => {
    // Clear all localStorage data
    localStorage.clear();
    removeToken();
    setToken(null);
    setIsAuthenticated(false);
    setTokenExpired(false);
  };

  const handleTokenExpiration = () => {
    setTokenExpired(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, handleTokenExpiration }}>
      {children}
      {tokenExpired && (
        <TokenExpiredHandler onConfirm={logout} />
      )}
    </AuthContext.Provider>
  );
};

// Token Expired Handler Component
const TokenExpiredHandler = ({ onConfirm }: { onConfirm: () => void }) => {
  const handleConfirm = () => {
    onConfirm();
    // Use window.location for navigation since we're outside Router context
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Token Expired</h3>
          <p className="text-gray-600">
            Your session has expired. Please log in again to continue.
          </p>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Yes, Logout
        </button>
      </div>
    </div>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
