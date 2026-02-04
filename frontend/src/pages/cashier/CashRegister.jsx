import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { CashRegisterIcon } from '../../components/common/Icons';
import { cashRegisterService } from '../../services/cashRegisterService';
import { useAuth } from '../../context/AuthContext';

const CashRegister = () => {
  const { user } = useAuth();
  const [closes, setCloses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClose, setSelectedClose] = useState(null);
  const [lastClose, setLastClose] = useState(null);
  const [formData, setFormData] = useState({
    initialAmount: '',
    finalAmount: '',
    cashAmount: '',
    cardAmount: '',
    transferAmount: '',
    totalSales: '',
    totalExpenses: '',
    difference: '',
    notes: '',
    closedBy: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calcular la diferencia automáticamente
    const final = parseFloat(formData.finalAmount) || 0;
    const initial = parseFloat(formData.initialAmount) || 0;
    const sales = parseFloat(formData.totalSales) || 0;
    const expenses = parseFloat(formData.totalExpenses) || 0;
    const expectedFinal = initial + sales - expenses;
    const difference = final - expectedFinal;
    
    setFormData(prev => ({
      ...prev,
      difference: difference.toFixed(2)
    }));
  }, [formData.finalAmount, formData.initialAmount, formData.totalSales, formData.totalExpenses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [closesData, lastCloseData] = await Promise.all([
        cashRegisterService.getAllCloses(),
        cashRegisterService.getLastClose().catch(() => null),
      ]);
      setCloses(closesData);
      setLastClose(lastCloseData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      initialAmount: lastClose?.finalAmount?.toString() || '',
      finalAmount: '',
      cashAmount: '',
      cardAmount: '',
      transferAmount: '',
      totalSales: '',
      totalExpenses: '',
      difference: '0',
      notes: '',
      closedBy: user?.username || '',
    });
    setShowModal(true);
  };

  const handleViewDetail = (close) => {
    setSelectedClose(close);
    setShowDetailModal(true);
  };

  const handleSubmit = async () => {
    try {
      await cashRegisterService.createCashRegisterClose(formData);
      alert('Cierre de caja registrado exitosamente');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al registrar cierre:', error);
      alert('Error al registrar cierre de caja');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const getDifferenceColor = (difference) => {
    if (difference > 0) return '#10b981'; // Verde
    if (difference < 0) return '#ef4444'; // Rojo
    return '#6b7280'; // Gris
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { 
      header: 'Fecha de Cierre', 
      render: (item) => formatDateTime(item.closeDate)
    },
    { 
      header: 'Monto Inicial', 
      render: (item) => formatCurrency(item.initialAmount)
    },
    { 
      header: 'Monto Final', 
      render: (item) => formatCurrency(item.finalAmount)
    },
    { 
      header: 'Total Ventas', 
      render: (item) => formatCurrency(item.totalSales)
    },
    { 
      header: 'Diferencia', 
      render: (item) => (
        <span style={{ 
          color: getDifferenceColor(item.difference),
          fontWeight: 'bold'
        }}>
          {formatCurrency(item.difference)}
        </span>
      )
    },
    { header: 'Cerrado por', field: 'closedBy' },
  ];

  const actions = [
    {
      label: 'Ver Detalle',
      onClick: handleViewDetail,
      variant: 'primary',
    },
  ];

  if (loading) return <Loading message="Cargando cierres de caja..." />;

  return (
    <Layout>
      <div className="page-container">
        {lastClose && (
          <Card title="Último Cierre de Caja" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Fecha:</strong>
                <div>{formatDateTime(lastClose.closeDate)}</div>
              </div>
              <div>
                <strong>Monto Final:</strong>
                <div>{formatCurrency(lastClose.finalAmount)}</div>
              </div>
              <div>
                <strong>Ventas:</strong>
                <div>{formatCurrency(lastClose.totalSales)}</div>
              </div>
              <div>
                <strong>Diferencia:</strong>
                <div style={{ color: getDifferenceColor(lastClose.difference), fontWeight: 'bold' }}>
                  {formatCurrency(lastClose.difference)}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card
          title={<><CashRegisterIcon size={24} /> Cierres de Caja</>}
          actions={
            <Button onClick={handleAdd}>
              + Nuevo Cierre de Caja
            </Button>
          }
        >
          <Table
            columns={columns}
            data={closes}
            actions={actions}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Nuevo Cierre de Caja"
          onConfirm={handleSubmit}
          size="large"
        >
          <div className="form-grid-2">
            <Input
              label="Monto Inicial"
              name="initialAmount"
              type="number"
              value={formData.initialAmount}
              onChange={handleChange}
              required
              placeholder="0"
            />

            <Input
              label="Monto Final en Caja"
              name="finalAmount"
              type="number"
              value={formData.finalAmount}
              onChange={handleChange}
              required
              placeholder="0"
            />

            <Input
              label="Efectivo"
              name="cashAmount"
              type="number"
              value={formData.cashAmount}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Tarjetas"
              name="cardAmount"
              type="number"
              value={formData.cardAmount}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Transferencias"
              name="transferAmount"
              type="number"
              value={formData.transferAmount}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Total Ventas"
              name="totalSales"
              type="number"
              value={formData.totalSales}
              onChange={handleChange}
              required
              placeholder="0"
            />

            <Input
              label="Total Gastos"
              name="totalExpenses"
              type="number"
              value={formData.totalExpenses}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Diferencia"
              name="difference"
              type="number"
              value={formData.difference}
              readOnly
              style={{ 
                backgroundColor: '#f3f4f6',
                color: getDifferenceColor(parseFloat(formData.difference)),
                fontWeight: 'bold'
              }}
            />

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notas</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Observaciones o notas adicionales..."
              />
            </div>

            <Input
              label="Cerrado por"
              name="closedBy"
              value={formData.closedBy}
              onChange={handleChange}
              required
              placeholder="Usuario que realiza el cierre"
            />
          </div>
        </Modal>

        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Detalle del Cierre #${selectedClose?.id}`}
          size="medium"
          showConfirm={false}
        >
          {selectedClose && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Fecha de Cierre:</strong>
                  <div>{formatDateTime(selectedClose.closeDate)}</div>
                </div>
                <div>
                  <strong>Cerrado por:</strong>
                  <div>{selectedClose.closedBy}</div>
                </div>
                <div>
                  <strong>Monto Inicial:</strong>
                  <div>{formatCurrency(selectedClose.initialAmount)}</div>
                </div>
                <div>
                  <strong>Monto Final:</strong>
                  <div>{formatCurrency(selectedClose.finalAmount)}</div>
                </div>
                <div>
                  <strong>Efectivo:</strong>
                  <div>{formatCurrency(selectedClose.cashAmount)}</div>
                </div>
                <div>
                  <strong>Tarjetas:</strong>
                  <div>{formatCurrency(selectedClose.cardAmount)}</div>
                </div>
                <div>
                  <strong>Transferencias:</strong>
                  <div>{formatCurrency(selectedClose.transferAmount)}</div>
                </div>
                <div>
                  <strong>Total Ventas:</strong>
                  <div>{formatCurrency(selectedClose.totalSales)}</div>
                </div>
                <div>
                  <strong>Total Gastos:</strong>
                  <div>{formatCurrency(selectedClose.totalExpenses)}</div>
                </div>
                <div>
                  <strong>Diferencia:</strong>
                  <div style={{ 
                    color: getDifferenceColor(selectedClose.difference),
                    fontWeight: 'bold',
                    fontSize: '1.2em'
                  }}>
                    {formatCurrency(selectedClose.difference)}
                  </div>
                </div>
              </div>
              {selectedClose.notes && (
                <div>
                  <strong>Notas:</strong>
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    {selectedClose.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default CashRegister;
