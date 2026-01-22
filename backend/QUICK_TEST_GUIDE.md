# 🧪 Guía de Pruebas Rápidas - Configuración Administrativa

## ✅ Estado del Sistema
```
✅ Servidor: http://localhost:8080
✅ H2 Console: http://localhost:8080/h2-console
✅ 5 Empleados creados
✅ 5 Categorías creadas
✅ 10 Ítems del menú creados
```

---

## 🚀 Pruebas Básicas (PowerShell)

### 1️⃣ Verificar Empleados
```powershell
# Ver todos los empleados
curl http://localhost:8080/api/employees

# Ver solo empleados activos
curl "http://localhost:8080/api/employees?activeOnly=true"

# Ver empleados del departamento de Cocina
curl http://localhost:8080/api/employees/department/Cocina
```

### 2️⃣ Verificar Categorías
```powershell
# Ver todas las categorías
curl http://localhost:8080/api/categories

# Ver categorías activas ordenadas
curl "http://localhost:8080/api/categories?activeOnly=true&ordered=true"

# Ver categoría específica
curl http://localhost:8080/api/categories/1
```

### 3️⃣ Verificar Menú
```powershell
# Ver todo el menú
curl http://localhost:8080/api/menu

# Ver solo ítems disponibles
curl "http://localhost:8080/api/menu?availableOnly=true"

# Ver menú de una categoría
curl "http://localhost:8080/api/menu/category/1?availableOnly=true"

# Ver platos vegetarianos
curl http://localhost:8080/api/menu/vegetarian

# Ver platos veganos
curl http://localhost:8080/api/menu/vegan
```

---

## 🔨 Operaciones CRUD

### Crear Nuevo Empleado
```powershell
# Paso 1: Crear usuario
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"mesero2\",\"email\":\"mesero2@test.com\",\"password\":\"pass123\",\"fullName\":\"María López\",\"role\":\"WAITER\"}'

# Paso 2: Crear empleado (usar userId de respuesta anterior)
curl -X POST http://localhost:8080/api/employees `
  -H "Content-Type: application/json" `
  -d '{\"userId\":6,\"documentNumber\":\"98765432\",\"phone\":\"+57 301 234 5678\",\"address\":\"Cra 10 #20-30\",\"hireDate\":\"2024-01-22\",\"salary\":1500000,\"position\":\"Mesera\",\"department\":\"Servicio\"}'
```

### Crear Nueva Categoría
```powershell
curl -X POST http://localhost:8080/api/categories `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Sopas\",\"description\":\"Deliciosas sopas calientes\",\"displayOrder\":6}'
```

### Crear Ítem del Menú
```powershell
curl -X POST http://localhost:8080/api/menu `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Sopa de Tomate\",\"description\":\"Crema de tomate con albahaca\",\"price\":14000,\"categoryId\":6,\"preparationTime\":12,\"isVegetarian\":true,\"calories\":180}'
```

### Actualizar Precio de un Ítem
```powershell
curl -X PUT http://localhost:8080/api/menu/3 `
  -H "Content-Type: application/json" `
  -d '{\"price\":38000}'
```

### Cambiar Disponibilidad de un Ítem
```powershell
curl -X PATCH http://localhost:8080/api/menu/1/toggle-availability
```

---

## 📊 Consultas Avanzadas

### Ver Empleados por Posición
```powershell
curl http://localhost:8080/api/employees/position/Mesero%20Senior
```

### Ver Menú Completo con Detalles
```powershell
# Ver cada categoría con sus ítems
curl "http://localhost:8080/api/menu/category/1?availableOnly=true"  # Entradas
curl "http://localhost:8080/api/menu/category/2?availableOnly=true"  # Platos Principales
curl "http://localhost:8080/api/menu/category/3?availableOnly=true"  # Postres
curl "http://localhost:8080/api/menu/category/4?availableOnly=true"  # Bebidas
curl "http://localhost:8080/api/menu/category/5?availableOnly=true"  # Ensaladas
```

### Filtros Nutricionales
```powershell
# Solo sin gluten
curl http://localhost:8080/api/menu/gluten-free

# Opciones veganas
curl http://localhost:8080/api/menu/vegan

# Opciones vegetarianas
curl http://localhost:8080/api/menu/vegetarian
```

---

## 🗄️ Consultas SQL Directas (H2 Console)

Abrir: http://localhost:8080/h2-console

**Conexión:**
- JDBC URL: `jdbc:h2:mem:restaurantdb`
- Username: `sa`
- Password: (vacío)

**Queries útiles:**

```sql
-- Ver todos los empleados con sus usuarios
SELECT 
    e.id, 
    u.username, 
    u.full_name, 
    e.position, 
    e.department, 
    e.salary 
FROM employees e 
JOIN users u ON e.user_id = u.id;

-- Ver categorías con conteo de ítems
SELECT 
    c.name AS categoria, 
    COUNT(m.id) AS cantidad_items,
    AVG(m.price) AS precio_promedio
FROM categories c 
LEFT JOIN menu_items m ON c.id = m.category_id 
GROUP BY c.name 
ORDER BY c.display_order;

-- Ver menú completo organizado
SELECT 
    c.name AS categoria,
    m.name AS plato,
    m.price AS precio,
    m.available AS disponible,
    m.is_vegetarian AS vegetariano,
    m.is_vegan AS vegano
FROM menu_items m
JOIN categories c ON m.category_id = c.id
ORDER BY c.display_order, m.name;

-- Estadísticas del restaurante
SELECT 
    'Empleados' AS tipo, 
    COUNT(*) AS total 
FROM employees
UNION ALL
SELECT 
    'Categorías', 
    COUNT(*) 
FROM categories
UNION ALL
SELECT 
    'Ítems del Menú', 
    COUNT(*) 
FROM menu_items;

-- Items más caros
SELECT 
    m.name, 
    c.name AS categoria, 
    m.price 
FROM menu_items m
JOIN categories c ON m.category_id = c.id
ORDER BY m.price DESC
LIMIT 5;

-- Distribución de salarios
SELECT 
    department AS departamento,
    COUNT(*) AS empleados,
    MIN(salary) AS salario_min,
    MAX(salary) AS salario_max,
    AVG(salary) AS salario_promedio
FROM employees
GROUP BY department;
```

---

## 🎯 Escenario de Prueba Completo

### Configuración Inicial del Restaurante

```powershell
# 1. Login como admin
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'

# 2. Ver el equipo de trabajo
curl http://localhost:8080/api/employees

# 3. Ver la estructura del menú
curl "http://localhost:8080/api/categories?activeOnly=true&ordered=true"

# 4. Ver el menú completo
curl "http://localhost:8080/api/menu?availableOnly=true"

# 5. Agregar un nuevo ítem especial del día
curl -X POST http://localhost:8080/api/menu `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Especial del Chef\",\"description\":\"Creación especial del día\",\"price\":45000,\"categoryId\":2,\"preparationTime\":30,\"calories\":680}'

# 6. Marcar un ítem como no disponible
curl -X PATCH http://localhost:8080/api/menu/10/toggle-availability

# 7. Verificar cambios
curl "http://localhost:8080/api/menu?availableOnly=true"
```

---

## 📱 Respuestas Esperadas

### Empleado (Example)
```json
{
  "id": 1,
  "userId": 1,
  "username": "admin",
  "fullName": "Administrator",
  "email": "admin@restaurant.com",
  "role": "ADMIN",
  "documentNumber": "12345678",
  "phone": "+57 300 123 4567",
  "address": "Calle 123 #45-67",
  "hireDate": "2023-01-01",
  "salary": 5000000,
  "position": "Administrador General",
  "department": "Administración",
  "active": true,
  "createdAt": "2026-01-22T14:17:07",
  "updatedAt": "2026-01-22T14:17:07"
}
```

### Categoría (Example)
```json
{
  "id": 1,
  "name": "Entradas",
  "description": "Deliciosas entradas para comenzar tu comida",
  "active": true,
  "displayOrder": 1,
  "createdAt": "2026-01-22T14:17:07",
  "updatedAt": "2026-01-22T14:17:07"
}
```

### Ítem del Menú (Example)
```json
{
  "id": 1,
  "name": "Bruschetta",
  "description": "Pan tostado con tomate, albahaca y aceite de oliva",
  "price": 15000,
  "categoryId": 1,
  "categoryName": "Entradas",
  "imageUrl": null,
  "available": true,
  "preparationTime": 10,
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": false,
  "isSpicy": false,
  "calories": 180,
  "createdAt": "2026-01-22T14:17:07",
  "updatedAt": "2026-01-22T14:17:07"
}
```

---

## ✅ Checklist de Verificación

- [ ] Servidor iniciado correctamente
- [ ] 5 usuarios creados
- [ ] 5 empleados creados
- [ ] 5 categorías creadas
- [ ] 10 ítems del menú creados
- [ ] Endpoint de empleados funcional
- [ ] Endpoint de categorías funcional
- [ ] Endpoint de menú funcional
- [ ] Relaciones entre entidades funcionando
- [ ] Precios guardándose correctamente
- [ ] Filtros de búsqueda funcionando

---

## 🎉 Resultado Esperado

Al completar estas pruebas, deberías tener:

✅ Un sistema completamente funcional con:
- Personal registrado y organizado
- Menú estructurado por categorías
- Ítems con precios y atributos
- Capacidad de gestión completa (CRUD)

**¡El restaurante está listo para operar!** 🚀
