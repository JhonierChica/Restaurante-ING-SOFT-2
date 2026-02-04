import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { DeliveryIcon } from '../../components/common/Icons';
import { deliveryService } from '../../services/deliveryService';
import { orderService } from '../../services/orderService';
import { employeeService } from '../../services/employeeService';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    clientName: '',
    clientPhone: '',
    deliveryAddress: '',
    addressReference: '',
    neighborhood: '',
    city: '',
    deliveryFee: '',
    totalAmount: '',
    deliveryPersonId: '',
    estimatedDeliveryTime: '',
  });
  const [statusData, setStatusData] = useState({
    status: 'PENDING',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, ordersData, employeesData] = await Promise.all([
        deliveryService.getAllDeliveries(),
        orderService.getAllOrders(),
        employeeService.getAllEmployees(),
      ]);
      setDeliveries(deliveriesData);
      setOrders(ordersData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDelivery(null);
    setFormData({
      orderId: '',
      clientName: '',
      clientPhone: '',
      deliveryAddress: '',
      addressReference: '',
      neighborhood: '',
      city: '',
      deliveryFee: '',
      totalAmount: '',
      deliveryPersonId: '',
      estimatedDeliveryTime: '',
    });
    setShowModal(true);
  };

  const handleChangeStatus = (delivery) => {
    setSelectedDelivery(delivery);
    setStatusData({
      status: delivery.status,
    });
    setShowStatusModal(true);
  };

  const handleDelete = async (delivery) => {
    if (window.confirm(`¿Está seguro de eliminar el domicilio #${delivery.id}?`)) {
      try {
        await deliveryService.deleteDelivery(delivery.id);
        alert('Domicilio eliminado exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar domicilio:', error);
        alert('Error al eliminar domicilio');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await deliveryService.createDelivery(formData);
      alert('Domicilio creado exitosamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al crear domicilio:', error);
      alert('Error al crear domicilio');
    }
  };

  const handleStatusSubmit = async () => {
    try {
      await deliveryService.updateDeliveryStatus(selectedDelivery.id, statusData);
      alert('Estado actualizado exitosamente');
      setShowStatusModal(false);
      loadData();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusChange = (e) => {
    setStatusData({
      ...statusData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: '🟡 Pendiente',
      PREPARING: '🔵 Preparando',
      IN_TRANSIT: '🚚 En Tránsito',
      DELIVERED: '✅ Entregado',
      CANCELLED: '🔴 Cancelado',
    };
    return badges[status] || status;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value || 0);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Cliente', field: 'clientName' },
    { header: 'Teléfono', field: 'clientPhone' },
    { header: 'Dirección', field: 'deliveryAddress' },
    { header: 'Barrio', field: 'neighborhood' },
    { 
      header: 'Domicilio', 
      render: (item) => formatCurrency(item.deliveryFee)
    },
    { 
      header: 'Total', 
      render: (item) => formatCurrency(item.totalAmount)
    },
    { 
      header: 'Estado', 
      render: (item) => getStatusBadge(item.status)
    },
    { 
      header: 'Hora Estimada', 
      render: (item) => formatDateTime(item.estimatedDeliveryTime)
    },
  ];

  const actions = [
    {
      label: 'Cambiar Estado',
      onClick: handleChangeStatus,
      variant: 'primary',
    },
    {
      label: 'Eliminar',
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  if (loading) return <Loading message="Cargando domicilios..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><DeliveryIcon size={24} /> Gestión de Domicilios</>}
          actions={
            <Button onClick={handleAdd}>
              + Nuevo Domicilio
            </Button>
          }
        >
          <Table
            columns={columns}
            data={deliveries}
            actions={actions}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Nuevo Domicilio"
          onConfirm={handleSubmit}
          size="large"
        >
          <div className="form-grid-2">
            <div className="form-group">
              <label>Orden</label>
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Seleccione una orden (opcional)</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Orden #{order.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Repartidor</label>
              <select
                name="deliveryPersonId"
                value={formData.deliveryPersonId}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Seleccione un repartidor (opcional)</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Nombre del Cliente"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Nombre completo del cliente"
            />

            <Input
              label="Teléfono"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Número de contacto"
            />

            <Input
              label="Dirección de Entrega"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              required
              placeholder="Dirección completa"
              style={{ gridColumn: '1 / -1' }}
            />

            <Input
              label="Referencia de Dirección"
              name="addressReference"
              value={formData.addressReference}
              onChange={handleChange}
              placeholder="Ej: Casa de dos pisos, puerta verde"
              style={{ gridColumn: '1 / -1' }}
            />

            <Input
              label="Barrio"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              placeholder="Barrio o sector"
            />

            <Input
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ciudad"
            />

            <Input
              label="Costo del Domicilio"
              name="deliveryFee"
              type="number"
              value={formData.deliveryFee}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Total a Cobrar"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Hora Estimada de Entrega"
              name="estimatedDeliveryTime"
              type="datetime-local"
              value={formData.estimatedDeliveryTime}
              onChange={handleChange}
              style={{ gridColumn: '1 / -1' }}
            />
          </div>
        </Modal>

        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Cambiar Estado del Domicilio"
          onConfirm={handleStatusSubmit}
          size="small"
        >
          <div className="form-group">
            <label>Estado</label>
            <select
              name="status"
              value={statusData.status}
              onChange={handleStatusChange}
              className="form-input"
              required
            >
              <option value="PENDING">Pendiente</option>
              <option value="PREPARING">Preparando</option>
              <option value="IN_TRANSIT">En Tránsito</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Deliveries;
