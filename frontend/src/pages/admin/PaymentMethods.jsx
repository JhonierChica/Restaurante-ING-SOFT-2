import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { PaymentIcon } from '../../components/common/Icons';
import { paymentMethodService } from '../../services/paymentMethodService';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EFECTIVO',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAllPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      alert('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      type: 'EFECTIVO',
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description || '',
      isActive: method.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (method) => {
    if (window.confirm(`¿Está seguro de eliminar el método de pago ${method.name}?`)) {
      try {
        await paymentMethodService.deletePaymentMethod(method.id);
        alert('Método de pago eliminado exitosamente');
        loadPaymentMethods();
      } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        alert('Error al eliminar método de pago');
      }
    }
  };

  const handleToggleStatus = async (method) => {
    try {
      await paymentMethodService.togglePaymentMethodStatus(method.id);
      alert('Estado actualizado exitosamente');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingMethod) {
        await paymentMethodService.updatePaymentMethod(editingMethod.id, formData);
        alert('Método de pago actualizado exitosamente');
      } else {
        await paymentMethodService.createPaymentMethod(formData);
        alert('Método de pago creado exitosamente');
      }
      setShowModal(false);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
      alert('Error al guardar método de pago');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getTypeBadge = (type) => {
    const badges = {
      EFECTIVO: '💵 Efectivo',
      TRANSFERENCIA: '🏦 Transferencia',
      TARJETA_CREDITO: '💳 Tarjeta Crédito',
      TARJETA_DEBITO: '💳 Tarjeta Débito',
      OTRO: '📋 Otro',
    };
    return badges[type] || type;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Activo</span>
    ) : (
      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Inactivo</span>
    );
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { 
      header: 'Tipo', 
      render: (item) => getTypeBadge(item.type)
    },
    { header: 'Descripción', field: 'description' },
    { 
      header: 'Estado', 
      render: (item) => getStatusBadge(item.isActive)
    },
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: handleEdit,
      variant: 'primary',
    },
    {
      label: (item) => item.isActive ? 'Desactivar' : 'Activar',
      onClick: handleToggleStatus,
      variant: 'secondary',
    },
    {
      label: 'Eliminar',
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  if (loading) return <Loading message="Cargando métodos de pago..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><PaymentIcon size={24} /> Gestión de Métodos de Pago</>}
          actions={
            <Button onClick={handleAdd}>
              + Nuevo Método de Pago
            </Button>
          }
        >
          <Table
            columns={columns}
            data={paymentMethods}
            actions={actions}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="form-grid-2">
            <Input
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Efectivo, Tarjeta Visa"
            />
            
            <div className="form-group">
              <label>Tipo</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción opcional del método de pago"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Activo</span>
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default PaymentMethods;
