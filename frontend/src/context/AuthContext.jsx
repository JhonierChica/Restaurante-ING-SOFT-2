import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Validar que se proporcionen credenciales
      if (!username || !username.trim()) {
        return { 
          success: false, 
          error: 'El nombre de usuario es requerido' 
        };
      }
      if (!password || !password.trim()) {
        return { 
          success: false, 
          error: 'La contraseña es requerida' 
        };
      }
      
      // Limpiar espacios en blanco
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      const response = await authService.login(cleanUsername, cleanPassword);
      
      // Verificar que la respuesta tenga los datos esperados
      if (!response || !response.userId) {
        return {
          success: false,
          error: 'Respuesta inválida del servidor'
        };
      }
      
      // Normalizar el código de perfil (puede venir en español o inglés)
      const normalizeProfileCode = (code) => {
        if (!code) return 'USER';
        const upperCode = code.toUpperCase();
        
        // Mapeo de códigos en español a inglés
        const mapping = {
          'MESERO': 'WAITER',
          'CAJERO': 'CASHIER',
          'ADMINISTRADOR': 'ADMIN',
          'ADMIN': 'ADMIN',
          'WAITER': 'WAITER',
          'CASHIER': 'CASHIER'
        };
        
        return mapping[upperCode] || upperCode;
      };
      
      const userData = {
        id: response.userId,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        pin: response.pin,
        profile: response.profile,
        // Normalizar role para compatibilidad
        role: normalizeProfileCode(response.profile?.code),
      };
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Extraer mensaje de error específico
      let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      
      if (error.response?.status === 401) {
        // Error de autenticación
        errorMessage = error.response?.data?.message || 'Usuario o contraseña incorrectos';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intente nuevamente.';
      } else if (!error.response) {
        errorMessage = 'No se puede conectar al servidor. Verifique su conexión.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
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
