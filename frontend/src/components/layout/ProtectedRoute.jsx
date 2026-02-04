import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Verificando autenticación..." />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Normalizar roles para comparación (soporta español e inglés)
  const normalizeRole = (role) => {
    if (!role) return '';
    return role.toUpperCase();
  };

  const userRole = normalizeRole(user.role);

  // ADMIN/ADMINISTRADOR tiene acceso a todo
  if (userRole === 'ADMIN' || userRole === 'ADMINISTRADOR') {
    return children;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole) {
    const required = normalizeRole(requiredRole);
    
    // Permitir tanto español como inglés
    const roleMatches = 
      userRole === required ||
      (userRole === 'WAITER' && required === 'MESERO') ||
      (userRole === 'MESERO' && required === 'WAITER') ||
      (userRole === 'CASHIER' && required === 'CAJERO') ||
      (userRole === 'CAJERO' && required === 'CASHIER');
    
    if (!roleMatches) {
      // Redirigir según el rol del usuario
      if (userRole === 'WAITER' || userRole === 'MESERO') {
        return <Navigate to={ROUTES.WAITER_ORDERS} replace />;
      } else if (userRole === 'CASHIER' || userRole === 'CAJERO') {
        return <Navigate to={ROUTES.CASHIER_TABLES} replace />;
      } else {
        return <Navigate to={ROUTES.LOGIN} replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
