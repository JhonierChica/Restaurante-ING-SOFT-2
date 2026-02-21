# SISTEMA DE GESTIÓN DE RESTAURANTE
## Documentación Técnica Académica

**Proyecto:** Restaurant Management System  
**Tecnologías:** Spring Boot 4.0.3 + React 19 + PostgreSQL  
**Arquitectura:** Cliente-Servidor REST con separación modular por dominio  
**Curso:** Ingeniería de Software  

---

## TABLA DE CONTENIDOS

1. [Introducción del Sistema](#1-introducción-del-sistema)
2. [Arquitectura General del Sistema](#2-arquitectura-general-del-sistema)
3. [Arquitectura del Backend (Spring Boot)](#3-arquitectura-del-backend-spring-boot)
4. [Arquitectura del Frontend (React + Vite)](#4-arquitectura-del-frontend-react--vite)
5. [Flujo Completo del Sistema](#5-flujo-completo-del-sistema)
6. [Decisiones Arquitectónicas y Justificación](#6-decisiones-arquitectónicas-y-justificación)
7. [Escalabilidad y Posible Evolución Comercial](#7-escalabilidad-y-posible-evolución-comercial)

---

## 1. INTRODUCCIÓN DEL SISTEMA

### 1.1 Problema que Resuelve el Sistema

Los restaurantes modernos enfrentan desafíos operativos significativos en la gestión simultánea de múltiples procesos de negocio: la toma de pedidos por parte de meseros, el control de inventario de menú, la gestión de mesas, el procesamiento de pagos por cajeros, la administración de empleados y perfiles de usuario, así como el manejo de pedidos a domicilio. La carencia de un sistema integrado genera ineficiencias operativas, errores humanos en la transcripción manual de pedidos, retrasos en la comunicación entre áreas (cocina, sala, caja), dificultades en el seguimiento del estado de las órdenes y limitaciones en la trazabilidad de las transacciones.

Este sistema resuelve estos problemas mediante la **centralización de operaciones** en una plataforma única que permite:

- **Control en tiempo real** del estado de mesas y pedidos
- **Trazabilidad completa** desde la orden hasta el pago
- **Gestión diferenciada por roles** (Administrador, Cajero, Mesero)
- **Reducción de errores** mediante validaciones automáticas
- **Integración de operaciones** entre múltiples módulos de negocio

### 1.2 Contexto de Uso

El sistema está diseñado para un restaurante llamado **"Mr. Panzo"** que maneja operaciones tanto de **establecimiento físico** como de **servicio a domicilio**. El flujo operativo típico incluye:

1. **Mesero:** Toma pedidos de clientes en mesas del establecimiento o registra pedidos a domicilio
2. **Cocina:** Visualiza pedidos pendientes y actualiza su estado (en preparación, listo)
3. **Cajero:** Procesa pagos mediante diversos métodos (efectivo, tarjeta, transferencia)
4. **Domicilios:** Gestiona entregas con información de dirección y estado del delivery
5. **Administrador:** Configura el sistema (menú, empleados, usuarios, perfiles, permisos)

El sistema maneja **dos tipos de pedido fundamentales**:
- **ESTABLECIMIENTO:** Pedidos consumidos en el restaurante (requieren mesa asignada)
- **DOMICILIO:** Pedidos para entrega a domicilio (requieren dirección del cliente y generan un registro automático de delivery)

### 1.3 Objetivos Funcionales

#### Objetivos de Negocio:
- Automatizar el ciclo completo de atención: desde la toma de pedido hasta el pago
- Facilitar el control de inventario y disponibilidad de items del menú
- Proporcionar visibilidad del estado de las mesas en tiempo real
- Permitir gestión diferenciada según el perfil del usuario (RBAC - Role Based Access Control)
- Generar trazabilidad de las transacciones para auditorías

#### Objetivos Técnicos:
- Implementar una arquitectura escalable y mantenible basada en módulos de dominio
- Garantizar separación de responsabilidades (SoC - Separation of Concerns)
- Implementar un modelo de datos normalizado y consistente
- Proporcionar una API RESTful coherente y bien documentada
- Asegurar la integridad referencial mediante validaciones en múltiples capas

### 1.4 Justificación de Tecnologías Elegidas

#### **Backend: Spring Boot 4.0.3**

Spring Boot fue seleccionado como framework backend por las siguientes razones arquitectónicas:

**1. Inyección de Dependencias y IoC (Inversion of Control):**  
Spring Boot proporciona un contenedor IoC que gestiona automáticamente el ciclo de vida de los componentes (controllers, services, repositories). Esto facilita el **principio de inversión de dependencias** y permite escribir código débilmente acoplado y altamente testeable.

**2. Spring Data JPA:**  
Abstrae la capa de persistencia mediante repositories que implementan automáticamente operaciones CRUD y consultas personalizadas. Esto reduce el código boilerplate y permite enfocarse en la lógica de negocio.

**3. Arquitectura en Capas:**  
Spring Boot favorece naturalmente la separación en capas (Controller → Service → Repository), lo que alinea perfectamente con el patrón arquitectónico elegido para este proyecto.

**4. Manejo Declarativo de Transacciones:**  
Mediante la anotación `@Transactional`, Spring gestiona automáticamente el commit/rollback de transacciones, garantizando la consistencia de datos sin código manual de gestión de transacciones.

**5. Ecosistema Maduro:**  
Spring Boot incluye validación automática (Hibernate Validator), serialización JSON (Jackson), manejo de excepciones centralizado, y configuración externa, reduciendo la necesidad de librerías adicionales.

#### **Frontend: React 19 + Vite**

React fue elegido como biblioteca para construir la interfaz de usuario por:

**1. Componentización:**  
React permite construir interfaces mediante componentes reutilizables y autocontenidos. En este proyecto, componentes como `Button`, `Table`, `Modal`, `Card` son reutilizados en múltiples vistas, reduciendo duplicación de código.

**2. Gestión de Estado Declarativa:**  
El uso de hooks (`useState`, `useEffect`, `useContext`) permite manejar el estado de la aplicación de forma predecible y reactiva. El Context API (`AuthContext`) centraliza el estado de autenticación sin necesidad de librerías adicionales de gestión de estado.

**3. Virtual DOM:**  
React optimiza automáticamente las actualizaciones del DOM, lo que mejora el rendimiento cuando se manejan listas grandes de pedidos, mesas o items del menú.

**4. Vite como Build Tool:**  
Vite proporciona arranque instantáneo en desarrollo (HMR - Hot Module Replacement) y builds de producción optimizados. Es significativamente más rápido que webpack en ambientes de desarrollo.

**5. Separación por Roles:**  
La estructura de carpetas del frontend (`pages/admin`, `pages/cashier`, `pages/waiter`) facilita la organización de vistas según el perfil del usuario, alineándose con el modelo RBAC del backend.

#### **Base de Datos: PostgreSQL**

PostgreSQL fue seleccionado como motor de base de datos relacional por:

**1. ACID Compliance:**  
PostgreSQL garantiza Atomicidad, Consistencia, Aislamiento y Durabilidad en las transacciones, crítico para operaciones financieras (pagos) y control de inventario.

**2. Integridad Referencial:**  
Soporta claves foráneas con constraints, triggers y procedimientos almacenados, permitiendo mantener la consistencia relacional entre entidades (Order → Client, Order → Table, Order → User).

**3. Tipos de Datos Avanzados:**  
Aunque en este proyecto se utilizan principalmente tipos básicos (VARCHAR, INTEGER, REAL, TIMESTAMP), PostgreSQL permite escalabilidad futura con tipos JSON, arrays, y tipos personalizados.

**4. Performance:**  
PostgreSQL optimiza consultas complejas mediante índices automáticos en claves primarias/foráneas y soporta query planning avanzado.

**5. Open Source y Amplia Adopción:**  
Es gratuito, tiene una comunidad activa, y es ampliamente utilizado en producción, lo que facilita el soporte y la escalabilidad.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

### 2.1 Tipo de Arquitectura Utilizada

El sistema implementa una **arquitectura modular basada en dominio** con separación cliente-servidor y comunicación mediante protocolo HTTP/REST.

#### **Arquitectura Cliente-Servidor**

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React + Vite)           │
│                                             │
│  - Interfaz de Usuario (UI)                │
│  - Gestión de Estado (Context API)         │
│  - Servicios HTTP (Axios)                  │
│  - Enrutamiento (React Router)             │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP/REST (JSON)
                   │ Authorization: Bearer <token>
                   │
┌──────────────────▼──────────────────────────┐
│         BACKEND (Spring Boot)               │
│                                             │
│  - API REST Controllers                    │
│  - Lógica de Negocio (Services)           │
│  - Acceso a Datos (Repositories)           │
│  - Validación y Seguridad                  │
└──────────────────┬──────────────────────────┘
                   │
                   │ JDBC (PostgreSQL Driver)
                   │
┌──────────────────▼──────────────────────────┐
│       BASE DE DATOS (PostgreSQL)            │
│                                             │
│  - Tablas (pedido, cliente, usuario, etc.) │
│  - Constraints y Relaciones                │
│  - Integridad Referencial                  │
└─────────────────────────────────────────────┘
```

#### **Características Arquitectónicas Fundamentales**

**1. Separación Frontend/Backend:**  
El frontend y backend son aplicaciones completamente independientes que se comunican únicamente a través de una API HTTP/REST. Esto permite:
- Desarrollo paralelo por equipos especializados
- Escalabilidad independiente (el backend puede servir a múltiples frontends: web, móvil, etc.)
- Despliegue separado (frontend en servidor estático, backend en servidor de aplicaciones)

**2. Arquitectura Stateless (Sin Estado en el Servidor):**  
El backend no mantiene sesiones de usuario en memoria. Cada petición HTTP es independiente y debe incluir toda la información necesaria para su procesamiento (token de autenticación). Esto permite:
- Escalabilidad horizontal (múltiples instancias del backend sin compartir sesión)
- Tolerancia a fallos (si un servidor cae, otro puede procesar la siguiente petición)
- Simplicidad en el balanceo de carga

**3. Comunicación REST mediante JSON:**  
El protocolo de comunicación sigue los principios REST:
- **Recursos identificables:** Cada entidad de negocio tiene una URL única (ej: `/api/orders/123`)
- **Métodos HTTP semánticos:** GET (leer), POST (crear), PUT (actualizar), DELETE (eliminar)
- **Representación JSON:** Los datos se transmiten en formato JSON, legible y ligero
- **Stateless:** Cada petición contiene toda la información necesaria (incluido el token de autenticación)

### 2.2 Organización Modular del Backend

El backend se organiza en **módulos de dominio**, donde cada módulo encapsula toda la lógica relacionada con una entidad de negocio específica:

```
backend/src/main/java/com/restaurante/restaurantbackend/
│
├── modules/
│   ├── auth/          (Autenticación y autorización)
│   ├── orders/        (Gestión de pedidos)
│   ├── clients/       (Gestión de clientes)
│   ├── employees/     (Gestión de empleados)
│   ├── users/         (Gestión de usuarios del sistema)
│   ├── profiles/      (Perfiles de usuario)
│   ├── permissions/   (Permisos del sistema)
│   ├── menu/          (Items del menú)
│   ├── categories/    (Categorías del menú)
│   ├── tables/        (Mesas del restaurante)
│   ├── payments/      (Pagos)
│   ├── paymentmethods/(Métodos de pago)
│   ├── deliveries/    (Entregas a domicilio)
│   ├── positions/     (Cargos de empleados)
│   └── cashregister/  (Cierre de caja)
│
├── config/            (Configuraciones globales)
│   ├── CorsConfig.java
│   ├── GlobalExceptionHandler.java
│   └── DataInitializer.java
│
└── shared/            (Componentes compartidos)
    ├── dto/
    ├── exception/
    └── util/
```

Cada módulo sigue la **estructura en capas estándar**:

```
modules/orders/
├── controller/     (Capa de presentación - Endpoints REST)
├── service/        (Capa de lógica de negocio)
├── repository/     (Capa de acceso a datos)
├── model/          (Entidades JPA)
└── dto/            (Objetos de transferencia de datos)
```

#### **Justificación de la Arquitectura Modular**

**1. Alta Cohesión:**  
Toda la lógica relacionada con "pedidos" (Order) está contenida en el módulo `orders`. Esto facilita localizar y modificar funcionalidad relacionada sin afectar otros módulos.

**2. Bajo Acoplamiento:**  
Los módulos se comunican entre sí mediante interfaces bien definidas (services). Por ejemplo, `OrderService` inyecta `ClientRepository`, `TableRepository` y `MenuItemRepository`, pero no conoce los detalles internos de esos módulos.

**3. Escalabilidad del Código:**  
Agregar nuevas funcionalidades (ej: módulo de reservas) implica crear un nuevo módulo sin modificar los existentes, siguiendo el **principio Open/Closed** de SOLID.

**4. Facilidad de Testing:**  
Cada módulo puede testearse independientemente mediante unit tests (testeando services con repositorios mockeados) e integration tests (testeando la integración entre capas).

### 2.3 Organización del Frontend

El frontend se organiza siguiendo el **patrón de separación por roles y funcionalidad**:

```
frontend/src/
├── pages/              (Vistas organizadas por rol)
│   ├── admin/          (Vistas exclusivas de administrador)
│   │   ├── Employees.jsx
│   │   ├── Users.jsx
│   │   ├── Profiles.jsx
│   │   ├── Menu.jsx
│   │   └── ...
│   ├── cashier/        (Vistas de cajero)
│   │   ├── Payments.jsx
│   │   ├── CashRegister.jsx
│   │   └── ...
│   └── waiter/         (Vistas de mesero)
│       ├── Orders.jsx
│       └── Tables.jsx
│
├── components/         (Componentes reutilizables)
│   ├── common/         (Componentes genéricos)
│   │   ├── Button.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   └── ...
│   └── layout/         (Componentes de estructura)
│       ├── Layout.jsx
│       ├── Navbar.jsx
│       └── ProtectedRoute.jsx
│
├── services/           (Servicios de API)
│   ├── apiClient.js    (Cliente HTTP centralizado)
│   ├── authService.js
│   ├── orderService.js
│   ├── clientService.js
│   └── ...
│
├── context/            (Gestión de estado global)
│   └── AuthContext.jsx
│
├── styles/             (Estilos CSS modulares)
│   ├── Button.css
│   ├── Table.css
│   └── ...
│
└── utils/              (Utilidades y constantes)
    └── constants.js
```

#### **Justificación de la Organización del Frontend**

**1. Separación por Roles:**  
Agrupar vistas por perfil (`admin`, `cashier`, `waiter`) facilita:
- Control de acceso mediante rutas protegidas
- Desarrollo paralelo por equipos especializados en cada módulo
- Despliegue selectivo (si fuera necesario crear aplicaciones separadas por rol)

**2. Componentes Reutilizables:**  
Los componentes en `components/common` (`Button`, `Table`, `Modal`) son **stateless** y reciben props, lo que permite reutilizarlos en cualquier vista con diferentes configuraciones.

**3. Servicios Desacoplados:**  
La carpeta `services` centraliza todas las peticiones HTTP. Los componentes **no conocen** los detalles de cómo se hacen las peticiones (URLs, headers, manejo de errores), solo invocan métodos como `orderService.createOrder()`.

**4. Context API para Estado Global:**  
El `AuthContext` almacena el usuario autenticado y el token, haciéndolos accesibles desde cualquier componente sin prop drilling.

---

## 3. ARQUITECTURA DEL BACKEND (SPRING BOOT)

### 3.1 Organización Modular por Capas

Cada módulo del backend sigue una **arquitectura en capas (layered architecture)** que separa responsabilidades según el principio de **separación de concerns (SoC)**:

```
┌─────────────────────────────────────────────┐
│          CAPA DE PRESENTACIÓN               │
│           (Controller Layer)                │
│                                             │
│  - Recibe peticiones HTTP                  │
│  - Valida request body (@Valid)            │
│  - Invoca servicios                        │
│  - Retorna ResponseEntity con DTOs         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       CAPA DE LÓGICA DE NEGOCIO             │
│            (Service Layer)                  │
│                                             │
│  - Implementa reglas de negocio            │
│  - Coordina múltiples repositorios         │
│  - Maneja transacciones (@Transactional)   │
│  - Transforma entidades ↔ DTOs            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        CAPA DE ACCESO A DATOS               │
│          (Repository Layer)                 │
│                                             │
│  - Extiende JpaRepository                  │
│  - Define queries personalizadas           │
│  - Abstrae la persistencia SQL             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         CAPA DE PERSISTENCIA                │
│           (Model / Entity)                  │
│                                             │
│  - Entidades JPA mapeadas a tablas SQL    │
│  - Define relaciones (@ManyToOne, etc.)    │
│  - Incluye validaciones básicas            │
└─────────────────────────────────────────────┘
```

#### **Justificación de Esta Arquitectura en Capas**

**1. Separación de Responsabilidades:**  
Cada capa tiene una responsabilidad única y bien definida:
- **Controller:** Maneja la comunicación HTTP, NO conoce SQL
- **Service:** Implementa lógica de negocio, NO conoce HTTP
- **Repository:** Abstrae SQL, NO conoce lógica de negocio
- **Model:** Define estructura de datos, NO conoce HTTP ni lógica de negocio

**2. Facilita el Testing:**  
- **Unit Tests:** Se puede testear un Service con repositorios mockeados
- **Integration Tests:** Se puede testear un Repository con base de datos H2 en memoria
- **E2E Tests:** Se puede testear un Controller con Spring MockMvc

**3. Reusabilidad:**  
Un mismo Service puede ser invocado desde múltiples Controllers (ej: `OrderService` podría ser usado por un futuro `ReportController` sin duplicar lógica).

**4. Escalabilidad:**  
Si en el futuro se requiere cambiar de PostgreSQL a MySQL, solo se modificaría la configuración de persistencia, sin tocar Controllers ni Services.

### 3.2 Flujo Detallado de una Petición HTTP: Creación de Pedido

Para ilustrar cómo funciona la arquitectura en la práctica, analicemos el flujo completo de creación de un pedido como ejemplo concreto del módulo de Orders.

#### **Contexto del Flujo:**
Un mesero desea crear un pedido para un cliente en una mesa. El pedido incluye múltiples items del menú.

#### **Componentes Involucrados:**

**OrderController (Controller Layer):**
Responsable de recibir la petición HTTP POST y delegarla al service. Valida automáticamente el request body deserializando JSON a `CreateOrderRequest`.

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

**OrderService (Business Logic Layer):**
Implementa la lógica de negocio completa: validaciones de existencia de cliente/usuario/mesa, validación de disponibilidad de items del menú, cálculo del total del pedido, coordinación de múltiples repositorios, y gestión transaccional.

El service ejecuta el siguiente flujo:
1. Valida que el cliente existe (`ClientRepository`)
2. Valida que el usuario (mesero) existe (`UserRepository`)
3. Valida que la mesa existe (`RestaurantTableRepository`)
4. Valida existencia y disponibilidad de items del menú (`MenuItemRepository`)
5. Calcula el total sumando: precio unitario × cantidad de cada item
6. Crea la entidad `Order` con todos los datos validados
7. Persiste la orden (`OrderRepository.save()`)
8. Fuerza el INSERT inmediato (`entityManager.flush()`) para generar el ID
9. Agrega los `OrderItem` a la orden guardada
10. Transforma la entidad a DTO y retorna `OrderResponse`

**OrderRepository (Data Access Layer):**
Abstrae las operaciones SQL extendiendo `JpaRepository<Order, Long>`. Spring Data JPA genera automáticamente las implementaciones:
- `save(order)` → `INSERT INTO pedido`
- `findById(id)` → `SELECT ... WHERE id_pedido = ?`
- `findByClientId(id)` → `SELECT ... WHERE id_cliente = ?`

**Order (Entity/Model):**
Entidad JPA mapeada a la tabla `pedido` con relaciones `@ManyToOne` hacia `Client`, `User`, `RestaurantTable` y `@OneToMany` hacia `OrderItem`.

#### **Gestión Transaccional:**

El método `OrderService.createOrder()` está anotado con `@Transactional`, lo que significa que Spring Boot:
- Inicia una transacción al entrar al método
- Hace commit automático si el método termina exitosamente
- Hace rollback automático si se lanza cualquier excepción

Esto garantiza que si falla algún paso (ej: item no disponible), ninguna modificación se persiste en la base de datos.

### 3.3 Rol de los DTOs (Data Transfer Objects)

El sistema utiliza DTOs tanto para recibir datos (requests) como para enviar respuestas (responses), en lugar de exponer directamente las entidades JPA.

#### **Problema que Resuelven los DTOs:**

**1. Exposición de Datos Sensibles:**
Las entidades JPA pueden contener campos internos que no deben exponerse (versiones de auditoría, timestamps, relaciones completas).

**2. Serialización Circular:**
Si `Order` tiene `@ManyToOne` con `Client`, y `Client` tiene `@OneToMany` con `Order`, Jackson entra en bucle infinito al serializar.

**3. Acoplamiento Frontend-Backend:**
Si se renombra un campo en la entidad, todos los clientes que consumen la API se rompen.

**4. Violación del Principio de Abstracción:**
El frontend no debería conocer detalles internos de JPA (lazy loading, proxies, etc.).

#### **Solución: CreateOrderRequest y OrderResponse**

**CreateOrderRequest (DTO de entrada):**
```java
@Data
public class CreateOrderRequest {
    private Long clientId;
    private Long userId;
    private Long tableId;
    private String orderType;  // ESTABLECIMIENTO o DOMICILIO
    private List<OrderItemRequest> items;
    private String notes;
}
```

**OrderResponse (DTO de salida):**
```java
@Data
public class OrderResponse {
    private Long id;
    private Long clientId;
    private String clientName;  // Desnormalizado
    private String clientPhone;
    private String clientAddress;
    private Long tableId;
    private Integer tableNumber;
    private Order.OrderStatus status;
    private String orderType;
    private Float total;
    private List<OrderItemResponse> items;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Ventajas:**

✅ **Control Total:** Solo se exponen los campos necesarios  
✅ **Desnormalización Estratégica:** Se incluyen `clientName`, `clientPhone` para evitar peticiones adicionales  
✅ **Versionado de API:** Se puede crear `OrderResponseV2` sin afectar la versión original  
✅ **Evita Serialización Circular:** Los DTOs son objetos planos sin relaciones JPA  
✅ **Facilita Documentación:** Contratos claros para generar documentación Swagger

### 3.4 Seguridad: Autenticación y Autorización

#### **3.4.1 Autenticación: "¿Quién eres?"**

El sistema implementa autenticación basada en tokens:

**Flujo de Login:**
1. Usuario envía credenciales (username, password)
2. `AuthService` valida credenciales contra la base de datos
3. Verifica que el usuario esté activo
4. Verifica que tenga un perfil asignado y activo
5. Genera token (actualmente simple, preparado para JWT)
6. Retorna token + información del usuario
7. Frontend almacena token en `localStorage`
8. Peticiones subsecuentes incluyen token en header `Authorization: Bearer <token>`

**AuthService.login() - Validaciones:**
```java
public LoginResponse login(LoginRequest request) {
    // 1. Buscar usuario por username
    User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new RuntimeException("Invalid username or password"));
    
    // 2. Verificar estado activo
    if (!user.getActive()) {
        throw new RuntimeException("User account is deactivated");
    }
    
    // 3. Verificar password (en producción usar BCrypt)
    if (!user.getPassword().equals(request.getPassword())) {
        throw new RuntimeException("Invalid username or password");
    }
    
    // 4. Verificar perfil activo
    if (user.getProfile() == null || !user.getProfile().getActive()) {
        throw new RuntimeException("User has no active profile");
    }
    
    // 5. Generar token
    String token = "Bearer_" + user.getId() + "_" + System.currentTimeMillis();
    
    // 6. Retornar respuesta
    return LoginResponse.builder()
        .token(token)
        .userId(user.getId())
        .username(user.getUsername())
        .fullName(user.getFullName())
        .profile(mapProfileToResponse(user.getProfile()))
        .build();
}
```

**Concepto Stateless:**
El backend NO mantiene sesiones. El token se envía en cada petición, permitiendo:
- Escalabilidad horizontal (múltiples instancias sin estado compartido)
- Tolerancia a fallos (el token sobrevive reinicios del servidor)
- Simplicidad (no hay gestión de sesiones en memoria o Redis)

#### **3.4.2 Autorización: "¿Qué puedes hacer?"**

El sistema implementa **RBAC (Role-Based Access Control)** mediante:

```
User → Profile → Permissions
```

**Modelo de Permisos:**
- **User:** Usuario del sistema (mesero, cajero, administrador)
- **Profile:** Agrupación de permisos (ADMIN, CAJERO, MESERO)
- **Permission:** Permiso granular (CREATE_ORDER, VIEW_PAYMENTS, MANAGE_USERS, etc.)

**Validación de Permisos:**
```java
@Transactional(readOnly = true)
public boolean hasPermission(Long userId, String permissionCode) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (!user.getActive() || user.getProfile() == null) {
        return false;
    }
    
    return user.getProfile().getPermissions().stream()
        .anyMatch(p -> p.getCode().equals(permissionCode) && p.getActive());
}
```

**Protección de Rutas en Frontend:**
```jsx
<Route path="/admin/users" element={
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <Users />
  </ProtectedRoute>
} />
```

### 3.5 Manejo Centralizado de Excepciones

`GlobalExceptionHandler` centraliza el manejo de errores proporcionando respuestas HTTP consistentes:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Bad Request");
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
```

**Ventajas:**

✅ **Consistencia:** Todas las respuestas de error tienen la misma estructura  
✅ **Mantenibilidad:** Formato de errores se modifica en un solo lugar  
✅ **Separación de Concerns:** Controllers no necesitan try-catch extensivos  
✅ **Logging Centralizado:** Se puede agregar logging en un punto único  
✅ **Evita Stack Traces:** Los errores se formatean antes de enviarlos al cliente

### 3.6 Modelo de Datos y Relaciones

El sistema implementa un modelo relacional normalizado con las siguientes entidades principales:

**Entidades Core:**
- **User:** Usuarios del sistema (meseros, cajeros, administradores)
- **Profile:** Perfiles con permisos (ADMIN, CAJERO, MESERO)
- **Permission:** Permisos granulares del sistema
- **Employee:** Empleados del restaurante
- **Position:** Cargos/puestos de trabajo

**Entidades de Negocio:**
- **Order:** Pedidos del restaurante
- **OrderItem:** Items individuales de un pedido (usa clave compuesta)
- **Client:** Clientes del restaurante
- **RestaurantTable:** Mesas del establecimiento
- **MenuItem:** Items del menú
- **Category:** Categorías del menú
- **Payment:** Pagos procesados
- **PaymentMethod:** Métodos de pago disponibles
- **Delivery:** Entregas a domicilio

**Relaciones Importantes:**

**Order (Pedido):**
```java
@ManyToOne Client client          // Muchos pedidos → Un cliente
@ManyToOne User user              // Muchos pedidos → Un usuario (mesero)
@ManyToOne RestaurantTable table  // Muchos pedidos → Una mesa
@OneToMany List<OrderItem> items  // Un pedido → Muchos items
```

**OrderItem (Item de Pedido):**
Usa **clave compuesta** (`OrderItemId`) formada por `orderId + menuItemId`, garantizando que no puede haber items duplicados en el mismo pedido.

**Ventajas del Diseño Relacional:**

✅ **Normalización:** Los datos no se duplican  
✅ **Integridad Referencial:** PostgreSQL garantiza consistencia mediante constraints  
✅ **Consultas Eficientes:** JPA genera JOINs optimizados automáticamente  
✅ **Escalabilidad:** El modelo puede extenderse sin modificar tablas existentes

---

## 4. ARQUITECTURA DEL FRONTEND (REACT + VITE)

### 4.1 Organización del Proyecto

#### **4.1.1 Separación por Roles (pages/)**

Las vistas están organizadas según el perfil del usuario:

- **pages/admin/:** Vistas exclusivas de administrador (Employees, Users, Profiles, Menu, etc.)
- **pages/cashier/:** Vistas de cajero (Payments, CashRegister, Deliveries)
- **pages/waiter/:** Vistas de mesero (Orders, Tables)

**Justificación:**
- Control de acceso mediante rutas protegidas
- Desarrollo paralelo sin conflictos
- Posibilidad de code splitting por rol

#### **4.1.2 Componentes Reutilizables (components/common/)**

Componentes genéricos **stateless** que reciben props:

- `Button.jsx` - Botones con variantes (primary, success, danger, warning)
- `Table.jsx` - Tablas de datos genéricas con columnas configurables
- `Modal.jsx` - Modales reutilizables
- `Input.jsx` - Campos de entrada con validación
- `Card.jsx` - Tarjetas de contenido
- `Loading.jsx` - Indicador de carga
- `ConfirmDialog.jsx` - Diálogos de confirmación

**Ventajas:**

✅ **DRY:** Código escrito una sola vez  
✅ **Consistencia Visual:** Estilo uniforme en toda la aplicación  
✅ **Facilita Cambios Globales:** Modificación centralizada  
✅ **Testabilidad:** Componentes predecibles (input → output)

#### **4.1.3 Servicios Desacoplados (services/)**

Cada módulo de backend tiene un servicio correspondiente que encapsula peticiones HTTP:

- `apiClient.js` - Cliente HTTP centralizado (Axios configurado)
- `authService.js` - Autenticación (login, logout, getCurrentUser)
- `orderService.js` - Gestión de pedidos
- `clientService.js` - Gestión de clientes
- `menuService.js` - Gestión del menú
- `paymentService.js` - Procesamiento de pagos
- etc.

**Patrón de Servicio:**
```javascript
export const orderService = {
  getAllOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  }
};
```

**Ventajas:**

✅ **Separación de Concerns:** Componentes no conocen URLs ni headers  
✅ **Reutilización:** Mismo servicio usado en múltiples componentes  
✅ **Facilita Mocking:** Tests pueden mockear servicios sin tocar componentes  
✅ **Centralización:** Cambios en API solo afectan servicios

#### **4.1.4 Context API para Estado Global (context/)**

`AuthContext` gestiona autenticación globalmente:

```javascript
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (username, password) => {
    const response = await authService.login(username, password);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return { success: true };
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Ventajas:**

✅ **Evita Prop Drilling:** Acceso directo al usuario desde cualquier componente  
✅ **Actualización Reactiva:** Cambios en `user` re-renderizan componentes automáticamente  
✅ **Sin Librerías Externas:** No requiere Redux, MobX, etc.

### 4.2 Flujo de Autenticación en el Frontend

#### **Paso 1: Login**
Usuario ingresa credenciales en `Login.jsx` → `AuthContext.login(username, password)`

#### **Paso 2: AuthService**
Envía petición POST a `/api/auth/login` con credenciales

#### **Paso 3: Almacenamiento**
Guarda token y usuario en `localStorage`

#### **Paso 4: Interceptores HTTP**
`apiClient` intercepta todas las peticiones y agrega automáticamente:
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

#### **Paso 5: Manejo de Sesión Expirada**
Si el backend retorna 401, el interceptor:
```javascript
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

### 4.3 Protección de Rutas

`ProtectedRoute` valida autenticación y autorización:

```jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Acceso Denegado</div>;
  }
  
  return children;
};
```

### 4.4 Consumo de API: Centralización

`apiClient` configura Axios con:

**Request Interceptor:**
```javascript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor:**
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 5. FLUJO COMPLETO DEL SISTEMA

### Caso de Uso: Mesero Crea un Pedido para una Mesa

Este caso ilustra la integración completa de todos los componentes del sistema.

#### **Secuencia del Flujo:**

**1. Usuario Interactúa (Frontend - React)**
- Mesero abre `Orders.jsx`
- Completa formulario: cliente, mesa, items del menú
- Hace clic en "Guardar Pedido"

**2. Frontend Prepara Petición**
```javascript
const orderData = {
  clientId: 5,
  userId: 2,  // Mesero autenticado
  tableId: 3,
  orderType: "ESTABLECIMIENTO",
  items: [
    { menuItemId: 1, quantity: 2, specialInstructions: "Sin cebolla" },
    { menuItemId: 3, quantity: 1, specialInstructions: null }
  ],
  notes: "Cliente prefiere mesa junto a ventana"
};

const response = await orderService.createOrder(orderData);
```

**3. HTTP Request**
```http
POST http://localhost:8080/api/orders
Headers:
  Content-Type: application/json
  Authorization: Bearer_2_1738286400000
Body: { clientId: 5, userId: 2, ... }
```

**4. Backend Recibe (OrderController)**
```java
@PostMapping
public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
    OrderResponse response = orderService.createOrder(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

**5. Service Ejecuta Lógica de Negocio**
```java
public OrderResponse createOrder(CreateOrderRequest request) {
    // Validar cliente existe
    Client client = clientRepository.findById(request.getClientId()).orElseThrow();
    
    // Validar usuario existe
    User user = userRepository.findById(request.getUserId()).orElseThrow();
    
    // Validar mesa existe
    RestaurantTable table = tableRepository.findById(request.getTableId()).orElseThrow();
    
    // Calcular total
    float totalAmount = calcularTotal(request.getItems());
    
    // Crear y guardar orden
    Order order = new Order();
    order.setClient(client);
    order.setUser(user);
    order.setTable(table);
    order.setTotalAmount(totalAmount);
    Order savedOrder = orderRepository.save(order);
    
    // Agregar items
    agregarItems(savedOrder, request.getItems());
    
    return mapToResponse(savedOrder);
}
```

**6. Repository Persiste (Hibernate/JPA → PostgreSQL)**
```sql
INSERT INTO pedido (id_cliente, id_usuario, id_mesa, "valor a pagar", estado, tipo_pedido)
VALUES (5, 2, 3, 25.50, 'P', 'ESTABLECIMIENTO')
RETURNING id_pedido;  -- Retorna ID: 123

INSERT INTO pedido_item (id_pedido, id_producto, cantidad, precio_unitario, instrucciones_especiales)
VALUES (123, 1, 2, 10.00, 'Sin cebolla');

INSERT INTO pedido_item (id_pedido, id_producto, cantidad, precio_unitario, instrucciones_especiales)
VALUES (123, 3, 1, 5.50, NULL);
```

**7. Response (Backend → Frontend)**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 123,
  "clientId": 5,
  "clientName": "Juan Pérez",
  "tableNumber": 5,
  "status": "PENDIENTE",
  "total": 25.50,
  "items": [...]
}
```

**8. Frontend Actualiza UI**
```javascript
setOrders([...orders, response]);
setShowModal(false);
alert('Pedido creado exitosamente');
```

### Puntos Clave:

✅ **Separación de Responsabilidades:** Cada capa cumple su rol específico  
✅ **Validaciones en Múltiples Capas:** Frontend (campos requeridos) + Backend (integridad de datos)  
✅ **Transaccionalidad:** Si falla cualquier paso, rollback automático  
✅ **DTOs:** CreateOrderRequest (entrada) + OrderResponse (salida)  
✅ **Stateless:** Token enviado en cada petición

---

## 6. DECISIONES ARQUITECTÓNICAS Y JUSTIFICACIÓN

### 6.1 ¿Por qué Arquitectura Modular Basada en Dominio?

**Decisión:** Módulos independientes por dominio de negocio (`orders`, `clients`, etc.)

**Justificación:**
- ✅ Alta cohesión (toda la lógica de pedidos en un módulo)
- ✅ Bajo acoplamiento (comunicación mediante interfaces)
- ✅ Escalabilidad (agregar módulos sin modificar existentes)
- ✅ Preparación para microservicios
- ✅ Desarrollo paralelo sin conflictos

### 6.2 ¿Por qué REST como Protocolo de Comunicación?

**Justificación:**
- ✅ Simplicidad e intuitividad
- ✅ Stateless (facilita escalabilidad horizontal)
- ✅ Cacheable (mejora performance)
- ✅ Compatibilidad universal (web, móvil, IoT)
- ✅ Semántica clara (GET, POST, PUT, DELETE)

### 6.3 ¿Por qué JWT (Conceptualmente) para Autenticación?

**Justificación:**
- ✅ Stateless (sin sesiones en servidor)
- ✅ Descentralización (token contiene toda la info)
- ✅ Multi-plataforma (mismo token para web/móvil)
- ✅ Seguridad (firma digital)
- ✅ Expiración automática

### 6.4 ¿Por qué Separación Frontend/Backend?

**Justificación:**
- ✅ Desarrollo paralelo
- ✅ Tecnologías especializadas
- ✅ Reutilización del backend (web, móvil, desktop)
- ✅ Escalabilidad independiente
- ✅ Mejor UX (SPA sin recargas)

### 6.5 ¿Por qué Spring Boot vs Java EE?

**Justificación:**
- ✅ Configuración por convención
- ✅ Servidor embebido
- ✅ Ecosistema maduro
- ✅ Curva de aprendizaje menor
- ✅ Comunidad y documentación amplia

### 6.6 ¿Por qué PostgreSQL vs MySQL/MongoDB?

**Justificación:**
- ✅ ACID compliance (crítico para pagos)
- ✅ Integridad referencial (claves foráneas)
- ✅ Performance en queries complejas
- ✅ Modelo relacional natural para este dominio
- ✅ Open source con amplia adopción

---

## 7. ESCALABILIDAD Y POSIBLE EVOLUCIÓN COMERCIAL

### 7.1 Control Transaccional Avanzado

**Mejora:** Saga Pattern para transacciones distribuidas con compensación automática en integraciones externas (pasarelas de pago, facturación electrónica).

### 7.2 Configuración por Entornos

**Mejora:** Perfiles de Spring Boot (dev, staging, prod) con configuración externalizada mediante variables de entorno.

### 7.3 Manejo Avanzado de Seguridad

**Mejoras:**
- Encriptación con BCrypt
- JWT firmados digitalmente
- Refresh tokens
- Rate limiting
- HTTPS obligatorio

### 7.4 Documentación con Swagger/OpenAPI

**Mejora:** Documentación interactiva automática de la API, facilitando integración de terceros.

### 7.5 Logging y Monitoreo

**Mejoras:**
- SLF4J/Logback estructurado
- ELK Stack (centralización)
- Spring Boot Actuator + Prometheus + Grafana
- Alertas automatizadas

### 7.6 Testing Automatizado

**Mejoras:**
- Unit Tests (JUnit + Mockito)
- Integration Tests (Spring Boot Test)
- E2E Tests (Cypress)
- Cobertura con JaCoCo

### 7.7 Despliegue en la Nube

**Arquitectura Propuesta:**
- Frontend: S3 + CloudFront
- Backend: AWS ECS/Kubernetes
- Base de Datos: RDS Multi-AZ
- Caché: Redis
- Alta disponibilidad y autoescalado

### 7.8 Mejoras de Rendimiento

**Mejoras:**
- Caché con Redis
- Paginación en endpoints
- `@EntityGraph` para evitar N+1
- Optimización de queries

---

## CONCLUSIÓN

Este sistema de gestión de restaurante implementa una **arquitectura moderna, escalable y mantenible** que separa claramente responsabilidades entre frontend y backend, siguiendo principios sólidos de ingeniería de software.

### Logros Arquitectónicos:

✅ **Arquitectura Modular:** Facilita mantenimiento y escalabilidad  
✅ **Separación Frontend/Backend:** Desarrollo paralelo y reutilización  
✅ **Arquitectura en Capas:** Controller → Service → Repository  
✅ **Uso de DTOs:** Evita exposición de entidades  
✅ **Seguridad RBAC:** Control granular de acceso  
✅ **Modelo Relacional:** Integridad y consistencia de datos  
✅ **Stateless:** Escalabilidad horizontal

### Resolución de Problemas de Negocio:

El sistema resuelve efectivamente los problemas operativos de un restaurante real, proporcionando:
- Trazabilidad completa desde pedido hasta pago
- Gestión diferenciada por roles
- Soporte para establecimiento y domicilio
- Visibilidad en tiempo real
- Reducción de errores mediante validaciones

### Justificación Técnica:

Las decisiones arquitectónicas (Spring Boot, React, PostgreSQL, REST, JWT) están justificadas técnicamente y alineadas con mejores prácticas de la industria, mientras que las mejoras propuestas demuestran comprensión de requerimientos productivos reales.

---

**Fecha de Elaboración:** Febrero 2026  
**Versión:** 1.0  
**Elaborado por:** Equipo de Desarrollo Restaurant Management System
