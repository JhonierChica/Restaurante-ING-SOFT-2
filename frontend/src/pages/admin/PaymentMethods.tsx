import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { PaymentIcon } from '../../components/common/Icons';
import { paymentMethodService } from '../../services/paymentMethodService';
import type { PaymentMethod } from '../../types';

interface FormData {
  name: string;
  active: boolean;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    active: true,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAllPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      active: !!(method.active || method.status || method.isActive),
    });
    setShowModal(true);
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (window.confirm(`¿Está seguro de eliminar el método de pago ${method.name}?`)) {
      try {
        await paymentMethodService.deletePaymentMethod(method.id);
        loadPaymentMethods();
      } catch (err) {
        console.error('Error al eliminar método de pago:', err);
      }
    }
  };

  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      await paymentMethodService.togglePaymentMethodStatus(method.id);
      loadPaymentMethods();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingMethod) {
        await paymentMethodService.updatePaymentMethod(editingMethod.id, formData);
      } else {
        await paymentMethodService.createPaymentMethod(formData);
      }
      setShowModal(false);
      loadPaymentMethods();
    } catch (err) {
      console.error('Error al guardar método de pago:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="text-green-600 font-bold flex items-center gap-1">✓ Activo</span>
    ) : (
      <span className="text-red-500 font-bold flex items-center gap-1">✗ Inactivo</span>
    );
  };

  const columns = [
    { header: 'ID', field: 'id' as keyof PaymentMethod },
    { header: 'Nombre', field: 'name' as keyof PaymentMethod },
    {
      header: 'Estado',
      render: (item: PaymentMethod) => getStatusBadge(!!(item.active || item.status || item.isActive))
    },
  ];

  const actions = [
    {
      label: 'Editar',
      onClick: handleEdit,
      variant: 'primary' as const,
    },
    {
      label: (item: PaymentMethod) => (item.active || item.status || item.isActive) ? 'Desactivar' : 'Activar',
      onClick: handleToggleStatus,
      variant: 'secondary' as const,
    },
    {
      label: 'Eliminar',
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ];

  if (loading) return <Loading message="Cargando métodos de pago..." />;

  return (
    <Layout>
      <div className="page-container p-4 md:p-8">
        <Card
          title={<span className="flex items-center gap-2"><PaymentIcon size={24} className="text-blue-600" /> Gestión de Métodos de Pago</span>}
          actions={
            <Button onClick={handleAdd} className="font-bold py-2 px-4 rounded-xl">
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
          <div className="space-y-6">
            <Input
              label="Nombre del Método"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Efectivo, Tarjeta Visa, Bancolombia"
            />

            <div className="form-group flex items-center p-4 bg-gray-50 rounded-2xl border-2 border-transparent">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-bold text-gray-700">Método de pago activo</span>
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default PaymentMethods;