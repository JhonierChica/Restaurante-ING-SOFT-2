import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLES } from '../utils/constants';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        console.log('Login successful, user role:', result.user.role);
        
        // Redirigir según el rol del usuario
        switch (result.user.role?.toUpperCase()) {
          case 'ADMIN':
          case 'ADMINISTRADOR':
            navigate(ROUTES.ADMIN_PROFILES);
            break;
          case 'WAITER':
          case 'MESERO':
            navigate(ROUTES.WAITER_ORDERS);
            break;
          case 'CASHIER':
          case 'CAJERO':
            navigate(ROUTES.CASHIER_TABLES);
            break;
          default:
            console.warn('Unknown role:', result.user.role, '- redirecting to admin');
            navigate(ROUTES.ADMIN_PROFILES);
        }
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Columna Izquierda - Bienvenida */}
      <div className="login-welcome-section">
        <div className="login-welcome-content">
          <div className="login-logo-container">
            <img 
              src="/logo-mrpanzo-removebg.png" 
              alt="Mr Panzo Logo" 
              className="login-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="login-logo-fallback" style={{display: 'none'}}>
              <div className="logo-text">
                <span className="logo-mr">MR</span>
                <span className="logo-panzo">PANZO</span>
              </div>
              <span className="logo-subtitle">COMIDAS RÁPIDAS</span>
            </div>
          </div>
          
          <h1 className="login-welcome-title">Bienvenido de nuevo</h1>
          <p className="login-welcome-subtitle">
           Este es un sistema exclusivo para el personal autorizado de Mr. Panzo.
          </p>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="login-form-section">
        <div className="login-form-container">
          {/* Toggle Tema (opcional) */}
          <button className="theme-toggle" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="login-form-header">
            <h2 className="login-form-title">Login</h2>
            <p className="login-form-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Usuario o Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <a href="#" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Mantener sesión iniciada</span>
              </label>
            </div>

            {error && (
              <div className="error-alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="button-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            <div className="security-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Acceso seguro solo para personal autorizado</span>
            </div>
          </form>

          <div className="login-footer">
            <span>POWERED BY MR. PANZO SYSTEMS</span>
            <div className="login-footer-links">
              <a href="#">Privacy Policy</a>
              <span>•</span>
              <a href="#">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
