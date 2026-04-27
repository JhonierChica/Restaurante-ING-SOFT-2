import React from 'react';
import { EditIcon, DeleteIcon, ToggleIcon } from '../../../components/common/Icons';
import { ORDER_STATUS } from '../../../utils/constants';
import type { Order, StatusBadge } from '../../../types';
import Card from '../../../components/common/Card';

interface OrderCardProps {
  order: Order;
  getStatusBadge: (status: string) => StatusBadge;
  getMenuItemName: (id: number) => string;
  getMenuItemPrice: (id: number) => number;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onToggleStatus: (order: Order) => void;
  onInitiatePayment: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusBadge,
  getMenuItemName,
  getMenuItemPrice,
  onEdit,
  onDelete,
  onToggleStatus,
  onInitiatePayment,
}) => {
  const statusBadge = getStatusBadge(order.status);
  const items = order.items || [];

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-black text-gray-800">Pedido #{order.id}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString('es-CO')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusBadge.class}`}>
          {statusBadge.emoji} {statusBadge.text}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Mesa / Tipo</span>
            <p className="font-bold text-gray-800 text-sm">
              {order.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `🪑 Mesa ${order.tableNumber || 'N/A'}`}
            </p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Cliente</span>
            <p className="font-bold text-gray-800 text-sm truncate">{order.clientName || 'General'}</p>
          </div>
        </div>

        {/* Items List */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Comanda ({items.length})</span>
          <div className="bg-white border-2 border-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-[160px] overflow-y-auto custom-scrollbar">
            {items.length > 0 ? items.map((item, idx) => {
              const itemName = item.menuItemName || item.name || getMenuItemName(item.menuItemId);
              const itemPrice = item.menuItemPrice || item.unitPrice || item.price || getMenuItemPrice(item.menuItemId);
              const subtotal = (itemPrice || 0) * (item.quantity || 1);
              return (
                <div key={idx} className="flex justify-between items-center p-3 hover:bg-blue-50/30 transition-colors">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-700 leading-tight">{itemName}</p>
                    <p className="text-[10px] text-gray-400">Cant: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-blue-600">${subtotal.toLocaleString('es-CO')}</span>
                </div>
              );
            }) : (
              <div className="p-4 text-center text-xs text-gray-400 italic">No hay ítems en la comanda</div>
            )}
          </div>
        </div>

        {/* Total & Notes */}
        <div className="flex items-center justify-between p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total</span>
          <span className="text-xl font-black">${(order.total || 0).toLocaleString('es-CO')}</span>
        </div>

        {order.notes && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
             <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">📝 Observaciones</span>
             <p className="text-xs text-amber-800 italic leading-relaxed">"{order.notes}"</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 pt-4 mt-4 border-t border-gray-50 flex-wrap">
        <button className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100" onClick={() => onEdit(order)} title="Editar pedido">
          <EditIcon size={18} />
        </button>
        <button className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100" onClick={() => onToggleStatus(order)} title="Cambiar estado">
          <ToggleIcon size={18} />
        </button>
        <button className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100" onClick={() => onDelete(order)} title="Eliminar pedido">
          <DeleteIcon size={18} />
        </button>

        {order.status === ORDER_STATUS.DELIVERED && (
          <button
            onClick={() => onInitiatePayment(order)}
            className="w-full mt-2 flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            💰 Realizar Cobro
          </button>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;