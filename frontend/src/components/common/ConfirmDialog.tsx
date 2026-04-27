import React from 'react';
import { DeleteIcon, ToggleIcon } from './Icons';
import '../../styles/ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
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
    <div className="confirm-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`confirm-dialog bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full transform transition-all animate-in fade-in zoom-in duration-200 border-b-4 ${type === 'danger' ? 'border-red-500' : 'border-amber-500'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header p-6 flex flex-col items-center text-center gap-4">
          <div className={`confirm-icon-container p-4 rounded-full ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            {getIcon()}
          </div>
          <div className="confirm-content space-y-2">
            <h3 className="confirm-title text-xl font-black text-gray-800">{title}</h3>
            <p className="confirm-message text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="confirm-actions p-4 bg-gray-50 flex gap-3">
          <button 
            className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl shadow-lg transform active:scale-95 transition-all ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;