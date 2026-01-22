# 🛠️ Configuración Administrativa - Sistema de Restaurante

## 📦 Módulos Implementados (Orden de Ejecución)

### 1️⃣ **Employees** - Gestión de Empleados
### 2️⃣ **Categories** - Gestión de Categorías del Menú
### 3️⃣ **Menu** - Gestión de Ítems del Menú

---

## 👥 Módulo EMPLOYEES

### Entidad Employee
- **Relación:** OneToOne con User
- **Atributos:**
  - ID autoincremental
  - Usuario asociado (único)
  - Número de documento (único)
  - Teléfono
  - Dirección
  - Fecha de contratación
  - Salario
  - Posición/Cargo
  - Departamento
  - Estado activo/inactivo
  - Timestamps

### 📡 Endpoints - Employees API

#### Base URL: `/api/employees`

#### 1. Crear Empleado
```http
POST /api/employees
Content-Type: application/json

{
  "userId": 1,
  "documentNumber": "12345678",
  "phone": "+57 300 123 4567",
  "address": "Calle 123 #45-67",
  "hireDate": "2024-01-15",
  "salary": 3000000,
  "position": "Mesero Senior",
  "department": "Servicio"
}
```

#### 2. Listar Empleados
```http
GET /api/employees
GET /api/employees?activeOnly=true
```

#### 3. Obtener por ID
```http
GET /api/employees/{id}
```

#### 4. Obtener por Usuario
```http
GET /api/employees/user/{userId}
```

#### 5. Filtrar por Departamento
```http
GET /api/employees/department/Cocina
```

#### 6. Filtrar por Posición
```http
GET /api/employees/position/Chef
```

#### 7. Actualizar Empleado
```http
PUT /api/employees/{id}
Content-Type: application/json

{
  "phone": "+57 300 999 9999",
  "salary": 3500000,
  "position": "Mesero Jefe"
}
```

#### 8. Eliminar Empleado
```http
DELETE /api/employees/{id}
```

#### 9. Desactivar Empleado
```http
PATCH /api/employees/{id}/deactivate
```

---

## 🏷️ Módulo CATEGORIES

### Entidad Category
- **Atributos:**
  - ID autoincremental
  - Nombre (único)
  - Descripción
  - Orden de visualización
  - Estado activo/inactivo
  - Timestamps

### 📡 Endpoints - Categories API

#### Base URL: `/api/categories`

#### 1. Crear Categoría
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Pastas",
  "description": "Deliciosas pastas italianas",
  "displayOrder": 3
}
```

#### 2. Listar Categorías
```http
GET /api/categories
GET /api/categories?activeOnly=true
GET /api/categories?activeOnly=true&ordered=true
```

#### 3. Obtener por ID
```http
GET /api/categories/{id}
```

#### 4. Obtener por Nombre
```http
GET /api/categories/name/Postres
```

#### 5. Actualizar Categoría
```http
PUT /api/categories/{id}
Content-Type: application/json

{
  "name": "Bebidas Calientes",
  "description": "Café, té y chocolate",
  "displayOrder": 5
}
```

#### 6. Eliminar Categoría
```http
DELETE /api/categories/{id}
```

#### 7. Desactivar Categoría
```http
PATCH /api/categories/{id}/deactivate
```

---

## 🍽️ Módulo MENU

### Entidad MenuItem
- **Relación:** ManyToOne con Category
- **Atributos:**
  - ID autoincremental
  - Nombre
  - Descripción
  - **Precio** (BigDecimal)
  - **Categoría** (relación)
  - URL de imagen
  - Disponibilidad
  - Tiempo de preparación (minutos)
  - Indicadores:
    - Vegetariano
    - Vegano
    - Sin gluten
    - Picante
  - Calorías
  - Timestamps

### 📡 Endpoints - Menu API

#### Base URL: `/api/menu`

#### 1. Crear Ítem del Menú
```http
POST /api/menu
Content-Type: application/json

{
  "name": "Pizza Margherita",
  "description": "Pizza clásica con tomate, mozzarella y albahaca",
  "price": 32000,
  "categoryId": 2,
  "imageUrl": "https://example.com/pizza.jpg",
  "preparationTime": 20,
  "isVegetarian": true,
  "calories": 550
}
```

#### 2. Listar Ítems del Menú
```http
GET /api/menu
GET /api/menu?availableOnly=true
```

#### 3. Obtener por ID
```http
GET /api/menu/{id}
```

#### 4. Filtrar por Categoría
```http
GET /api/menu/category/2
GET /api/menu/category/2?availableOnly=true
```

#### 5. Filtros Especiales
```http
GET /api/menu/vegetarian     # Solo vegetarianos
GET /api/menu/vegan          # Solo veganos
GET /api/menu/gluten-free    # Sin gluten
```

#### 6. Actualizar Ítem
```http
PUT /api/menu/{id}
Content-Type: application/json

{
  "price": 35000,
  "available": true,
  "preparationTime": 18
}
```

#### 7. Eliminar Ítem
```http
DELETE /api/menu/{id}
```

#### 8. Cambiar Disponibilidad
```http
PATCH /api/menu/{id}/toggle-availability
```

---

## 🗂️ Datos Iniciales Creados

### Empleados (5)
| ID | Usuario | Documento | Posición | Departamento | Salario |
|----|---------|-----------|----------|--------------|---------|
| 1 | admin | 12345678 | Administrador General | Administración | $5,000,000 |
| 2 | manager | 23456789 | Gerente de Operaciones | Administración | $4,000,000 |
| 3 | waiter | 34567890 | Mesero Senior | Servicio | $1,500,000 |
| 4 | chef | 45678901 | Chef Ejecutivo | Cocina | $3,500,000 |
| 5 | cashier | 56789012 | Cajero Principal | Caja | $2,000,000 |

### Categorías (5)
| ID | Nombre | Descripción | Orden |
|----|--------|-------------|-------|
| 1 | Entradas | Deliciosas entradas para comenzar tu comida | 1 |
| 2 | Platos Principales | Platos fuertes y sustanciosos | 2 |
| 3 | Postres | Dulces y deliciosos postres | 3 |
| 4 | Bebidas | Refrescantes bebidas | 4 |
| 5 | Ensaladas | Frescas y saludables ensaladas | 5 |

### Ítems del Menú (10)
| ID | Nombre | Categoría | Precio | Calorías | Atributos |
|----|--------|-----------|--------|----------|-----------|
| 1 | Bruschetta | Entradas | $15,000 | 180 | Vegetariano |
| 2 | Aros de Cebolla | Entradas | $12,000 | 250 | Vegetariano |
| 3 | Bandeja Paisa | Platos Principales | $35,000 | 850 | - |
| 4 | Lasagna Vegetariana | Platos Principales | $28,000 | 450 | Vegetariano |
| 5 | Tiramisu | Postres | $18,000 | 380 | Vegetariano |
| 6 | Brownie con Helado | Postres | $16,000 | 520 | Vegetariano |
| 7 | Limonada Natural | Bebidas | $8,000 | 90 | Vegano |
| 8 | Café Americano | Bebidas | $5,000 | 5 | Vegano |
| 9 | Ensalada César | Ensaladas | $22,000 | 320 | Sin Gluten |
| 10 | Ensalada Griega | Ensaladas | $20,000 | 180 | Vegetariano, Sin Gluten |

---

## 🧪 Flujo de Prueba Completo

### 1. Crear un Empleado Nuevo
```powershell
# Primero crear el usuario
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"nuevo_mesero\",\"email\":\"mesero@test.com\",\"password\":\"pass123\",\"fullName\":\"Pedro Mesero\",\"role\":\"WAITER\"}'

# Luego crear el empleado (usar el userId de la respuesta anterior)
curl -X POST http://localhost:8080/api/employees `
  -H "Content-Type: application/json" `
  -d '{\"userId\":6,\"documentNumber\":\"67890123\",\"phone\":\"+57 300 678 9012\",\"address\":\"Calle Nueva\",\"hireDate\":\"2024-01-22\",\"salary\":1400000,\"position\":\"Mesero\",\"department\":\"Servicio\"}'
```

### 2. Crear una Nueva Categoría
```powershell
curl -X POST http://localhost:8080/api/categories `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Pastas\",\"description\":\"Pastas artesanales\",\"displayOrder\":6}'
```

### 3. Crear un Ítem del Menú
```powershell
# Usar el categoryId de la respuesta anterior
curl -X POST http://localhost:8080/api/menu `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Spaghetti Carbonara\",\"description\":\"Pasta con crema y tocino\",\"price\":26000,\"categoryId\":6,\"preparationTime\":15,\"calories\":620}'
```

### 4. Consultar Todo
```powershell
# Ver todos los empleados
curl http://localhost:8080/api/employees

# Ver todas las categorías ordenadas
curl "http://localhost:8080/api/categories?activeOnly=true&ordered=true"

# Ver menú completo disponible
curl "http://localhost:8080/api/menu?availableOnly=true"

# Ver menú por categoría
curl "http://localhost:8080/api/menu/category/1?availableOnly=true"
```

---

## 📊 Estructura de Base de Datos

### Tabla: employees
```sql
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    document_number VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(200),
    hire_date DATE,
    salary DECIMAL(10,2),
    position VARCHAR(100),
    department VARCHAR(50),
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabla: categories
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla: menu_items
```sql
CREATE TABLE menu_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    category_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN NOT NULL,
    preparation_time INTEGER,
    is_vegetarian BOOLEAN,
    is_vegan BOOLEAN,
    is_gluten_free BOOLEAN,
    is_spicy BOOLEAN,
    calories INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

---

## ✅ Resultado Final

### 📌 El Admin puede ahora:

1. ✅ **Gestionar Empleados**
   - Crear perfiles completos de empleados
   - Vincular empleados con usuarios del sistema
   - Administrar salarios, posiciones y departamentos
   - Consultar empleados activos

2. ✅ **Gestionar Categorías**
   - Crear categorías del menú
   - Ordenar categorías por prioridad
   - Activar/desactivar categorías
   - Consultar categorías ordenadas

3. ✅ **Gestionar Menú**
   - Crear ítems con precios
   - Asociar ítems a categorías
   - Indicar atributos (vegetariano, vegano, sin gluten)
   - Controlar disponibilidad
   - Especificar tiempo de preparación
   - Consultar menú filtrado por categoría

### 🎉 Sistema Listo para Operar

El administrador puede dejar el sistema completamente configurado:
- ✅ Usuarios y empleados registrados
- ✅ Categorías del menú organizadas
- ✅ Menú completo con precios y detalles
- ✅ El restaurante está listo para recibir órdenes

---

## 🔜 Próximos Módulos Sugeridos

1. **Tables** - Gestión de mesas del restaurante
2. **Orders** - Sistema de órdenes y pedidos
3. **Payments** - Gestión de pagos
4. **Cash Register** - Caja registradora
5. **Clients** - Gestión de clientes
6. **Deliveries** - Sistema de entregas a domicilio
