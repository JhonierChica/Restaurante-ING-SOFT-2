import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { DeliveryIcon } from '../../components/common/Icons';
import { deliveryService } from '../../services/deliveryService';
import { orderService } from '../../services/orderService';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusData, setStatusData] = useState({
    status: 'PENDING',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const deliveriesData = await deliveryService.getAllDeliveries();
      
      // Obtener información de los pedidos relacionados
      const ordersMap = {};
      for (const delivery of deliveriesData) {
        try {
          const order = await orderService.getOrderById(delivery.orderId);
          ordersMap[delivery.orderId] = order;
        } catch (err) {
          console.error(`Error al cargar pedido ${delivery.orderId}:`, err);
        }
      }
      
      setDeliveries(deliveriesData);
      setOrders(ordersMap);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };


  const handleChangeStatus = (delivery) => {
    setSelectedDelivery(delivery);
    setStatusData({
      status: delivery.status,
    });
    setShowStatusModal(true);
  };

  const handleStatusChange = (e) => {
    setStatusData({ status: e.target.value });
  };

  const handleStatusSubmit = async () => {
    try {
      await deliveryService.updateDeliveryStatus(
        selectedDelivery.id,
        statusData.status
      );
      alert('Estado actualizado exitosamente');
      setShowStatusModal(false);
      loadData();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', className: 'badge-warning' },
      IN_TRANSIT: { label: 'En Tránsito', className: 'badge-primary' },
      DELIVERED: { label: 'Entregado', className: 'badge-success' },
      CANCELLED: { label: 'Cancelado', className: 'badge-danger' },
    };
    const config = statusConfig[status] || { label: status, className: 'badge-secondary' };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
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
    { header: 'Pedido #', field: 'orderId' },
    { 
      header: 'Cliente', 
      render: (item) => {
        const order = orders[item.orderId];
        return order?.clientName || 'N/A';
      }
    },
    { 
      header: 'Teléfono', 
      render: (item) => {
        const order = orders[item.orderId];
        return order?.clientPhone || 'N/A';
      }
    },
    { 
      header: 'Dirección', 
      render: (item) => {
        const order = orders[item.orderId];
        return order?.clientAddress || 'N/A';
      }
    },
    { 
      header: 'Total Pedido', 
      render: (item) => {
        const order = orders[item.orderId];
        return order ? `$${order.total?.toFixed(2) || '0.00'}` : 'N/A';
      }
    },
    { 
      header: 'Estado', 
      render: (item) => getStatusBadge(item.status)
    },
    { 
      header: 'Creado', 
      render: (item) => formatDateTime(item.createdAt)
    },
  ];

  const actions = [
    {
      label: 'Cambiar Estado',
      onClick: handleChangeStatus,
      variant: 'info',
    },
  ];

  if (loading) return <Loading message="Cargando domicilios..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={
            <>
              <DeliveryIcon size={24} /> Gestión de Domicilios
              <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                ({deliveries.length} {deliveries.length === 1 ? 'domicilio' : 'domicilios'})
              </span>
            </>
          }
        >
          <Table
            columns={columns}
            data={deliveries}
            actions={actions}
          />
        </Card>

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
