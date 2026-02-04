# Frontend - Sistema de Gestión de Restaurante

## Descripción General

Aplicación web desarrollada en React con Vite para la gestión de un restaurante. Interfaz moderna, rápida y responsiva con control de acceso basado en roles.

## Tecnologías Utilizadas

- **React 19.2.0** - Biblioteca de interfaz de usuario
- **Vite 7.2.4** - Build tool y dev server
- **React Router DOM 7.12.0** - Navegación y rutas
- **Axios 1.13.2** - Cliente HTTP para consumir API
- **CSS Vanilla** - Estilos personalizados
- **ESLint** - Linter de código

## Estructura del Proyecto

```
frontend/
├── public/                    # Archivos estáticos
├── src/
│   ├── assets/               # Imágenes y recursos
│   ├── components/           # Componentes reutilizables
│   │   ├── common/          # Componentes genéricos
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Icons.jsx
│   │   │   └── EmployeeForm.jsx
│   │   └── layout/          # Componentes de layout
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── context/              # Context API de React
│   │   └── AuthContext.jsx  # Gestión de autenticación
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── admin/           # Páginas del administrador
│   │   │   ├── Profiles.jsx
│   │   │   ├── Positions.jsx
│   │   │   ├── EmployeesNew.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Menu.jsx
│   │   │   └── PaymentMethods.jsx
│   │   ├── waiter/          # Páginas del mesero
│   │   │   ├── Orders.jsx
│   │   │   └── Tables.jsx
│   │   └── cashier/         # Páginas del cajero
│   │       ├── Tables.jsx
│   │       ├── Clients.jsx
│   │       ├── Payments.jsx
│   │       ├── Deliveries.jsx
│   │       └── CashRegister.jsx
│   ├── services/             # Servicios de API
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── orderService.js
│   │   ├── menuService.js
│   │   ├── tableService.js
│   │   ├── paymentService.js
│   │   ├── cashRegisterService.js
│   │   ├── clientService.js
│   │   ├── employeeService.js
│   │   ├── userService.js
│   │   ├── profileService.js
│   │   ├── positionService.js
│   │   ├── categoryService.js
│   │   ├── paymentMethodService.js
│   │   ├── permissionService.js
│   │   └── deliveryService.js
│   ├── styles/               # Hojas de estilo CSS
│   │   ├── App.css
│   │   ├── Button.css
│   │   ├── Card.css
│   │   ├── Forms.css
│   │   ├── Icons.css
│   │   ├── Input.css
│   │   ├── Layout.css
│   │   ├── Loading.css
│   │   ├── Login.css
│   │   ├── Modal.css
│   │   ├── Navbar.css
│   │   ├── Sidebar.css
│   │   └── Table.css
│   ├── utils/                # Utilidades
│   │   └── constants.js     # Constantes (rutas, roles, API)
│   ├── App.jsx              # Componente raíz
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html               # HTML base
├── vite.config.js           # Configuración de Vite
├── package.json             # Dependencias
└── eslint.config.js         # Configuración ESLint
```

## Arquitectura del Frontend

### Organización por Capas

1. **Páginas (pages/)**: Vistas completas que representan una ruta
2. **Componentes (components/)**: Piezas reutilizables de UI
3. **Servicios (services/)**: Comunicación con la API
4. **Contexto (context/)**: Estado global de la aplicación
5. **Utilidades (utils/)**: Constantes y helpers

### Flujo de Datos

```
Usuario → Página → Servicio → API Backend
                ↓
           Componentes
                ↓
           Context (Estado Global)
```

## Componentes Principales

### Layout y Navegación

#### Layout.jsx
Contenedor principal que incluye:
- Navbar lateral colapsable
- Área de contenido principal
- Gestión de responsive

#### Navbar.jsx
Barra de navegación con:
- Logo del sistema
- Menú según rol del usuario
- Botón de cerrar sesión
- Información del usuario actual

#### ProtectedRoute.jsx
HOC que protege rutas según el rol:
- Verifica autenticación
- Valida permisos por rol
- Redirige a login si no está autenticado

### Componentes Comunes

- **Button**: Botones estilizados con variantes (primary, danger, success)
- **Card**: Contenedor para secciones de contenido
- **Input**: Campos de formulario con validación
- **Modal**: Ventanas emergentes para crear/editar
- **Table**: Tablas con paginación y acciones
- **Loading**: Indicador de carga
- **Icons**: Iconos SVG personalizados

## Manejo de Autenticación

### AuthContext

Proporciona estado global de autenticación:

```javascript
{
  user: { id, username, profile },
  token: "jwt-token",
  isAuthenticated: true/false,
  login(credentials),
  logout()
}
```

### Flujo de Login

1. Usuario ingresa credenciales en `Login.jsx`
2. Se llama a `authService.login()`
3. Backend valida y retorna usuario + token
4. Se guarda en `localStorage` y `AuthContext`
5. Redirige según el rol del usuario

### Protección de Rutas

Cada ruta protegida usa `ProtectedRoute`:

```jsx
<ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
  <Profiles />
</ProtectedRoute>
```

## Navegación y Roles

### Roles Disponibles

Definidos en `utils/constants.js`:

- **ADMIN**: Administrador del sistema
- **WAITER**: Mesero
- **CASHIER**: Cajero

### Rutas por Rol

#### ADMIN
- `/admin/profiles` - Gestión de perfiles
- `/admin/positions` - Cargos de empleados
- `/admin/employees` - Empleados
- `/admin/users` - Usuarios del sistema
- `/admin/categories` - Categorías del menú
- `/admin/menu` - Platillos del menú
- `/admin/payment-methods` - Métodos de pago

#### WAITER
- `/waiter/orders` - Gestión de pedidos
- `/waiter/tables` - Estado de mesas

#### CASHIER
- `/cashier/tables` - Mesas y cuentas
- `/cashier/clients` - Clientes
- `/cashier/payments` - Registro de pagos
- `/cashier/deliveries` - Entregas a domicilio
- `/cashier/cash-register` - Caja registradora

## Comunicación con el Backend

### Configuración Base

En `utils/constants.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```

### Cliente HTTP (apiClient.js)

Instancia de Axios configurada con:
- Base URL del backend
- Timeout de 10 segundos
- Interceptors para agregar token JWT
- Manejo de errores global

### Servicios por Módulo

Cada módulo tiene su servicio dedicado:

#### Ejemplo: orderService.js

```javascript
getAll()          // GET /api/orders
getById(id)       // GET /api/orders/{id}
create(data)      // POST /api/orders
update(id, data)  // PUT /api/orders/{id}
delete(id)        // DELETE /api/orders/{id}
```

### Uso en Componentes

```jsx
import orderService from '../../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      const data = await orderService.getAll();
      setOrders(data);
    };
    fetchOrders();
  }, []);
};
```

## Ejecución Local

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Backend corriendo en `http://localhost:8080`

### Pasos para Ejecutar

1. **Navegar al directorio del frontend:**
```bash
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

4. **Abrir en el navegador:**
- URL: http://localhost:5173
- Vite recargará automáticamente los cambios

### Scripts Disponibles

```json
npm run dev      // Inicia servidor de desarrollo
npm run build    // Genera build de producción
npm run preview  // Previsualiza build de producción
npm run lint     // Ejecuta ESLint
```

## Variables de Entorno

Actualmente la URL del backend está hardcodeada en `constants.js`.

Para usar variables de entorno, crear `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Y actualizar `constants.js`:

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

## Estilos y Diseño

### Sistema de Estilos

- **CSS Vanilla** organizado por componente
- Variables CSS para colores y espaciados
- Diseño responsivo con media queries
- Estilos modulares (un CSS por componente)

### Tema de Colores

Definido en `index.css`:

- **Primary**: Azul (#4A90E2)
- **Success**: Verde (#52C41A)
- **Warning**: Amarillo (#FAAD14)
- **Danger**: Rojo (#F5222D)
- **Dark**: Gris oscuro (#1F1F1F)

### Responsive Design

Breakpoints:
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## Estructura de Páginas

### Patrón Común

Todas las páginas CRUD siguen este patrón:

1. **Estado local**: Lista de items, loading, modal
2. **useEffect**: Carga inicial de datos
3. **Funciones CRUD**:
   - `handleCreate()`
   - `handleUpdate()`
   - `handleDelete()`
4. **Render**: Tabla + Modal de formulario

### Ejemplo: Estructura de Categories.jsx

```jsx
- Estado para categorías
- Estado para modal
- Fetch inicial de categorías
- Función crear categoría
- Función editar categoría
- Función eliminar categoría
- Render tabla con acciones
- Modal de formulario
```

## Características Principales

### Validación de Formularios

- Validación en tiempo real
- Mensajes de error descriptivos
- Estados de loading en botones
- Prevención de envíos duplicados

### Feedback al Usuario

- Mensajes de éxito/error
- Indicadores de carga
- Confirmaciones de eliminación
- Estados visuales de botones

### Gestión de Estado

- **Local**: `useState` para estado de componentes
- **Global**: `AuthContext` para autenticación
- **Async**: `useEffect` para llamadas a API

## Integración Backend-Frontend

### Flujo Completo

1. **Usuario interactúa** con la interfaz
2. **Página llama** al servicio correspondiente
3. **Servicio hace petición HTTP** al backend
4. **Backend procesa** y responde
5. **Frontend actualiza** la UI con los datos

### Ejemplo: Crear un Pedido

```
Orders.jsx (Waiter)
    ↓
orderService.create(orderData)
    ↓
POST http://localhost:8080/api/orders
    ↓
Backend procesa y guarda
    ↓
Respuesta 201 Created
    ↓
Frontend actualiza lista y cierra modal
```

## Características Técnicas

### React Router

- Rutas anidadas
- Navegación programática
- Parámetros de URL
- Redirecciones condicionales

### Manejo de Errores

- Try-catch en servicios
- Mensajes de error amigables
- Fallbacks para datos no encontrados
- Timeout de peticiones

### Performance

- Code splitting con React.lazy (futuro)
- Memoización con React.memo (futuro)
- Optimización de re-renders
- Build optimizado con Vite

## Notas Importantes

- **Puerto**: Vite corre en puerto 5173 por defecto
- **Hot Module Replacement**: Cambios en tiempo real sin recargar
- **ESLint**: Mantiene calidad de código
- **API**: Depende totalmente del backend en puerto 8080

## Solución de Problemas Comunes

### Error de CORS
- Verificar que el backend tenga configurado CORS para `localhost:5173`

### 404 Not Found
- Verificar que el backend esté corriendo
- Revisar URL en `constants.js`

### Login no funciona
- Verificar credenciales en el backend
- Revisar consola del navegador para errores

### Cambios CSS no se reflejan
- Limpiar caché del navegador
- Reiniciar servidor de Vite

---

**Última actualización:** Febrero 2026
