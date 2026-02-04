import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Table from '../../components/common/Table';
import { BriefcaseIcon } from '../../components/common/Icons';
import { positionService } from '../../services/positionService';
import { DEPARTMENTS } from '../../utils/constants';

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

  const columns = [
    {
      header: 'Código',
      accessor: 'code',
      render: (position) => (
        <span className="position-code">{position.code}</span>
      ),
    },
    {
      header: 'Nombre',
      accessor: 'name',
      render: (position) => (
        <div>
          <strong>{position.name}</strong>
          <br />
          <small className="text-muted">{position.description}</small>
        </div>
      ),
    },
    {
      header: 'Departamento',
      accessor: 'department',
      render: (position) => (
        <span className="department-badge">{position.department}</span>
      ),
    },
    {
      header: 'Salario Base',
      accessor: 'baseSalary',
      render: (position) => (
        position.baseSalary ? (
          <span className="salary">
            ${position.baseSalary.toLocaleString('es-CO')}
          </span>
        ) : (
          <span className="text-muted">No especificado</span>
        )
      ),
    },
    {
      header: 'Estado',
      accessor: 'active',
      render: (position) => (
        <span className={`badge ${position.active ? 'badge-success' : 'badge-danger'}`}>
          {position.active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (position) => (
        <div className="table-actions">
          <Button size="small" variant="secondary" onClick={() => handleEdit(position)}>
            Editar
          </Button>
          <Button size="small" variant="danger" onClick={() => handleDelete(position.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

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

        {positions.length > 0 ? (
          <Card>
            <Table columns={columns} data={positions} />
          </Card>
        ) : (
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

      <style jsx>{`
        .position-code {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .department-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-size: 0.875rem;
        }

        .salary {
          font-weight: 600;
          color: var(--color-success);
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-success {
          background: #d4edda;
          color: #155724;
        }

        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .position-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .col-span-2 {
          grid-column: span 2;
        }

        .col-span-3 {
          grid-column: span 3;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 13px;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
        }

        .form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .form-select {
          cursor: pointer;
        }

        .text-muted {
          color: var(--color-text-secondary);
          font-size: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }

        @media (max-width: 1024px) {
          .form-grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .form-grid-3 {
            grid-template-columns: 1fr;
          }

          .col-span-2,
          .col-span-3 {
            grid-column: 1 / -1;
          }
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </Layout>
  );
};

export default Positions;
