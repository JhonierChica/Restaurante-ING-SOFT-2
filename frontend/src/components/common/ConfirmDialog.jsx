import React from 'react';
import '../../styles/ConfirmDialog.css';
import { DeleteIcon, ToggleIcon } from './Icons';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // 'warning', 'danger', 'info'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <DeleteIcon size={48} className="confirm-icon-danger" />;
      case 'warning':
        return <ToggleIcon size={48} className="confirm-icon-warning" />;
      default:
        return null;
    }
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className={`confirm-dialog confirm-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-container">
          {getIcon()}
        </div>
        
        <div className="confirm-content">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`confirm-btn confirm-btn-${type}`} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
