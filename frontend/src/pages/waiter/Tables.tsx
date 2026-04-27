import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import TableComp from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { TableIcon } from '../../components/common/Icons';
import { tableService } from '../../services/tableService';
import { TABLE_STATUS } from '../../utils/constants';
import type { Table } from '../../types';

const WaiterTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [status, setStatus] = useState<string>(TABLE_STATUS.AVAILABLE);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAllTables();
      setTables(data);
    } catch (err) {
      console.error('Error al cargar mesas:', err);
      alert('Error al cargar mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setStatus(table.status);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!editingTable) return;

    try {
      await tableService.updateTable(editingTable.id, {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location,
        status: status,
      });
      alert('Estado de mesa actualizado exitosamente');
      setShowModal(false);
      loadTables();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar estado de mesa');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const getStatusBadge = (tableStatus: string) => {
    const badges: Record<string, string> = {
      AVAILABLE: '🟢 Disponible',
      OCCUPIED: '🔴 Ocupada',
      RESERVED: '🟡 Reservada',
    };
    return badges[tableStatus] || tableStatus;
  };

  const columns = [
    { header: 'ID', field: 'id' as keyof Table },
    { header: 'Número de Mesa', field: 'tableNumber' as keyof Table },
    { header: 'Capacidad', field: 'capacity' as keyof Table },
    {
      header: 'Ubicación',
      render: (row: Table) => row.location || 'Sin ubicación'
    },
    {
      header: 'Estado',
      render: (row: Table) => getStatusBadge(row.status)
    },
  ];

  if (loading) return <Loading message="Cargando mesas..." />;

  return (
    <Layout>
      <div className="page-container p-4">
        <Card
          title={<><TableIcon size={24} className="text-blue-600" /> Estado de Mesas</>}
        >
          <TableComp
            columns={columns}
            data={tables}
            onEdit={handleEdit}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Cambiar Estado de Mesa"
          onConfirm={handleSubmit}
        >
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="mb-1 text-sm text-gray-500">Número de Mesa</div>
            <div className="text-xl font-black text-gray-800">{editingTable?.tableNumber}</div>
            <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Capacidad: {editingTable?.capacity} personas</div>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Seleccionar Nuevo Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={status}
              onChange={handleChange}
              className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all font-semibold"
              required
            >
              <option value={TABLE_STATUS.AVAILABLE}>🟢 Disponible</option>
              <option value={TABLE_STATUS.OCCUPIED}>🔴 Ocupada</option>
              <option value={TABLE_STATUS.RESERVED}>🟡 Reservada</option>
            </select>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default WaiterTables;