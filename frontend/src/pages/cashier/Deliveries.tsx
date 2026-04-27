import React, { useState, useEffect, ReactNode } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DeliveryIcon } from '../../components/common/Icons';
import { deliveryService } from '../../services/deliveryService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { paymentMethodService } from '../../services/paymentMethodService';
import type { Delivery, Order, Payment, PaymentMethod, PaymentFormData, DeliveryStatus } from '../../types';

type DeliveryFilter = 'TODOS' | DeliveryStatus;

interface DeliveryStatusOption {
  value: string;
  label: string;
  color: string;
}

const DELIVERY_STATUS_FILTERS: { value: DeliveryFilter; label: string; color: string }[] = [
  { value: 'TODOS', label: '📋 Todos', color: '#6c757d' },
  { value: 'PENDING', label: '⏳ Pendiente', color: '#f0ad4e' },
  { value: 'IN_TRANSIT', label: '🚀 En Tránsito', color: '#0275d8' },
  { value: 'DELIVERED', label: '✅ Entregado', color: '#5cb85c' },
  { value: 'CANCELLED', label: '❌ Cancelado', color: '#d9534f' },
];

const DELIVERY_STATUS_OPTIONS: DeliveryStatusOption[] = [
  { value: 'PENDING', label: '⏳ Pendiente', color: '#f0ad4e' },
  { value: 'IN_TRANSIT', label: '🚀 En Tránsito', color: '#0275d8' },
  { value: 'DELIVERED', label: '✅ Entregado', color: '#5cb85c' },
  { value: 'CANCELLED', label: '❌ Cancelado', color: '#d9534f' },
];

// ===================== HELPERS =====================
const formatDateTime = (dateTime: string | undefined): string => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getStatusBadge = (status: string): ReactNode => {
  const cfg: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pendiente', className: 'badge-warning' },
    IN_TRANSIT: { label: 'En Tránsito', className: 'badge-primary' },
    DELIVERED: { label: 'Entregado', className: 'badge-success' },
    CANCELLED: { label: 'Cancelado', className: 'badge-danger' },
  };
  const c = cfg[status] || { label: status, className: 'badge-secondary' };
  return <span className={`badge ${c.className}`}>{c.label}</span>;
};

// ===================== COMPONENT =====================
const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<number, Order>>({});
  const [loading, setLoading] = useState(true);
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<DeliveryFilter>('TODOS');

  // Delivery status modal
  const [showDeliveryStatusModal, setShowDeliveryStatusModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<DeliveryStatus | ''>('');

  // Payment state
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({ paymentMethodId: '', amount: 0, receivedAmount: '', change: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, paymentMethodsData, paymentsData] = await Promise.all([
        deliveryService.getAllDeliveries(),
        paymentMethodService.getActivePaymentMethods(),
        paymentService.getAllPayments(),
      ]);

      const paidOrderIds = new Set(
        paymentsData.filter((p: Payment) => p.status === 'COMPLETADO').map((p: Payment) => p.orderId),
      );
      const unpaid = deliveriesData.filter((d: Delivery) => !paidOrderIds.has(d.orderId));

      const map: Record<number, Order> = {};
      for (const delivery of unpaid) {
        try {
          map[delivery.orderId] = await orderService.getOrderById(delivery.orderId);
        } catch (err) {
          console.error(`Error al cargar pedido ${delivery.orderId}:`, err);
        }
      }

      setDeliveries(unpaid);
      setOrdersMap(map);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ===================== DELIVERY STATUS =====================
  const handleChangeDeliveryStatus = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewDeliveryStatus(delivery.status || 'PENDING');
    setShowDeliveryStatusModal(true);
  };

  const handleDeliveryStatusSubmit = async () => {
    if (!selectedDelivery || !newDeliveryStatus) return;
    try {
      await deliveryService.updateDeliveryStatus(selectedDelivery.id, newDeliveryStatus as DeliveryStatus);
      alert('Estado del domicilio actualizado exitosamente');
      setShowDeliveryStatusModal(false);
      setSelectedDelivery(null);
      loadData();
    } catch (err) {
      console.error('Error al actualizar estado del domicilio:', err);
      alert('Error al actualizar estado del domicilio');
    }
  };

  // ===================== PAYMENT FLOW =====================
  const handleInitiatePayment = (delivery: Delivery) => {
    const order = ordersMap[delivery.orderId];
    if (!order) { alert('No se pudo encontrar el pedido asociado'); return; }
    setPaymentOrder(order);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPaymentStart = () => {
    if (!paymentOrder) { alert('Error: No se encontró el pedido'); setShowPaymentConfirm(false); return; }
    setShowPaymentConfirm(false);
    setPaymentData({ paymentMethodId: '', amount: paymentOrder.total || 0, receivedAmount: '', change: 0 });
    setShowPaymentModal(true);
  };

  const handleReceivedAmountChange = (value: string) => {
    const received = parseFloat(value) || 0;
    const total = paymentOrder?.total || 0;
    setPaymentData((prev: PaymentFormData) => ({ ...prev, receivedAmount: value, change: received >= total ? received - total : 0 }));
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentOrder?.id) { alert('Error: No se encontró el pedido'); return; }
      if (!paymentData.paymentMethodId) { alert('Seleccione un método de pago'); return; }
      const received = parseFloat(String(paymentData.receivedAmount)) || 0;
      const total = Number(paymentData.amount) || 0;
      const totalStr: string = total.toFixed(2);
      const receivedStr: string = received.toFixed(2);
      const changeStr: string = Number(paymentData.change).toFixed(2);
      
      if (received < total) { alert(`Monto insuficiente: $${receivedStr} < $${totalStr}`); return; }

      await paymentService.createPayment({ 
        orderId: (paymentOrder as any).id, 
        paymentMethodId: parseInt(String(paymentData.paymentMethodId)), 
        amount: total 
      });
      
      alert(`✅ Pago registrado\n\nTotal: $${totalStr}\nRecibido: $${receivedStr}\nCambio: $${changeStr}`);
      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
    } catch (err: any) {
      console.error('Error al registrar pago:', err);
      alert('Error al registrar pago: ' + (err.response?.data?.message || err.message));
    }
  };

  // ===================== TABLE CONFIG =====================
  const filteredDeliveries = deliveryStatusFilter === 'TODOS' ? deliveries : deliveries.filter((d) => d.status === deliveryStatusFilter);

  const columns = [
    { header: 'ID', field: 'id' as keyof Delivery },
    { header: 'Pedido #', field: 'orderId' as keyof Delivery },
    { header: 'Cliente', render: (item: Delivery) => ordersMap[item.orderId]?.clientName || 'N/A' },
    { header: 'Teléfono', render: (item: Delivery) => ordersMap[item.orderId]?.clientPhone || 'N/A' },
    { header: 'Dirección', render: (item: Delivery) => ordersMap[item.orderId]?.clientAddress || 'N/A' },
    { header: 'Total Pedido', render: (item: Delivery) => { const o = ordersMap[item.orderId]; return o ? `$${(o.total || 0).toFixed(2)}` : 'N/A'; } },
    { header: 'Estado Domicilio', render: (item: Delivery) => getStatusBadge(item.status) },
    { header: 'Creado', render: (item: Delivery) => formatDateTime(item.createdAt) },
  ];

  const tableActions = [
    { label: 'Estado Domicilio', onClick: handleChangeDeliveryStatus, variant: 'primary' as const },
    { label: '💰 Cobrar', onClick: handleInitiatePayment, variant: 'success' as const, show: (d: Delivery) => d.status === 'DELIVERED' },
  ];

  if (loading) return <Loading message="Cargando domicilios..." />;

  const received = parseFloat(String(paymentData.receivedAmount)) || 0;
  const isPaymentValid = received >= (paymentOrder?.total || 0);

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={
            <>
              <DeliveryIcon size={24} /> Gestión de Domicilios
              <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                ({filteredDeliveries.length} de {deliveries.length} {deliveries.length === 1 ? 'domicilio' : 'domicilios'})
              </span>
            </>
          }
        >
          {/* Status filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginRight: '8px' }}>🏍️ Estado del Domicilio:</span>
            {DELIVERY_STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDeliveryStatusFilter(opt.value)}
                style={{
                  padding: '6px 14px',
                  border: deliveryStatusFilter === opt.value ? `2px solid ${opt.color}` : '1px solid #dee2e6',
                  borderRadius: '20px',
                  backgroundColor: deliveryStatusFilter === opt.value ? `${opt.color}20` : 'white',
                  cursor: 'pointer', fontSize: '13px',
                  fontWeight: deliveryStatusFilter === opt.value ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  color: deliveryStatusFilter === opt.value ? opt.color : '#555',
                }}
              >
                {opt.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
              Mostrando <strong>{filteredDeliveries.length}</strong> de {deliveries.length}
            </span>
          </div>

          <Table columns={columns} data={filteredDeliveries} actions={tableActions} />
        </Card>

        {/* Status change modal */}
        <Modal
          isOpen={showDeliveryStatusModal}
          onClose={() => { setShowDeliveryStatusModal(false); setSelectedDelivery(null); }}
          title={`Cambiar Estado del Domicilio — #${selectedDelivery?.id || ''}`}
          onConfirm={handleDeliveryStatusSubmit}
          size="small"
        >
          {selectedDelivery && (
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                Pedido #{selectedDelivery.orderId} — Estado actual: <strong>{getStatusBadge(selectedDelivery.status)}</strong>
              </p>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>Seleccionar nuevo estado:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DELIVERY_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewDeliveryStatus(opt.value as DeliveryStatus)}
                    style={{
                      padding: '10px 15px',
                      border: newDeliveryStatus === opt.value ? `3px solid ${opt.color}` : '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: newDeliveryStatus === opt.value ? `${opt.color}20` : 'white',
                      cursor: 'pointer', textAlign: 'left', fontSize: '14px',
                      fontWeight: newDeliveryStatus === opt.value ? 'bold' : 'normal',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Payment confirm */}
        <ConfirmDialog
          isOpen={showPaymentConfirm}
          onClose={() => setShowPaymentConfirm(false)}
          onConfirm={handleConfirmPaymentStart}
          title="Confirmar Cobro"
          message={`¿Cobrar Pedido #${paymentOrder?.id || ''} por $${Number(paymentOrder?.total || 0).toFixed(2)}?`}
        />

        {/* Payment modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); setPaymentOrder(null); }}
          title={`💰 Registrar Pago — Pedido #${paymentOrder?.id || ''}`}
          onConfirm={handlePaymentSubmit}
          size="medium"
        >
          {paymentOrder && (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}><strong>📋 Pedido:</strong> #{paymentOrder.id}</div>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}><strong>👤 Cliente:</strong> {paymentOrder.clientName || 'N/A'}</div>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}><strong>🏍️ Tipo:</strong> Domicilio</div>
                {paymentOrder.items?.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #c8e6c9', paddingTop: '10px' }}>
                    <strong style={{ fontSize: '13px' }}>🛒 Detalle:</strong>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '6px' }}>
                      {paymentOrder.items.map((item, idx) => {
                        const name = item.menuItemName || item.name || 'Ítem';
                        const price = item.menuItemPrice || item.unitPrice || item.price || 0;
                        const qty = item.quantity || 1;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'white', borderRadius: '4px', marginBottom: '3px', fontSize: '12px', border: '1px solid #e9ecef' }}>
                            <span>{name} x{qty}</span>
                            <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>${(price * qty).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', padding: '12px', marginBottom: '20px', backgroundColor: '#1b5e20', borderRadius: '8px', color: 'white' }}>
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>TOTAL A PAGAR</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${(paymentOrder.total || 0).toFixed(2)}</div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>Método de Pago <span style={{ color: 'red' }}>*</span></label>
                <select value={paymentData.paymentMethodId} onChange={(e) => setPaymentData({ ...paymentData, paymentMethodId: e.target.value })} style={{ width: '100%', padding: '10px', border: '2px solid #28a745', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <option value="">Seleccione un método de pago</option>
                  {paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>Monto Recibido <span style={{ color: 'red' }}>*</span></label>
                <input type="number" value={paymentData.receivedAmount} onChange={(e) => handleReceivedAmountChange(e.target.value)} placeholder="Ingrese el monto recibido" min="0" step="0.01" style={{ width: '100%', padding: '12px', border: `2px solid ${isPaymentValid ? '#28a745' : '#dc3545'}`, borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', boxSizing: 'border-box', color: '#333' }} />
                {paymentData.receivedAmount !== '' && !isPaymentValid && (
                  <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>⚠️ El monto recibido es menor al total</div>
                )}
              </div>
              <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: paymentData.change > 0 ? '#fff3cd' : '#f8f9fa', border: `2px solid ${paymentData.change > 0 ? '#ffc107' : '#dee2e6'}`, textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>CAMBIO / DEVUELTA</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: paymentData.change > 0 ? '#856404' : '#6c757d' }}>${paymentData.change.toFixed(2)}</div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Deliveries;
