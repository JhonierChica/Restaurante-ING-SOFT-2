import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { OrdersIcon } from '../../components/common/Icons';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import { menuService } from '../../services/menuService';
import { clientService } from '../../services/clientService';
import { ORDER_STATUS } from '../../utils/constants';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
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
      // Filtrar solo mesas disponibles
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
    setFormData({
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

  const handleSubmit = async () => {
    try {
      if (!editingOrder) {
        // Validar campos requeridos del cliente
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
        
        if (!formData.tableId) {
          alert('Por favor seleccione una mesa');
          return;
        }
        
        if (selectedItems.length === 0) {
          alert('Por favor agregue al menos un ítem del menú');
          return;
        }
        
        // Crear nuevo pedido con cliente
        
        // 1. Crear el cliente primero
        const clientData = {
          name: formData.clientName.trim(),
          identificationNumber: formData.clientIdentification.trim(),
          phone: formData.clientPhone.trim(),
          address: formData.clientAddress?.trim() || '',
          email: '',
          notes: '',
        };
        
        console.log('Datos del cliente a enviar:', clientData);
        
        const createdClient = await clientService.createClient(clientData);
        
        console.log('Cliente creado:', createdClient);
        
        // 2. Crear el pedido con el cliente creado
        const orderData = {
          tableId: parseInt(formData.tableId),
          clientId: createdClient.id,
          items: selectedItems, // Cambio de menuItems a items
          notes: formData.notes,
        };
        
        console.log('Datos del pedido a enviar:', orderData);
        
        await orderService.createOrder(orderData);
        alert('Pedido creado exitosamente');
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
          items: selectedItems, // Cambio de menuItems a items
          notes: formData.notes,
        };
        
        await orderService.updateOrder(editingOrder.id, orderData);
        alert('Pedido actualizado exitosamente');
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar pedido';
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
      PENDING: '🟡 Pendiente',
      IN_PROGRESS: '🔵 En Proceso',
      READY: '🟢 Listo',
      DELIVERED: '✅ Entregado',
      CANCELLED: '🔴 Cancelado',
    };
    return badges[status] || status;
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
      render: (row) => getStatusBadge(row.status) 
    },
    { 
      header: 'Total', 
      render: (row) => `$${parseFloat(row.total || 0).toFixed(2)}` 
    },
  ];

  if (loading) return <Loading message="Cargando pedidos..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><OrdersIcon size={24} /> Gestión de Pedidos</>}
          actions={
            <Button onClick={handleAdd} disabled={availableTables.length === 0}>
              + Nuevo Pedido
            </Button>
          }
        >
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
          
          <Table
            columns={columns}
            data={orders}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
          onConfirm={handleSubmit}
          size="large"
        >
          {!editingOrder && (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '6px', fontSize: '14px' }}>
                📋 Datos del Cliente
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

              <h3 style={{ marginTop: '12px', marginBottom: '10px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '6px', fontSize: '14px' }}>
                🍽️ Datos del Pedido
              </h3>
            </>
          )}

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
        </Modal>
      </div>
    </Layout>
  );
};

export default Orders;
