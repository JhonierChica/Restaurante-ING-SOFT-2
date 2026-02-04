export const API_BASE_URL = 'http://localhost:8080/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  ADMIN_PROFILES: '/admin/profiles',
  ADMIN_POSITIONS: '/admin/positions',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_MENU: '/admin/menu',
  ADMIN_PAYMENT_METHODS: '/admin/payment-methods',
  WAITER: '/waiter',
  WAITER_ORDERS: '/waiter/orders',
  WAITER_TABLES: '/waiter/tables',
  CASHIER: '/cashier',
  CASHIER_TABLES: '/cashier/tables',
  CASHIER_CLIENTS: '/cashier/clients',
  CASHIER_PAYMENTS: '/cashier/payments',
  CASHIER_DELIVERIES: '/cashier/deliveries',
  CASHIER_CASH_REGISTER: '/cashier/cash-register',
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  WAITER: 'WAITER',
  CASHIER: 'CASHIER',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const TABLE_STATUS = {
  AVAILABLE: 'DISPONIBLE',
  OCCUPIED: 'OCUPADA',
  RESERVED: 'RESERVADA',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const DEPARTMENTS = {
  COCINA: 'Cocina',
  SALON: 'Salón',
  ADMINISTRACION: 'Administración',
  CAJA: 'Caja',
};

export const PERMISSION_MODULES = {
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  MENU: 'menu',
  CATEGORIES: 'categories',
  USERS: 'users',
  EMPLOYEES: 'employees',
  PROFILES: 'profiles',
  POSITIONS: 'positions',
  CLIENTS: 'clients',
  TABLES: 'tables',
  REPORTS: 'reports',
  PAYMENT_METHODS: 'payment_methods',
  DELIVERIES: 'deliveries',
  CASH_REGISTER: 'cash_register',
};

export const PAYMENT_METHOD_TYPES = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  OTRO: 'OTRO',
};

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};
