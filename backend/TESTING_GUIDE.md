# 🧪 Pruebas de la API - Sistema de Restaurante

## ✅ Verificar que el servidor esté corriendo

```powershell
curl http://localhost:8080/api/users
```

---

## 🔐 Pruebas de Autenticación (Auth Module)

### 1. Login exitoso con usuario Admin
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

### 2. Login con usuario Manager
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"manager\",\"password\":\"manager123\"}'
```

### 3. Login con usuario Waiter
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"waiter\",\"password\":\"waiter123\"}'
```

### 4. Login fallido (contraseña incorrecta)
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"wrong\"}'
```

### 5. Verificar si un usuario es Admin (ID 1)
```powershell
curl http://localhost:8080/api/auth/is-admin/1
```

### 6. Obtener el rol de un usuario
```powershell
curl http://localhost:8080/api/auth/get-role/1
```

### 7. Validar rol específico
```powershell
curl "http://localhost:8080/api/auth/validate-role/1?role=ADMIN"
```

---

## 👥 Pruebas de Usuarios (Users Module)

### 1. Listar todos los usuarios
```powershell
curl http://localhost:8080/api/users
```

### 2. Listar solo usuarios activos
```powershell
curl "http://localhost:8080/api/users?activeOnly=true"
```

### 3. Obtener usuario por ID
```powershell
curl http://localhost:8080/api/users/1
```

### 4. Obtener usuario por username
```powershell
curl http://localhost:8080/api/users/username/admin
```

### 5. Listar usuarios por rol (WAITER)
```powershell
curl http://localhost:8080/api/users/role/WAITER
```

### 6. Crear nuevo usuario
```powershell
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"newuser\",\"email\":\"newuser@restaurant.com\",\"password\":\"pass123\",\"fullName\":\"New User\",\"role\":\"WAITER\"}'
```

### 7. Actualizar usuario
```powershell
curl -X PUT http://localhost:8080/api/users/6 `
  -H "Content-Type: application/json" `
  -d '{\"fullName\":\"Updated User Name\",\"email\":\"updated@restaurant.com\"}'
```

### 8. Desactivar usuario (Soft Delete)
```powershell
curl -X PATCH http://localhost:8080/api/users/6/deactivate
```

### 9. Eliminar usuario permanentemente
```powershell
curl -X DELETE http://localhost:8080/api/users/6
```

---

## 🧪 Flujo de Prueba Completo

### Paso 1: Listar todos los usuarios
```powershell
curl http://localhost:8080/api/users
```

### Paso 2: Login como admin
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

### Paso 3: Verificar que es admin (usar el userId de la respuesta, debería ser 1)
```powershell
curl http://localhost:8080/api/auth/is-admin/1
```

### Paso 4: Crear un nuevo mesero
```powershell
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"juan_mesero\",\"email\":\"juan@restaurant.com\",\"password\":\"juan123\",\"fullName\":\"Juan Pérez\",\"role\":\"WAITER\"}'
```

### Paso 5: Login con el nuevo usuario
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"juan_mesero\",\"password\":\"juan123\"}'
```

### Paso 6: Listar todos los meseros
```powershell
curl http://localhost:8080/api/users/role/WAITER
```

---

## 📊 Prueba de Roles y Permisos

### Listar usuarios por cada rol:

```powershell
# Administradores
curl http://localhost:8080/api/users/role/ADMIN

# Gerentes
curl http://localhost:8080/api/users/role/MANAGER

# Meseros
curl http://localhost:8080/api/users/role/WAITER

# Chefs
curl http://localhost:8080/api/users/role/CHEF

# Cajeros
curl http://localhost:8080/api/users/role/CASHIER
```

---

## 🎯 Probar Validaciones

### 1. Intentar crear usuario con username duplicado
```powershell
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"email\":\"otro@email.com\",\"password\":\"pass123\",\"fullName\":\"Test\",\"role\":\"WAITER\"}'
```
**Resultado esperado:** Error 400 - "Username already exists"

### 2. Intentar crear usuario con email duplicado
```powershell
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"unique123\",\"email\":\"admin@restaurant.com\",\"password\":\"pass123\",\"fullName\":\"Test\",\"role\":\"WAITER\"}'
```
**Resultado esperado:** Error 400 - "Email already exists"

### 3. Login con usuario desactivado

Primero desactivamos un usuario:
```powershell
curl -X PATCH http://localhost:8080/api/users/3/deactivate
```

Luego intentamos hacer login:
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"waiter\",\"password\":\"waiter123\"}'
```
**Resultado esperado:** Error 401 - "User account is deactivated"

---

## 🌐 Acceder a la Consola H2

Abrir en el navegador:
```
http://localhost:8080/h2-console
```

**Configuración de conexión:**
- JDBC URL: `jdbc:h2:mem:restaurantdb`
- Username: `sa`
- Password: (dejar vacío)

**Queries SQL útiles:**

```sql
-- Ver todos los usuarios
SELECT * FROM USERS;

-- Ver usuarios por rol
SELECT * FROM USERS WHERE ROLE = 'ADMIN';

-- Contar usuarios por rol
SELECT ROLE, COUNT(*) FROM USERS GROUP BY ROLE;

-- Ver usuarios activos
SELECT * FROM USERS WHERE ACTIVE = TRUE;
```

---

## 📝 Notas

- Todos los ejemplos usan PowerShell (Windows)
- Para bash/Linux, remover los backticks (`) y usar backslash (\) para continuar líneas
- Las respuestas JSON pueden ser formateadas usando herramientas como `jq` o Postman
- El servidor debe estar corriendo en `http://localhost:8080`
