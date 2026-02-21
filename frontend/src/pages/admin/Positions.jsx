import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Table from '../../components/common/Table';
import { BriefcaseIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { positionService } from '../../services/positionService';
import { DEPARTMENTS } from '../../utils/constants';
import '../../styles/Positions.css';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: '',
    baseSalary: '',
    responsibilities: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await positionService.getAll();
      setPositions(data);
    } catch (error) {
      setError('Error al cargar los cargos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      department: '',
      baseSalary: '',
      responsibilities: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setFormData({
      code: position.code,
      name: position.name,
      description: position.description || '',
      department: position.department,
      baseSalary: position.baseSalary?.toString() || '',
      responsibilities: position.responsibilities || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleToggleStatus = async (positionId, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este cargo?`)) {
      try {
        await positionService.update(positionId, { active: !currentStatus });
        loadPositions();
      } catch (error) {
        setError(`Error al ${action} el cargo`);
        console.error(error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await positionService.delete(id);
        loadPositions();
      } catch (error) {
        setError('Error al eliminar el cargo. Puede tener empleados asociados.');
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        ...formData,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
      };

      if (editingPosition) {
        await positionService.update(editingPosition.id, submitData);
      } else {
        await positionService.create(submitData);
      }
      setShowModal(false);
      loadPositions();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el cargo');
      console.error(error);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><BriefcaseIcon size={32} /> Gestión de Cargos</h1>
            <p>Administra los cargos laborales de la empresa</p>
          </div>
          <Button onClick={handleCreate}>+ Nuevo Cargo</Button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="profiles-grid">
          {positions.map((position) => (
            <Card key={position.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{position.name}</h3>
                    <span className="profile-id">{position.code}</span>
                  </div>
                  <span className={`badge ${position.active ? 'badge-success' : 'badge-danger'}`}>
                    {position.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  {position.description && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <small className="text-muted">{position.description}</small>
                    </div>
                  )}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Departamento:</strong> {position.department}
                  </div>
                  {position.baseSalary && (
                    <div>
                      <strong>Salario Base:</strong> ${position.baseSalary.toLocaleString('es-CO')}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(position)}
                    title="Editar cargo"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${position.active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(position.id, position.active)}
                    title={position.active ? 'Desactivar cargo' : 'Activar cargo'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(position.id)}
                    title="Eliminar cargo"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {positions.length === 0 && (
          <div className="empty-state">
            <p>No hay cargos registrados</p>
            <Button onClick={handleCreate}>Crear primer cargo</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingPosition ? 'Editar Cargo' : 'Nuevo Cargo'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="position-form">
            <div className="form-grid-3">
              <Input
                label="Código *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: CHEF"
                required
                disabled={editingPosition !== null}
              />

              <Input
                label="Nombre *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Chef Principal"
                required
              />

              <div className="form-group">
                <label>Departamento *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione departamento</option>
                  {Object.entries(DEPARTMENTS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-span-2">
                <label>Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe brevemente el cargo"
                  className="form-input"
                />
              </div>

              <Input
                label="Salario Base"
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder="0"
                min="0"
                step="1000"
              />

              <div className="form-group col-span-3">
                <label>Responsabilidades</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Enumera las principales responsabilidades del cargo"
                  rows={2}
                  className="form-textarea"
                />
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingPosition ? 'Actualizar' : 'Crear'} Cargo
              </Button>
            </div>
          </form>
        </Modal>
      </div>

     
    </Layout>
  );
};

export default Positions;
