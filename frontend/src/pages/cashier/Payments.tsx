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
import type { Payment } from '../../types';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
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
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCashClose = async () => {
    try {
      await cashRegisterService.close({ closedBy: user?.username || 'Sistema' });
      alert('✅ Cierre de caja del día realizado exitosamente');
      setShowCashCloseConfirm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error al realizar cierre de caja:', err);
      const msg = err.response?.data?.message || err.message || 'Error al realizar cierre de caja';
      alert('Error: ' + msg);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDIENTE: '🟡 Pendiente',
      COMPLETADO: '✅ Completado',
      CANCELADO: '🔴 Cancelado',
      FALLIDO: '❌ Fallido',
    };
    return badges[status] || status;
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return 'N/A';
    const date = typeof dateStr === 'string' && !dateStr.includes('T')
      ? new Date(dateStr + 'T00:00:00')
      : new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const totalPayments = payments.length;
  const totalAmount = payments
    .filter(p => p.status === 'COMPLETADO')
    .reduce((sum, p) => sum + parseFloat(p.amount as any || 0), 0);

  const columns = [
    { header: 'ID', field: 'id' as keyof Payment },
    { 
      header: 'Orden', 
      render: (row: Payment) => `Pedido #${row.orderId}`
    },
    { 
      header: 'Monto', 
      render: (row: Payment) => `$${typeof row.amount === 'number' ? row.amount.toFixed(2) : parseFloat(row.amount as any).toFixed(2)}` 
    },
    { 
      header: 'Método de Pago', 
      render: (row: Payment) => `💰 ${(row as any).paymentMethodName}` 
    },
    { 
      header: 'Estado', 
      render: (row: Payment) => getStatusBadge(row.status || '') 
    },
    { 
      header: 'Fecha', 
      render: (row: Payment) => formatDate(row.paymentDate || '')
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
            >
              <CashRegisterIcon size={18} /> Cierre de Caja
            </button>
          }
        >
          <div className="payment-summary" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="summary-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total de Pagos</h4>
              <p className="summary-value" style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalPayments}</p>
            </div>
            <div className="summary-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Pendiente de Cierre</h4>
              <p className="summary-value" style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
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
              actions={[]}
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
