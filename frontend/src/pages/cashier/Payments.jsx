import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { PaymentIcon } from '../../components/common/Icons';
import { paymentService } from '../../services/paymentService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { orderService } from '../../services/orderService';
import { PAYMENT_STATUS } from '../../utils/constants';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    paymentMethodId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, ordersData, paymentMethodsData] = await Promise.all([
        paymentService.getAllPayments(),
        orderService.getAllOrdersForPayments(), // Usar el nuevo método que incluye todas las órdenes
        paymentMethodService.getActivePaymentMethods(),
      ]);
      setPayments(paymentsData);
      setOrders(ordersData);
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // Validar que hay datos disponibles
    if (orders.length === 0) {
      alert('No hay órdenes disponibles para registrar pagos');
      return;
    }
    if (paymentMethods.length === 0) {
      alert('No hay métodos de pago disponibles. Por favor, configure al menos un método de pago.');
      return;
    }

    // Inicializar formulario con la primera orden y su monto
    const firstOrder = orders[0];
    setFormData({
      orderId: firstOrder.id,
      amount: firstOrder.total || 0,
      paymentMethodId: paymentMethods[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOrderChange = (e) => {
    const selectedOrderId = parseInt(e.target.value);
    const selectedOrder = orders.find(o => o.id === selectedOrderId);
    
    setFormData({
      ...formData,
      orderId: selectedOrderId,
      amount: selectedOrder?.total || 0,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validar que todos los campos requeridos estén completos
      if (!formData.orderId) {
        alert('Por favor seleccione una orden');
        return;
      }
      if (!formData.paymentMethodId) {
        alert('Por favor seleccione un método de pago');
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
      }

      // Preparar datos en el formato correcto para el backend
      const paymentData = {
        orderId: parseInt(formData.orderId),
        paymentMethodId: parseInt(formData.paymentMethodId),
        amount: parseFloat(formData.amount),
      };

      await paymentService.createPayment(paymentData);
      alert('Pago registrado exitosamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar pago: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getOrderInfo = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `Orden #${order.id}` : 'N/A';
  };

  const getPaymentMethodBadge = (methodName) => {
    // Mostrar el nombre del método de pago con icono genérico
    return `💰 ${methodName}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDIENTE: '🟡 Pendiente',
      COMPLETADO: '✅ Completado',
      CANCELADO: '🔴 Cancelado',
      FALLIDO: '❌ Fallido',
    };
    return badges[status] || status;
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { 
      header: 'Orden', 
      render: (row) => getOrderInfo(row.orderId) 
    },
    { 
      header: 'Monto', 
      render: (row) => `$${parseFloat(row.amount).toFixed(2)}` 
    },
    { 
      header: 'Método de Pago', 
      render: (row) => getPaymentMethodBadge(row.paymentMethodName) 
    },
    { 
      header: 'Estado', 
      render: (row) => getStatusBadge(row.status) 
    },
    { 
      header: 'Fecha', 
      render: (row) => row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A' 
    },
  ];

  if (loading) return <Loading message="Cargando pagos..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><PaymentIcon size={24} /> Gestión de Pagos</>}
          actions={
            <Button onClick={handleAdd}>
              + Registrar Pago
            </Button>
          }
        >
          <div className="payment-summary">
            <div className="summary-card">
              <h4>Total de Pagos</h4>
              <p className="summary-value">{payments.length}</p>
            </div>
            <div className="summary-card">
              <h4>Pagos Completados</h4>
              <p className="summary-value">
                {payments.filter(p => p.status === 'COMPLETADO').length}
              </p>
            </div>
            <div className="summary-card">
              <h4>Total Recaudado</h4>
              <p className="summary-value">
                ${payments
                  .filter(p => p.status === 'COMPLETADO')
                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <Table
            columns={columns}
            data={payments}
            actions={false}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Registrar Pago"
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="form-grid-2">
            <div className="input-group col-span-2">
              <label className="input-label">
                Orden <span className="required">*</span>
              </label>
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleOrderChange}
                className="input"
                required
              >
                <option value="">Seleccione una orden</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    Orden #{order.id} - {order.orderType === 'DOMICILIO' ? 'Domicilio' : `Mesa ${order.tableNumber}`} - Cliente: {order.clientName} - Total: ${parseFloat(order.total || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Monto Total"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              required
              readOnly
              title="El monto se llena automáticamente según la orden seleccionada"
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />

            <div className="input-group">
              <label className="input-label">
                Método de Pago <span className="required">*</span>
              </label>
              <select
                name="paymentMethodId"
                value={formData.paymentMethodId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccione un método</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Payments;
