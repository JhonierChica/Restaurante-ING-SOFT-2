import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { BriefcaseIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { positionService } from '../../services/positionService';
import { DEPARTMENTS } from '../../utils/constants';
import type { Position } from '../../types';
import '../../styles/Positions.css';

interface PositionFormData {
  code: string;
  name: string;
  description: string;
  department: string;
  baseSalary: string;
  responsibilities: string;
}

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>({
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
    } catch (err) {
      setError('Error al cargar los cargos');
      console.error(err);
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

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      code: (position as any).code || '',
      name: position.name,
      description: (position as any).description || '',
      department: position.department,
      baseSalary: position.baseSalary?.toString() || '',
      responsibilities: (position as any).responsibilities || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleToggleStatus = async (positionId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este cargo?`)) {
      try {
        await positionService.update(positionId, { active: !currentStatus });
        loadPositions();
      } catch (err) {
        setError(`Error al ${action} el cargo`);
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await positionService.delete(id);
        loadPositions();
      } catch (err) {
        setError('Error al eliminar el cargo. Puede tener empleados asociados.');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        ...formData,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
      };

      if (editingPosition) {
        await positionService.update(editingPosition.id, submitData as Partial<Position>);
      } else {
        await positionService.create(submitData as Partial<Position>);
      }
      setShowModal(false);
      loadPositions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el cargo');
      console.error(err);
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
                    <span className="profile-id">{(position as any).code}</span>
                  </div>
                  <span className={`badge ${(position as any).active ? 'badge-success' : 'badge-danger'}`}>
                    {(position as any).active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  {(position as any).description && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <small className="text-muted">{(position as any).description}</small>
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
                    className={`icon-btn ${(position as any).active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(position.id, !!(position as any).active)}
                    title={(position as any).active ? 'Desactivar cargo' : 'Activar cargo'}
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
          showActions={false}
        >
          <form onSubmit={handleSubmit} className="position-form">
            <div className="form-grid-3">
              <Input
                label="Código *"
                name="code"
                value={formData.code}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: CHEF"
                required
                disabled={editingPosition !== null}
              />

              <Input
                label="Nombre *"
                name="name"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Chef Principal"
                required
              />

              <div className="form-group">
                <label>Departamento *</label>
                <select
                  value={formData.department}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione departamento</option>
                  {Object.entries(DEPARTMENTS).map(([key, value]: [string, string]) => (
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe brevemente el cargo"
                  className="form-input"
                />
              </div>

              <Input
                label="Salario Base"
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder="0"
                min="0"
                step="1000"
              />

              <div className="form-group col-span-3">
                <label>Responsabilidades</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, responsibilities: e.target.value })}
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