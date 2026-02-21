import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { OrdersIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import { menuService } from '../../services/menuService';
import { clientService } from '../../services/clientService';
import { ORDER_STATUS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [orders, setOrders] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [allTables, setAllTables] = useState([]); // Todas las mesas (incluida mesa de domicilios)
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Estados para el flujo de cliente
  const [clientStep, setClientStep] = useState('selection'); // 'selection', 'new', 'existing', 'orderType', 'order'
  const [existingClient, setExistingClient] = useState(null);
  const [searchingClient, setSearchingClient] = useState(false);
  const [orderType, setOrderType] = useState(''); // 'ESTABLECIMIENTO' o 'DOMICILIO'
  
  // Datos del pedido completo (cliente + orden)
  const [formData, setFormData] = useState({
    // Datos del cliente (inline)
    clientName: '',
    clientIdentification: '',
    clientPhone: '',
    clientAddress: '',
    // Datos del pedido
    tableId: '',
    status: ORDER_STATUS.PENDING,
    notes: '',
  });
  
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tablesData, menuData] = await Promise.all([
        orderService.getAllOrders(),
        tableService.getAllTables(),
        menuService.getAllMenuItems(),
      ]);
      
      setOrders(ordersData);
      setAllTables(tablesData); // Guardar todas las mesas
      // Filtrar solo mesas disponibles para selección normal
      const available = tablesData.filter(table => 
        table.status === 'DISPONIBLE' && table.isActive
      );
      setAvailableTables(available);
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setClientStep('selection');
    setExistingClient(null);
    setOrderType('');
    setFormData({
      clientName: '',
      clientIdentification: '',
      clientPhone: '',
      clientAddress: '',
      tableId: availableTables[0]?.id || '',
      status: ORDER_STATUS.PENDING,
      notes: '',
    });
    setSelectedItems([]);
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setClientStep('order');
    setExistingClient({ 
      id: order.clientId, 
      name: order.clientName,
      identificationNumber: ''
    });
    setFormData({
      clientName: order.clientName || '',
      clientIdentification: '',
      clientPhone: '',
      clientAddress: '',
      tableId: order.tableId,
      status: order.status,
      notes: order.notes || '',
    });
    setSelectedItems(order.items || []);
    setShowModal(true);
  };

  const handleDelete = async (order) => {
    if (window.confirm(`¿Está seguro de eliminar la orden #${order.id}?`)) {
      try {
        await orderService.deleteOrder(order.id);
        alert('Orden eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar orden');
      }
    }
  };

  const handleToggleStatus = async (order) => {
    const statusOptions = [
      { value: ORDER_STATUS.PENDING, label: 'Pendiente' },
      { value: ORDER_STATUS.IN_PROGRESS, label: 'En Proceso' },
      { value: ORDER_STATUS.READY, label: 'Listo' },
      { value: ORDER_STATUS.DELIVERED, label: 'Entregado' },
      { value: ORDER_STATUS.CANCELLED, label: 'Cancelado' }
    ];
    
    const currentIndex = statusOptions.findIndex(s => s.value === order.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const nextStatus = statusOptions[nextIndex];
    
    if (window.confirm(`¿Cambiar estado de "${statusOptions[currentIndex].label}" a "${nextStatus.label}"?`)) {
      try {
        await orderService.updateOrderStatus(order.id, nextStatus.value);
        alert(`Estado actualizado a ${nextStatus.label}`);
        loadData();
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar estado');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!editingOrder) {
        // Si estamos en el paso de selección o verificación de cliente
        if (clientStep === 'selection') {
          alert('Por favor seleccione si el cliente es nuevo o existente');
          return;
        }
        
        // Si el cliente es existente, verificar número de identificación
        if (clientStep === 'existing' && !existingClient) {
          if (!formData.clientIdentification || !formData.clientIdentification.trim()) {
            alert('Por favor ingrese el número de identificación del cliente');
            return;
          }
          
          // Buscar cliente existente
          await searchExistingClient();
          return;
        }
        
        // Si el cliente es nuevo, validar todos los campos
        if (clientStep === 'new') {
          if (!formData.clientName || !formData.clientName.trim()) {
            alert('Por favor ingrese el nombre completo del cliente');
            return;
          }
          
          if (!formData.clientIdentification || !formData.clientIdentification.trim()) {
            alert('Por favor ingrese el número de identificación del cliente');
            return;
          }
          
          if (!formData.clientPhone || !formData.clientPhone.trim()) {
            alert('Por favor ingrese el teléfono del cliente');
            return;
          }
          
          // Crear el cliente nuevo y pasar al formulario de pedido
          await createNewClientAndProceed();
          return;
        }
        
        // Paso final: crear el pedido
        if (clientStep === 'order') {
          // Validar que el usuario esté autenticado
          if (!user || !user.id) {
            alert('Error: Usuario no autenticado. Por favor inicie sesión nuevamente.');
            return;
          }
          
          // Solo validar mesa si el pedido es en establecimiento
          if (orderType === 'ESTABLECIMIENTO' && !formData.tableId) {
            alert('Por favor seleccione una mesa');
            return;
          }
          
          if (selectedItems.length === 0) {
            alert('Por favor agregue al menos un ítem del menú');
            return;
          }
          
          let clientId = existingClient?.id;
          
          // Si no hay cliente existente, crear uno nuevo
          if (!clientId) {
            const clientData = {
              name: formData.clientName.trim(),
              identificationNumber: formData.clientIdentification.trim(),
              phone: formData.clientPhone.trim(),
              address: formData.clientAddress?.trim() || '',
              email: '',
              notes: '',
            };
            
            const createdClient = await clientService.createClient(clientData);
            clientId = createdClient.id;
          }
          
          // Para pedidos a domicilio, buscar la mesa especial "DOMICILIOS"
          let tableIdToUse = parseInt(formData.tableId);
          
          if (orderType === 'DOMICILIO') {
            // Buscar mesa especial para domicilios (debes crearla en el admin con número 0 o 999)
            const deliveryTable = allTables.find(t => 
              t.tableNumber === 0 || t.location?.toUpperCase().includes('DOMICILIO')
            );
            
            if (!deliveryTable) {
              alert('Error: No existe una mesa configurada para domicilios. Por favor, crea una mesa especial en el módulo de administración.');
              return;
            }
            
            tableIdToUse = deliveryTable.id;
          }
          
          // Crear el pedido
          const orderData = {
            userId: user?.id, // ID del usuario autenticado
            tableId: tableIdToUse,
            clientId: clientId,
            orderType: orderType, // ESTABLECIMIENTO o DOMICILIO
            items: selectedItems,
            notes: formData.notes,
          };
          
          console.log('=== SENDING ORDER DATA ===');
          console.log('Order Type:', orderType);
          console.log('User ID:', user?.id);
          console.log('Table ID:', tableIdToUse);
          console.log('Client ID:', clientId);
          console.log('Items:', selectedItems);
          console.log('Full orderData:', JSON.stringify(orderData, null, 2));
          
          await orderService.createOrder(orderData);
          
          if (orderType === 'DOMICILIO') {
            alert('Pedido a domicilio creado exitosamente. Consulta el módulo de Deliveries para más detalles.');
          } else {
            alert('Pedido creado exitosamente');
          }
          setShowModal(false);
          loadData();
        }
      } else {
        // Validar al actualizar
        if (!formData.tableId) {
          alert('Por favor seleccione una mesa');
          return;
        }
        
        if (selectedItems.length === 0) {
          alert('Por favor agregue al menos un ítem del menú');
          return;
        }
        
        // Actualizar pedido existente
        const orderData = {
          tableId: parseInt(formData.tableId),
          status: formData.status,
          items: selectedItems,
          notes: formData.notes,
        };
        
        await orderService.updateOrder(editingOrder.id, orderData);
        alert('Pedido actualizado exitosamente');
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar pedido';
      alert(`Error: ${errorMessage}`);
    }
  };
  
  const searchExistingClient = async () => {
    try {
      setSearchingClient(true);
      const clients = await clientService.getAllClients();
      const found = clients.find(c => c.identificationNumber === formData.clientIdentification.trim());
      
      if (found) {
        setExistingClient(found);
        setFormData({
          ...formData,
          clientName: found.name,
          clientPhone: found.phone,
          clientAddress: found.address || '',
        });
        setClientStep('orderType'); // Cambiar a paso de selección de tipo de pedido
        alert(`Cliente encontrado: ${found.name}`);
      } else {
        alert('Cliente no encontrado. ¿Desea registrarlo como cliente nuevo?');
        setClientStep('new');
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      alert('Error al buscar cliente');
    } finally {
      setSearchingClient(false);
    }
  };
  
  const createNewClientAndProceed = async () => {
    try {
      const clientData = {
        name: formData.clientName.trim(),
        identificationNumber: formData.clientIdentification.trim(),
        phone: formData.clientPhone.trim(),
        address: formData.clientAddress?.trim() || '',
        email: '',
        notes: '',
      };
      
      const createdClient = await clientService.createClient(clientData);
      setExistingClient(createdClient);
      setClientStep('orderType'); // Cambiar a paso de selección de tipo de pedido
      alert(`Cliente registrado exitosamente: ${createdClient.name}`);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar cliente';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddItem = (menuItemId) => {
    const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
    if (menuItem) {
      setSelectedItems([...selectedItems, { menuItemId: menuItem.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = parseInt(quantity) || 1;
    setSelectedItems(newItems);
  };

  const getMenuItemName = (menuItemId) => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item ? item.name : 'N/A';
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { emoji: '🟡', text: 'Pendiente', class: 'badge-warning' },
      IN_PROGRESS: { emoji: '🔵', text: 'En Proceso', class: 'badge-info' },
      READY: { emoji: '🟢', text: 'Listo', class: 'badge-success' },
      DELIVERED: { emoji: '✅', text: 'Entregado', class: 'badge-primary' },
      CANCELLED: { emoji: '🔴', text: 'Cancelado', class: 'badge-danger' },
    };
    return badges[status] || { emoji: '', text: status, class: 'badge-secondary' };
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { 
      header: 'Mesa', 
      render: (row) => `Mesa ${row.tableNumber || 'N/A'}` 
    },
    { 
      header: 'Cliente', 
      render: (row) => row.clientName || 'N/A'
    },
    { 
      header: 'Estado', 
      render: (row) => {
        const badge = getStatusBadge(row.status);
        return `${badge.emoji} ${badge.text}`;
      }
    },
    { 
      header: 'Total', 
      render: (row) => `$${parseFloat(row.total || 0).toFixed(2)}` 
    },
  ];

  const calculateOrderTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const price = menuItem ? parseFloat(menuItem.price) : 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  if (loading) return <Loading message="Cargando pedidos..." />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><OrdersIcon size={32} /> Gestión de Pedidos</h1>
            <p>Administra los pedidos del restaurante</p>
          </div>
          <Button onClick={handleAdd} disabled={availableTables.length === 0}>
            + Nuevo Pedido
          </Button>
        </div>

        {availableTables.length === 0 && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404'
          }}>
            ⚠️ No hay mesas disponibles en este momento
          </div>
        )}

        <div className="profiles-grid">
          {orders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <Card key={order.id}>
                <div className="profile-card">
                  <div className="profile-header">
                    <div>
                      <h3>Pedido #{order.id}</h3>
                      <span className="profile-id">
                        {order.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `🍽️ Mesa ${order.tableNumber || 'N/A'}`}
                      </span>
                    </div>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.emoji} {statusBadge.text}
                    </span>
                  </div>
                  
                  <div className="profile-permissions">
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>👤 Cliente:</strong> {order.clientName || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>💵 Total:</strong> ${parseFloat(order.total || 0).toFixed(2)}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>🍽️ Ítems:</strong> {order.items?.length || 0}
                    </div>
                    {order.notes && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>📝 Notas:</strong> {order.notes}
                      </div>
                    )}
                    <div>
                      <strong>📅 Creado:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString('es-ES') : '-'}
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="icon-btn icon-btn-edit" 
                      onClick={() => handleEdit(order)}
                      title="Editar pedido"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className="icon-btn icon-btn-info"
                      onClick={() => handleToggleStatus(order)}
                      title="Cambiar estado"
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="icon-btn icon-btn-danger" 
                      onClick={() => handleDelete(order)}
                      title="Eliminar pedido"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="empty-state">
            <p>No hay pedidos registrados</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
          onConfirm={handleSubmit}
          size="large"
        >
          {!editingOrder && clientStep === 'selection' && (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                👤 ¿El cliente es nuevo o ya está registrado?
              </h3>
              
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
                <Button 
                  onClick={() => setClientStep('new')}
                  style={{ 
                    padding: '20px 40px', 
                    fontSize: '16px',
                    backgroundColor: '#28a745',
                    minWidth: '200px'
                  }}
                >
                  ➕ Cliente Nuevo
                </Button>
                
                <Button 
                  onClick={() => setClientStep('existing')}
                  style={{ 
                    padding: '20px 40px', 
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    minWidth: '200px'
                  }}
                >
                  🔍 Cliente Existente
                </Button>
              </div>
            </>
          )}

          {!editingOrder && clientStep === 'existing' && !existingClient && (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
                🔍 Buscar Cliente Existente
              </h3>
              
              <Input
                label="Número de Identificación"
                name="clientIdentification"
                value={formData.clientIdentification}
                onChange={handleChange}
                required
                placeholder="Ingrese el número de identificación"
                autoFocus
              />
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Button 
                  onClick={searchExistingClient}
                  disabled={searchingClient || !formData.clientIdentification}
                  style={{ minWidth: '200px' }}
                >
                  {searchingClient ? 'Buscando...' : 'Buscar Cliente'}
                </Button>
              </div>
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setClientStep('selection')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Volver a selección
                </button>
              </div>
            </>
          )}

          {!editingOrder && clientStep === 'orderType' && existingClient && (
            <>
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px', 
                backgroundColor: '#d4edda', 
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                color: '#155724'
              }}>
                <strong>✅ Cliente: </strong>{existingClient.name}<br />
                {existingClient.phone && <><strong>📞 Teléfono: </strong>{existingClient.phone}<br /></>}
                {existingClient.identificationNumber && <><strong>🆔 Identificación: </strong>{existingClient.identificationNumber}</>}
              </div>

              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                🏠 ¿Dónde se entregará el pedido?
              </h3>
              
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
                <Button 
                  onClick={() => {
                    setOrderType('ESTABLECIMIENTO');
                    setTimeout(() => setClientStep('order'), 100);
                  }}
                  style={{ 
                    padding: '20px 40px', 
                    fontSize: '16px',
                    backgroundColor: '#28a745',
                    minWidth: '200px'
                  }}
                >
                  🍽️ En el Establecimiento
                </Button>
                
                <Button 
                  onClick={() => {
                    setOrderType('DOMICILIO');
                    setTimeout(() => setClientStep('order'), 100);
                  }}
                  style={{ 
                    padding: '20px 40px', 
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    minWidth: '200px'
                  }}
                >
                  🏍️ A Domicilio
                </Button>
              </div>
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setClientStep('existing');
                    setOrderType('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Volver
                </button>
              </div>
            </>
          )}

          {!editingOrder && clientStep === 'new' && (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '6px', fontSize: '14px' }}>
                ➕ Registrar Cliente Nuevo
              </h3>
              
              <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                <Input
                  label="Nombre Completo"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Juan Pérez"
                />
                
                <Input
                  label="Número de Identificación"
                  name="clientIdentification"
                  value={formData.clientIdentification}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 1234567890"
                />
                
                <Input
                  label="Teléfono"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 3001234567"
                />
                
                <Input
                  label="Dirección"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  placeholder="Ej: Calle 123 #45-67"
                />
              </div>
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Button 
                  onClick={createNewClientAndProceed}
                  style={{ minWidth: '200px', backgroundColor: '#28a745' }}
                >
                  Registrar y Continuar
                </Button>
              </div>
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setClientStep('selection')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Volver a selección
                </button>
              </div>
            </>
          )}

          {(!editingOrder && clientStep === 'order' && existingClient) || editingOrder ? (
            <>
              {existingClient && (
                <>
                  <div style={{ 
                    marginBottom: '15px', 
                    padding: '12px', 
                    backgroundColor: '#d4edda', 
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    color: '#155724'
                  }}>
                    <strong>✅ Cliente: </strong>{existingClient.name}<br />
                    {existingClient.phone && <><strong>📞 Teléfono: </strong>{existingClient.phone}<br /></>}
                    {existingClient.identificationNumber && <><strong>🆔 Identificación: </strong>{existingClient.identificationNumber}</>}
                  </div>
                  
                  <h3 style={{ marginTop: '12px', marginBottom: '10px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '6px', fontSize: '14px' }}>
                    🍽️ Datos del Pedido
                  </h3>

                  {orderType && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: orderType === 'ESTABLECIMIENTO' ? '#d4edda' : '#cce5ff',
                      border: `1px solid ${orderType === 'ESTABLECIMIENTO' ? '#c3e6cb' : '#b8daff'}`,
                      borderRadius: '4px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      color: orderType === 'ESTABLECIMIENTO' ? '#155724' : '#004085'
                    }}>
                      <strong>{orderType === 'ESTABLECIMIENTO' ? '🍽️ Pedido en Establecimiento' : '🏍️ Pedido a Domicilio'}</strong>
                    </div>
                  )}
                </>
              )}

              {orderType === 'ESTABLECIMIENTO' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                    Mesa Disponible <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="tableId"
                    value={formData.tableId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                    disabled={editingOrder}
                  >
                    <option value="">Seleccione una mesa...</option>
                    {availableTables.map(table => (
                      <option key={table.id} value={table.id}>
                        Mesa {table.tableNumber} - {table.location || 'Sin ubicación'} (Capacidad: {table.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {orderType === 'DOMICILIO' && (
                <div style={{ 
                  marginBottom: '12px', 
                  padding: '12px', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  color: '#856404',
                  fontSize: '13px'
                }}>
                  ℹ️ <strong>Nota:</strong> Este pedido se creará automáticamente en el módulo de Deliveries con la dirección registrada del cliente.
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                  Agregar Ítems del Menú
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  onChange={(e) => {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }}
                  value=""
                >
                  <option value="">Seleccione un ítem...</option>
                  {menuItems.filter(item => item.available).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${parseFloat(item.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div style={{ 
                  marginBottom: '12px', 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px' }}>Ítems Seleccionados:</h4>
                  {selectedItems.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '6px',
                      padding: '6px',
                      backgroundColor: 'white',
                      borderRadius: '4px'
                    }}>
                      <span style={{ flex: 1, fontSize: '13px' }}>{getMenuItemName(item.menuItemId)}</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min="1"
                        style={{
                          width: '70px',
                          padding: '4px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value={ORDER_STATUS.PENDING}>Pendiente</option>
                  <option value={ORDER_STATUS.IN_PROGRESS}>En Proceso</option>
                  <option value={ORDER_STATUS.READY}>Listo</option>
                  <option value={ORDER_STATUS.DELIVERED}>Entregado</option>
                  <option value={ORDER_STATUS.CANCELLED}>Cancelado</option>
                </select>
              </div>

              <Input
                label="Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales del pedido"
              />

              {!editingOrder && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setClientStep('orderType');
                      setOrderType('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Cambiar tipo de pedido
                  </button>
                </div>
              )}
            </>
          ) : null}
        </Modal>
      </div>
    </Layout>
  );
};

export default Orders;
