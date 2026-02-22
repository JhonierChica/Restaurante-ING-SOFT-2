import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OrdersIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import { menuService } from '../../services/menuService';
import { clientService } from '../../services/clientService';
import { categoryService } from '../../services/categoryService';
import { paymentService } from '../../services/paymentService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { ORDER_STATUS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [orders, setOrders] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [allTables, setAllTables] = useState([]); // Todas las mesas (incluida mesa de domicilios)
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Estado para el modal de cambio de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
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
  
  // Filtro por estado
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Estado para el modal de cobro
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentData, setPaymentData] = useState({
    paymentMethodId: '',
    amount: 0,
    receivedAmount: '',
    change: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tablesData, menuData, categoriesData, paymentMethodsData, paymentsData] = await Promise.all([
        orderService.getAllOrders(),
        tableService.getAllTables(),
        menuService.getAllMenuItems(),
        categoryService.getAllCategories(),
        paymentMethodService.getActivePaymentMethods(),
        paymentService.getAllPayments(),
      ]);
      
      // Filtrar pedidos que ya fueron pagados (tienen un pago con estado COMPLETADO)
      const paidOrderIds = new Set(
        paymentsData
          .filter(p => p.status === 'COMPLETADO')
          .map(p => p.orderId)
      );
      const unpaidOrders = ordersData.filter(order => !paidOrderIds.has(order.id));
      
      setOrders(unpaidOrders);
      setAllTables(tablesData); // Guardar todas las mesas
      // Filtrar solo mesas disponibles para selección normal
      const available = tablesData.filter(table => 
        table.status === 'DISPONIBLE' && table.isActive
      );
      setAvailableTables(available);
      setMenuItems(menuData);
      // Filtrar solo categorías activas
      const activeCategories = categoriesData.filter(cat => cat.status === 'A' || cat.active);
      setCategories(activeCategories);
      setPaymentMethods(paymentMethodsData);
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
    setSelectedCategory('');
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setClientStep('order');
    setSelectedCategory('');
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

  const handleToggleStatus = (order) => {
    setStatusOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusOrder || !newStatus) return;
    if (newStatus === statusOrder.status) {
      setShowStatusModal(false);
      return;
    }
    try {
      await orderService.updateOrderStatus(statusOrder.id, newStatus);
      const badge = getStatusBadge(newStatus);
      alert(`Estado del pedido #${statusOrder.id} actualizado a "${badge.text}"`);
      setShowStatusModal(false);
      setStatusOrder(null);
      loadData();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
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

  // === FUNCIONES DE COBRO ===
  const handleInitiatePayment = (order) => {
    setPaymentOrder(order);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPaymentStart = () => {
    if (!paymentOrder) {
      alert('Error: No se encontró el pedido para cobrar');
      setShowPaymentConfirm(false);
      return;
    }
    setShowPaymentConfirm(false);
    setPaymentData({
      paymentMethodId: '',
      amount: parseFloat(paymentOrder.total || 0),
      receivedAmount: '',
      change: 0,
    });
    setShowPaymentModal(true);
  };

  const handleReceivedAmountChange = (value) => {
    const received = parseFloat(value) || 0;
    const total = parseFloat(paymentOrder?.total || 0);
    const change = received - total;
    setPaymentData(prev => ({
      ...prev,
      receivedAmount: value,
      change: change >= 0 ? change : 0,
    }));
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentOrder || !paymentOrder.id) {
        alert('Error: No se encontró el pedido para cobrar');
        return;
      }
      if (!paymentData.paymentMethodId) {
        alert('Por favor seleccione un método de pago');
        return;
      }
      const received = parseFloat(paymentData.receivedAmount) || 0;
      const total = parseFloat(paymentData.amount);
      if (received < total) {
        alert(`El monto recibido ($${received.toFixed(2)}) es menor al total del pedido ($${total.toFixed(2)})`);
        return;
      }

      const payment = {
        orderId: parseInt(paymentOrder.id),
        paymentMethodId: parseInt(paymentData.paymentMethodId),
        amount: total,
      };

      await paymentService.createPayment(payment);
      alert(`✅ Pago registrado exitosamente\n\nTotal: $${total.toFixed(2)}\nRecibido: $${received.toFixed(2)}\nCambio: $${paymentData.change.toFixed(2)}`);
      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar pago: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddItem = (menuItemId) => {
    const menuItem = menuItems.find(item => item.id === parseInt(menuItemId));
    if (menuItem) {
      // Verificar si el item ya está en la lista
      const existingIndex = selectedItems.findIndex(item => item.menuItemId === menuItem.id);
      if (existingIndex >= 0) {
        // Si ya existe, incrementar la cantidad
        const newItems = [...selectedItems];
        newItems[existingIndex].quantity += 1;
        setSelectedItems(newItems);
      } else {
        // Si no existe, agregarlo con los datos completos
        setSelectedItems([...selectedItems, { 
          menuItemId: menuItem.id, 
          quantity: 1,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          categoryName: menuItem.categoryName
        }]);
      }
    }
  };

  // Filtrar items del menú por categoría seleccionada
  const getFilteredMenuItems = () => {
    if (!selectedCategory) return [];
    return menuItems.filter(item => 
      item.available && 
      item.categoryId === parseInt(selectedCategory)
    );
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

  const getMenuItemPrice = (menuItemId) => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item ? parseFloat(item.price) : 0;
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDIENTE: { emoji: '🟡', text: 'Pendiente', class: 'badge-warning' },
      EN_PREPARACION: { emoji: '🔵', text: 'En Proceso', class: 'badge-info' },
      LISTO: { emoji: '🟢', text: 'Listo', class: 'badge-success' },
      SERVIDO: { emoji: '✅', text: 'Servido', class: 'badge-primary' },
      CANCELADO: { emoji: '🔴', text: 'Cancelado', class: 'badge-danger' },
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
      // Usar el precio guardado en el item o buscarlo en el menú
      const price = item.price || getMenuItemPrice(item.menuItemId);
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

        {/* Filtro por estado */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginRight: '8px' }}>Filtrar por estado:</span>
          {[
            { value: 'TODOS', label: '📋 Todos', color: '#6c757d' },
            { value: ORDER_STATUS.PENDING, label: '🟡 Pendiente', color: '#f0ad4e' },
            { value: ORDER_STATUS.IN_PROGRESS, label: '🔵 En Proceso', color: '#5bc0de' },
            { value: ORDER_STATUS.READY, label: '🟢 Listo', color: '#5cb85c' },
            { value: ORDER_STATUS.DELIVERED, label: '✅ Servido', color: '#0275d8' },
            { value: ORDER_STATUS.CANCELLED, label: '🔴 Cancelado', color: '#d9534f' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '6px 14px',
                border: statusFilter === opt.value ? `2px solid ${opt.color}` : '1px solid #dee2e6',
                borderRadius: '20px',
                backgroundColor: statusFilter === opt.value ? `${opt.color}20` : 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: statusFilter === opt.value ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                color: statusFilter === opt.value ? opt.color : '#555',
              }}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
            Mostrando <strong>{statusFilter === 'TODOS' ? orders.length : orders.filter(o => o.status === statusFilter).length}</strong> pedido(s)
          </span>
        </div>

        <div className="profiles-grid">
          {orders.filter(order => statusFilter === 'TODOS' || order.status === statusFilter).map((order) => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <Card key={order.id}>
                <div className="profile-card" style={{ padding: '12px' }}>
                  <div className="profile-header" style={{ marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>Pedido #{order.id}</h3>
                    </div>
                    <span className={`badge ${statusBadge.class}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                      {statusBadge.emoji} {statusBadge.text}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div>
                      <strong>🍽️ Mesa:</strong> {order.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `${order.tableNumber || 'N/A'}`}
                    </div>
                    <div>
                      <strong>👤 Cliente:</strong> {order.clientName || 'N/A'}
                    </div>
                    
                    {/* Detalle de ítems */}
                    <div style={{ margin: '6px 0' }}>
                      <strong>🛒 Ítems ({order.items?.length || 0}):</strong>
                      {order.items && order.items.length > 0 ? (
                        <div style={{ 
                          marginTop: '4px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          padding: '6px',
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}>
                          {order.items.map((item, idx) => {
                            const itemName = item.menuItemName || getMenuItemName(item.menuItemId);
                            const itemPrice = item.menuItemPrice || item.unitPrice || getMenuItemPrice(item.menuItemId);
                            const subtotal = (parseFloat(itemPrice) || 0) * (item.quantity || 1);
                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 6px',
                                backgroundColor: 'white',
                                borderRadius: '3px',
                                marginBottom: '3px',
                                fontSize: '12px',
                                border: '1px solid #e9ecef'
                              }}>
                                <span style={{ fontWeight: '500', flex: 1 }}>{itemName}</span>
                                <span style={{ color: '#666', margin: '0 8px' }}>x{item.quantity}</span>
                                <span style={{ color: '#28a745', fontWeight: 'bold' }}>${subtotal.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ color: '#999', marginLeft: '4px' }}>Sin ítems</span>
                      )}
                    </div>

                    <div>
                      <strong>💵 Total:</strong>{' '}
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        ${parseFloat(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div style={{ 
                      marginTop: '4px',
                      padding: '6px 8px',
                      backgroundColor: order.notes ? '#fff8e1' : '#f5f5f5',
                      borderRadius: '4px',
                      border: `1px solid ${order.notes ? '#ffe082' : '#e0e0e0'}`,
                      fontSize: '12px'
                    }}>
                      <strong>📝 Notas:</strong>{' '}
                      <span style={{ color: order.notes ? '#333' : '#999', fontStyle: order.notes ? 'normal' : 'italic' }}>
                        {order.notes || 'No hay notas en este pedido'}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button 
                      className="icon-btn icon-btn-edit" 
                      onClick={() => handleEdit(order)}
                      title="Editar pedido"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className="icon-btn icon-btn-info"
                      onClick={() => handleToggleStatus(order)}
                      title="Cambiar estado"
                      style={{ cursor: 'pointer' }}
                    >
                      <ToggleIcon size={16} />
                    </button>
                    <button 
                      className="icon-btn icon-btn-danger" 
                      onClick={() => handleDelete(order)}
                      title="Eliminar pedido"
                    >
                      <DeleteIcon size={16} />
                    </button>
                    {order.status === ORDER_STATUS.DELIVERED && (
                      <button
                        onClick={() => handleInitiatePayment(order)}
                        style={{
                          marginLeft: 'auto',
                          padding: '6px 14px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        title="Realizar cobro del pedido"
                      >
                        💰 Realizar Cobro
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {orders.filter(order => statusFilter === 'TODOS' || order.status === statusFilter).length === 0 && (
          <div className="empty-state">
            <p>{statusFilter === 'TODOS' ? 'No hay pedidos registrados' : `No hay pedidos con estado "${getStatusBadge(statusFilter).text}"`}</p>
          </div>
        )}

        {/* Modal para cambiar estado del pedido */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => { setShowStatusModal(false); setStatusOrder(null); }}
          title={`Cambiar Estado — Pedido #${statusOrder?.id || ''}`}
          onConfirm={handleConfirmStatusChange}
          size="small"
        >
          {statusOrder && (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#555' }}>
                Estado actual: <strong>{getStatusBadge(statusOrder.status).emoji} {getStatusBadge(statusOrder.status).text}</strong>
              </p>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                Seleccionar nuevo estado:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { value: ORDER_STATUS.PENDING, label: 'Pendiente', emoji: '🟡', color: '#fff3cd', border: '#ffc107' },
                  { value: ORDER_STATUS.IN_PROGRESS, label: 'En Proceso', emoji: '🔵', color: '#cce5ff', border: '#b8daff' },
                  { value: ORDER_STATUS.READY, label: 'Listo', emoji: '🟢', color: '#d4edda', border: '#c3e6cb' },
                  { value: ORDER_STATUS.DELIVERED, label: 'Servido', emoji: '✅', color: '#d1ecf1', border: '#bee5eb' },
                  { value: ORDER_STATUS.CANCELLED, label: 'Cancelado', emoji: '🔴', color: '#f8d7da', border: '#f5c6cb' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewStatus(opt.value)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: newStatus === opt.value ? opt.color : 'white',
                      border: `2px solid ${newStatus === opt.value ? opt.border : '#dee2e6'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: newStatus === opt.value ? 'bold' : 'normal',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {newStatus === opt.value && <span style={{ marginLeft: 'auto' }}>✔</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>
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

              {/* Selector de Categorías */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                  📂 Seleccionar Categoría
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- Seleccione una categoría --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Productos de la categoría seleccionada */}
              {selectedCategory && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                    🍽️ Productos Disponibles
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '10px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    {getFilteredMenuItems().length > 0 ? (
                      getFilteredMenuItems().map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleAddItem(item.id)}
                          style={{
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = '#007bff';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = '#dee2e6';
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '16px', color: '#28a745', fontWeight: 'bold' }}>
                            ${parseFloat(item.price).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            Click para agregar
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '20px', 
                        color: '#666' 
                      }}>
                        No hay productos disponibles en esta categoría
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ítems Seleccionados con información completa */}
              {selectedItems.length > 0 && (
                <div style={{ 
                  marginBottom: '12px', 
                  padding: '12px', 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '8px',
                  border: '2px solid #4caf50'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🛒 Ítems del Pedido ({selectedItems.length})
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedItems.map((item, index) => {
                      const itemPrice = item.price || getMenuItemPrice(item.menuItemId);
                      const itemName = item.name || getMenuItemName(item.menuItemId);
                      const subtotal = itemPrice * item.quantity;
                      return (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          marginBottom: '8px',
                          padding: '10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #c8e6c9'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                              {itemName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              ${itemPrice.toFixed(2)} c/u
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                              style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              min="1"
                              style={{
                                width: '50px',
                                padding: '4px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                textAlign: 'center'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              +
                            </button>
                          </div>
                          <div style={{ 
                            minWidth: '70px', 
                            textAlign: 'right', 
                            fontWeight: 'bold', 
                            fontSize: '14px',
                            color: '#2e7d32'
                          }}>
                            ${subtotal.toFixed(2)}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total del pedido */}
                  <div style={{ 
                    marginTop: '12px', 
                    paddingTop: '12px', 
                    borderTop: '2px solid #4caf50',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                      Total del Pedido:
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#2e7d32' }}>
                      ${calculateOrderTotal(selectedItems).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

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

        {/* Confirmación de cobro */}
        <ConfirmDialog
          isOpen={showPaymentConfirm}
          onClose={() => { setShowPaymentConfirm(false); }}
          onConfirm={handleConfirmPaymentStart}
          title="Confirmar Cobro"
          message={`¿Está seguro de realizar el cobro del Pedido #${paymentOrder?.id || ''} por un total de $${parseFloat(paymentOrder?.total || 0).toFixed(2)}?`}
        />

        {/* Modal de Registrar Pago */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); setPaymentOrder(null); }}
          title={`💰 Registrar Pago — Pedido #${paymentOrder?.id || ''}`}
          onConfirm={handlePaymentSubmit}
          size="medium"
        >
          {paymentOrder && (
            <div>
              {/* Resumen del pedido */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#e8f5e9', 
                borderRadius: '8px',
                border: '1px solid #c8e6c9'
              }}>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                  <strong>📋 Pedido:</strong> #{paymentOrder.id}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                  <strong>👤 Cliente:</strong> {paymentOrder.clientName || 'N/A'}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                  <strong>🍽️ Tipo:</strong> {paymentOrder.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `Mesa ${paymentOrder.tableNumber || 'N/A'}`}
                </div>
                {/* Detalle de ítems */}
                {paymentOrder.items && paymentOrder.items.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #c8e6c9', paddingTop: '10px' }}>
                    <strong style={{ fontSize: '13px' }}>🛒 Detalle:</strong>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '6px' }}>
                      {paymentOrder.items.map((item, idx) => {
                        const name = item.menuItemName || item.name || 'Ítem';
                        const price = parseFloat(item.menuItemPrice || item.unitPrice || item.price || 0);
                        const qty = item.quantity || 1;
                        return (
                          <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '4px 8px', backgroundColor: 'white', borderRadius: '4px',
                            marginBottom: '3px', fontSize: '12px', border: '1px solid #e9ecef'
                          }}>
                            <span>{name} x{qty}</span>
                            <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>${(price * qty).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Total a pagar */}
              <div style={{
                textAlign: 'center', padding: '12px', marginBottom: '20px',
                backgroundColor: '#1b5e20', borderRadius: '8px', color: 'white'
              }}>
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>TOTAL A PAGAR</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  ${parseFloat(paymentOrder.total || 0).toFixed(2)}
                </div>
              </div>

              {/* Método de Pago */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  Método de Pago <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={paymentData.paymentMethodId}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethodId: e.target.value })}
                  style={{
                    width: '100%', padding: '10px',
                    border: '2px solid #28a745', borderRadius: '6px',
                    fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  <option value="">Seleccione un método de pago</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto Recibido */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  Monto Recibido <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  value={paymentData.receivedAmount}
                  onChange={(e) => handleReceivedAmountChange(e.target.value)}
                  placeholder="Ingrese el monto recibido"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%', padding: '12px',
                    border: `2px solid ${parseFloat(paymentData.receivedAmount || 0) >= parseFloat(paymentOrder.total || 0) ? '#28a745' : '#dc3545'}`,
                    borderRadius: '6px', fontSize: '18px', fontWeight: 'bold',
                    boxSizing: 'border-box', color: '#333'
                  }}
                />
                {paymentData.receivedAmount !== '' && parseFloat(paymentData.receivedAmount || 0) < parseFloat(paymentOrder.total || 0) && (
                  <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ El monto recibido es menor al total del pedido
                  </div>
                )}
              </div>

              {/* Cambio / Devuelta */}
              <div style={{
                padding: '15px', borderRadius: '8px',
                backgroundColor: paymentData.change > 0 ? '#fff3cd' : '#f8f9fa',
                border: `2px solid ${paymentData.change > 0 ? '#ffc107' : '#dee2e6'}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>CAMBIO / DEVUELTA</div>
                <div style={{
                  fontSize: '26px', fontWeight: 'bold',
                  color: paymentData.change > 0 ? '#856404' : '#6c757d'
                }}>
                  ${paymentData.change.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Orders;
