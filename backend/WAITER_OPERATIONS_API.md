# API OPERACIÓN DEL MESERO

Este documento describe las APIs implementadas para la operación del mesero siguiendo el flujo correcto:

## 🔄 FLUJO DE OPERACIÓN

### 1️⃣ TABLES (Mesas)
### 2️⃣ CLIENTS (Clientes)
### 3️⃣ ORDERS (Pedidos)

---

## 📋 ENDPOINTS IMPLEMENTADOS

### 1️⃣ TABLES - `/api/tables`

#### Crear Mesa
```http
POST /api/tables
Content-Type: application/json

{
  "tableNumber": 1,
  "capacity": 4,
  "location": "Zona VIP"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "tableNumber": 1,
  "capacity": 4,
  "status": "DISPONIBLE",
  "location": "Zona VIP",
  "isActive": true,
  "createdAt": "2026-01-22T14:30:00",
  "updatedAt": "2026-01-22T14:30:00"
}
```

#### Consultar Mesas
```http
GET /api/tables
```

**Parámetros opcionales:**
- `activeOnly=true` - Solo mesas activas
- `status=DISPONIBLE` - Filtrar por estado (DISPONIBLE, OCUPADA, RESERVADA, FUERA_DE_SERVICIO)

**Respuesta:**
```json
[
  {
    "id": 1,
    "tableNumber": 1,
    "capacity": 4,
    "status": "DISPONIBLE",
    "location": "Zona VIP",
    "isActive": true,
    "createdAt": "2026-01-22T14:30:00",
    "updatedAt": "2026-01-22T14:30:00"
  }
]
```

#### Consultar Mesa por ID
```http
GET /api/tables/{id}
```

#### Consultar Mesa por Número
```http
GET /api/tables/number/{tableNumber}
```

---

### 2️⃣ CLIENTS - `/api/clients`

#### Crear Cliente
```http
POST /api/clients
Content-Type: application/json

{
  "name": "Juan Pérez",
  "phone": "3001234567",
  "email": "juan@example.com",
  "identificationNumber": "123456789",
  "address": "Calle 123 #45-67",
  "notes": "Cliente VIP"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "phone": "3001234567",
  "email": "juan@example.com",
  "identificationNumber": "123456789",
  "address": "Calle 123 #45-67",
  "isFrequentCustomer": false,
  "loyaltyPoints": 0,
  "notes": "Cliente VIP",
  "isActive": true,
  "createdAt": "2026-01-22T14:30:00",
  "updatedAt": "2026-01-22T14:30:00"
}
```

#### Consultar Clientes
```http
GET /api/clients
```

**Parámetros opcionales:**
- `activeOnly=true` - Solo clientes activos
- `frequentOnly=true` - Solo clientes frecuentes
- `search=Juan` - Buscar por nombre

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "phone": "3001234567",
    "email": "juan@example.com",
    "identificationNumber": "123456789",
    "address": "Calle 123 #45-67",
    "isFrequentCustomer": false,
    "loyaltyPoints": 0,
    "notes": "Cliente VIP",
    "isActive": true,
    "createdAt": "2026-01-22T14:30:00",
    "updatedAt": "2026-01-22T14:30:00"
  }
]
```

#### Consultar Cliente por ID
```http
GET /api/clients/{id}
```

---

### 3️⃣ ORDERS - `/api/orders`

#### Crear Pedido
```http
POST /api/orders
Content-Type: application/json

{
  "clientId": 1,
  "tableId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "specialInstructions": "Sin cebolla"
    },
    {
      "menuItemId": 2,
      "quantity": 1,
      "specialInstructions": "Término medio"
    }
  ],
  "notes": "Pedido para mesa 1"
}
```

**Características importantes:**
- ✅ Asocia **cliente** (clientId)
- ✅ Asocia **mesa** (tableId)
- ✅ Asocia **items del menú** (menuItemId)
- ✅ Estado inicial: **PENDIENTE**
- ✅ **NO calcula totales** (como solicitaste)

**Respuesta:**
```json
{
  "id": 1,
  "clientId": 1,
  "clientName": "Juan Pérez",
  "tableId": 1,
  "tableNumber": 1,
  "status": "PENDIENTE",
  "items": [
    {
      "id": 1,
      "menuItemId": 1,
      "menuItemName": "Hamburguesa",
      "menuItemPrice": 15000,
      "quantity": 2,
      "specialInstructions": "Sin cebolla"
    },
    {
      "id": 2,
      "menuItemId": 2,
      "menuItemName": "Filete de Res",
      "menuItemPrice": 35000,
      "quantity": 1,
      "specialInstructions": "Término medio"
    }
  ],
  "notes": "Pedido para mesa 1",
  "createdAt": "2026-01-22T14:30:00",
  "updatedAt": "2026-01-22T14:30:00"
}
```

#### Consultar Pedidos
```http
GET /api/orders
```

**Parámetros opcionales:**
- `status=PENDIENTE` - Filtrar por estado (PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, CANCELADO)
- `clientId=1` - Pedidos de un cliente específico
- `tableId=1` - Pedidos de una mesa específica

**Respuesta:**
```json
[
  {
    "id": 1,
    "clientId": 1,
    "clientName": "Juan Pérez",
    "tableId": 1,
    "tableNumber": 1,
    "status": "PENDIENTE",
    "items": [
      {
        "id": 1,
        "menuItemId": 1,
        "menuItemName": "Hamburguesa",
        "menuItemPrice": 15000,
        "quantity": 2,
        "specialInstructions": "Sin cebolla"
      }
    ],
    "notes": "Pedido para mesa 1",
    "createdAt": "2026-01-22T14:30:00",
    "updatedAt": "2026-01-22T14:30:00"
  }
]
```

#### Consultar Pedido por ID
```http
GET /api/orders/{id}
```

#### Actualizar Pedido
```http
PUT /api/orders/{id}
Content-Type: application/json

{
  "status": "EN_PREPARACION",
  "notes": "Pedido actualizado"
}
```

---

## 🔐 VALIDACIONES IMPLEMENTADAS

### Tables
- ✅ Número de mesa único
- ✅ Estado inicial: DISPONIBLE
- ✅ Estados disponibles: DISPONIBLE, OCUPADA, RESERVADA, FUERA_DE_SERVICIO

### Clients
- ✅ Email único (si se proporciona)
- ✅ Número de identificación único (si se proporciona)
- ✅ isFrequentCustomer por defecto: false
- ✅ loyaltyPoints por defecto: 0

### Orders
- ✅ Cliente debe existir
- ✅ Mesa debe existir
- ✅ Items del menú deben existir
- ✅ Items del menú deben estar disponibles
- ✅ Debe tener al menos un item
- ✅ Estado inicial: PENDIENTE
- ✅ Estados disponibles: PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, CANCELADO

---

## 📦 ESTRUCTURA DE BASE DE DATOS

### Tabla: restaurant_tables
- id (Long, PK)
- table_number (Integer, unique)
- capacity (Integer)
- status (Enum)
- location (String)
- is_active (Boolean)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)

### Tabla: clients
- id (Long, PK)
- name (String)
- phone (String)
- email (String)
- identification_number (String)
- address (String)
- is_frequent_customer (Boolean)
- loyalty_points (Integer)
- notes (String)
- is_active (Boolean)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)

### Tabla: orders
- id (Long, PK)
- client_id (Long, FK -> clients)
- table_id (Long, FK -> restaurant_tables)
- status (Enum)
- notes (String)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)

### Tabla: order_items
- id (Long, PK)
- order_id (Long, FK -> orders)
- menu_item_id (Long, FK -> menu_items)
- quantity (Integer)
- special_instructions (String)

---

## 🚀 EJEMPLO DE USO COMPLETO

### Paso 1: Crear Mesa
```bash
curl -X POST http://localhost:8080/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 1,
    "capacity": 4,
    "location": "Zona VIP"
  }'
```

### Paso 2: Crear Cliente
```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "phone": "3001234567",
    "email": "juan@example.com"
  }'
```

### Paso 3: Crear Pedido
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "tableId": 1,
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "specialInstructions": "Sin cebolla"
      }
    ],
    "notes": "Pedido para mesa 1"
  }'
```

---

## ✅ IMPLEMENTACIÓN COMPLETA

- ✅ **Tables**: Crear y consultar mesas
- ✅ **Clients**: Crear y consultar clientes
- ✅ **Orders**: Crear pedidos asociando cliente, mesa e items del menú
- ✅ **Estado inicial**: PENDIENTE
- ✅ **NO se calculan totales** (como solicitaste)
- ✅ Validaciones de integridad referencial
- ✅ Validaciones de negocio (items disponibles, etc.)

El sistema está listo para ser utilizado siguiendo el flujo correcto del mesero.
