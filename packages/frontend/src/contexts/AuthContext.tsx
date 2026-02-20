import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginDto, RegisterDto } from '@dental-clinic/shared';
import { authService } from '../services/api/auth.service';
import { tokenStorage } from '../services/storage/tokenStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      if (tokenStorage.hasToken()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear it
          tokenStorage.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginDto) => {
    const result = await authService.login(data);
    tokenStorage.setToken(result.token);
    setUser(result.user);
  };

  const register = async (data: RegisterDto) => {
    const result = await authService.register(data);
    tokenStorage.setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
