# AGENTS.md — Restaurante Mr. Panzo

## Descripción del Proyecto

Sistema de Gestión de Restaurante ("Mr. Panzo") para un curso de Ingeniería de Software.
Aplicación full-stack con arquitectura cliente-servidor REST que permite administrar pedidos, mesas, clientes, empleados, pagos, menú y entregas a domicilio.
Tres roles de usuario: **Administrador**, **Mesero (Waiter)** y **Cajero (Cashier)** con RBAC basado en perfiles y permisos.

---

## Stack Tecnológico

| Capa        | Tecnología                          | Versión     |
|-------------|-------------------------------------|-------------|
| Backend     | Spring Boot (Java)                  | 4.0.3       |
| Java        | JDK                                 | 25          |
| ORM         | Spring Data JPA / Hibernate         | —           |
| Base de Datos | PostgreSQL                        | —           |
| Frontend    | React + Vite                        | React 19, Vite 7 |
| HTTP Client | Axios                               | 1.13+       |
| Routing     | React Router DOM                    | 7.12+       |
| Build Tool  | Maven Wrapper (backend), npm (frontend) | —       |
| Linting     | ESLint (frontend)                   | 9+          |
| Utilidades  | Lombok (backend)                    | —           |

---

## Estructura del Proyecto

```
/                           ← Raíz del monorepo
├── AGENTS.md
├── DOCUMENTACION_PROYECTO.md
├── package.json            ← Scripts raíz para ejecutar backend + frontend
├── start-backend.bat
├── start-frontend.bat
├── backend/                ← Spring Boot (Maven)
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   ├── sql/                ← Scripts SQL manuales (DDL + datos iniciales)
│   └── src/
│       ├── main/java/com/restaurante/restaurantbackend/
│       │   ├── RestaurantBackendApplication.java
│       │   ├── config/           ← CorsConfig, GlobalExceptionHandler, DataInitializer
│       │   └── modules/          ← Módulos de dominio (ver abajo)
│       └── main/resources/
│           └── application.properties
└── frontend/               ← React + Vite
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx           ← Enrutamiento principal
        ├── main.jsx          ← Punto de entrada
        ├── components/       ← Componentes reutilizables (common/ + layout/)
        ├── context/          ← AuthContext (estado de autenticación global)
        ├── pages/            ← Vistas organizadas por rol (admin/, cashier/, waiter/)
        ├── services/         ← Clientes de API (uno por módulo)
        ├── styles/           ← CSS modular (un archivo por componente)
        └── utils/            ← Constantes y utilidades
```

---

## Arquitectura del Backend

### Organización Modular por Dominio

Cada módulo vive en `backend/src/main/java/com/restaurante/restaurantbackend/modules/` y sigue la estructura de capas:

```
modules/<nombre>/
├── controller/    ← @RestController — endpoints REST
├── service/       ← @Service — lógica de negocio y mapeo DTO↔Entidad
├── repository/    ← JpaRepository — acceso a datos
├── model/         ← @Entity — entidad JPA / Hibernate
└── dto/           ← Create*Request, Update*Request, *Response
```

### Módulos de Dominio

| Módulo            | Ruta API base           | Descripción                              |
|-------------------|-------------------------|------------------------------------------|
| `auth`            | `/api/auth`             | Login, verificación de permisos/perfil   |
| `orders`          | `/api/orders`           | Pedidos y detalles de pedido             |
| `clients`         | `/api/clients`          | Clientes del restaurante                 |
| `employees`       | `/api/employees`        | Empleados (datos personales/laborales)   |
| `users`           | `/api/users`            | Usuarios del sistema (credenciales)      |
| `profiles`        | `/api/profiles`         | Roles/perfiles con permisos              |
| `permissions`     | `/api/permissions`      | Permisos granulares                      |
| `menu`            | `/api/menu`             | Ítems del menú                           |
| `categories`      | `/api/categories`       | Categorías del menú                      |
| `tables`          | `/api/tables`           | Mesas del restaurante                    |
| `payments`        | `/api/payments`         | Registros de pagos                       |
| `paymentmethods`  | `/api/payment-methods`  | Métodos de pago (efectivo, tarjeta, etc) |
| `deliveries`      | `/api/deliveries`       | Entregas a domicilio                     |
| `positions`       | `/api/positions`        | Cargos laborales                         |
| `cashregister`    | `/api/cash-register`    | Cierres de caja                          |

### Patrones y Convenciones del Backend

- **DTOs separados** para request/response (`Create*Request`, `Update*Request`, `*Response`).
- **Mapeo manual** entidad ↔ DTO en los services (sin MapStruct ni ModelMapper).
- **Inyección por constructor** en todos los services y controllers (sin `@Autowired` en campos).
- **Estados con código de 1 carácter** en campo `estado` (`"A"` = Activo, `"I"` = Inactivo, etc.).
- **Nombres de tablas/columnas en español** en la BD, código Java en inglés.
- **DDL gestionado externamente** (`spring.jpa.hibernate.ddl-auto=none`); esquema definido en `backend/sql/`.
- **Tipos Float** para valores monetarios (la BD usa `REAL`).
- **Manejo global de excepciones** en `GlobalExceptionHandler` con respuestas JSON consistentes.
- **CORS abierto** en `CorsConfig` (permite todos los orígenes, todos los métodos).
- **Sin Spring Security**: autenticación basada en token simple (`Bearer_userId_timestamp`), contraseñas en texto plano.
- Los pedidos de tipo **DOMICILIO** crean automáticamente un registro `Delivery`.
- La entidad `OrderItem` usa una **clave compuesta** `(id_pedido, id_menu)`.

---

## Arquitectura del Frontend

### Organización

```
src/
├── pages/              ← Vistas separadas por rol
│   ├── admin/          ← Profiles, Positions, Employees, Users, Categories, Menu, PaymentMethods
│   ├── cashier/        ← Tables, Clients, Payments, Deliveries, CashRegister
│   └── waiter/         ← Orders, Tables
├── components/
│   ├── common/         ← Button, Card, ConfirmDialog, EmployeeForm, Icons, Input, Loading, Modal, Table
│   └── layout/         ← Layout, Navbar, ProtectedRoute
├── services/           ← Un archivo por módulo (apiClient.js es el cliente HTTP centralizado)
├── context/            ← AuthContext.jsx (Context API para auth)
├── styles/             ← Un CSS por componente
└── utils/              ← constants.js (rutas, roles, estados)
```

### Convenciones del Frontend

- **React funcional** con hooks (`useState`, `useEffect`, `useContext`).
- **Context API** para autenticación global (sin Redux ni Zustand).
- **Axios** como cliente HTTP con interceptores para token y manejo de 401.
- **React Router DOM v7** para enrutamiento con rutas protegidas por rol (`ProtectedRoute`).
- **CSS modular** — un archivo CSS por componente en `styles/`.
- **Componentes reutilizables** (`Button`, `Table`, `Modal`, `Input`, `Card`) usados en todas las vistas.
- Las constantes de rutas, roles y estados están centralizadas en `utils/constants.js`.
- El `apiClient.js` configura `baseURL` a `http://localhost:8080/api`.

---

## Base de Datos

- **Motor:** PostgreSQL
- **Nombre BD:** `mr_panzo_db`
- **Puerto:** 5432 (por defecto)
- **Usuario BD:** `postgres`
- **DDL:** Gestionado manualmente en `backend/sql/dbActual.sql`
- **Datos iniciales:** `backend/sql/datos_iniciales.sql` (solo usuario admin)
- **Credenciales iniciales:** usuario `admin` / contraseña `admin123`
- **Convención de nombres:** tablas y columnas en español (`pedido`, `empleado`, `categoría`, `menú`, etc.)

### Relaciones Principales

```
Position → Employee → User → Profile → Permissions (ManyToMany)
Category → MenuItem
Client, User, RestaurantTable → Order → OrderItem → MenuItem
Order, PaymentMethod → Payment
Order → Delivery (para pedidos tipo DOMICILIO)
```

---

## Cómo Ejecutar el Proyecto

### Prerrequisitos

- Java 25+ (JDK)
- Node.js 18+ y npm
- PostgreSQL instalado y corriendo en `localhost:5432`
- Base de datos `mr_panzo_db` creada

### Setup de la Base de Datos

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE mr_panzo_db;"

# 2. Ejecutar el esquema
psql -U postgres -d mr_panzo_db -f backend/sql/dbActual.sql

# 3. Insertar datos iniciales
psql -U postgres -d mr_panzo_db -f backend/sql/datos_iniciales.sql
```

### Ejecutar Backend y Frontend

```bash
# Desde la raíz del proyecto:
npm run dev          # Arranca backend (puerto 8080) y frontend (Vite, puerto 5173)

# O por separado:
npm run backend      # Solo backend (Spring Boot en puerto 8080)
npm run frontend     # Solo frontend (Vite en puerto 5173)
```

También se pueden usar los archivos `.bat`:
- `start-backend.bat`
- `start-frontend.bat`

### Ejecutar manualmente

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

---

## Endpoints de la API

Todos los endpoints usan el prefijo `/api`. Formato de respuestas JSON.

**Autenticación:**
- `POST /api/auth/login` — Login (devuelve token y datos de usuario)
- `GET /api/auth/verify` — Verificar token
- `GET /api/auth/profile/{userId}` — Obtener perfil del usuario
- `GET /api/auth/permissions/{userId}` — Obtener permisos del usuario

**CRUD estándar** (GET todos, GET por id, POST crear, PUT actualizar, DELETE eliminar):
`/api/orders`, `/api/clients`, `/api/employees`, `/api/users`, `/api/profiles`, `/api/permissions`, `/api/menu`, `/api/categories`, `/api/tables`, `/api/payments`, `/api/payment-methods`, `/api/deliveries`, `/api/positions`, `/api/cash-register`

**Endpoints especiales:**
- `GET /api/orders?status=X` — Filtrar pedidos por estado
- `PATCH /api/employees/{id}/deactivate` — Desactivar empleado
- `GET /api/employees/active` — Solo empleados activos

---

## Tests

- **Backend:** Solo test básico de contexto Spring (`RestaurantBackendApplicationTests.java`). No hay tests unitarios ni de integración para los módulos.
- **Frontend:** Sin tests configurados.
- Para ejecutar los tests del backend: `cd backend && ./mvnw test`
- Para lint del frontend: `cd frontend && npm run lint`

---

## Guías para Agentes de IA

### Al Modificar el Backend

1. Respetar la estructura modular: cada nuevo módulo va en `modules/<nombre>/` con las subcarpetas `controller/`, `service/`, `repository/`, `model/`, `dto/`.
2. Usar DTOs separados para request y response — nunca exponer entidades JPA directamente.
3. Inyección por constructor, no usar `@Autowired` en campos.
4. Los estados usan códigos de 1 carácter (no booleanos ni enums de BD).
5. El mapeo DTO ↔ Entidad se hace manualmente en el service.
6. Las tablas y columnas de la BD tienen nombres en español; considerar las comillas especiales para columnas con caracteres especiales (ej: `"menú"`, `"detallePedido"`, `"contraseña"`).
7. No cambiar `ddl-auto` a valores distintos de `none` — los cambios de esquema van en `backend/sql/`.
8. El `GlobalExceptionHandler` ya captura `RuntimeException`, `IllegalArgumentException` y `Exception`. Usar `throw new RuntimeException("mensaje")` o excepciones custom si se necesita.
9. Los endpoints siguen el patrón REST estándar: `GET /api/{recurso}`, `POST /api/{recurso}`, `PUT /api/{recurso}/{id}`, `DELETE /api/{recurso}/{id}`.

### Al Modificar el Frontend

1. Crear un archivo de servicio en `services/` para cada nuevo módulo (importando `apiClient`).
2. Las páginas van en `pages/admin/`, `pages/cashier/` o `pages/waiter/` según el rol.
3. Usar los componentes reutilizables existentes (`Button`, `Table`, `Modal`, `Input`, `Card`, `ConfirmDialog`, `Loading`).
4. Agregar nuevas rutas en `App.jsx` envueltas con `<ProtectedRoute requiredRole={...}>`.
5. Añadir constantes de rutas en `utils/constants.js`.
6. Un archivo CSS por componente/página en `styles/`.
7. Usar hooks de React (no class components).
8. El estado de autenticación se gestiona con `AuthContext` — usar `useAuth()` para acceder.
9. `apiClient.js` ya maneja el token y redirección por 401; no duplicar esa lógica.

### Al Modificar la Base de Datos

1. Los cambios de esquema van en un nuevo script SQL o se actualizan en `backend/sql/dbActual.sql`.
2. Actualizar las secuencias si se insertan registros con IDs manuales (`SELECT setval(...)`).
3. Respetar la convención de nombres en español para tablas y columnas.
4. Usar tipo `REAL` para valores monetarios (consistente con el modelo actual).

### Reglas Generales

- No introducir Spring Security ni JWT a menos que se solicite explícitamente.
- No agregar librerías de gestión de estado al frontend (Redux, Zustand, etc.) a menos que se solicite.
- Los puertos por defecto son: backend `8080`, frontend `5173`, PostgreSQL `5432`.
- La documentación técnica detallada está en `DOCUMENTACION_PROYECTO.md`.
- Los scripts de BD están en `backend/sql/`.
