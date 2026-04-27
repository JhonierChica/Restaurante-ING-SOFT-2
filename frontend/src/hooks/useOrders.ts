import { useState, useEffect, ChangeEvent } from 'react';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';
import { clientService } from '../services/clientService';
import { categoryService } from '../services/categoryService';
import { paymentService } from '../services/paymentService';
import { paymentMethodService } from '../services/paymentMethodService';
import { ORDER_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import type {
  Order,
  OrderItem,
  Table,
  MenuItem,
  Category,
  Client,
  PaymentMethod,
  Payment,
  ClientStep,
  OrderFormData,
  PaymentFormData,
  StatusBadge,
} from '../types';

const INITIAL_FORM: OrderFormData = {
  clientName: '',
  clientIdentification: '',
  clientPhone: '',
  clientAddress: '',
  tableId: '',
  status: ORDER_STATUS.PENDING,
  notes: '',
};

const INITIAL_PAYMENT: PaymentFormData = {
  paymentMethodId: '',
  amount: 0,
  receivedAmount: '',
  change: 0,
};

export function useOrders() {
  const { user } = useAuth();

  // --- Data State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Order Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // --- Client Flow ---
  const [clientStep, setClientStep] = useState<ClientStep>('selection');
  const [existingClient, setExistingClient] = useState<Client | null>(null);
  const [searchingClient, setSearchingClient] = useState(false);
  const [orderType, setOrderType] = useState('');

  // --- Status Modal ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  // --- Payment State ---
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData>(INITIAL_PAYMENT);

  // ===================== LOAD DATA =====================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tablesData, menuData, categoriesData, paymentMethodsData, paymentsData] =
        await Promise.all([
          orderService.getAllOrders(),
          tableService.getAllTables(),
          menuService.getAllMenuItems(),
          categoryService.getAllCategories(),
          paymentMethodService.getActivePaymentMethods(),
          paymentService.getAllPayments(),
        ]);

      const paidOrderIds = new Set(
        paymentsData
          .filter((p: Payment) => p.status === 'COMPLETADO')
          .map((p: Payment) => p.orderId),
      );
      setOrders(ordersData.filter((o: Order) => !paidOrderIds.has(o.id)));
      setAllTables(tablesData);
      setAvailableTables(tablesData.filter((t: Table) => t.status === 'DISPONIBLE' && t.isActive));
      setMenuItems(menuData);
      setCategories(categoriesData.filter((c: Category) => c.active !== false));
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ===================== HELPERS =====================
  const getMenuItemName = (menuItemId: number): string => {
    const item = menuItems.find((m) => m.id === menuItemId);
    return item ? item.name : 'N/A';
  };

  const getMenuItemPrice = (menuItemId: number): number => {
    const item = menuItems.find((m) => m.id === menuItemId);
    return item ? item.price : 0;
  };

  const getStatusBadge = (status: string): StatusBadge => {
    const badges: Record<string, StatusBadge> = {
      PENDIENTE: { emoji: '🟡', text: 'Pendiente', class: 'badge-warning' },
      EN_PREPARACION: { emoji: '🔵', text: 'En Proceso', class: 'badge-info' },
      LISTO: { emoji: '🟢', text: 'Listo', class: 'badge-success' },
      SERVIDO: { emoji: '✅', text: 'Servido', class: 'badge-primary' },
      CANCELADO: { emoji: '🔴', text: 'Cancelado', class: 'badge-danger' },
    };
    return badges[status] || { emoji: '', text: status, class: 'badge-secondary' };
  };

  const calculateOrderTotal = (items: OrderItem[]): number => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const price = item.price || getMenuItemPrice(item.menuItemId);
      return sum + price * item.quantity;
    }, 0);
  };

  const getFilteredMenuItems = (): MenuItem[] => {
    if (!selectedCategory) return [];
    return menuItems.filter(
      (item) => item.available && item.categoryId === parseInt(selectedCategory),
    );
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === 'TODOS' || o.status === statusFilter,
  );

  // ===================== ORDER CRUD =====================
  const handleAdd = () => {
    setEditingOrder(null);
    setClientStep('selection');
    setExistingClient(null);
    setOrderType('');
    setFormData({ ...INITIAL_FORM, tableId: availableTables[0]?.id || '' });
    setSelectedItems([]);
    setSelectedCategory('');
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setClientStep('order');
    setSelectedCategory('');
    setExistingClient({ id: order.clientId || 0, name: order.clientName || '', identificationNumber: '', phone: '', });
    setFormData({
      clientName: order.clientName || '',
      clientIdentification: '',
      clientPhone: '',
      clientAddress: '',
      tableId: order.tableId || '',
      status: order.status,
      notes: order.notes || '',
    });
    setSelectedItems(order.items || []);
    setShowModal(true);
  };

  const handleDelete = async (order: Order) => {
    if (window.confirm(`¿Está seguro de eliminar la orden #${order.id}?`)) {
      try {
        await orderService.deleteOrder(order.id);
        alert('Orden eliminada exitosamente');
        loadData();
      } catch (err) {
        console.error('Error al eliminar orden:', err);
        alert('Error al eliminar orden');
      }
    }
  };

  // ===================== STATUS FLOW =====================
  const openStatusModal = (order: Order) => {
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
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar estado');
    }
  };

  // ===================== CLIENT FLOW =====================
  const searchExistingClient = async () => {
    try {
      setSearchingClient(true);
      const clients = await clientService.getAllClients();
      const found = clients.find(
        (c: Client) => c.identificationNumber === formData.clientIdentification.trim(),
      );

      if (found) {
        setExistingClient(found);
        setFormData({
          ...formData,
          clientName: found.name,
          clientPhone: found.phone,
          clientAddress: found.address || '',
        });
        setClientStep('orderType');
        alert(`Cliente encontrado: ${found.name}`);
      } else {
        alert('Cliente no encontrado. ¿Desea registrarlo como cliente nuevo?');
        setClientStep('new');
      }
    } catch (err) {
      console.error('Error al buscar cliente:', err);
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
      setClientStep('orderType');
      alert(`Cliente registrado exitosamente: ${createdClient.name}`);
    } catch (err: any) {
      console.error('Error al crear cliente:', err);
      const msg = err.response?.data?.message || err.message || 'Error al registrar cliente';
      alert(`Error: ${msg}`);
    }
  };

  // ===================== MENU ITEMS =====================
  const handleAddItem = (menuItemId: number) => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const existingIndex = selectedItems.findIndex((item) => item.menuItemId === menuItem.id);
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: menuItem.id,
          quantity: 1,
          name: menuItem.name,
          price: menuItem.price,
          categoryName: menuItem.categoryName,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number | string) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = parseInt(String(quantity)) || 1;
    setSelectedItems(newItems);
  };

  // ===================== FORM CHANGE =====================
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===================== SUBMIT ORDER =====================
  const handleSubmit = async () => {
    try {
      if (!editingOrder) {
        if (clientStep === 'selection') {
          alert('Por favor seleccione si el cliente es nuevo o existente');
          return;
        }

        if (clientStep === 'existing' && !existingClient) {
          if (!formData.clientIdentification?.trim()) {
            alert('Por favor ingrese el número de identificación del cliente');
            return;
          }
          await searchExistingClient();
          return;
        }

        if (clientStep === 'new') {
          if (!formData.clientName?.trim()) { alert('Nombre del cliente obligatorio'); return; }
          if (!formData.clientIdentification?.trim()) { alert('Identificación obligatoria'); return; }
          if (!formData.clientPhone?.trim()) { alert('Teléfono obligatorio'); return; }
          await createNewClientAndProceed();
          return;
        }

        if (clientStep === 'order') {
          if (!user || !user.id) {
            alert('Error: Usuario no autenticado. Por favor inicie sesión nuevamente.');
            return;
          }
          if (orderType === 'ESTABLECIMIENTO' && !formData.tableId) {
            alert('Por favor seleccione una mesa');
            return;
          }
          if (selectedItems.length === 0) {
            alert('Por favor agregue al menos un ítem del menú');
            return;
          }

          let clientId = existingClient?.id;
          if (!clientId) {
            const createdClient = await clientService.createClient({
              name: formData.clientName.trim(),
              identificationNumber: formData.clientIdentification.trim(),
              phone: formData.clientPhone.trim(),
              address: formData.clientAddress?.trim() || '',
              email: '',
              notes: '',
            });
            clientId = createdClient.id;
          }

          let tableIdToUse = parseInt(String(formData.tableId));
          if (orderType === 'DOMICILIO') {
            const deliveryTable = allTables.find(
              (t) => t.tableNumber === 0 || t.location?.toUpperCase().includes('DOMICILIO'),
            );
            if (!deliveryTable) {
              alert('Error: No existe una mesa configurada para domicilios.');
              return;
            }
            tableIdToUse = deliveryTable.id;
          }

          await orderService.createOrder({
            userId: user.id,
            tableId: tableIdToUse,
            clientId,
            orderType,
            items: selectedItems,
            notes: formData.notes,
          });

          alert(
            orderType === 'DOMICILIO'
              ? 'Pedido a domicilio creado exitosamente. Consulta el módulo de Deliveries.'
              : 'Pedido creado exitosamente',
          );
          setShowModal(false);
          loadData();
        }
      } else {
        if (!formData.tableId) { alert('Por favor seleccione una mesa'); return; }
        if (selectedItems.length === 0) { alert('Agregue al menos un ítem'); return; }

        await orderService.updateOrder(editingOrder.id, {
          tableId: parseInt(String(formData.tableId)),
          status: formData.status,
          items: selectedItems,
          notes: formData.notes,
        });
        alert('Pedido actualizado exitosamente');
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      console.error('Error al guardar pedido:', err);
      const msg = err.response?.data?.message || err.message || 'Error al guardar pedido';
      alert(`Error: ${msg}`);
    }
  };

  // ===================== PAYMENT FLOW =====================
  const handleInitiatePayment = (order: Order) => {
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
      amount: paymentOrder.total || 0,
      receivedAmount: '',
      change: 0,
    });
    setShowPaymentModal(true);
  };

  const handleReceivedAmountChange = (value: string) => {
    const received = parseFloat(value) || 0;
    const total = paymentOrder?.total || 0;
    setPaymentData((prev) => ({
      ...prev,
      receivedAmount: value,
      change: received >= total ? received - total : 0,
    }));
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentOrder?.id) { alert('Error: No se encontró el pedido'); return; }
      if (!paymentData.paymentMethodId) { alert('Seleccione un método de pago'); return; }

      const received = parseFloat(String(paymentData.receivedAmount)) || 0;
      const total = paymentData.amount;
      if (received < total) {
        alert(`Monto recibido ($${received.toFixed(2)}) menor al total ($${total.toFixed(2)})`);
        return;
      }

      await paymentService.createPayment({
        orderId: paymentOrder.id,
        paymentMethodId: parseInt(String(paymentData.paymentMethodId)),
        amount: total,
      });

      alert(
        `✅ Pago registrado\n\nTotal: $${total.toFixed(2)}\nRecibido: $${received.toFixed(2)}\nCambio: $${paymentData.change.toFixed(2)}`,
      );
      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
    } catch (err: any) {
      console.error('Error al registrar pago:', err);
      alert('Error al registrar pago: ' + (err.response?.data?.message || err.message));
    }
  };

  // ===================== RETURN =====================
  return {
    // Data
    orders, filteredOrders, availableTables, allTables, menuItems,
    categories, paymentMethods, loading, user,

    // Order Modal
    showModal, setShowModal, editingOrder, formData, selectedItems,
    selectedCategory, setSelectedCategory, statusFilter, setStatusFilter,

    // Client Flow
    clientStep, setClientStep, existingClient,
    searchingClient, orderType, setOrderType,

    // Status Modal
    showStatusModal, setShowStatusModal, statusOrder, setStatusOrder,
    newStatus, setNewStatus,

    // Payment
    showPaymentConfirm, setShowPaymentConfirm,
    showPaymentModal, setShowPaymentModal,
    paymentOrder, paymentData, setPaymentData,

    // Actions
    handleAdd, handleEdit, handleDelete,
    openStatusModal, handleConfirmStatusChange,
    handleSubmit, handleChange,
    handleAddItem, handleRemoveItem, handleQuantityChange,
    searchExistingClient, createNewClientAndProceed,
    handleInitiatePayment, handleConfirmPaymentStart,
    handleReceivedAmountChange, handlePaymentSubmit,

    // Helpers
    getMenuItemName, getMenuItemPrice, getStatusBadge,
    calculateOrderTotal, getFilteredMenuItems,
  };
}
