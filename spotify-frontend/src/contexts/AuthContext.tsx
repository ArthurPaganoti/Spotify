import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { LoginRequestDTO, UserRegisterDTO, User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequestDTO) => Promise<void>;
  register: (userData: UserRegisterDTO) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (authService.getToken()) {
      try {
        const profile = await profileService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);

    if (token) {
      refreshUser();
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequestDTO) => {
    const response = await authService.login(credentials);
    authService.setToken(response.token);
    setIsAuthenticated(true);
    await refreshUser();
  };

  const register = async (userData: UserRegisterDTO) => {
    await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
