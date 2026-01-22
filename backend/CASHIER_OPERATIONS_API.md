# API CAJA (VERSIÓN SIMPLE)

Este documento describe las APIs implementadas para la operación de caja (versión simple).

## 🔄 FLUJO DE OPERACIÓN

### 1️⃣ PAYMENT METHODS (Métodos de Pago)
### 2️⃣ PAYMENTS (Pagos)

---

## 📋 ENDPOINTS IMPLEMENTADOS

### 1️⃣ PAYMENT METHODS - `/api/payment-methods`

#### Crear Método de Pago
```http
POST /api/payment-methods
Content-Type: application/json

{
  "name": "Efectivo",
  "type": "EFECTIVO",
  "description": "Pago en efectivo"
}
```

**Tipos de pago disponibles:**
- `EFECTIVO`
- `TRANSFERENCIA`
- `TARJETA_CREDITO`
- `TARJETA_DEBITO`
- `OTRO`

**Respuesta:**
```json
{
  "id": 1,
  "name": "Efectivo",
  "type": "EFECTIVO",
  "description": "Pago en efectivo",
  "isActive": true,
  "createdAt": "2026-01-22T14:30:00",
  "updatedAt": "2026-01-22T14:30:00"
}
```

#### Consultar Métodos de Pago
```http
GET /api/payment-methods
```

**Parámetros opcionales:**
- `activeOnly=true` - Solo métodos activos
- `type=EFECTIVO` - Filtrar por tipo (EFECTIVO, TRANSFERENCIA, etc.)

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Efectivo",
    "type": "EFECTIVO",
    "description": "Pago en efectivo",
    "isActive": true,
    "createdAt": "2026-01-22T14:30:00",
    "updatedAt": "2026-01-22T14:30:00"
  },
  {
    "id": 2,
    "name": "Transferencia Bancaria",
    "type": "TRANSFERENCIA",
    "description": "Pago por transferencia",
    "isActive": true,
    "createdAt": "2026-01-22T14:31:00",
    "updatedAt": "2026-01-22T14:31:00"
  }
]
```

#### Consultar Método de Pago por ID
```http
GET /api/payment-methods/{id}
```

#### Actualizar Método de Pago
```http
PUT /api/payment-methods/{id}
Content-Type: application/json

{
  "name": "Efectivo USD",
  "description": "Pago en efectivo dólares",
  "isActive": true
}
```

---

### 2️⃣ PAYMENTS - `/api/payments`

#### Crear Pago
```http
POST /api/payments
Content-Type: application/json

{
  "orderId": 1,
  "paymentMethodId": 1,
  "amount": 50000,
  "referenceNumber": "REF-2026-001",
  "notes": "Pago en efectivo"
}
```

**Características importantes:**
- ✅ Asocia **pedido** (orderId)
- ✅ Asocia **método de pago** (paymentMethodId)
- ✅ Estado inicial: **PENDIENTE**
- ✅ **Sin lógica de cambio** (como solicitaste)
- ✅ **Sin confirmaciones** (como solicitaste)

**Respuesta:**
```json
{
  "id": 1,
  "orderId": 1,
  "paymentMethodId": 1,
  "paymentMethodName": "Efectivo",
  "amount": 50000,
  "status": "PENDIENTE",
  "referenceNumber": "REF-2026-001",
  "notes": "Pago en efectivo",
  "createdAt": "2026-01-22T14:30:00",
  "updatedAt": "2026-01-22T14:30:00"
}
```

#### Consultar Pagos
```http
GET /api/payments
```

**Parámetros opcionales:**
- `orderId=1` - Pagos de un pedido específico
- `status=PENDIENTE` - Filtrar por estado (PENDIENTE, COMPLETADO, CANCELADO, FALLIDO)
- `paymentMethodId=1` - Pagos de un método específico

**Respuesta:**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "paymentMethodId": 1,
    "paymentMethodName": "Efectivo",
    "amount": 50000,
    "status": "PENDIENTE",
    "referenceNumber": "REF-2026-001",
    "notes": "Pago en efectivo",
    "createdAt": "2026-01-22T14:30:00",
    "updatedAt": "2026-01-22T14:30:00"
  }
]
```

#### Consultar Pago por ID
```http
GET /api/payments/{id}
```

#### Actualizar Pago
```http
PUT /api/payments/{id}
Content-Type: application/json

{
  "status": "COMPLETADO",
  "notes": "Pago procesado exitosamente"
}
```

---

## 🔐 VALIDACIONES IMPLEMENTADAS

### Payment Methods
- ✅ Nombre único del método de pago
- ✅ Estado activo/inactivo
- ✅ Tipos de pago: EFECTIVO, TRANSFERENCIA, TARJETA_CREDITO, TARJETA_DEBITO, OTRO

### Payments
- ✅ Pedido debe existir
- ✅ Método de pago debe existir
- ✅ Método de pago debe estar activo
- ✅ Estado inicial: PENDIENTE
- ✅ Estados disponibles: PENDIENTE, COMPLETADO, CANCELADO, FALLIDO
- ✅ **Sin lógica de cambio**
- ✅ **Sin confirmaciones automáticas**

---

## 📦 ESTRUCTURA DE BASE DE DATOS

### Tabla: payment_methods
- id (Long, PK)
- name (String, unique)
- type (Enum: EFECTIVO, TRANSFERENCIA, etc.)
- description (String)
- is_active (Boolean)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)

### Tabla: payments
- id (Long, PK)
- order_id (Long, FK -> orders)
- payment_method_id (Long, FK -> payment_methods)
- amount (BigDecimal)
- status (Enum: PENDIENTE, COMPLETADO, CANCELADO, FALLIDO)
- reference_number (String)
- notes (String)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)

---

## 🚀 EJEMPLO DE USO COMPLETO

### Paso 1: Crear Métodos de Pago

#### Crear Efectivo
```bash
curl -X POST http://localhost:8080/api/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Efectivo",
    "type": "EFECTIVO",
    "description": "Pago en efectivo"
  }'
```

#### Crear Transferencia
```bash
curl -X POST http://localhost:8080/api/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Transferencia Bancaria",
    "type": "TRANSFERENCIA",
    "description": "Pago por transferencia bancaria"
  }'
```

### Paso 2: Crear Pago

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "paymentMethodId": 1,
    "amount": 50000,
    "referenceNumber": "REF-2026-001",
    "notes": "Pago en efectivo"
  }'
```

### Paso 3: Consultar Pagos de un Pedido

```bash
curl http://localhost:8080/api/payments?orderId=1
```

---

## 📊 FLUJO COMPLETO: MESERO + CAJA

### 1. El mesero crea el pedido
```bash
# Crear mesa
POST /api/tables
{
  "tableNumber": 1,
  "capacity": 4,
  "location": "Zona principal"
}

# Crear cliente
POST /api/clients
{
  "name": "María García",
  "phone": "3001234567"
}

# Crear pedido
POST /api/orders
{
  "clientId": 1,
  "tableId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "specialInstructions": "Sin cebolla"
    }
  ],
  "notes": "Pedido urgente"
}
```

### 2. La caja procesa el pago
```bash
# Consultar métodos de pago disponibles
GET /api/payment-methods?activeOnly=true

# Crear pago
POST /api/payments
{
  "orderId": 1,
  "paymentMethodId": 1,
  "amount": 50000,
  "referenceNumber": "REF-2026-001",
  "notes": "Pago en efectivo"
}

# Actualizar estado del pago (cuando se complete)
PUT /api/payments/1
{
  "status": "COMPLETADO"
}
```

---

## ✅ IMPLEMENTACIÓN COMPLETA

### Payment Methods
- ✅ Crear métodos de pago (Efectivo / Transferencia)
- ✅ Consultar métodos de pago
- ✅ CRUD completo
- ✅ Validación de nombres únicos
- ✅ Gestión de estado activo/inactivo

### Payments
- ✅ Crear pago asociando pedido y método de pago
- ✅ Consultar pagos por pedido, estado o método
- ✅ Estado inicial: PENDIENTE
- ✅ **Sin lógica de cambio** (versión simple)
- ✅ **Sin confirmaciones automáticas** (versión simple)
- ✅ Validaciones de integridad referencial

---

## 🎯 CARACTERÍSTICAS DE LA VERSIÓN SIMPLE

Esta es la **versión simple** de la caja, como solicitaste:

- ✅ **Solo registro básico de pagos**: Se crea el pago asociando orden y método
- ✅ **Sin cálculo de cambio**: No hay lógica para calcular cambio de efectivo
- ✅ **Sin confirmaciones**: No hay flujos de confirmación automáticos
- ✅ **Sin validación de monto**: No se valida que el monto coincida con el total del pedido
- ✅ **Sin integración con caja registradora**: Es solo registro de transacciones

La funcionalidad está lista para ser extendida en futuras versiones con:
- Lógica de cambio y confirmaciones
- Validación de montos
- Integración con caja registradora
- Reportes de cierre de caja
- Etc.

El sistema está listo para procesar pagos de manera simple y directa.
