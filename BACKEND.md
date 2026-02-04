# Backend - Sistema de Gestión de Restaurante

## Descripción General

Backend desarrollado en Spring Boot para la gestión integral de un restaurante. Proporciona una API REST para el manejo de pedidos, menú, mesas, clientes, empleados, pagos y caja registradora.

## Tecnologías Utilizadas

- **Java 25**
- **Spring Boot 4.0.2**
- **Spring Data JPA / Hibernate** - Persistencia de datos
- **H2 Database** - Base de datos en memoria
- **Lombok** - Reducción de código boilerplate
- **Maven** - Gestión de dependencias
- **Bean Validation** - Validación de datos

## Arquitectura del Backend

El proyecto sigue una arquitectura modular organizada por dominios. Cada módulo implementa el patrón MVC:

### Estructura de Módulos

```
src/main/java/com/restaurante/restaurantbackend/
├── config/                    # Configuración global
├── modules/                   # Módulos de negocio
│   ├── auth/                 # Autenticación
│   ├── cashregister/         # Caja registradora
│   ├── categories/           # Categorías del menú
│   ├── clients/              # Gestión de clientes
│   ├── deliveries/           # Entregas a domicilio
│   ├── employees/            # Empleados
│   ├── menu/                 # Menú y platillos
│   ├── orders/               # Pedidos
│   ├── paymentmethods/       # Métodos de pago
│   ├── payments/             # Pagos
│   ├── permissions/          # Permisos
│   ├── positions/            # Cargos/Posiciones
│   ├── profiles/             # Perfiles de usuario
│   ├── tables/               # Mesas del restaurante
│   └── users/                # Usuarios del sistema
└── shared/                    # Componentes compartidos
    ├── dto/                  # DTOs comunes
    ├── exception/            # Excepciones personalizadas
    └── util/                 # Utilidades
```

### Capas por Módulo

Cada módulo funcional contiene:

- **Controller**: Endpoints REST expuestos al frontend
- **Service**: Lógica de negocio
- **Repository**: Acceso a datos (Spring Data JPA)
- **Model/Entity**: Entidades JPA
- **DTO**: Objetos de transferencia de datos

### Módulos Principales

#### 1. Auth (Autenticación)
- Login de usuarios
- Validación de credenciales
- Gestión de sesión

#### 2. Orders (Pedidos)
- Creación de pedidos
- Asignación a mesas
- Estados: pendiente, en preparación, servido, cancelado

#### 3. Menu (Menú)
- CRUD de platillos
- Relación con categorías
- Precio y disponibilidad

#### 4. Tables (Mesas)
- Gestión de mesas del restaurante
- Estado: libre, ocupada, reservada
- Asignación de meseros

#### 5. Payments (Pagos)
- Registro de pagos
- Métodos de pago
- Relación con pedidos

#### 6. CashRegister (Caja)
- Apertura y cierre de caja
- Movimientos de efectivo
- Reportes de ventas

#### 7. Employees (Empleados)
- Información de empleados
- Asignación de posiciones
- Relación con usuarios

#### 8. Users (Usuarios)
- CRUD de usuarios del sistema
- Asignación de perfiles (roles)

## Configuración

### Base de Datos (H2)

```properties
spring.datasource.url=jdbc:h2:mem:restaurantdb
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

La base de datos es **en memoria** y se reinicia al detener la aplicación.

**Acceso a la consola H2:**
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:restaurantdb`
- Usuario: `sa`
- Contraseña: (vacía)

### JPA/Hibernate

```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

- `ddl-auto=update`: Las tablas se crean/actualizan automáticamente
- `show-sql=true`: Muestra las consultas SQL en la consola

### Puerto del Servidor

```properties
server.port=8080
```

El backend se ejecuta en **http://localhost:8080**

## Manejo de Seguridad y Roles

El sistema implementa control de acceso basado en roles:

### Roles Disponibles

- **ADMIN**: Acceso total (configuración, usuarios, empleados, menú)
- **WAITER**: Gestión de pedidos y mesas
- **CASHIER**: Pagos, caja, clientes, entregas

### Permisos por Rol

Los permisos se gestionan mediante:
- Módulo `profiles`: Define los roles
- Módulo `permissions`: Asigna permisos específicos
- Módulo `users`: Relaciona usuarios con perfiles

## Endpoints Principales

Todos los endpoints están bajo la ruta base: `/api`

### Auth
- `POST /api/auth/login` - Login de usuario

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/{id}` - Actualizar pedido
- `DELETE /api/orders/{id}` - Eliminar pedido

### Menú
- `GET /api/menu` - Listar platillos
- `POST /api/menu` - Crear platillo
- `PUT /api/menu/{id}` - Actualizar platillo
- `DELETE /api/menu/{id}` - Eliminar platillo

### Mesas
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Crear mesa
- `PUT /api/tables/{id}` - Actualizar mesa

### Pagos
- `GET /api/payments` - Listar pagos
- `POST /api/payments` - Registrar pago

### Caja Registradora
- `POST /api/cash-register/open` - Apertura de caja
- `POST /api/cash-register/close` - Cierre de caja
- `GET /api/cash-register/status` - Estado actual

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Registrar cliente

### Empleados
- `GET /api/employees` - Listar empleados
- `POST /api/employees` - Registrar empleado

## Ejecución Local

### Requisitos Previos

- Java JDK 25 instalado
- Maven instalado (o usar el wrapper incluido)

### Pasos para Ejecutar

1. **Navegar al directorio del backend:**
```bash
cd backend
```

2. **Ejecutar con Maven Wrapper (recomendado):**

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw spring-boot:run
```

3. **O compilar y ejecutar el JAR:**
```bash
mvnw.cmd clean package
java -jar target/restaurant-backend-0.0.1-SNAPSHOT.jar
```

4. **Verificar que esté corriendo:**
- Abrir: http://localhost:8080/h2-console
- Si muestra la consola, el backend está activo

### Inicialización de Datos

El backend incluye un `DataInitializer` que carga datos de prueba al iniciar:
- Perfiles (roles)
- Usuarios de ejemplo
- Posiciones
- Categorías
- Métodos de pago

## Relación con el Frontend

El backend expone una **API REST** que el frontend consume mediante **Axios**.

### CORS

El backend está configurado para permitir peticiones desde:
- `http://localhost:5173` (Vite dev server)

Configuración en `CorsConfig.java`.

### Comunicación

- **Base URL:** `http://localhost:8080/api`
- **Formato:** JSON
- **HTTP Methods:** GET, POST, PUT, DELETE

El frontend realiza peticiones usando servicios organizados por dominio:
- `authService.js`
- `orderService.js`
- `menuService.js`
- `tableService.js`
- etc.

## Manejo de Errores

El backend implementa un `GlobalExceptionHandler` que captura errores y devuelve respuestas consistentes:

```json
{
  "status": 404,
  "message": "Recurso no encontrado",
  "timestamp": "2026-02-04T10:30:00"
}
```

Códigos HTTP comunes:
- **200**: Éxito
- **201**: Recurso creado
- **400**: Datos inválidos
- **404**: No encontrado
- **500**: Error del servidor

## Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/          # Código fuente
│   │   └── resources/      # Configuración
│   └── test/              # Tests unitarios
├── target/                # Archivos compilados
├── pom.xml               # Dependencias Maven
├── mvnw                  # Maven wrapper (Linux/Mac)
└── mvnw.cmd              # Maven wrapper (Windows)
```

## Notas Importantes

- La base de datos es **temporal**: los datos se pierden al reiniciar
- Para producción, cambiar a PostgreSQL o MySQL
- Los logs SQL aparecen en consola durante desarrollo
- El puerto 8080 debe estar libre para iniciar el backend

---

**Última actualización:** Febrero 2026
