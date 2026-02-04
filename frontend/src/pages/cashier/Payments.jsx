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
    paymentMethod: '',
    status: PAYMENT_STATUS.COMPLETED,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, ordersData, paymentMethodsData] = await Promise.all([
        paymentService.getAllPayments(),
        orderService.getAllOrders(),
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
    setFormData({
      orderId: orders[0]?.id || '',
      amount: '',
      paymentMethod: paymentMethods[0]?.name || '',
      status: PAYMENT_STATUS.COMPLETED,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      await paymentService.createPayment(formData);
      alert('Pago registrado exitosamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar pago');
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

  const getPaymentMethodBadge = (method) => {
    // Buscar el método de pago por nombre
    const paymentMethod = paymentMethods.find(pm => pm.name === method);
    
    // Iconos según el tipo
    const typeIcons = {
      EFECTIVO: '💵',
      TRANSFERENCIA: '🏦',
      TARJETA_CREDITO: '💳',
      TARJETA_DEBITO: '💳',
      OTRO: '📋',
    };
    
    if (paymentMethod) {
      const icon = typeIcons[paymentMethod.type] || '💰';
      return `${icon} ${paymentMethod.name}`;
    }
    
    return method;
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: '🟡 Pendiente',
      COMPLETED: '✅ Completado',
      CANCELLED: '🔴 Cancelado',
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
      render: (row) => getPaymentMethodBadge(row.paymentMethod) 
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
                {payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).length}
              </p>
            </div>
            <div className="summary-card">
              <h4>Total Recaudado</h4>
              <p className="summary-value">
                ${payments
                  .filter(p => p.status === PAYMENT_STATUS.COMPLETED)
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
                onChange={handleChange}
                className="input"
                required
              >
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    Orden #{order.id} - ${parseFloat(order.total || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Monto"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              required
            />

            <div className="input-group">
              <label className="input-label">
                Método de Pago <span className="required">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input"
                required
              >
                {paymentMethods.length === 0 && (
                  <option value="">No hay métodos de pago disponibles</option>
                )}
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.name}>
                    {method.name} - {method.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group col-span-2">
              <label className="input-label">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value={PAYMENT_STATUS.COMPLETED}>Completado</option>
                <option value={PAYMENT_STATUS.PENDING}>Pendiente</option>
              </select>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Payments;
