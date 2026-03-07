import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PaymentIcon, CashRegisterIcon } from '../../components/common/Icons';
import { paymentService } from '../../services/paymentService';
import { cashRegisterService } from '../../services/cashRegisterService';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCashCloseConfirm, setShowCashCloseConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const paymentsData = await paymentService.getUnclosedPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCashClose = async () => {
    try {
      await cashRegisterService.createDailyCashClose(user?.username || 'Sistema');
      alert('✅ Cierre de caja del día realizado exitosamente');
      setShowCashCloseConfirm(false);
      // Recargar pagos para que se vacíe la tabla tras el cierre
      await loadData();
    } catch (error) {
      console.error('Error al realizar cierre de caja:', error);
      const msg = error.response?.data?.message || error.message || 'Error al realizar cierre de caja';
      alert('Error: ' + msg);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDIENTE: '🟡 Pendiente',
      COMPLETADO: '✅ Completado',
      CANCELADO: '🔴 Cancelado',
      FALLIDO: '❌ Fallido',
    };
    return badges[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Agregar T00:00:00 para evitar que JS interprete la fecha como UTC
    const date = typeof dateStr === 'string' && !dateStr.includes('T')
      ? new Date(dateStr + 'T00:00:00')
      : new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Calcular totales basados en los pagos sin cierre
  const totalPayments = payments.length;
  const totalAmount = payments
    .filter(p => p.status === 'COMPLETADO')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const columns = [
    { header: 'ID', field: 'id' },
    { 
      header: 'Orden', 
      render: (row) => `Pedido #${row.orderId}`
    },
    { 
      header: 'Monto', 
      render: (row) => `$${parseFloat(row.amount).toFixed(2)}` 
    },
    { 
      header: 'Método de Pago', 
      render: (row) => `💰 ${row.paymentMethodName}` 
    },
    { 
      header: 'Estado', 
      render: (row) => getStatusBadge(row.status) 
    },
    { 
      header: 'Fecha', 
      render: (row) => formatDate(row.paymentDate)
    },
  ];

  if (loading) return <Loading message="Cargando pagos..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><PaymentIcon size={24} /> Registro de Pagos</>}
          actions={
            <button
              onClick={() => setShowCashCloseConfirm(true)}
              disabled={payments.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: payments.length === 0 ? '#999' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: payments.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => { if (payments.length > 0) e.currentTarget.style.backgroundColor = '#c82333'; }}
              onMouseOut={(e) => { if (payments.length > 0) e.currentTarget.style.backgroundColor = '#dc3545'; }}
            >
              <CashRegisterIcon size={18} /> Cierre de Caja
            </button>
          }
        >
          <div className="payment-summary">
            <div className="summary-card">
              <h4>Total de Pagos</h4>
              <p className="summary-value">{totalPayments}</p>
            </div>
            <div className="summary-card">
              <h4>Total Pendiente de Cierre</h4>
              <p className="summary-value" style={{ color: '#28a745' }}>
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>✅ No hay pagos pendientes de cierre</p>
              <p style={{ fontSize: '13px' }}>Los pagos confirmados aparecerán aquí hasta que se realice el cierre de caja.</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={payments}
              actions={false}
            />
          )}
        </Card>

        <ConfirmDialog
          isOpen={showCashCloseConfirm}
          onClose={() => setShowCashCloseConfirm(false)}
          onConfirm={handleCashClose}
          title="Cierre de Caja"
          message={`¿Está seguro de realizar el cierre de caja? Se registrarán ${totalPayments} transacciones por un total de $${totalAmount.toFixed(2)}. Esta acción no se puede deshacer.`}
        />
      </div>
    </Layout>
  );
};

export default Payments;
