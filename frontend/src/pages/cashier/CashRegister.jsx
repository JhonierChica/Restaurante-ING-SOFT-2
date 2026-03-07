import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { CashRegisterIcon } from '../../components/common/Icons';
import { cashRegisterService } from '../../services/cashRegisterService';

const CashRegister = () => {
  const [closes, setCloses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClose, setSelectedClose] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('last');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const closesData = await cashRegisterService.getAllCloses();
      setCloses(closesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (close) => {
    setSelectedClose(close);
    setShowDetailModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
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
    const val = parseFloat(difference || 0);
    if (val > 0) return '#10b981';
    if (val < 0) return '#ef4444';
    return '#6b7280';
  };

  // Filtrar cierres según el tipo seleccionado
  const getFilteredCloses = () => {
    if (filterType === 'all') return closes;
    
    return closes.filter(close => {
      if (!close.closingDate) return false;
      const closeDate = new Date(close.closingDate);
      
      if (filterType === 'daily') {
        const closeDateStr = closeDate.getFullYear() + '-' +
          String(closeDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(closeDate.getDate()).padStart(2, '0');
        return closeDateStr === selectedDate;
      }
      if (filterType === 'monthly') {
        const closeMonthStr = closeDate.getFullYear() + '-' +
          String(closeDate.getMonth() + 1).padStart(2, '0');
        return closeMonthStr === selectedMonth;
      }
      if (filterType === 'annual') {
        return closeDate.getFullYear().toString() === selectedYear;
      }
      return true;
    });
  };

  const filteredCloses = getFilteredCloses();

  // Calcular resumen de los cierres filtrados
  const totalSales = filteredCloses.reduce((sum, c) => sum + parseFloat(c.totalSales || 0), 0);
  const totalTransactions = filteredCloses.reduce((sum, c) => sum + (c.totalTransactions || 0), 0);
  const totalDifference = filteredCloses.reduce((sum, c) => sum + parseFloat(c.difference || 0), 0);

  // Obtener cierres para exportación según el tipo seleccionado
  const getExportCloses = () => {
    if (exportType === 'last') {
      return closes.length > 0 ? [closes[0]] : [];
    }
    return closes.filter(close => {
      if (!close.closingDate) return false;
      const closeDate = new Date(close.closingDate);
      
      if (exportType === 'daily') {
        const closeDateStr = closeDate.getFullYear() + '-' +
          String(closeDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(closeDate.getDate()).padStart(2, '0');
        return closeDateStr === exportDate;
      }
      if (exportType === 'monthly') {
        const closeMonthStr = closeDate.getFullYear() + '-' +
          String(closeDate.getMonth() + 1).padStart(2, '0');
        return closeMonthStr === exportMonth;
      }
      if (exportType === 'annual') {
        return closeDate.getFullYear().toString() === exportYear;
      }
      return true;
    });
  };

  // Obtener texto descriptivo del filtro de exportación
  const getExportLabel = () => {
    if (exportType === 'last') {
      if (closes.length > 0) {
        const last = closes[0];
        return `Último cierre: ${formatDateTime(last.closingDate)}`;
      }
      return 'Último cierre (no disponible)';
    }
    if (exportType === 'daily') return `Día: ${exportDate}`;
    if (exportType === 'monthly') return `Mes: ${exportMonth}`;
    if (exportType === 'annual') return `Año: ${exportYear}`;
    return 'Todos';
  };

  // Generar PDF
  const generatePDF = (closesToExport, label) => {
    if (!closesToExport || closesToExport.length === 0) {
      alert('No hay cierres de caja para exportar con el filtro seleccionado.');
      return;
    }

    const pdfTotalSales = closesToExport.reduce((sum, c) => sum + parseFloat(c.totalSales || 0), 0);
    const pdfTotalTransactions = closesToExport.reduce((sum, c) => sum + (c.totalTransactions || 0), 0);
    const pdfTotalDifference = closesToExport.reduce((sum, c) => sum + parseFloat(c.difference || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cierre de Caja - Mr. Panzo</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header h2 { margin: 5px 0; font-size: 16px; color: #666; }
          .header p { margin: 5px 0; font-size: 12px; color: #999; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-item h3 { margin: 0; font-size: 12px; color: #666; }
          .summary-item p { margin: 5px 0; font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #343a40; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍕 Mr. Panzo - Restaurante</h1>
          <h2>Reporte de Cierres de Caja</h2>
          <p>Filtro: ${label} | Generado: ${new Date().toLocaleString('es-CO')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Cierres</h3>
            <p>${closesToExport.length}</p>
          </div>
          <div class="summary-item">
            <h3>Total Ventas</h3>
            <p>${formatCurrency(pdfTotalSales)}</p>
          </div>
          <div class="summary-item">
            <h3>Transacciones</h3>
            <p>${pdfTotalTransactions}</p>
          </div>
          <div class="summary-item">
            <h3>Diferencia</h3>
            <p class="${pdfTotalDifference >= 0 ? 'positive' : 'negative'}">${formatCurrency(pdfTotalDifference)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha de Cierre</th>
              <th>Monto Inicial</th>
              <th>Monto Final</th>
              <th>Total Ventas</th>
              <th>Transacciones</th>
              <th>Diferencia</th>
              <th>Cerrado por</th>
            </tr>
          </thead>
          <tbody>
            ${closesToExport.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${formatDateTime(c.closingDate)}</td>
                <td>${formatCurrency(c.initialAmount)}</td>
                <td>${formatCurrency(c.finalAmount)}</td>
                <td>${formatCurrency(c.totalSales)}</td>
                <td>${c.totalTransactions || 0}</td>
                <td class="${parseFloat(c.difference || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(c.difference)}</td>
                <td>${c.closedBy || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Reporte generado automáticamente por el Sistema de Gestión Mr. Panzo</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleExportPDF = () => {
    const closesToExport = getExportCloses();
    const label = getExportLabel();
    generatePDF(closesToExport, label);
    setShowExportModal(false);
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { 
      header: 'Fecha de Cierre', 
      render: (item) => formatDateTime(item.closingDate)
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
      header: 'Transacciones', 
      render: (item) => item.totalTransactions || 0
    },
    { 
      header: 'Diferencia', 
      render: (item) => {
        const diff = parseFloat(item.finalAmount || 0) - parseFloat(item.initialAmount || 0) - parseFloat(item.totalSales || 0);
        return (
          <span style={{ 
            color: getDifferenceColor(diff),
            fontWeight: 'bold'
          }}>
            {formatCurrency(diff)}
          </span>
        );
      }
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

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  if (loading) return <Loading message="Cargando cierres de caja..." />;

  return (
    <Layout>
      <div className="page-container">
        {/* Resumen */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Cierres</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>{filteredCloses.length}</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Ventas</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>{formatCurrency(totalSales)}</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Transacciones</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e65100' }}>{totalTransactions}</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: totalDifference >= 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Diferencia</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: getDifferenceColor(totalDifference) }}>{formatCurrency(totalDifference)}</div>
          </div>
        </div>

        <Card
          title={<><CashRegisterIcon size={24} /> Cierres de Caja</>}
          actions={
            <button
              onClick={() => setShowExportModal(true)}
              disabled={closes.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: closes.length === 0 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: closes.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📄 Exportar PDF
            </button>
          }
        >
          {/* Filtros */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            flexWrap: 'wrap',
            alignItems: 'flex-end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                Tipo de Reporte
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #007bff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="all">📋 Todos</option>
                <option value="daily">📅 Diario</option>
                <option value="monthly">📆 Mensual</option>
                <option value="annual">📊 Anual</option>
              </select>
            </div>

            {filterType === 'daily' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            {filterType === 'monthly' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                  Mes
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            {filterType === 'annual' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ fontSize: '13px', color: '#666', alignSelf: 'center', marginLeft: 'auto' }}>
              Mostrando <strong>{filteredCloses.length}</strong> cierre(s)
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredCloses}
            actions={actions}
          />
        </Card>

        {/* Modal de detalle */}
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
                  <div>{formatDateTime(selectedClose.closingDate)}</div>
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
                  <strong>Total Ventas:</strong>
                  <div>{formatCurrency(selectedClose.totalSales)}</div>
                </div>
                <div>
                  <strong>Transacciones:</strong>
                  <div>{selectedClose.totalTransactions || 0}</div>
                </div>
                <div>
                  <strong>Diferencia:</strong>
                  <div style={{ 
                    color: getDifferenceColor(
                      parseFloat(selectedClose.finalAmount || 0) - parseFloat(selectedClose.initialAmount || 0) - parseFloat(selectedClose.totalSales || 0)
                    ),
                    fontWeight: 'bold',
                    fontSize: '1.2em'
                  }}>
                    {formatCurrency(
                      parseFloat(selectedClose.finalAmount || 0) - parseFloat(selectedClose.initialAmount || 0) - parseFloat(selectedClose.totalSales || 0)
                    )}
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

        {/* Modal de exportación PDF */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="📄 Exportar Reporte PDF"
          size="medium"
          onConfirm={handleExportPDF}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: '#555', margin: 0 }}>
              Seleccione el tipo de reporte que desea exportar como PDF:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                border: exportType === 'last' ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: exportType === 'last' ? '#e3f2fd' : '#fff',
              }}>
                <input type="radio" name="exportType" value="last" checked={exportType === 'last'} onChange={() => setExportType('last')} />
                <div>
                  <strong>🕐 Último cierre de caja</strong>
                  {closes.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {formatDateTime(closes[0].closingDate)} — por {closes[0].closedBy || 'N/A'}
                    </div>
                  )}
                </div>
              </label>

              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                border: exportType === 'daily' ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: exportType === 'daily' ? '#e3f2fd' : '#fff',
              }}>
                <input type="radio" name="exportType" value="daily" checked={exportType === 'daily'} onChange={() => setExportType('daily')} />
                <div style={{ flex: 1 }}>
                  <strong>📅 Día específico</strong>
                  {exportType === 'daily' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="date"
                        value={exportDate}
                        onChange={(e) => setExportDate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  )}
                </div>
              </label>

              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                border: exportType === 'monthly' ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: exportType === 'monthly' ? '#e3f2fd' : '#fff',
              }}>
                <input type="radio" name="exportType" value="monthly" checked={exportType === 'monthly'} onChange={() => setExportType('monthly')} />
                <div style={{ flex: 1 }}>
                  <strong>📆 Mes específico</strong>
                  {exportType === 'monthly' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="month"
                        value={exportMonth}
                        onChange={(e) => setExportMonth(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  )}
                </div>
              </label>

              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                border: exportType === 'annual' ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: exportType === 'annual' ? '#e3f2fd' : '#fff',
              }}>
                <input type="radio" name="exportType" value="annual" checked={exportType === 'annual'} onChange={() => setExportType('annual')} />
                <div style={{ flex: 1 }}>
                  <strong>📊 Año específico</strong>
                  {exportType === 'annual' && (
                    <div style={{ marginTop: '8px' }}>
                      <select
                        value={exportYear}
                        onChange={(e) => setExportYear(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', minWidth: '100px' }}
                      >
                        {yearOptions.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div style={{ 
              padding: '10px 15px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '6px', 
              fontSize: '13px',
              color: '#333',
              border: '1px solid #b3d9ff'
            }}>
              <strong>Exportará:</strong> {getExportLabel()} — {getExportCloses().length} cierre(s) encontrado(s)
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default CashRegister;
