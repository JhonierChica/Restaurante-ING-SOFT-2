import React from 'react';
import Modal from '../../../components/common/Modal';
import { ORDER_STATUS } from '../../../utils/constants';
import type { Order, StatusBadge } from '../../../types';

interface StatusChangeModalProps {
  isOpen: boolean;
  statusOrder: Order | null;
  newStatus: string;
  onClose: () => void;
  onConfirm: () => void;
  onSelectStatus: (status: string) => void;
  getStatusBadge: (status: string) => StatusBadge;
}

const STATUS_OPTIONS = [
  { value: ORDER_STATUS.PENDING, label: 'Pendiente', emoji: '🟡', color: '#fff3cd', border: '#ffc107' },
  { value: ORDER_STATUS.IN_PROGRESS, label: 'En Proceso', emoji: '🔵', color: '#cce5ff', border: '#b8daff' },
  { value: ORDER_STATUS.READY, label: 'Listo', emoji: '🟢', color: '#d4edda', border: '#c3e6cb' },
  { value: ORDER_STATUS.DELIVERED, label: 'Servido', emoji: '✅', color: '#d1ecf1', border: '#bee5eb' },
  { value: ORDER_STATUS.CANCELLED, label: 'Cancelado', emoji: '🔴', color: '#f8d7da', border: '#f5c6cb' },
];

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  statusOrder,
  newStatus,
  onClose,
  onConfirm,
  onSelectStatus,
  getStatusBadge,
}) => {
  if (!statusOrder) return null;

  const currentBadge = getStatusBadge(statusOrder.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cambiar Estado — Pedido #${statusOrder.id}`}
      onConfirm={onConfirm}
      size="small"
    >
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#555' }}>
          Estado actual: <strong>{currentBadge.emoji} {currentBadge.text}</strong>
        </p>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          Seleccionar nuevo estado:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectStatus(opt.value)}
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
                gap: '8px',
              }}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
              {newStatus === opt.value && <span style={{ marginLeft: 'auto' }}>✔</span>}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default StatusChangeModal;
