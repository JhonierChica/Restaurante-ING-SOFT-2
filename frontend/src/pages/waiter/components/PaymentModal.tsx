import React from 'react';
import Modal from '../../../components/common/Modal';
import type { Order, PaymentMethod, PaymentFormData } from '../../../types';

interface PaymentModalProps {
  isOpen: boolean;
  paymentOrder: Order | null;
  paymentData: PaymentFormData;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onConfirm: () => void;
  onMethodChange: (value: string) => void;
  onReceivedAmountChange: (value: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  paymentOrder,
  paymentData,
  paymentMethods,
  onClose,
  onConfirm,
  onMethodChange,
  onReceivedAmountChange,
}) => {
  if (!paymentOrder) return null;

  const total = paymentOrder.total || 0;
  const received = parseFloat(String(paymentData.receivedAmount)) || 0;
  const isValid = received >= total;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`💰 Registrar Pago — Pedido #${paymentOrder.id}`}
      onConfirm={onConfirm}
      size="medium"
    >
      <div>
        {/* Order summary */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
          <div style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>📋 Pedido:</strong> #{paymentOrder.id}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>👤 Cliente:</strong> {paymentOrder.clientName || 'N/A'}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>🍽️ Tipo:</strong>{' '}
            {paymentOrder.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `Mesa ${paymentOrder.tableNumber || 'N/A'}`}
          </div>

          {/* Items breakdown */}
          {paymentOrder.items && paymentOrder.items.length > 0 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid #c8e6c9', paddingTop: '10px' }}>
              <strong style={{ fontSize: '13px' }}>🛒 Detalle:</strong>
              <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '6px' }}>
                {paymentOrder.items.map((item, idx) => {
                  const name = item.menuItemName || item.name || 'Ítem';
                  const price = item.menuItemPrice || item.unitPrice || item.price || 0;
                  const qty = item.quantity || 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '4px 8px', backgroundColor: 'white', borderRadius: '4px',
                        marginBottom: '3px', fontSize: '12px', border: '1px solid #e9ecef',
                      }}
                    >
                      <span>{name} x{qty}</span>
                      <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>${(price * qty).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{ textAlign: 'center', padding: '12px', marginBottom: '20px', backgroundColor: '#1b5e20', borderRadius: '8px', color: 'white' }}>
          <div style={{ fontSize: '13px', marginBottom: '4px' }}>TOTAL A PAGAR</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${total.toFixed(2)}</div>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            Método de Pago <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            value={paymentData.paymentMethodId}
            onChange={(e) => onMethodChange(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '2px solid #28a745', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="">Seleccione un método de pago</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>

        {/* Received amount */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            Monto Recibido <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            value={paymentData.receivedAmount}
            onChange={(e) => onReceivedAmountChange(e.target.value)}
            placeholder="Ingrese el monto recibido"
            min="0"
            step="0.01"
            style={{
              width: '100%', padding: '12px',
              border: `2px solid ${isValid ? '#28a745' : '#dc3545'}`,
              borderRadius: '6px', fontSize: '18px', fontWeight: 'bold',
              boxSizing: 'border-box', color: '#333',
            }}
          />
          {paymentData.receivedAmount !== '' && !isValid && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ El monto recibido es menor al total del pedido
            </div>
          )}
        </div>

        {/* Change */}
        <div
          style={{
            padding: '15px', borderRadius: '8px',
            backgroundColor: paymentData.change > 0 ? '#fff3cd' : '#f8f9fa',
            border: `2px solid ${paymentData.change > 0 ? '#ffc107' : '#dee2e6'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>CAMBIO / DEVUELTA</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: paymentData.change > 0 ? '#856404' : '#6c757d' }}>
            ${paymentData.change.toFixed(2)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;