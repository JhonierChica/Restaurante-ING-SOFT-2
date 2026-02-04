import React from 'react';
import Button from './Button';
import '../../styles/Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'Guardar',
  size = 'medium',
  showActions = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {showActions && (
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            {onConfirm && (
              <Button variant="primary" onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
