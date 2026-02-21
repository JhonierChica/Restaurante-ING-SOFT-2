import React from 'react';

// Componente base para iconos SVG
const Icon = ({ children, size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

// Icono de Pedidos (plato con cubiertos)
export const OrdersIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8m-4-4h8" />
    <path d="M7 7l10 10M17 7L7 17" opacity="0.4" />
  </Icon>
);

// Icono de Menú (lista con elementos)
export const MenuIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="7" y1="9" x2="17" y2="9" />
    <line x1="7" y1="13" x2="17" y2="13" />
    <line x1="7" y1="17" x2="13" y2="17" />
  </Icon>
);

// Icono de Mesas (mesa con sillas)
export const TableIcon = (props) => (
  <Icon {...props}>
    <rect x="4" y="6" width="16" height="2" rx="1" />
    <line x1="6" y1="8" x2="6" y2="18" />
    <line x1="18" y1="8" x2="18" y2="18" />
    <line x1="10" y1="8" x2="10" y2="13" />
    <line x1="14" y1="8" x2="14" y2="13" />
    <circle cx="6" cy="19" r="1" />
    <circle cx="18" cy="19" r="1" />
  </Icon>
);

// Icono de Clientes (grupo de personas)
export const ClientsIcon = (props) => (
  <Icon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

// Icono de Personal (grupo)
export const TeamIcon = (props) => (
  <Icon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

// Icono de Empleado (persona con identificación)
export const EmployeeIcon = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

// Icono de Cargos (maletín)
export const BriefcaseIcon = (props) => (
  <Icon {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

// Icono de Perfiles (escudo con check)
export const ProfileIcon = (props) => (
  <Icon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

// Icono de Usuarios (persona con engranaje)
export const UsersIcon = (props) => (
  <Icon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6M23 11h-6" />
  </Icon>
);

// Icono de Finanzas (monedas)
export const FinanceIcon = (props) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <line x1="16" y1="16" x2="16" y2="22" />
    <line x1="13" y1="19" x2="19" y2="19" />
  </Icon>
);

// Icono de Pagos (tarjeta de crédito)
export const PaymentIcon = (props) => (
  <Icon {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </Icon>
);

// Icono de Configuración (engranaje)
export const SettingsIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </Icon>
);

// Icono de Categorías (carpeta)
export const CategoryIcon = (props) => (
  <Icon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

// Icono de Cerrar Sesión (salida)
export const LogoutIcon = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

// Icono de Menú hamburguesa (para mobile toggle)
export const MenuToggleIcon = (props) => (
  <Icon {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

// Icono de Expandir/Colapsar (chevrones)
export const CollapseIcon = (props) => (
  <Icon {...props}>
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </Icon>
);

export const ExpandIcon = (props) => (
  <Icon {...props}>
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </Icon>
);

// Icono de Flecha (para grupos colapsables)
export const ChevronRightIcon = (props) => (
  <Icon {...props} size={16}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const ChevronDownIcon = (props) => (
  <Icon {...props} size={16}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

// Icono de Domicilios/Entregas (camión)
export const DeliveryIcon = (props) => (
  <Icon {...props}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Icon>
);

// Icono de Caja Registradora (caja con dinero)
export const CashRegisterIcon = (props) => (
  <Icon {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3h2a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2h2" />
    <path d="M8 3h8v4H8z" />
    <line x1="6" y1="11" x2="6.01" y2="11" />
    <line x1="10" y1="11" x2="10.01" y2="11" />
    <line x1="14" y1="11" x2="14.01" y2="11" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </Icon>
);

export const EditIcon = (props) => (
  <Icon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

export const ToggleIcon = (props) => (
  <Icon {...props}>
    <rect x="1" y="5" width="22" height="14" rx="7" />
    <circle cx="16" cy="12" r="3" />
  </Icon>
);

export const DeleteIcon = (props) => (
  <Icon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);

export default {
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
  MenuToggleIcon,
  CollapseIcon,
  ExpandIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DeliveryIcon,
  CashRegisterIcon,
  EditIcon,
  ToggleIcon,
  DeleteIcon,
};
