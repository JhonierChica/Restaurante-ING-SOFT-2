import React from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OrdersIcon } from '../../components/common/Icons';
import { ORDER_STATUS } from '../../utils/constants';
import { useOrders } from '../../hooks/useOrders';

import OrderCard from './components/OrderCard';
import StatusChangeModal from './components/StatusChangeModal';
import PaymentModal from './components/PaymentModal';
import OrderFormModal from './components/OrderFormModal';

const STATUS_FILTERS = [
  { value: 'TODOS', label: '📋 Todos', color: '#6c757d' },
  { value: ORDER_STATUS.PENDING, label: '🟡 Pendiente', color: '#f0ad4e' },
  { value: ORDER_STATUS.IN_PROGRESS, label: '🔵 En Proceso', color: '#5bc0de' },
  { value: ORDER_STATUS.READY, label: '🟢 Listo', color: '#5cb85c' },
  { value: ORDER_STATUS.DELIVERED, label: '✅ Servido', color: '#0275d8' },
  { value: ORDER_STATUS.CANCELLED, label: '🔴 Cancelado', color: '#d9534f' },
];

const Orders: React.FC = () => {
  const hook = useOrders();

  if (hook.loading) return <Loading message="Cargando pedidos..." />;

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1><OrdersIcon size={32} /> Gestión de Pedidos</h1>
            <p>Administra los pedidos del restaurante</p>
          </div>
          <Button onClick={hook.handleAdd} disabled={hook.availableTables.length === 0}>
            + Nuevo Pedido
          </Button>
        </div>

        {/* No tables warning */}
        {hook.availableTables.length === 0 && (
          <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
            ⚠️ No hay mesas disponibles en este momento
          </div>
        )}

        {/* Status filter bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginRight: '8px' }}>
            Filtrar por estado:
          </span>
          {STATUS_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => hook.setStatusFilter(opt.value)}
              style={{
                padding: '6px 14px',
                border: hook.statusFilter === opt.value ? `2px solid ${opt.color}` : '1px solid #dee2e6',
                borderRadius: '20px',
                backgroundColor: hook.statusFilter === opt.value ? `${opt.color}20` : 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: hook.statusFilter === opt.value ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                color: hook.statusFilter === opt.value ? opt.color : '#555',
              }}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
            Mostrando <strong>{hook.filteredOrders.length}</strong> pedido(s)
          </span>
        </div>

        {/* Order cards grid */}
        <div className="profiles-grid">
          {hook.filteredOrders.map((order) => (
            <Card key={order.id}>
              <OrderCard
                order={order}
                getStatusBadge={hook.getStatusBadge}
                getMenuItemName={hook.getMenuItemName}
                getMenuItemPrice={hook.getMenuItemPrice}
                onEdit={hook.handleEdit}
                onDelete={hook.handleDelete}
                onToggleStatus={hook.openStatusModal}
                onInitiatePayment={hook.handleInitiatePayment}
              />
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {hook.filteredOrders.length === 0 && (
          <div className="empty-state">
            <p>
              {hook.statusFilter === 'TODOS'
                ? 'No hay pedidos registrados'
                : `No hay pedidos con estado "${hook.getStatusBadge(hook.statusFilter).text}"`}
            </p>
          </div>
        )}

        {/* Status Change Modal */}
        <StatusChangeModal
          isOpen={hook.showStatusModal}
          statusOrder={hook.statusOrder}
          newStatus={hook.newStatus}
          onClose={() => { hook.setShowStatusModal(false); hook.setStatusOrder(null); }}
          onConfirm={hook.handleConfirmStatusChange}
          onSelectStatus={hook.setNewStatus}
          getStatusBadge={hook.getStatusBadge}
        />

        {/* Order Form Modal */}
        <OrderFormModal
          isOpen={hook.showModal}
          onClose={() => hook.setShowModal(false)}
          onConfirm={hook.handleSubmit}
          editingOrder={hook.editingOrder}
          formData={hook.formData}
          handleChange={hook.handleChange}
          clientStep={hook.clientStep}
          setClientStep={hook.setClientStep}
          existingClient={hook.existingClient}
          searchingClient={hook.searchingClient}
          orderType={hook.orderType}
          setOrderType={hook.setOrderType}
          searchExistingClient={hook.searchExistingClient}
          createNewClientAndProceed={hook.createNewClientAndProceed}
          availableTables={hook.availableTables}
          menuItems={hook.menuItems}
          categories={hook.categories}
          selectedCategory={hook.selectedCategory}
          setSelectedCategory={hook.setSelectedCategory}
          selectedItems={hook.selectedItems}
          getFilteredMenuItems={hook.getFilteredMenuItems}
          handleAddItem={hook.handleAddItem}
          handleRemoveItem={hook.handleRemoveItem}
          handleQuantityChange={hook.handleQuantityChange}
          getMenuItemName={hook.getMenuItemName}
          getMenuItemPrice={hook.getMenuItemPrice}
          calculateOrderTotal={hook.calculateOrderTotal}
        />

        {/* Payment Confirm Dialog */}
        <ConfirmDialog
          isOpen={hook.showPaymentConfirm}
          onClose={() => hook.setShowPaymentConfirm(false)}
          onConfirm={hook.handleConfirmPaymentStart}
          title="Confirmar Cobro"
          message={`¿Está seguro de realizar el cobro del Pedido #${hook.paymentOrder?.id || ''} por un total de $${(hook.paymentOrder?.total || 0).toFixed(2)}?`}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={hook.showPaymentModal}
          paymentOrder={hook.paymentOrder}
          paymentData={hook.paymentData}
          paymentMethods={hook.paymentMethods}
          onClose={() => { hook.setShowPaymentModal(false); }}
          onConfirm={hook.handlePaymentSubmit}
          onMethodChange={(val) => hook.setPaymentData({ ...hook.paymentData, paymentMethodId: val })}
          onReceivedAmountChange={hook.handleReceivedAmountChange}
        />
      </div>
    </Layout>
  );
};

export default Orders;