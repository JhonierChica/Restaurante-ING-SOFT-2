import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { TableIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { tableService } from '../../services/tableService';
import { TABLE_STATUS } from '../../utils/constants';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
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
    } catch (error) {
      console.error('Error al cargar mesas:', error);
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

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || '',
      status: table.status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (tableId, isActive) => {
    const action = isActive ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} esta mesa?`)) {
      try {
        await tableService.updateTable(tableId, { isActive: !isActive });
        alert(`Mesa ${action === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
        loadTables();
      } catch (error) {
        console.error(`Error al ${action} mesa:`, error);
        alert(`Error al ${action} mesa`);
      }
    }
  };

  const handleDelete = async (table) => {
    if (window.confirm(`¿Está seguro de eliminar la mesa ${table.tableNumber}?`)) {
      try {
        await tableService.deleteTable(table.id);
        alert('Mesa eliminada exitosamente');
        loadTables();
      } catch (error) {
        console.error('Error al eliminar mesa:', error);
        alert('Error al eliminar mesa');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable.id, formData);
        alert('Mesa actualizada exitosamente');
      } else {
        await tableService.createTable(formData);
        alert('Mesa creada exitosamente');
      }
      setShowModal(false);
      loadTables();
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      alert('Error al guardar mesa');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      DISPONIBLE: '🟢 Disponible',
      OCUPADA: '🔴 Ocupada',
      RESERVADA: '🟡 Reservada',
      FUERA_DE_SERVICIO: '⚫ Fuera de servicio',
    };
    return badges[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      DISPONIBLE: 'badge-success',
      OCUPADA: 'badge-danger',
      RESERVADA: 'badge-warning',
      FUERA_DE_SERVICIO: 'badge-secondary',
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
                    {getStatusBadge(table.status).replace(/^[🟢🔴🟡⚫]\s/, '')}
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
                    onClick={() => handleToggleStatus(table.id, table.isActive)}
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
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Terraza, Salón principal, Segundo piso"
            />
            <div className="input-group">
              <label className="input-label">
                Estado <span className="required">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
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

export default Tables;
