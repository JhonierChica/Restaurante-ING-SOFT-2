# 📖 Manual de Usuario — Sistema de Gestión Mr. Panzo

> **Versión:** 1.0  
> **Sistema:** Restaurant Management System — Mr. Panzo  
> **Stack:** Spring Boot + React + PostgreSQL

HACER QUE LOS MESEROS PUEDAN ACCEDER A LOS DOMICILIO, 
LOS MESEROS NO PUDEN REALIZAR EL COBRO,
MANEJARLO CON WEBSOCKET EN TIEMPO REAL LOS PEDIDOS
LOS PAGOS NO SE GUARDAN SI YA SE CERRO CAJA 
SOLO DEJA BORRAR, USUARIOS, Y MET DE PAGO
la difrencia de los pdfs sigue sin salir

---

## 📑 Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Requisitos e Instalación](#2-requisitos-e-instalación)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Módulo Administrador](#5-módulo-administrador)
6. [Módulo Mesero](#6-módulo-mesero)
7. [Módulo Cajero](#7-módulo-cajero)
8. [Flujos Principales del Sistema](#8-flujos-principales-del-sistema)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Descripción General

**Mr. Panzo** es un sistema integral de gestión para restaurantes que permite administrar pedidos, mesas, clientes, empleados, pagos, menú y entregas a domicilio desde una interfaz web moderna.

El sistema está organizado en **tres roles principales**, cada uno con su propio panel y funcionalidades:

```mermaid
graph TD
    A[🔐 Login] --> B{Rol del Usuario}
    B -->|ADMIN| C[👨‍💼 Panel Administrador]
    B -->|WAITER| D[🧑‍🍳 Panel Mesero]
    B -->|CASHIER| E[💰 Panel Cajero]
    
    C --> C1[Perfiles y Permisos]
    C --> C2[Cargos]
    C --> C3[Empleados]
    C --> C4[Usuarios]
    C --> C5[Categorías]
    C --> C6[Menú]
    C --> C7[Métodos de Pago]
    
    D --> D1[Pedidos]
    D --> D2[Mesas]
    
    E --> E1[Mesas]
    E --> E2[Clientes]
    E --> E3[Domicilios]
    E --> E4[Pagos]
    E --> E5[Cierre de Caja]

    style A fill:#4a90d9,stroke:#333,color:#fff
    style C fill:#6c5ce7,stroke:#333,color:#fff
    style D fill:#00b894,stroke:#333,color:#fff
    style E fill:#fdcb6e,stroke:#333,color:#333
```

---

## 2. Requisitos e Instalación

### 2.1 Prerrequisitos

| Software       | Versión mínima |
|----------------|----------------|
| Java JDK       | 25+            |
| Node.js        | 18+            |
| npm            | 9+             |
| PostgreSQL     | 14+            |

### 2.2 Configuración de la Base de Datos

```mermaid
flowchart LR
    A[1. Instalar PostgreSQL] --> B[2. Crear BD mr_panzo_db]
    B --> C[3. Ejecutar dbActual.sql]
    C --> D[4. Ejecutar datos_iniciales.sql]
    D --> E[✅ BD Lista]

    style E fill:#00b894,stroke:#333,color:#fff
```

**Pasos en terminal:**

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE mr_panzo_db;"

# 2. Ejecutar el esquema
psql -U postgres -d mr_panzo_db -f backend/sql/dbActual.sql

# 3. Insertar datos iniciales (usuario admin)
psql -U postgres -d mr_panzo_db -f backend/sql/datos_iniciales.sql
```

### 2.3 Ejecutar el Sistema

```bash
# Desde la raíz del proyecto — inicia backend y frontend juntos:
npm run dev

# O por separado:
npm run backend      # Backend en http://localhost:8080
npm run frontend     # Frontend en http://localhost:5173
```

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | `http://localhost:5173`     |
| Backend   | `http://localhost:8080/api` |

---

## 3. Acceso al Sistema

### 3.1 Pantalla de Login

Al abrir la aplicación se muestra la pantalla de inicio de sesión:

- **Usuario inicial:** `admin`
- **Contraseña inicial:** `admin123`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant L as Pantalla Login
    participant API as Backend API
    participant BD as Base de Datos
    
    U->>L: Ingresa usuario y contraseña
    L->>API: POST /api/auth/login
    API->>BD: Verifica credenciales
    BD-->>API: Usuario válido + perfil
    API-->>L: Token + datos de usuario
    L->>L: Redirige al panel según el rol
    
    Note over L: ADMIN → /admin/profiles
    Note over L: WAITER → /waiter/orders
    Note over L: CASHIER → /cashier/tables
```

---

## 4. Roles y Permisos

El sistema implementa control de acceso basado en roles (RBAC). Cada usuario tiene un perfil con permisos específicos.

```mermaid
graph TD
    subgraph "👨‍💼 ADMINISTRADOR"
        A1[Perfiles y Permisos]
        A2[Cargos]
        A3[Empleados]
        A4[Usuarios]
        A5[Categorías del Menú]
        A6[Ítems del Menú]
        A7[Métodos de Pago]
    end
    
    subgraph "🧑‍🍳 MESERO"
        W1[Gestión de Pedidos]
        W2[Ver Mesas]
    end
    
    subgraph "💰 CAJERO"
        C1[Ver Mesas]
        C2[Gestión de Clientes]
        C3[Gestión de Domicilios]
        C4[Historial de Pagos]
        C5[Cierre de Caja]
    end

    style A1 fill:#dfe6e9
    style A2 fill:#dfe6e9
    style A3 fill:#dfe6e9
    style A4 fill:#dfe6e9
    style A5 fill:#dfe6e9
    style A6 fill:#dfe6e9
    style A7 fill:#dfe6e9
    style W1 fill:#dfe6e9
    style W2 fill:#dfe6e9
    style C1 fill:#dfe6e9
    style C2 fill:#dfe6e9
    style C3 fill:#dfe6e9
    style C4 fill:#dfe6e9
    style C5 fill:#dfe6e9
```

| Rol             | Acceso                                                                   |
|-----------------|--------------------------------------------------------------------------|
| **Administrador** | Configuración general: perfiles, cargos, empleados, usuarios, menú, categorías, métodos de pago |
| **Mesero**        | Crear y gestionar pedidos, ver mesas, realizar cobros                    |
| **Cajero**        | Clientes, domicilios, historial de pagos, cierre de caja, mesas         |

---

## 5. Módulo Administrador

### 5.1 Perfiles y Permisos

Permite crear roles personalizados y asignarles permisos granulares.

**Acciones disponibles:**
- ➕ Crear nuevo perfil
- ✏️ Editar perfil existente
- 🗑️ Eliminar perfil
- 🔐 Asignar/quitar permisos por módulo

```mermaid
flowchart LR
    A[Crear Perfil] --> B[Nombrar el Rol]
    B --> C[Activar Permisos]
    C --> D[Guardar]
    D --> E[✅ Perfil disponible para asignar a usuarios]

    style E fill:#00b894,stroke:#333,color:#fff
```

### 5.2 Cargos (Positions)

Gestiona los cargos laborales del restaurante (Mesero, Cajero, Chef, etc.).

**Acciones disponibles:**
- ➕ Crear cargo
- ✏️ Editar cargo
- 🔄 Activar/Desactivar cargo

### 5.3 Empleados

Administra la información del personal del restaurante.

**Campos del empleado:**
| Campo              | Descripción                        |
|--------------------|------------------------------------|
| Nombre y Apellido  | Datos personales                   |
| Documento          | Número de identificación           |
| Teléfono           | Número de contacto                 |
| Dirección          | Dirección del empleado             |
| Correo             | Email del empleado                 |
| Cargo              | Selección del cargo registrado     |
| Estado             | Activo / Inactivo                  |

```mermaid
flowchart TD
    A[Crear Cargo] --> B[Crear Empleado]
    B --> C[Crear Usuario]
    C --> D[Asignar Perfil al Usuario]
    D --> E[✅ Empleado puede ingresar al sistema]

    style A fill:#74b9ff,stroke:#333
    style E fill:#00b894,stroke:#333,color:#fff
```

### 5.4 Usuarios

Crea cuentas de acceso al sistema para los empleados.

**Campos:**
- **Empleado:** Seleccionar empleado registrado
- **Username:** Nombre de usuario único
- **Contraseña:** Clave de acceso
- **Perfil:** Rol del sistema (Admin, Mesero, Cajero)

### 5.5 Categorías del Menú

Organiza los ítems del menú por categoría (Entradas, Platos Fuertes, Bebidas, Postres, etc.).

**Acciones:**
- ➕ Crear categoría
- ✏️ Editar nombre/descripción
- 🔄 Activar/Desactivar

### 5.6 Ítems del Menú

Gestiona los platos y productos disponibles para la venta.

**Campos del ítem:**
| Campo        | Descripción                           |
|--------------|---------------------------------------|
| Nombre       | Nombre del plato/producto             |
| Descripción  | Descripción detallada                 |
| Precio       | Precio de venta                       |
| Categoría    | Categoría a la que pertenece          |
| Disponible   | Si está disponible para ordenar       |

```mermaid
flowchart LR
    A[Crear Categoría] --> B[Crear Ítem de Menú]
    B --> C[Asignar Categoría + Precio]
    C --> D[✅ Disponible para pedidos]

    style D fill:#00b894,stroke:#333,color:#fff
```

### 5.7 Métodos de Pago

Configura los métodos de pago aceptados en el restaurante.

**Tipos disponibles:**
- 💵 Efectivo
- 💳 Tarjeta de Crédito
- 💳 Tarjeta de Débito
- 📱 Transferencia
- 📦 Otro

---

## 6. Módulo Mesero

### 6.1 Gestión de Pedidos

Este es el módulo principal del mesero. Permite crear, editar y gestionar pedidos del restaurante.

#### Flujo para crear un pedido:

```mermaid
flowchart TD
    A[🆕 Nuevo Pedido] --> B{¿Cliente existe?}
    B -->|Sí| C[Buscar por documento]
    B -->|No| D[Registrar nuevo cliente]
    C --> E[Seleccionar tipo de pedido]
    D --> E
    E --> F{Tipo de pedido}
    F -->|Establecimiento| G[Seleccionar Mesa]
    F -->|Domicilio| H[Se asigna mesa de domicilios]
    G --> I[Seleccionar ítems del menú]
    H --> I
    I --> J[Elegir categoría]
    J --> K[Agregar ítems + cantidad]
    K --> L{¿Agregar más?}
    L -->|Sí| J
    L -->|No| M[Agregar notas opcionales]
    M --> N[💾 Guardar Pedido]
    N --> O[✅ Pedido creado]
    
    N -.->|Si es DOMICILIO| P[📦 Se crea registro de Delivery automáticamente]

    style A fill:#74b9ff,stroke:#333
    style O fill:#00b894,stroke:#333,color:#fff
    style P fill:#fdcb6e,stroke:#333
```

#### Tarjetas de Pedido

Cada pedido se muestra como una **tarjeta** con la siguiente información:
- 🔢 Número de pedido
- 🍽️ Mesa asignada (o 🏍️ Domicilio)
- 👤 Nombre del cliente
- 🛒 Lista de ítems con cantidades y subtotales
- 💵 Total del pedido
- 📝 Notas
- 🏷️ Badge de estado con color

#### Filtros de Estado

Se pueden filtrar los pedidos por estado usando los botones de filtro:

| Filtro          | Color    | Descripción                      |
|-----------------|----------|----------------------------------|
| 📋 Todos        | Gris     | Muestra todos los pedidos        |
| 🟡 Pendiente    | Amarillo | Pedidos recién creados           |
| 🔵 En Proceso   | Azul     | En preparación en cocina         |
| 🟢 Listo        | Verde    | Preparado, listo para servir     |
| ✅ Servido       | Primario | Entregado al cliente             |
| 🔴 Cancelado    | Rojo     | Pedidos cancelados               |

#### Estados de un Pedido

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Pedido creado
    PENDIENTE --> EN_PREPARACION: Enviado a cocina
    EN_PREPARACION --> LISTO: Cocina terminó
    LISTO --> SERVIDO: Entregado al cliente
    SERVIDO --> [*]: Cobro realizado ✅
    
    PENDIENTE --> CANCELADO: Cancelar
    EN_PREPARACION --> CANCELADO: Cancelar
    LISTO --> CANCELADO: Cancelar
    CANCELADO --> [*]
```

#### Realizar Cobro

Cuando un pedido tiene estado **SERVIDO**, aparece el botón **💰 Realizar Cobro**:

```mermaid
sequenceDiagram
    actor M as Mesero
    participant O as Tarjeta del Pedido
    participant C as Confirmación
    participant P as Modal de Pago
    participant API as Backend
    
    M->>O: Click "💰 Realizar Cobro"
    O->>C: "¿Está seguro de realizar el cobro?"
    M->>C: Confirmar
    C->>P: Abre modal de pago
    
    Note over P: Muestra resumen del pedido
    Note over P: Ítems + cantidades + subtotales
    Note over P: TOTAL A PAGAR
    
    M->>P: Selecciona método de pago
    M->>P: Ingresa monto recibido
    P->>P: Calcula cambio automáticamente
    M->>P: Confirmar pago
    P->>API: POST /api/payments
    API-->>P: Pago registrado ✅
    
    Note over O: El pedido desaparece de la vista
    Note over O: Se ve en Historial de Pagos
```

**Campos del modal de pago:**

| Campo             | Descripción                                    |
|-------------------|------------------------------------------------|
| Resumen del pedido | Cliente, tipo, detalle de ítems               |
| Total a pagar     | Monto total calculado                          |
| Método de pago    | Seleccionar (Efectivo, Tarjeta, etc.)          |
| Monto recibido    | Cantidad que entrega el cliente                |
| Cambio/Devuelta   | Se calcula automáticamente                     |

> ⚠️ **Nota:** Una vez cobrado, el pedido **desaparece** de la vista de pedidos y se mueve al historial de pagos del cajero.

### 6.2 Mesas (Vista Mesero)

Permite al mesero ver el estado de todas las mesas del restaurante.

| Estado       | Significado                   |
|--------------|-------------------------------|
| 🟢 Disponible | Mesa libre                   |
| 🔴 Ocupada    | Mesa con clientes            |
| 🟡 Reservada  | Mesa con reservación         |

---

## 7. Módulo Cajero

### 7.1 Mesas (Vista Cajero)

Vista de consulta del estado de las mesas del restaurante.

### 7.2 Clientes

Gestión completa de la base de datos de clientes.

**Campos del cliente:**
| Campo          | Descripción                    |
|----------------|--------------------------------|
| Nombre         | Nombre completo                |
| Identificación | Número de documento            |
| Teléfono       | Número de contacto             |
| Dirección      | Dirección del cliente          |
| Email          | Correo electrónico (opcional)  |

### 7.3 Gestión de Domicilios

Administra los pedidos de tipo **DOMICILIO**. Cuando un mesero crea un pedido tipo "Domicilio", automáticamente aparece aquí.

#### Estados de un Domicilio

```mermaid
stateDiagram-v2
    [*] --> PENDING: Pedido domicilio creado
    PENDING --> IN_TRANSIT: Sale a entregar
    IN_TRANSIT --> DELIVERED: Entrega exitosa
    DELIVERED --> [*]: Cobro realizado ✅
    
    PENDING --> CANCELLED: Cancelar
    IN_TRANSIT --> CANCELLED: Cancelar
    CANCELLED --> [*]
```

| Estado        | Badge         | Descripción                          |
|---------------|---------------|--------------------------------------|
| ⏳ Pendiente   | Amarillo      | Domicilio recién creado              |
| 🚀 En Tránsito | Azul          | Pedido en camino                     |
| ✅ Entregado   | Verde         | Entregado al cliente                 |
| ❌ Cancelado   | Rojo          | Domicilio cancelado                  |

#### Flujo de Domicilios

```mermaid
flowchart TD
    A[🧑‍🍳 Mesero crea pedido tipo DOMICILIO] --> B[📦 Se crea registro de Delivery automáticamente]
    B --> C[💰 Cajero ve el domicilio en estado PENDING]
    C --> D[Cajero cambia estado a IN_TRANSIT]
    D --> E[Cajero cambia estado a DELIVERED]
    E --> F[🔓 Se habilita botón 💰 Cobrar]
    F --> G[Cajero realiza el cobro]
    G --> H[✅ Pago registrado]
    H --> I[📋 Domicilio desaparece de la vista]
    I --> J[Se ve en Historial de Pagos]

    style A fill:#74b9ff,stroke:#333
    style F fill:#fdcb6e,stroke:#333
    style H fill:#00b894,stroke:#333,color:#fff
```

> ⚠️ **Importante:** El botón **💰 Cobrar** solo se habilita cuando el estado del domicilio es **ENTREGADO** (`DELIVERED`). Una vez cobrado, el domicilio desaparece de esta vista.

#### Tabla de Domicilios

| Columna          | Descripción                        |
|------------------|------------------------------------|
| ID               | Identificador del domicilio        |
| Pedido #         | Número del pedido asociado         |
| Cliente          | Nombre del cliente                 |
| Teléfono         | Teléfono de contacto               |
| Dirección        | Dirección de entrega               |
| Total Pedido     | Monto total del pedido             |
| Estado Domicilio | Estado actual del delivery         |
| Creado           | Fecha y hora de creación           |

**Acciones por domicilio:**
- 🔄 **Estado Domicilio** — Cambiar el estado del delivery
- 💰 **Cobrar** — Registrar pago (solo si estado = Entregado)

### 7.4 Historial de Pagos

Vista de **solo lectura** que muestra todos los pagos realizados.

**Información mostrada:**

| Columna        | Descripción                        |
|----------------|------------------------------------|
| ID             | Identificador del pago             |
| Orden          | Número de pedido asociado          |
| Monto          | Cantidad cobrada                   |
| Método de Pago | Efectivo, Tarjeta, etc.            |
| Estado         | Completado, Cancelado, etc.        |
| Fecha          | Fecha del pago                     |

**Funcionalidades adicionales:**
- 📊 Resumen diario (total ventas del día y cantidad de pagos)
- 📦 Botón **Cierre de Caja** — Genera el cierre diario

```mermaid
flowchart LR
    A[Pagos del día] --> B[📊 Resumen diario]
    B --> C{¿Fin del turno?}
    C -->|Sí| D[Click Cierre de Caja]
    D --> E[Se genera registro de cierre]
    E --> F[✅ Disponible en módulo Cierre de Caja]

    style F fill:#00b894,stroke:#333,color:#fff
```

### 7.5 Cierre de Caja

Módulo para consultar los cierres de caja realizados.

#### Filtros por período

| Filtro     | Descripción                         |
|------------|-------------------------------------|
| 📋 Todos    | Muestra todos los cierres           |
| 📅 Diario   | Cierres del día actual              |
| 📆 Mensual  | Cierres del mes actual              |
| 📊 Anual    | Cierres del año actual              |

#### Información del cierre

| Campo             | Descripción                            |
|-------------------|----------------------------------------|
| Fecha de apertura | Inicio del período                     |
| Fecha de cierre   | Fin del período                        |
| Monto inicial     | Dinero al inicio                       |
| Monto final       | Dinero al cierre                       |
| Total ventas      | Suma de pagos completados              |
| Diferencia        | Diferencia entre esperado y real       |
| Cerrado por       | Usuario que realizó el cierre          |

**Funcionalidades:**
- 🔍 Ver detalle de cada cierre
- 📄 **Exportar PDF** — Genera un documento PDF del cierre seleccionado

```mermaid
flowchart TD
    A[Historial de Pagos] -->|Cierre de Caja| B[Se genera cierre manual]
    C[⏰ 23:59 cada día] -->|Automático| D[Sistema genera cierre automático]
    B --> E[Registro en Cierre de Caja]
    D --> E
    E --> F[Consultar por período]
    E --> G[📄 Exportar PDF]

    style B fill:#74b9ff,stroke:#333
    style D fill:#fdcb6e,stroke:#333
    style G fill:#a29bfe,stroke:#333,color:#fff
```

> 📌 **Cierre automático:** El sistema genera automáticamente un cierre de caja todos los días a las **23:59**. Si ya existe un cierre manual del mismo día, no se duplica.

---

## 8. Flujos Principales del Sistema

### 8.1 Flujo Completo: Pedido en Establecimiento

```mermaid
flowchart TD
    A[👨‍💼 Admin configura el sistema] --> A1[Crea cargos, empleados, usuarios]
    A --> A2[Crea categorías e ítems de menú]
    A --> A3[Configura métodos de pago]
    
    A1 --> B[🧑‍🍳 Mesero inicia sesión]
    A2 --> B
    A3 --> B
    
    B --> C[Crea nuevo pedido]
    C --> D[Busca o registra cliente]
    D --> E[Selecciona tipo: ESTABLECIMIENTO]
    E --> F[Elige mesa disponible]
    F --> G[Agrega ítems del menú por categoría]
    G --> H[💾 Guarda pedido]
    
    H --> I[Estado: 🟡 PENDIENTE]
    I --> J[Cambia a 🔵 EN PREPARACIÓN]
    J --> K[Cambia a 🟢 LISTO]
    K --> L[Cambia a ✅ SERVIDO]
    
    L --> M[Aparece botón 💰 Realizar Cobro]
    M --> N[Selecciona método de pago]
    N --> O[Ingresa monto recibido]
    O --> P[Sistema calcula cambio]
    P --> Q[✅ Pago registrado]
    
    Q --> R[Pedido desaparece de Orders]
    Q --> S[Pago visible en Historial de Pagos]
    S --> T[💰 Cajero puede hacer Cierre de Caja]

    style A fill:#6c5ce7,stroke:#333,color:#fff
    style B fill:#00b894,stroke:#333,color:#fff
    style Q fill:#00b894,stroke:#333,color:#fff
    style T fill:#fdcb6e,stroke:#333
```

### 8.2 Flujo Completo: Pedido a Domicilio

```mermaid
flowchart TD
    A[🧑‍🍳 Mesero crea pedido] --> B[Busca o registra cliente]
    B --> C[Selecciona tipo: DOMICILIO]
    C --> D[Se asigna mesa de domicilios automáticamente]
    D --> E[Agrega ítems del menú]
    E --> F[💾 Guarda pedido]
    
    F --> G[📦 Se crea Delivery automáticamente]
    F --> H[Pedido aparece en Orders del mesero]
    G --> I[Domicilio aparece en vista Cajero]
    
    H --> J[Mesero gestiona estado del pedido]
    I --> K[Cajero gestiona estado del domicilio]
    
    K --> K1[⏳ PENDING → 🚀 IN_TRANSIT]
    K1 --> K2[🚀 IN_TRANSIT → ✅ DELIVERED]
    
    K2 --> L[Se habilita botón 💰 Cobrar]
    L --> M[Cajero registra el pago]
    M --> N[✅ Pago completado]
    
    N --> O[Pedido desaparece de Orders]
    N --> P[Domicilio desaparece de Deliveries]
    N --> Q[Pago visible en Historial de Pagos]

    style A fill:#00b894,stroke:#333,color:#fff
    style G fill:#74b9ff,stroke:#333
    style N fill:#00b894,stroke:#333,color:#fff
```

### 8.3 Flujo de Cierre de Caja

```mermaid
flowchart TD
    A[📊 Pagos del día se acumulan] --> B{¿Cómo se cierra?}
    
    B -->|Manual| C[Cajero va a Historial de Pagos]
    C --> D[Click en 📦 Cierre de Caja]
    D --> E[Se genera registro de cierre]
    
    B -->|Automático| F[⏰ Sistema a las 23:59]
    F --> G{¿Ya existe cierre del día?}
    G -->|No| H[Se genera cierre automático]
    G -->|Sí| I[No se duplica]
    
    E --> J[Disponible en módulo Cierre de Caja]
    H --> J
    
    J --> K[Consultar por período]
    J --> L[📄 Exportar a PDF]

    style D fill:#74b9ff,stroke:#333
    style F fill:#fdcb6e,stroke:#333
    style L fill:#a29bfe,stroke:#333,color:#fff
```

### 8.4 Configuración Inicial del Sistema

Flujo recomendado para configurar el sistema por primera vez:

```mermaid
flowchart TD
    A[1️⃣ Login como admin/admin123] --> B[2️⃣ Crear Cargos]
    B --> C[3️⃣ Crear Perfiles con permisos]
    C --> D[4️⃣ Registrar Empleados]
    D --> E[5️⃣ Crear Usuarios para empleados]
    E --> F[6️⃣ Crear Categorías del menú]
    F --> G[7️⃣ Agregar Ítems al menú]
    G --> H[8️⃣ Configurar Métodos de Pago]
    H --> I[9️⃣ Crear Mesas del restaurante]
    I --> J[✅ Sistema listo para operar]

    style A fill:#6c5ce7,stroke:#333,color:#fff
    style J fill:#00b894,stroke:#333,color:#fff
```

---

## 9. Preguntas Frecuentes

### ¿Cómo creo un nuevo mesero?

```mermaid
flowchart LR
    A[Admin: Crear Cargo 'Mesero'] --> B[Admin: Crear Empleado con ese cargo]
    B --> C[Admin: Crear Usuario]
    C --> D[Asignar perfil WAITER]
    D --> E[✅ Mesero puede iniciar sesión]

    style E fill:#00b894,stroke:#333,color:#fff
```

### ¿Por qué no aparece el botón de cobro?

| Situación                              | Solución                                                    |
|----------------------------------------|-------------------------------------------------------------|
| Pedido en establecimiento              | El pedido debe estar en estado **SERVIDO**                  |
| Pedido a domicilio                     | El estado del domicilio debe ser **ENTREGADO** (`DELIVERED`) |
| El pedido ya fue cobrado               | Ya no aparece en la vista, está en Historial de Pagos       |

### ¿Dónde veo los pedidos ya cobrados?

Los pedidos cobrados **desaparecen** de las vistas de Pedidos y Domicilios. Se pueden consultar en:
- **Cajero → Pagos** — Historial completo de pagos
- **Cajero → Cierre de Caja** — Resumen agrupado por período

### ¿Qué pasa si el sistema se cierra sin hacer cierre de caja?

El sistema genera un **cierre automático a las 23:59** todos los días. Si ya se hizo un cierre manual ese día, no se duplica.

### ¿Puedo cambiar el estado de un pedido hacia atrás?

Sí, el sistema permite cambiar el estado de un pedido a cualquier estado disponible. Sin embargo, se recomienda seguir el flujo natural:

`PENDIENTE → EN PREPARACIÓN → LISTO → SERVIDO`

### ¿Cómo cambio mi contraseña?

Contacte al administrador del sistema. El administrador puede editar las credenciales desde **Admin → Usuarios**.

---

## Arquitectura del Sistema

```mermaid
graph TB
    subgraph "🖥️ Frontend - React + Vite"
        FE[Puerto 5173]
        FE --> |Axios HTTP| API
    end
    
    subgraph "⚙️ Backend - Spring Boot"
        API[REST API - Puerto 8080]
        API --> SVC[Servicios]
        SVC --> REPO[Repositorios JPA]
    end
    
    subgraph "🗄️ Base de Datos"
        REPO --> DB[(PostgreSQL - Puerto 5432)]
    end

    style FE fill:#61dafb,stroke:#333
    style API fill:#6db33f,stroke:#333,color:#fff
    style DB fill:#336791,stroke:#333,color:#fff
```

### Modelo de Datos Simplificado

```mermaid
erDiagram
    CARGO ||--o{ EMPLEADO : tiene
    EMPLEADO ||--o| USUARIO : tiene
    ROL ||--o{ USUARIO : asignado
    ROL }o--o{ PERMISOS : tiene
    
    CATEGORIA ||--o{ MENU : contiene
    CLIENTE ||--o{ PEDIDO : realiza
    USUARIO ||--o{ PEDIDO : registra
    MESA ||--o{ PEDIDO : asignada
    PEDIDO ||--o{ DETALLE_PEDIDO : contiene
    MENU ||--o{ DETALLE_PEDIDO : incluido
    
    PEDIDO ||--o| PAGO : genera
    METODO_PAGO ||--o{ PAGO : usa
    PEDIDO ||--o| DOMICILIO : genera
```

---

<div align="center">

**Mr. Panzo** — Sistema de Gestión de Restaurante  
Ingeniería de Software · 2026

</div>
