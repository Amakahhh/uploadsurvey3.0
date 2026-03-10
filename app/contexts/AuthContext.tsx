'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeLocalStorage } from '../utils/storageUtils';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isVerified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData, token: string, refreshToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTokenValid = (token: string): boolean => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload?.exp) return false;
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    };

    const bootstrapAuth = async () => {
      try {
        const token = safeLocalStorage.getItem('jwtToken');
        const userData = safeLocalStorage.getJSONItem<UserData>('userData');

        if (!token || !userData || !isTokenValid(token)) {
          safeLocalStorage.removeItem('jwtToken');
          safeLocalStorage.removeItem('userData');
          safeLocalStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        // Validate session against backend to avoid stale localStorage login state
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          safeLocalStorage.removeItem('jwtToken');
          safeLocalStorage.removeItem('userData');
          safeLocalStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        safeLocalStorage.removeItem('jwtToken');
        safeLocalStorage.removeItem('userData');
        safeLocalStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = (userData: UserData, token: string, refreshToken: string) => {
    try {
      safeLocalStorage.setItem('jwtToken', token);
      safeLocalStorage.setItem('refreshToken', refreshToken);
      safeLocalStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving authentication data:', error);
      // Fallback: clear all auth data if storage fails
      logout();
    }
  };

  const logout = () => {
    try {
      safeLocalStorage.removeItem('jwtToken');
      safeLocalStorage.removeItem('refreshToken');
      safeLocalStorage.removeItem('userData');
    } catch (error) {
      console.error('Error removing authentication data:', error);
    }
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
