import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { TableIcon } from '../../components/common/Icons';
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
    };
    return badges[status] || status;
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Número de Mesa', field: 'tableNumber' },
    { header: 'Capacidad', field: 'capacity' },
    { 
      header: 'Ubicación', 
      render: (row) => row.location || 'Sin ubicación' 
    },
    { 
      header: 'Estado', 
      render: (row) => getStatusBadge(row.status) 
    },
  ];

  if (loading) return <Loading message="Cargando mesas..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><TableIcon size={24} /> Gestión de Mesas</>}
          actions={
            <Button onClick={handleAdd}>
              + Nueva Mesa
            </Button>
          }
        >
          <Table
            columns={columns}
            data={tables}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
          onConfirm={handleSubmit}
        >
          <Input
            label="Número de Mesa"
            name="tableNumber"
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
        </Modal>
      </div>
    </Layout>
  );
};

export default Tables;
