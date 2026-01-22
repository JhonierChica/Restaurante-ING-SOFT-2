# API de Usuarios y Autenticación - Sistema de Restaurante

## 📋 Módulos Implementados

### 1. **Users Module** - Gestión de Usuarios
### 2. **Auth Module** - Autenticación y Validación de Roles

---

## 🔐 Roles Disponibles

```java
- ADMIN      // Administrador del sistema
- MANAGER    // Gerente del restaurante
- WAITER     // Mesero
- CHEF       // Chef/Cocinero
- CASHIER    // Cajero
```

---

## 📡 Endpoints - Users API

### Base URL: `/api/users`

#### 1. Crear Usuario
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "WAITER"
}
```

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "username": "newuser",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "WAITER",
  "active": true,
  "createdAt": "2026-01-22T10:30:00",
  "updatedAt": "2026-01-22T10:30:00"
}
```

#### 2. Listar Todos los Usuarios
```http
GET /api/users
```

**Listar solo usuarios activos:**
```http
GET /api/users?activeOnly=true
```

#### 3. Obtener Usuario por ID
```http
GET /api/users/{id}
```

#### 4. Obtener Usuario por Username
```http
GET /api/users/username/{username}
```

#### 5. Obtener Usuarios por Rol
```http
GET /api/users/role/{role}

Ejemplos:
GET /api/users/role/WAITER
GET /api/users/role/ADMIN
```

#### 6. Actualizar Usuario
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "fullName": "Jane Doe Updated",
  "role": "MANAGER",
  "active": true
}
```

#### 7. Eliminar Usuario
```http
DELETE /api/users/{id}
```

#### 8. Desactivar Usuario (Soft Delete)
```http
PATCH /api/users/{id}/deactivate
```

---

## 🔑 Endpoints - Auth API

### Base URL: `/api/auth`

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@restaurant.com",
  "fullName": "Administrator",
  "role": "ADMIN",
  "message": "Login successful"
}
```

**Respuesta error (401 Unauthorized):**
```json
{
  "userId": null,
  "username": null,
  "email": null,
  "fullName": null,
  "role": null,
  "message": "Invalid username or password"
}
```

#### 2. Validar Rol Específico
```http
GET /api/auth/validate-role/{userId}?role=ADMIN

Ejemplo:
GET /api/auth/validate-role/1?role=ADMIN
```

**Respuesta:** `true` o `false`

#### 3. Verificar si Usuario Tiene Rol(es)
```http
GET /api/auth/has-role/{userId}?roles=ADMIN,MANAGER

Ejemplo:
GET /api/auth/has-role/1?roles=ADMIN&roles=MANAGER
```

**Respuesta:** `true` o `false`

#### 4. Verificar si es Administrador
```http
GET /api/auth/is-admin/{userId}

Ejemplo:
GET /api/auth/is-admin/1
```

**Respuesta:** `true` o `false`

#### 5. Obtener Rol del Usuario
```http
GET /api/auth/get-role/{userId}

Ejemplo:
GET /api/auth/get-role/1
```

**Respuesta:** `"ADMIN"`, `"WAITER"`, etc.

---

## 👥 Usuarios de Prueba (Creados Automáticamente)

| Username | Password    | Rol     | Email                     |
|----------|-------------|---------|---------------------------|
| admin    | admin123    | ADMIN   | admin@restaurant.com      |
| manager  | manager123  | MANAGER | manager@restaurant.com    |
| waiter   | waiter123   | WAITER  | waiter@restaurant.com     |
| chef     | chef123     | CHEF    | chef@restaurant.com       |
| cashier  | cashier123  | CASHIER | cashier@restaurant.com    |

---

## 🚀 Cómo Ejecutar

1. **Compilar el proyecto:**
```bash
./mvnw clean compile
```

2. **Ejecutar la aplicación:**
```bash
./mvnw spring-boot:run
```

3. **Acceder a la API:**
```
http://localhost:8080/api/users
http://localhost:8080/api/auth/login
```

4. **Acceder a H2 Console:**
```
http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:restaurantdb
Username: sa
Password: (dejar vacío)
```

---

## 🧪 Pruebas con cURL

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Crear Usuario:
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"test123",
    "fullName":"Test User",
    "role":"WAITER"
  }'
```

### Listar Usuarios:
```bash
curl http://localhost:8080/api/users
```

### Verificar Rol:
```bash
curl http://localhost:8080/api/auth/is-admin/1
```

---

## 📝 Notas Importantes

1. **Seguridad Básica**: Actualmente las contraseñas se almacenan en texto plano. Para producción, implementar BCrypt.
2. **Sin JWT**: Esta es una implementación simple. Para producción, considerar JWT con Spring Security.
3. **Base de Datos**: Usando H2 en memoria. Los datos se pierden al reiniciar la aplicación.
4. **CORS**: Actualmente permite todos los orígenes (`*`). Restringir en producción.

---

## ✅ Funcionalidades Implementadas

- ✅ Entidad User con roles
- ✅ UserRepository con queries personalizadas
- ✅ UserService con lógica de negocio completa
- ✅ UserController con CRUD completo
- ✅ AuthService con login y validación de roles
- ✅ AuthController con endpoints de autenticación
- ✅ Distinción de roles (ADMIN, MANAGER, WAITER, CHEF, CASHIER)
- ✅ Datos iniciales de prueba
- ✅ Validaciones de usuario único
- ✅ Soft delete (desactivar usuarios)

---

## 🔜 Próximos Pasos Recomendados

1. Implementar encriptación de contraseñas con BCrypt
2. Agregar Spring Security
3. Implementar JWT para sesiones
4. Agregar validaciones con Bean Validation
5. Implementar manejo de excepciones global
6. Agregar tests unitarios e integración
7. Documentar con Swagger/OpenAPI
