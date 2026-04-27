import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { TableIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { tableService } from '../../services/tableService';
import { TABLE_STATUS } from '../../utils/constants';
import type { Table } from '../../types';

interface FormData {
  tableNumber: string | number;
  capacity: string | number;
  location?: string;
  status: string;
}

const TablesList: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tableNumber: '',
    capacity: '',
    status: TABLE_STATUS.AVAILABLE,
  });

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

  const handleAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '',
      location: '',
      status: TABLE_STATUS.AVAILABLE,
    });
    setShowModal(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || '',
      status: table.status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (tableId: number, isActive: boolean) => {
    const action = isActive ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} esta mesa?`)) {
      try {
        await tableService.updateTable(tableId, { isActive: !isActive } as Partial<Table>);
        alert(`Mesa ${action === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
        loadTables();
      } catch (err) {
        console.error(`Error al ${action} mesa:`, err);
        alert(`Error al ${action} mesa`);
      }
    }
  };

  const handleDelete = async (table: Table) => {
    if (window.confirm(`¿Está seguro de eliminar la mesa ${table.tableNumber}?`)) {
      try {
        await tableService.deleteTable(table.id);
        alert('Mesa eliminada exitosamente');
        loadTables();
      } catch (err) {
        console.error('Error al eliminar mesa:', err);
        alert('Error al eliminar mesa');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = {
        ...formData,
        tableNumber: Number(formData.tableNumber),
        capacity: Number(formData.capacity)
      };

      if (editingTable) {
        await tableService.updateTable(editingTable.id, dataToSave as Partial<Table>);
        alert('Mesa actualizada exitosamente');
      } else {
        await tableService.createTable(dataToSave as Partial<Table>);
        alert('Mesa creada exitosamente');
      }
      setShowModal(false);
      loadTables();
    } catch (err) {
      console.error('Error al guardar mesa:', err);
      alert('Error al guardar mesa');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      AVAILABLE: '🟢 Disponible',
      OCCUPIED: '🔴 Ocupada',
      RESERVED: '🟡 Reservada',
      OUT_OF_SERVICE: '⚫ Fuera de servicio',
    };
    // Map backend status if necessary
    const displayStatus = badges[status] || status;
    return displayStatus;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      AVAILABLE: 'badge-success',
      OCCUPIED: 'badge-danger',
      RESERVED: 'badge-warning',
      OUT_OF_SERVICE: 'badge-secondary',
    };
    return classes[status] || 'badge-secondary';
  };

  if (loading) return <Loading message="Cargando mesas..." />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><TableIcon size={32} /> Gestión de Mesas</h1>
            <p>Administra las mesas del restaurante</p>
          </div>
          <Button onClick={handleAdd}>+ Nueva Mesa</Button>
        </div>

        <div className="profiles-grid">
          {tables.map((table) => (
            <Card key={table.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>Mesa {table.tableNumber}</h3>
                    <span className="profile-id">Capacidad: {table.capacity} personas</span>
                  </div>
                  <span className={`badge ${getStatusClass(table.status)}`}>
                    {getStatusBadge(table.status).replace(/^[🟢🔴🟡⚫]\s/u, '')}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  {table.location && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Ubicación:</strong> {table.location}
                    </div>
                  )}
                  <div>
                    <strong>Estado:</strong> {getStatusBadge(table.status)}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(table)}
                    title="Editar mesa"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${table.isActive ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(table.id, !!table.isActive)}
                    title={table.isActive ? 'Desactivar mesa' : 'Activar mesa'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(table)}
                    title="Eliminar mesa"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="empty-state">
            <p>No hay mesas registradas</p>
            <Button onClick={handleAdd}>Crear primera mesa</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
          onConfirm={handleSubmit}
        >
          <div className="form-grid-2">
            <Input
              label="Número de Mesa"
              name="tableNumber"
              type="number"
              value={formData.tableNumber}
              onChange={handleChange}
              required
            />
            <Input
              label="Capacidad"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
            <Input
              label="Ubicación"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="Ej: Terraza, Salón principal, Segundo piso"
            />
            <div className="form-group">
              <label className="form-label">
                Estado <span className="required">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value={TABLE_STATUS.AVAILABLE}>Disponible</option>
                <option value={TABLE_STATUS.OCCUPIED}>Ocupada</option>
                <option value={TABLE_STATUS.RESERVED}>Reservada</option>
              </select>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default TablesList;