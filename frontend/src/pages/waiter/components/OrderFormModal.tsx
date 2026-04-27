import React, { ChangeEvent } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import type {
  Order,
  OrderItem,
  Table,
  MenuItem,
  Category,
  Client,
  ClientStep,
  OrderFormData,
} from '../../../types';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  editingOrder: Order | null;
  formData: OrderFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

  // Client flow
  clientStep: ClientStep;
  setClientStep: (step: ClientStep) => void;
  existingClient: Client | null;
  searchingClient: boolean;
  orderType: string;
  setOrderType: (type: string) => void;
  searchExistingClient: () => void;
  createNewClientAndProceed: () => void;

  // Menu items
  availableTables: Table[];
  menuItems: MenuItem[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedItems: OrderItem[];
  getFilteredMenuItems: () => MenuItem[];
  handleAddItem: (id: number) => void;
  handleRemoveItem: (index: number) => void;
  handleQuantityChange: (index: number, qty: number | string) => void;
  getMenuItemName: (id: number) => string;
  getMenuItemPrice: (id: number) => number;
  calculateOrderTotal: (items: OrderItem[]) => number;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  editingOrder,
  formData,
  handleChange,
  clientStep,
  setClientStep,
  existingClient,
  searchingClient,
  orderType,
  setOrderType,
  searchExistingClient,
  createNewClientAndProceed,
  availableTables,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedItems,
  getFilteredMenuItems,
  handleAddItem,
  handleRemoveItem,
  handleQuantityChange,
  getMenuItemName,
  getMenuItemPrice,
  calculateOrderTotal,
}) => {
  const showOrderForm = ((!editingOrder && clientStep === 'order' && existingClient) || editingOrder);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
      onConfirm={onConfirm}
      size="large"
    >
      {/* Step 1: Client Selection */}
      {!editingOrder && clientStep === 'selection' && (
        <>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            👤 ¿El cliente es nuevo o ya está registrado?
          </h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
            <Button
              onClick={() => setClientStep('new')}
              style={{ padding: '20px 40px', fontSize: '16px', backgroundColor: '#28a745', minWidth: '200px' }}
            >
              ➕ Cliente Nuevo
            </Button>
            <Button
              onClick={() => setClientStep('existing')}
              style={{ padding: '20px 40px', fontSize: '16px', backgroundColor: '#007bff', minWidth: '200px' }}
            >
              🔍 Cliente Existente
            </Button>
          </div>
        </>
      )}

      {/* Step 2a: Search Existing Client */}
      {!editingOrder && clientStep === 'existing' && !existingClient && (
        <>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>🔍 Buscar Cliente Existente</h3>
          <Input
            label="Número de Identificación"
            name="clientIdentification"
            value={formData.clientIdentification}
            onChange={handleChange}
            required
            placeholder="Ingrese el número de identificación"
          />
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Button
              onClick={searchExistingClient}
              disabled={searchingClient || !formData.clientIdentification}
              style={{ minWidth: '200px' }}
            >
              {searchingClient ? 'Buscando...' : 'Buscar Cliente'}
            </Button>
          </div>
          <BackButton onClick={() => setClientStep('selection')} />
        </>
      )}

      {/* Step 2b: Order Type Selection */}
      {!editingOrder && clientStep === 'orderType' && existingClient && (
        <>
          <ClientBanner client={existingClient} />
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            🏠 ¿Dónde se entregará el pedido?
          </h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
            <Button
              onClick={() => { setOrderType('ESTABLECIMIENTO'); setTimeout(() => setClientStep('order'), 100); }}
              style={{ padding: '20px 40px', fontSize: '16px', backgroundColor: '#28a745', minWidth: '200px' }}
            >
              🍽️ En el Establecimiento
            </Button>
            <Button
              onClick={() => { setOrderType('DOMICILIO'); setTimeout(() => setClientStep('order'), 100); }}
              style={{ padding: '20px 40px', fontSize: '16px', backgroundColor: '#007bff', minWidth: '200px' }}
            >
              🏍️ A Domicilio
            </Button>
          </div>
          <BackButton onClick={() => { setClientStep('existing'); setOrderType(''); }} />
        </>
      )}

      {/* Step 2c: New Client Form */}
      {!editingOrder && clientStep === 'new' && (
        <>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '6px', fontSize: '14px' }}>
            ➕ Registrar Cliente Nuevo
          </h3>
          <div className="form-grid-2" style={{ marginBottom: '12px' }}>
            <Input label="Nombre Completo" name="clientName" value={formData.clientName} onChange={handleChange} required placeholder="Ej: Juan Pérez" />
            <Input label="Número de Identificación" name="clientIdentification" value={formData.clientIdentification} onChange={handleChange} required placeholder="Ej: 1234567890" />
            <Input label="Teléfono" name="clientPhone" value={formData.clientPhone} onChange={handleChange} required placeholder="Ej: 3001234567" />
            <Input label="Dirección" name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="Ej: Calle 123 #45-67" />
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Button onClick={createNewClientAndProceed} style={{ minWidth: '200px', backgroundColor: '#28a745' }}>
              Registrar y Continuar
            </Button>
          </div>
          <BackButton onClick={() => setClientStep('selection')} />
        </>
      )}

      {/* Step 3: Order Details */}
      {showOrderForm ? (
        <>
          {existingClient && (
            <>
              <ClientBanner client={existingClient} />
              <h3 style={{ marginTop: '12px', marginBottom: '10px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '6px', fontSize: '14px' }}>
                🍽️ Datos del Pedido
              </h3>
              {orderType && (
                <div style={{
                  padding: '10px',
                  backgroundColor: orderType === 'ESTABLECIMIENTO' ? '#d4edda' : '#cce5ff',
                  border: `1px solid ${orderType === 'ESTABLECIMIENTO' ? '#c3e6cb' : '#b8daff'}`,
                  borderRadius: '4px', marginBottom: '12px', fontSize: '13px',
                  color: orderType === 'ESTABLECIMIENTO' ? '#155724' : '#004085',
                }}>
                  <strong>{orderType === 'ESTABLECIMIENTO' ? '🍽️ Pedido en Establecimiento' : '🏍️ Pedido a Domicilio'}</strong>
                </div>
              )}
            </>
          )}

          {/* Table selector (only for dine-in) */}
          {orderType === 'ESTABLECIMIENTO' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                Mesa Disponible <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="tableId"
                value={formData.tableId}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                required
                disabled={!!editingOrder}
              >
                <option value="">Seleccione una mesa...</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.tableNumber} - {table.location || 'Sin ubicación'} (Capacidad: {table.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'DOMICILIO' && (
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontSize: '13px' }}>
              ℹ️ <strong>Nota:</strong> Este pedido se creará automáticamente en el módulo de Deliveries.
            </div>
          )}

          {/* Category selector */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>📂 Seleccionar Categoría</label>
            <select
              style={{ width: '100%', padding: '10px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">-- Seleccione una categoría --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Menu items grid */}
          {selectedCategory && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>🍽️ Productos Disponibles</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '250px', overflowY: 'auto', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                {getFilteredMenuItems().length > 0 ? (
                  getFilteredMenuItems().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddItem(item.id)}
                      style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#333' }}>{item.name}</div>
                      <div style={{ fontSize: '16px', color: '#28a745', fontWeight: 'bold' }}>${item.price.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Click para agregar</div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                    No hay productos disponibles en esta categoría
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected items list */}
          {selectedItems.length > 0 && (
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛒 Ítems del Pedido ({selectedItems.length})
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedItems.map((item, index) => {
                  const itemPrice = item.price || getMenuItemPrice(item.menuItemId);
                  const itemName = item.name || getMenuItemName(item.menuItemId);
                  const subtotal = itemPrice * item.quantity;
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{itemName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>${itemPrice.toFixed(2)} c/u</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button type="button" onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))} style={{ width: '28px', height: '28px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>-</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          min="1"
                          style={{ width: '50px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}
                        />
                        <button type="button" onClick={() => handleQuantityChange(index, item.quantity + 1)} style={{ width: '28px', height: '28px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>+</button>
                      </div>
                      <div style={{ minWidth: '70px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#2e7d32' }}>${subtotal.toFixed(2)}</div>
                      <button type="button" onClick={() => handleRemoveItem(index)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                    </div>
                  );
                })}
              </div>
              {/* Total */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #4caf50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Total del Pedido:</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#2e7d32' }}>${calculateOrderTotal(selectedItems).toFixed(2)}</span>
              </div>
            </div>
          )}

          <Input label="Notas" name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas adicionales del pedido" />

          {!editingOrder && (
            <BackButton onClick={() => { setClientStep('orderType'); setOrderType(''); }} label="← Cambiar tipo de pedido" />
          )}
        </>
      ) : null}
    </Modal>
  );
};

// ===================== SUB-COMPONENTS =====================
const ClientBanner: React.FC<{ client: Client }> = ({ client }) => (
  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', color: '#155724' }}>
    <strong>✅ Cliente: </strong>{client.name}<br />
    {client.phone && <><strong>📞 Teléfono: </strong>{client.phone}<br /></>}
    {client.identificationNumber && <><strong>🆔 Identificación: </strong>{client.identificationNumber}</>}
  </div>
);

const BackButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = '← Volver a selección' }) => (
  <div style={{ marginTop: '15px', textAlign: 'center' }}>
    <button
      type="button"
      onClick={onClick}
      style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
    >
      {label}
    </button>
  </div>
);

export default OrderFormModal;
