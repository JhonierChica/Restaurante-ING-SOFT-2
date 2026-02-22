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
      const paymentsData = await paymentService.getAllPayments();
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
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Calcular totales del día
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter(p => {
    if (!p.paymentDate) return false;
    const pDate = typeof p.paymentDate === 'string' ? p.paymentDate : new Date(p.paymentDate).toISOString().split('T')[0];
    return pDate === today;
  });
  const todayTotal = todayPayments
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
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
            >
              <CashRegisterIcon size={18} /> Cierre de Caja
            </button>
          }
        >
          <div className="payment-summary">
            <div className="summary-card">
              <h4>Total de Pagos</h4>
              <p className="summary-value">{payments.length}</p>
            </div>
            <div className="summary-card">
              <h4>Pagos del Día</h4>
              <p className="summary-value">{todayPayments.length}</p>
            </div>
            <div className="summary-card">
              <h4>Total del Día</h4>
              <p className="summary-value" style={{ color: '#28a745' }}>
                ${todayTotal.toFixed(2)}
              </p>
            </div>
            <div className="summary-card">
              <h4>Total Histórico</h4>
              <p className="summary-value">
                ${payments
                  .filter(p => p.status === 'COMPLETADO')
                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <Table
            columns={columns}
            data={payments}
            actions={false}
          />
        </Card>

        <ConfirmDialog
          isOpen={showCashCloseConfirm}
          onClose={() => setShowCashCloseConfirm(false)}
          onConfirm={handleCashClose}
          title="Cierre de Caja"
          message={`¿Está seguro de realizar el cierre de caja del día de hoy? Se registrarán ${todayPayments.length} transacciones por un total de $${todayTotal.toFixed(2)}. Esta acción no se puede deshacer.`}
        />
      </div>
    </Layout>
  );
};

export default Payments;
