import React, { useState, useEffect, ReactNode } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { CashRegisterIcon } from '../../components/common/Icons';
import { cashRegisterService } from '../../services/cashRegisterService';
import type { CashRegisterClose } from '../../types';

type FilterType = 'all' | 'daily' | 'monthly' | 'annual';
type ExportType = 'last' | 'daily' | 'monthly' | 'annual';

// ===================== HELPERS =====================
const formatCurrency = (value: number | string | undefined): string =>
  new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 2 
  }).format(parseFloat(String(value)) || 0);

const formatDateTime = (dateTime: string | undefined): string => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit',
  });
};

const getDifferenceColor = (difference: number): string => {
  if (difference > 0) return '#10b981';
  if (difference < 0) return '#ef4444';
  return '#6b7280';
};

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toMonthStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const filterCloses = (
  closes: CashRegisterClose[],
  type: FilterType | ExportType,
  date: string,
  month: string,
  year: string,
): CashRegisterClose[] => {
  if (type === 'all' || type === 'last') return closes;
  return closes.filter((c) => {
    if (!c.closingDate) return false;
    const d = new Date(c.closingDate);
    if (type === 'daily') return toDateStr(d) === date;
    if (type === 'monthly') return toMonthStr(d) === month;
    if (type === 'annual') return d.getFullYear().toString() === year;
    return true;
  });
};

// ===================== COMPONENT =====================
const CashRegister: React.FC = () => {
  const [closes, setCloses] = useState<CashRegisterClose[]>([]);
  const [loading, setLoading] = useState(true);

  // View filters
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClose, setSelectedClose] = useState<CashRegisterClose | null>(null);

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('last');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await cashRegisterService.getAll();
      setCloses(data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredCloses = filterCloses(closes, filterType, selectedDate, selectedMonth, selectedYear);
  const totalSales = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (Number(c.totalSales) || 0), 0);
  const totalTransactions = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (c.totalTransactions || 0), 0);
  const totalDifference = filteredCloses.reduce((s: number, c: CashRegisterClose) => s + (Number(c.difference) || 0), 0);

  const getExportCloses = (): CashRegisterClose[] => {
    if (exportType === 'last') return closes.length > 0 ? [closes[0]] : [];
    return filterCloses(closes, exportType, exportDate, exportMonth, exportYear);
  };

  const getExportLabel = (): string => {
    if (exportType === 'last') {
      return closes.length > 0 ? `Último cierre: ${formatDateTime(closes[0].closingDate)}` : 'Último cierre (no disponible)';
    }
    if (exportType === 'daily') return `Día: ${exportDate}`;
    if (exportType === 'monthly') return `Mes: ${exportMonth}`;
    if (exportType === 'annual') return `Año: ${exportYear}`;
    return 'Todos';
  };

  const generatePDF = (closesToExport: CashRegisterClose[], label: string) => {
    if (!closesToExport.length) { alert('No hay cierres para exportar.'); return; }

    const s = closesToExport.reduce((a: number, c: CashRegisterClose) => a + (Number(c.totalSales) || 0), 0);
    const t = closesToExport.reduce((a: number, c: CashRegisterClose) => a + (c.totalTransactions || 0), 0);
    const d = closesToExport.reduce((a: number, c: CashRegisterClose) => a + (Number(c.difference) || 0), 0);

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cierre de Caja</title> <style>body{font-family:Arial,sans-serif;padding:20px;color:#333}.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #333;padding-bottom:15px}.header h1{margin:0;font-size:24px}.header h2{margin:5px 0;font-size:16px;color:#666}.header p{margin:5px 0;font-size:12px;color:#999}.summary{display:flex;justify-content:space-around;margin:20px 0;padding:15px;background:#f8f9fa;border-radius:8px}.summary-item{text-align:center}.summary-item h3{margin:0;font-size:12px;color:#666}.summary-item p{margin:5px 0;font-size:18px;font-weight:bold}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#343a40;color:white;padding:10px;text-align:left;font-size:12px}td{padding:8px 10px;border-bottom:1px solid #ddd;font-size:11px}tr:nth-child(even){background:#f8f9fa}.footer{text-align:center;margin-top:30px;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:10px}.positive{color:#10b981}.negative{color:#ef4444}@media print{body{padding:0}}</style> </head><body> <div class="header"><h1>🍕 Mr. Panzo - Restaurante</h1><h2>Reporte de Cierres de Caja</h2><p>Filtro: ${label} | Generado: ${new Date().toLocaleString('es-CO')}</p></div> <div class="summary"><div class="summary-item"><h3>Total Cierres</h3><p>${closesToExport.length}</p></div><div class="summary-item"><h3>Total Ventas</h3><p>${formatCurrency(s)}</p></div><div class="summary-item"><h3>Transacciones</h3><p>${t}</p></div><div class="summary-item"><h3>Diferencia</h3><p class="${d >= 0 ? 'positive' : 'negative'}">${formatCurrency(d)}</p></div></div> <table><thead><tr><th>ID</th><th>Fecha de Cierre</th><th>Monto Inicial</th><th>Monto Final</th><th>Total Ventas</th><th>Transacciones</th><th>Diferencia</th><th>Cerrado por</th></tr></thead><tbody> ${closesToExport.map(c => `<tr><td>${c.id}</td><td>${formatDateTime(c.closingDate)}</td><td>${formatCurrency(c.initialAmount)}</td><td>${formatCurrency(c.finalAmount)}</td><td>${formatCurrency(c.totalSales)}</td><td>${c.totalTransactions || 0}</td><td class="${parseFloat(String(c.difference || 0)) >= 0 ? 'positive' : 'negative'}">${formatCurrency(c.difference)}</td><td>${c.closedBy || 'N/A'}</td></tr>`).join('')} </tbody></table> <div class="footer"><p>Reporte generado automáticamente por el Sistema de Gestión Mr. Panzo</p></div></body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(htmlContent); w.document.close(); w.onload = () => w.print(); }
  };

  const handleExportPDF = () => {
    generatePDF(getExportCloses(), getExportLabel());
    setShowExportModal(false);
  };

  const columns = [
    { header: 'ID', field: 'id' as keyof CashRegisterClose },
    { header: 'Fecha de Cierre', render: (item: CashRegisterClose) => formatDateTime(item.closingDate) },
    { header: 'Monto Inicial', render: (item: CashRegisterClose) => formatCurrency(item.initialAmount) },
    { header: 'Monto Final', render: (item: CashRegisterClose) => formatCurrency(item.finalAmount) },
    { header: 'Total Ventas', render: (item: CashRegisterClose) => formatCurrency(item.totalSales) },
    { header: 'Transacciones', render: (item: CashRegisterClose) => item.totalTransactions || 0 },
    {
      header: 'Diferencia',
      render: (item: CashRegisterClose) => {
        const diff = Number(item.difference) || 0;
        return <span style={{ color: getDifferenceColor(diff), fontWeight: 'bold' }}>{formatCurrency(diff)}</span>;
      },
    },
    { header: 'Cerrado por', field: 'closedBy' as keyof CashRegisterClose },
  ];

  const actions = [{ 
    label: 'Ver Detalle', 
    onClick: (c: CashRegisterClose) => { setSelectedClose(c); setShowDetailModal(true); }, 
    variant: 'primary' as const 
  }];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (loading) return <Loading message="Cargando cierres de caja..." />;

  return (
    <Layout>
      <div className="page-container p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total Cierres" value={String(filteredCloses.length)} bg="#e3f2fd" color="#1565c0" />
          <SummaryCard label="Total Ventas" value={formatCurrency(totalSales)} bg="#e8f5e9" color="#2e7d32" />
          <SummaryCard label="Transacciones" value={String(totalTransactions)} bg="#fff3e0" color="#e65100" />
          <SummaryCard label="Diferencia" value={formatCurrency(totalDifference)} bg={totalDifference >= 0 ? '#e8f5e9' : '#ffebee'} color={getDifferenceColor(totalDifference)} />
        </div>

        <Card
          title={<div className="flex items-center gap-2"><CashRegisterIcon size={24} /> <span>Cierres de Caja</span></div>}
          actions={
            <button 
              onClick={() => setShowExportModal(true)} 
              disabled={closes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-bold"
            >
              📄 Exportar PDF
            </button>
          }
        >
          <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg flex-wrap items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">Tipo de Reporte</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="p-2 border-2 border-blue-500 rounded-lg text-sm bg-white"
              >
                <option value="all">📋 Todos</option>
                <option value="daily">📅 Diario</option>
                <option value="monthly">📆 Mensual</option>
                <option value="annual">📊 Anual</option>
              </select>
            </div>
            {filterType === 'daily' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg text-sm" />
              </div>
            )}
            {filterType === 'monthly' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Mes</label>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-lg text-sm" />
              </div>
            )}
            {filterType === 'annual' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Año</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-2 border rounded-lg text-sm min-w-[100px]">
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
            <div className="text-xs text-gray-500 ml-auto self-center">
              Mostrando <strong>{filteredCloses.length}</strong> cierre(s)
            </div>
          </div>

          <Table columns={columns} data={filteredCloses} actions={actions} />
        </Card>

        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Detalle del Cierre #${selectedClose?.id}`} size="medium">
          {selectedClose && <CloseDetail close={selectedClose} />}
        </Modal>

        <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="📄 Exportar Reporte PDF" size="medium">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">Seleccione el tipo de reporte que desea exportar:</p>
            <div className="flex flex-col gap-2">
              <ExportOption type="last" current={exportType} onSelect={setExportType} label="🕐 Último cierre de caja" sub={closes.length > 0 ? `${formatDateTime(closes[0].closingDate)} — por ${closes[0].closedBy || 'N/A'}` : undefined} />
              <ExportOption type="daily" current={exportType} onSelect={setExportType} label="📅 Día específico">
                {exportType === 'daily' && <input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} className="mt-2 p-2 border rounded-lg text-xs w-full" />}
              </ExportOption>
              <ExportOption type="monthly" current={exportType} onSelect={setExportType} label="📆 Mes específico">
                {exportType === 'monthly' && <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="mt-2 p-2 border rounded-lg text-xs w-full" />}
              </ExportOption>
              <ExportOption type="annual" current={exportType} onSelect={setExportType} label="📊 Año específico">
                {exportType === 'annual' && (
                  <select value={exportYear} onChange={(e) => setExportYear(e.target.value)} className="mt-2 p-2 border rounded-lg text-xs w-full">
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
              </ExportOption>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800 border border-blue-100">
              <strong>Exportará:</strong> {getExportLabel()} — {getExportCloses().length} cierre(s)
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => setShowExportModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
               <button onClick={handleExportPDF} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-bold">Generar PDF</button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

// ===================== SUB-COMPONENTS =====================
const SummaryCard: React.FC<{ label: string; value: string; bg: string; color: string }> = ({ label, value, bg, color }) => (
  <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: bg }}>
    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">{label}</div>
    <div className="text-xl font-black" style={{ color }}>{value}</div>
  </div>
);

const CloseDetail: React.FC<{ close: CashRegisterClose }> = ({ close }) => {
  const diff = parseFloat(String(close.finalAmount || 0)) - parseFloat(String(close.initialAmount || 0)) - parseFloat(String(close.totalSales || 0));
  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        <DetailItem label="Fecha" value={formatDateTime(close.closingDate)} />
        <DetailItem label="Cerrado por" value={close.closedBy || 'N/A'} />
        <DetailItem label="Monto Inicial" value={formatCurrency(close.initialAmount)} />
        <DetailItem label="Monto Final" value={formatCurrency(close.finalAmount)} />
        <DetailItem label="Total Ventas" value={formatCurrency(close.totalSales)} />
        <DetailItem label="Transacciones" value={String(close.totalTransactions || 0)} />
      </div>
      <div className="p-4 border-2 rounded-xl text-center" style={{ borderColor: getDifferenceColor(diff), backgroundColor: diff >= 0 ? '#f0fdf4' : '#fef2f2' }}>
        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Diferencia</div>
        <div className="text-3xl font-black" style={{ color: getDifferenceColor(diff) }}>{formatCurrency(diff)}</div>
      </div>
      {close.notes && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase">Observaciones</div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border italic">"{close.notes}"</div>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col group">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

interface ExportOptionProps {
  type: ExportType;
  current: ExportType;
  onSelect: (t: ExportType) => void;
  label: string;
  sub?: string;
  children?: ReactNode;
}

const ExportOption: React.FC<ExportOptionProps> = ({ type, current, onSelect, label, sub, children }) => (
  <label className={`
    flex flex-col gap-1 p-4 border-2 rounded-xl cursor-pointer transition-all
    ${current === type ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}
  `}>
    <div className="flex items-center gap-3">
      <input type="radio" name="exportType" checked={current === type} onChange={() => onSelect(type)} className="accent-blue-600" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        {sub && <span className="text-[10px] text-gray-500">{sub}</span>}
      </div>
    </div>
    {children}
  </label>
);

export default CashRegister;