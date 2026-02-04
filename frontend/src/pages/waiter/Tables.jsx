import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
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

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      status: table.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      // Solo actualizar el estado
      await tableService.updateTable(editingTable.id, {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location,
        status: formData.status,
      });
      alert('Estado de mesa actualizado exitosamente');
      setShowModal(false);
      loadTables();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado de mesa');
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
          title={<><TableIcon size={24} /> Estado de Mesas</>}
        >
          <Table
            columns={columns}
            data={tables}
            onEdit={handleEdit}
            showDelete={false}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Cambiar Estado de Mesa"
          onConfirm={handleSubmit}
        >
          <div style={{ marginBottom: '1rem' }}>
            <strong>Mesa:</strong> {editingTable?.tableNumber} <br />
            <strong>Capacidad:</strong> {editingTable?.capacity} personas
          </div>
          
          <div className="input-group">
            <label className="input-label">
              Estado <span className="required">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
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

export default Tables;
