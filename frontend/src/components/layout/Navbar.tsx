import React, { useState, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';
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

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: ReactNode;
  items: MenuItem[];
}

interface MenuStructure {
  mainItems: MenuItem[];
  groups: MenuGroup[];
}

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Estado persistente para grupos colapsables
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebarExpandedGroups');
    return saved ? JSON.parse(saved) : {
      menu: false,
      personal: false,
      finanzas: false,
      configuracion: false
    };
  });

  // Guardar y restaurar posición de scroll
  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const savedScrollPos = localStorage.getItem('sidebarScrollPosition');
    if (savedScrollPos) {
      navElement.scrollTop = parseInt(savedScrollPos, 10);
    }

    const handleScroll = () => {
      localStorage.setItem('sidebarScrollPosition', navElement.scrollTop.toString());
    };

    navElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => navElement.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newState = {
        ...prev,
        [groupName]: !prev[groupName]
      };
      localStorage.setItem('sidebarExpandedGroups', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const menuStructure = useMemo<MenuStructure>(() => {
    if (!user) return { mainItems: [], groups: [] };

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return {
          mainItems: [
            { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon /> },
            { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon /> },
            { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon /> },
            { path: ROUTES.CASHIER_CASH_REGISTER, label: 'Cierre de Caja', icon: <CashRegisterIcon /> },
            { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon /> },
            { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon /> },
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
  }, [user]);

  const handleNavClick = useCallback((path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  }, [navigate]);

  const isGroupActive = useCallback((group: MenuGroup) => {
    return group.items.some(item => location.pathname === item.path);
  }, [location.pathname]);

  const isItemActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <>
      <div className="mobile-header">
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
        <div className="mobile-brand">
          <span className="brand-text">Mr Panzo</span>
        </div>
        <div className="mobile-user">
          <span>{user?.username}</span>
        </div>
      </div>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img src="/logo-mrpanzo-removebg.png" alt="Mr Panzo Logo" />
            </div>
            {!collapsed && (
              <div className="logo-content">
                <div className="logo-mr text-blue-600 font-bold text-xl">Mr.</div>
                <div className="logo-panzo text-gray-800 font-black text-2xl">Panzo</div>
                <div className="logo-tagline text-[10px] text-gray-400 uppercase tracking-widest">Admin Panel</div>
              </div>
            )}
          </div>
          <button className="sidebar-toggle desktop-only" onClick={onToggle} title={collapsed ? 'Expandir' : 'Contraer'}>
            {collapsed ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
          </button>
        </div>

        {user && (
          <div className="sidebar-user px-4 py-6 border-b border-gray-50 mb-4">
            <div className="user-avatar w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info ml-3 overflow-hidden">
                <div className="user-name font-bold text-gray-800 truncate">{user.username}</div>
                <div className="user-role text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{user.role}</div>
              </div>
            )}
          </div>
        )}

        <nav className="sidebar-nav flex-1 overflow-y-auto px-2" ref={navRef}>
          {menuStructure.mainItems.map((item) => (
            <a
              key={item.path}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.path);
              }}
              className={`nav-item flex items-center p-3 rounded-xl transition-all mb-1 ${isItemActive(item.path) ? 'active bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="ml-3 text-sm font-semibold">{item.label}</span>}
            </a>
          ))}

          {menuStructure.groups.length > 0 && menuStructure.mainItems.length > 0 && (
            <div className="h-px bg-gray-100 my-4 mx-4"></div>
          )}

          {menuStructure.groups.map((group) => (
            <div key={group.id} className="nav-group mb-1">
              <button
                className={`w-full flex items-center p-3 rounded-xl transition-all ${isGroupActive(group) ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50'} ${expandedGroups[group.id] ? 'bg-gray-50/50' : ''}`}
                onClick={() => toggleGroup(group.id)}
                title={collapsed ? group.label : ''}
              >
                <span className="nav-icon">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="ml-3 text-sm font-semibold text-left flex-1">{group.label}</span>
                    <span className={`transition-transform duration-200 ${expandedGroups[group.id] ? 'rotate-0' : '-rotate-90'}`}>
                      {expandedGroups[group.id] ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                    </span>
                  </>
                )}
              </button>

              {!collapsed && expandedGroups[group.id] && (
                <div className="nav-group-items mt-1 ml-4 border-l border-gray-100 space-y-1">
                  {group.items.map((item) => (
                    <a
                      key={item.path}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.path);
                      }}
                      className={`flex items-center p-2 pl-6 rounded-xl text-xs font-medium transition-all ${isItemActive(item.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className="nav-icon scale-75 opacity-70">{item.icon}</span>
                      <span className="ml-3">{item.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer p-4 mt-auto">
          <button
            className="w-full flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm"
            onClick={handleLogout}
            title={collapsed ? 'Cerrar Sesión' : ''}
          >
            <LogoutIcon size={18} />
            {!collapsed && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
});

export default Navbar;
