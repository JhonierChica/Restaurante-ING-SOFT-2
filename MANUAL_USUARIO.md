# Manual de Usuario - Sistema de Gestión de Restaurante

## ¿Qué es este sistema?

Es una aplicación web diseñada para gestionar todas las operaciones diarias de un restaurante: pedidos, mesas, menú, clientes, personal y caja.

Permite trabajar de forma organizada, rápida y sin confusiones entre el equipo del restaurante.

## ¿Para qué sirve?

Este sistema ayuda a:

- Tomar pedidos de forma rápida y ordenada
- Controlar el estado de las mesas
- Gestionar el menú y los precios
- Registrar pagos y métodos de pago
- Llevar control de la caja
- Administrar clientes y entregas a domicilio
- Gestionar el personal del restaurante

## Cómo iniciar sesión

1. Abrir el navegador web (Chrome, Firefox, Edge)
2. Ir a la dirección: `http://localhost:5173`
3. Aparecerá la pantalla de inicio de sesión
4. Ingresar tu **nombre de usuario**
5. Ingresar tu **contraseña**
6. Hacer clic en el botón **"Iniciar Sesión"**

**Importante**: Tu jefe o administrador te proporcionará tu usuario y contraseña.

Si olvidas tu contraseña, contacta al administrador del sistema.

## La pantalla principal

Después de iniciar sesión, verás:

### Barra lateral (Menú de navegación)
- Muestra tu nombre y tipo de usuario
- Lista de opciones disponibles según tu rol
- Botón para cerrar sesión

### Área de trabajo principal
- Aquí se muestran los módulos con los que trabajas
- Cambia según la opción que selecciones del menú

## Tipos de usuario

El sistema tiene 3 tipos de usuarios. Cada uno tiene acceso a diferentes funciones:

### 1. Administrador
La persona que configura todo el sistema.

### 2. Mesero
La persona que toma pedidos y atiende las mesas.

### 3. Cajero
La persona que cobra, registra pagos y maneja la caja.

---

## Módulos del Sistema

## 📋 Pedidos

**¿Quién lo usa?** Meseros

**¿Para qué sirve?** Tomar y gestionar los pedidos de los clientes.

### Cómo crear un pedido

1. Ir al menú **"Pedidos"**
2. Hacer clic en **"Nuevo Pedido"**
3. Seleccionar la **mesa** donde está el cliente
4. Elegir los **platillos** del menú
5. Indicar la **cantidad** de cada platillo
6. Revisar que todo esté correcto
7. Hacer clic en **"Guardar Pedido"**

### Cómo ver los pedidos activos

- En la pantalla de pedidos aparece una lista con todos los pedidos
- Cada pedido muestra:
  - Número de mesa
  - Platillos ordenados
  - Estado (pendiente, en preparación, servido)
  - Total a pagar

### Cómo cambiar el estado de un pedido

1. Buscar el pedido en la lista
2. Hacer clic en el botón de **"Editar"**
3. Cambiar el estado:
   - **Pendiente**: El pedido acaba de tomarse
   - **En preparación**: La cocina está preparando
   - **Servido**: Ya se entregó al cliente
   - **Cancelado**: El cliente canceló el pedido
4. Guardar los cambios

---

## 🪑 Mesas

**¿Quién lo usa?** Meseros y Cajeros

**¿Para qué sirve?** Controlar el estado de las mesas del restaurante.

### Cómo ver el estado de las mesas

- Ir al menú **"Mesas"**
- Aparece una lista con todas las mesas
- Cada mesa muestra:
  - Número de mesa
  - Capacidad (número de personas)
  - Estado actual
  - Mesero asignado (si aplica)

### Estados de las mesas

- **Libre**: Mesa disponible para nuevos clientes
- **Ocupada**: Hay clientes sentados
- **Reservada**: Mesa apartada para alguien

### Cómo cambiar el estado de una mesa

1. Buscar la mesa en la lista
2. Hacer clic en **"Editar"**
3. Cambiar el estado según corresponda
4. Guardar

---

## 🍽️ Menú

**¿Quién lo usa?** Administrador

**¿Para qué sirve?** Gestionar los platillos que ofrece el restaurante.

### Cómo agregar un nuevo platillo

1. Ir al menú **"Menú"**
2. Hacer clic en **"Nuevo Platillo"**
3. Llenar la información:
   - Nombre del platillo
   - Descripción
   - Precio
   - Categoría (entrada, plato fuerte, postre, bebida)
   - Disponibilidad (si está disponible o no)
4. Hacer clic en **"Guardar"**

### Cómo editar un platillo

1. Buscar el platillo en la lista
2. Hacer clic en **"Editar"**
3. Modificar lo que necesites
4. Guardar los cambios

### Cómo quitar un platillo del menú

1. Buscar el platillo
2. Hacer clic en **"Eliminar"**
3. Confirmar la eliminación

**Nota**: Solo puedes eliminar platillos que no tengan pedidos activos.

---

## 👥 Clientes

**¿Quién lo usa?** Cajeros

**¿Para qué sirve?** Registrar la información de los clientes, especialmente para entregas a domicilio.

### Cómo registrar un cliente

1. Ir al menú **"Clientes"**
2. Hacer clic en **"Nuevo Cliente"**
3. Llenar los datos:
   - Nombre completo
   - Teléfono
   - Dirección
   - Correo electrónico (opcional)
4. Guardar

### Cómo buscar un cliente

- Usar el buscador en la parte superior
- Escribir el nombre o teléfono
- Aparecerán los resultados

---

## 💵 Pagos

**¿Quién lo usa?** Cajeros

**¿Para qué sirve?** Registrar los pagos que hacen los clientes.

### Cómo registrar un pago

1. Ir al menú **"Pagos"**
2. Hacer clic en **"Nuevo Pago"**
3. Seleccionar el **pedido** que se está pagando
4. Elegir el **método de pago**:
   - Efectivo
   - Tarjeta de crédito
   - Tarjeta de débito
   - Transferencia
5. Ingresar el **monto**
6. Guardar el pago

### Cómo ver el historial de pagos

- En la pantalla de pagos aparece la lista completa
- Muestra:
  - Fecha y hora
  - Número de pedido o mesa
  - Monto pagado
  - Método de pago

---

## 💰 Caja Registradora

**¿Quién lo usa?** Cajeros

**¿Para qué sirve?** Controlar el dinero que entra y sale de la caja.

### Cómo abrir la caja

Al inicio del turno:

1. Ir al menú **"Caja Registradora"**
2. Hacer clic en **"Abrir Caja"**
3. Ingresar el **monto inicial** (dinero con el que se inicia)
4. Confirmar

### Cómo cerrar la caja

Al final del turno:

1. Ir a **"Caja Registradora"**
2. Hacer clic en **"Cerrar Caja"**
3. Contar el dinero físico
4. Ingresar el **monto final**
5. El sistema mostrará si hay diferencias
6. Confirmar el cierre

### Cómo ver el estado de la caja

- Muestra el monto inicial
- Ingresos del día (ventas)
- Gastos (si se registraron)
- Saldo actual

---

## 🚚 Entregas a Domicilio

**¿Quién lo usa?** Cajeros

**¿Para qué sirve?** Gestionar los pedidos para llevar o enviar.

### Cómo registrar una entrega

1. Ir al menú **"Entregas"**
2. Hacer clic en **"Nueva Entrega"**
3. Seleccionar o registrar al **cliente**
4. Ingresar la **dirección de entrega**
5. Anotar el **pedido**
6. Guardar

### Estados de entregas

- **Pendiente**: La entrega está por salir
- **En camino**: Ya salió el repartidor
- **Entregada**: Se completó la entrega
- **Cancelada**: Se canceló la entrega

---

## 👤 Personal

**¿Quién lo usa?** Administrador

**¿Para qué sirve?** Gestionar la información de los empleados.

### Módulo de Empleados

**Cómo agregar un empleado:**

1. Ir a **"Empleados"**
2. Hacer clic en **"Nuevo Empleado"**
3. Llenar:
   - Nombre completo
   - Número de documento
   - Teléfono
   - Dirección
   - Cargo (mesero, cajero, cocinero, etc.)
4. Guardar

### Módulo de Usuarios

**Cómo crear un usuario para que acceda al sistema:**

1. Ir a **"Usuarios"**
2. Hacer clic en **"Nuevo Usuario"**
3. Llenar:
   - Nombre de usuario
   - Contraseña
   - Seleccionar el empleado asociado
   - Asignar el tipo de usuario (Administrador, Mesero, Cajero)
4. Guardar

**Importante**: Primero se debe crear el empleado y luego el usuario.

---

## 🔧 Configuración (Solo Administrador)

### Categorías

Organiza los platillos del menú en categorías:
- Entradas
- Platos fuertes
- Postres
- Bebidas
- Especialidades

**Cómo agregar una categoría:**
1. Ir a **"Categorías"**
2. Hacer clic en **"Nueva Categoría"**
3. Escribir el nombre
4. Guardar

### Métodos de Pago

Define las formas de pago que acepta el restaurante.

**Cómo agregar un método de pago:**
1. Ir a **"Métodos de Pago"**
2. Hacer clic en **"Nuevo Método"**
3. Escribir el nombre (Efectivo, Tarjeta, etc.)
4. Guardar

### Cargos

Define los puestos de trabajo en el restaurante.

**Cómo agregar un cargo:**
1. Ir a **"Cargos"**
2. Hacer clic en **"Nuevo Cargo"**
3. Escribir el nombre (Mesero, Cajero, Cocinero, etc.)
4. Guardar

### Perfiles

Son los tipos de usuario del sistema (Administrador, Mesero, Cajero).

Ya vienen configurados, pero puedes editarlos si necesitas cambiar permisos.

---

## Flujo básico de uso

### Turno de un Mesero

1. Iniciar sesión
2. Ver el estado de las mesas
3. Cuando llega un cliente:
   - Cambiar mesa a "Ocupada"
   - Crear un pedido
   - Seleccionar mesa y platillos
4. Avisar a cocina (el pedido aparece como "Pendiente")
5. Cuando la comida esté lista, cambiar estado a "Servido"
6. Cuando el cliente termine, avisar al cajero

### Turno de un Cajero

1. Iniciar sesión
2. Abrir la caja registradora con el monto inicial
3. Cuando el mesero avise:
   - Ver el pedido de la mesa
   - Registrar el pago
   - Seleccionar método de pago
4. Cambiar la mesa a "Libre"
5. Al final del turno:
   - Cerrar la caja
   - Contar el dinero
   - Registrar el monto final

---

## Buenas prácticas

### Para Meseros

- Revisa bien el pedido antes de guardarlo
- Actualiza el estado de los pedidos a tiempo
- Cambia el estado de las mesas cuando los clientes se vayan

### Para Cajeros

- Abre la caja al inicio del turno
- Registra todos los pagos inmediatamente
- Revisa que el método de pago sea correcto
- Cierra la caja al final del turno
- Cuenta bien el dinero antes de cerrar

### Para Administradores

- Mantén actualizado el menú
- Revisa los precios regularmente
- Crea usuarios solo para empleados activos
- Elimina usuarios de empleados que ya no trabajan

---

## ¿Qué hacer si ocurre un error?

### "No se pudo conectar con el servidor"
- Verifica que el sistema esté encendido
- Revisa tu conexión a internet
- Contacta al soporte técnico

### "Usuario o contraseña incorrectos"
- Verifica que estés escribiendo bien
- Las contraseñas distinguen mayúsculas y minúsculas
- Si olvidaste tu contraseña, contacta al administrador

### "No tienes permisos para acceder a esta página"
- Estás intentando acceder a una función que no corresponde a tu rol
- Si necesitas acceso, habla con el administrador

### No puedo eliminar un platillo/mesa/cliente
- El elemento está siendo usado en otro lugar del sistema
- Primero debes eliminar lo que lo está usando
- Ejemplo: No puedes eliminar una mesa que tiene un pedido activo

### La página no carga o se queda en blanco
- Recarga la página (F5)
- Cierra sesión y vuelve a entrar
- Si el problema persiste, contacta a soporte

### Los cambios no se guardan
- Verifica que hayas llenado todos los campos obligatorios
- Revisa que los datos sean válidos (números, fechas, etc.)
- Asegúrate de hacer clic en "Guardar"

---

## Cómo cerrar sesión

1. Hacer clic en tu nombre en la barra lateral
2. Seleccionar **"Cerrar Sesión"**
3. Serás redirigido a la pantalla de inicio de sesión

**Importante**: Siempre cierra sesión cuando termines de trabajar, especialmente si usas una computadora compartida.

---

## Consejos generales

- **No compartas tu contraseña** con nadie
- **Cierra sesión** si te alejas de la computadora
- **Revisa bien** antes de guardar o eliminar
- **Actualiza** la información a tiempo
- **Reporta problemas** al administrador inmediatamente
- **Mantén limpio** tu espacio de trabajo digital

---

## Contacto de soporte

Si tienes problemas técnicos o dudas sobre el sistema, contacta a:

- **Administrador del restaurante**
- **Soporte técnico del sistema**

Proporciona la mayor información posible:
- Qué estabas haciendo
- Qué error apareció
- Captura de pantalla (si es posible)

---

**Recuerda**: Este sistema está diseñado para hacer tu trabajo más fácil. Si tienes sugerencias para mejorarlo, compártelas con tu administrador.

---

**Versión del manual:** Febrero 2026
