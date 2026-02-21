import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import {
  OrdersIcon,
  MenuIcon,
  TableIcon,
  ClientsIcon,
  TeamIcon,
  EmployeeIcon,
  BriefcaseIcon,
  ProfileIcon,
  UsersIcon,
  FinanceIcon,
  PaymentIcon,
  SettingsIcon,
  CategoryIcon,
  LogoutIcon,
  CollapseIcon,
  ExpandIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DeliveryIcon,
  CashRegisterIcon,
} from '../common/Icons';
import '../../styles/Sidebar.css';
import '../../styles/Navbar.css';
import '../../styles/Icons.css';

const Navbar = React.memo(({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Estado persistente para grupos colapsables
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const saved = localStorage.getItem('sidebarExpandedGroups');
    return saved ? JSON.parse(saved) : {
      personal: false,
      finanzas: false,
      configuracion: false
    };
  });

  // Guardar y restaurar posición de scroll
  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    // Restaurar posición guardada en localStorage
    const savedScrollPos = localStorage.getItem('sidebarScrollPosition');
    if (savedScrollPos) {
      navElement.scrollTop = parseInt(savedScrollPos, 10);
    }

    // Guardar posición de scroll cuando cambie
    const handleScroll = () => {
      localStorage.setItem('sidebarScrollPosition', navElement.scrollTop.toString());
    };

    navElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => navElement.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // Re-ejecutar cuando cambie la ruta

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  const toggleGroup = useCallback((groupName) => {
    setExpandedGroups(prev => {
      const newState = {
        ...prev,
        [groupName]: !prev[groupName]
      };
      // Guardar en localStorage
      localStorage.setItem('sidebarExpandedGroups', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const getMenuStructure = useMemo(() => {
    if (!user) return { mainItems: [], groups: [] };

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return {
          mainItems: [
            { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon /> },
            { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon /> },
            { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon /> },
            { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon /> },
            { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon /> },
            { path: ROUTES.CASHIER_CASH_REGISTER, label: 'Cierre de Caja', icon: <CashRegisterIcon /> },
          ],
          groups: [
            {
              id: 'menu',
              label: 'Menú',
              icon: <MenuIcon />,
              items: [
                { path: ROUTES.ADMIN_MENU, label: 'Gestión de Menú', icon: <MenuIcon /> },
                { path: ROUTES.ADMIN_CATEGORIES, label: 'Categorías', icon: <CategoryIcon /> },
              ]
            },
            {
              id: 'personal',
              label: 'Personal',
              icon: <TeamIcon />,
              items: [
                { path: ROUTES.ADMIN_EMPLOYEES, label: 'Empleados', icon: <EmployeeIcon /> },
                { path: ROUTES.ADMIN_POSITIONS, label: 'Cargos', icon: <BriefcaseIcon /> },
                { path: ROUTES.ADMIN_PROFILES, label: 'Perfiles', icon: <ProfileIcon /> },
                { path: ROUTES.ADMIN_USERS, label: 'Usuarios', icon: <UsersIcon /> },
              ]
            },
            {
              id: 'configuracion',
              label: 'Configuración',
              icon: <SettingsIcon />,
              items: [
                { path: ROUTES.ADMIN_PAYMENT_METHODS, label: 'Métodos de Pago', icon: <PaymentIcon /> },
              ]
            }
          ]
        };
      case USER_ROLES.WAITER:
        return {
          mainItems: [
            { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon /> },
            { path: ROUTES.WAITER_TABLES, label: 'Mesas', icon: <TableIcon /> },
          ],
          groups: []
        };
      case USER_ROLES.CASHIER:
        return {
          mainItems: [
            { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon /> },
            { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon /> },
            { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon /> },
            { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon /> },
            { path: ROUTES.CASHIER_CASH_REGISTER, label: 'Cierre de Caja', icon: <CashRegisterIcon /> },
          ],
          groups: []
        };
      default:
        return { mainItems: [], groups: [] };
    }
  }, [user?.role]);

  const menuStructure = getMenuStructure;

  const handleNavClick = useCallback((path) => {
    navigate(path);
    setMobileMenuOpen(false);
  }, [navigate]);

  const isGroupActive = useCallback((group) => {
    return group.items.some(item => location.pathname === item.path);
  }, [location.pathname]);

  const isItemActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-brand">
          <span className="brand-text">Mr Panzo</span>
        </div>
        <div className="mobile-user">
          <span>{user?.username}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img
                src="/logo-mrpanzo-removebg.png"
                alt="Mr Panzo Logo"
              />
            </div>
            {!collapsed && (
              <div className="logo-content">
                <div className="logo-mr">Mr.</div>
                <div className="logo-panzo">Panzo</div>
                <div className="logo-tagline">Admin Panel</div>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={onToggle}
            title={collapsed ? 'Expandir' : 'Contraer'}
          >
            {collapsed ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-role">{user.role}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" ref={navRef}>
          {/* Main Items */}
          {menuStructure.mainItems.map((item) => (
            <a
              key={item.path}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.path);
              }}
              className={`nav-item ${isItemActive(item.path) ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </a>
          ))}

          {/* Separator if there are groups */}
          {menuStructure.groups.length > 0 && menuStructure.mainItems.length > 0 && (
            <div className="nav-separator"></div>
          )}

          {/* Grouped Items */}
          {menuStructure.groups.map((group) => (
            <div key={group.id} className="nav-group">
              {/* Group Header */}
              <button
                className={`nav-group-header ${isGroupActive(group) ? 'active' : ''} ${expandedGroups[group.id] ? 'expanded' : ''}`}
                onClick={() => toggleGroup(group.id)}
                title={collapsed ? group.label : ''}
              >
                <span className="nav-icon">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{group.label}</span>
                    <span className="nav-arrow">
                      {expandedGroups[group.id] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </span>
                  </>
                )}
              </button>

              {/* Group Items */}
              {!collapsed && expandedGroups[group.id] && (
                <div className="nav-group-items">
                  {group.items.map((item) => (
                    <a
                      key={item.path}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.path);
                      }}
                      className={`nav-item nav-subitem ${isItemActive(item.path) ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Cerrar Sesión' : ''}
          >
            <span className="logout-icon"><LogoutIcon /></span>
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
});

export default Navbar;
