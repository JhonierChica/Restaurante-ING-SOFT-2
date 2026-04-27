import { createContext, useState, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { normalizeProfileCode } from '../utils/roles';
import type { User, AuthResult, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    return authService.getCurrentUser() || null;
  });
  const [loading] = useState(false);

  const login = async (username: string, password: string): Promise<AuthResult> => {
    try {
      if (!username || !username.trim()) {
        return { success: false, error: 'El nombre de usuario es requerido' };
      }
      if (!password || !password.trim()) {
        return { success: false, error: 'La contraseña es requerida' };
      }
      
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      const response: LoginResponse = await authService.login(cleanUsername, cleanPassword);
      
      if (!response || !response.userId) {
        return { success: false, error: 'Respuesta inválida del servidor' };
      }
      
      const userData: User = {
        id: response.userId,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        pin: response.pin,
        profile: response.profile,
        role: normalizeProfileCode(response.profile?.code),
      };
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      
      if (error.response?.status === 401) {
        errorMessage = error.response?.data?.message || 'Usuario o contraseña incorrectos';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intente nuevamente.';
      } else if (!error.response) {
        errorMessage = 'No se puede conectar al servidor. Verifique su conexión.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};