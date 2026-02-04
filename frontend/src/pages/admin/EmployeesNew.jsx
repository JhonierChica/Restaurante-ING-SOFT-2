import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Table from '../../components/common/Table';
import { EmployeeIcon } from '../../components/common/Icons';
import { employeeService } from '../../services/employeeService';
import { positionService } from '../../services/positionService';

const EmployeesNew = () => {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    documentNumber: '',
    phone: '',
    address: '',
    positionId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, positionsData] = await Promise.all([
        employeeService.getAllEmployees(),
        positionService.getActive(),
      ]);
      setEmployees(employeesData);
      setPositions(positionsData);
    } catch (error) {
      setError('Error al cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      firstName: '',
      lastName: '',
      email: '',
      documentNumber: '',
      phone: '',
      address: '',
      positionId: '',
    });
    setError('');
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      documentNumber: employee.documentNumber || '',
      phone: employee.phone || '',
      address: employee.address || '',
      positionId: employee.position?.id || '',
    });
    setError('');
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este empleado?')) {
      try {
        await employeeService.deleteEmployee(id);
        loadData();
      } catch (error) {
        setError('Error al eliminar el empleado');
        console.error(error);
      }
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        ...employeeFormData,
        positionId: parseInt(employeeFormData.positionId),
      };

      console.log('📤 Enviando datos al backend:', submitData);

      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, submitData);
        setShowEmployeeModal(false);
        loadData();
        alert('Empleado actualizado exitosamente');
      } else {
        // Crear empleado
        await employeeService.createEmployee(submitData);
        setShowEmployeeModal(false);
        loadData();
        alert('Empleado creado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      setError(error.response?.data?.message || 'Error al guardar el empleado');
      console.error(error);
    }
  };

  const columns = [
    {
      header: 'Nombre Completo',
      accessor: 'fullName',
      render: (employee) => (
        <div>
          <strong>{employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Sin nombre'}</strong>
          <br />
          <small className="text-muted">{employee.email || ''}</small>
        </div>
      ),
    },
    {
      header: 'Documento',
      accessor: 'documentNumber',
      render: (employee) => employee.documentNumber || <span className="text-muted">No especificado</span>,
    },
    {
      header: 'Teléfono',
      accessor: 'phone',
      render: (employee) => employee.phone || <span className="text-muted">-</span>,
    },
    {
      header: 'Cargo',
      accessor: 'position',
      render: (employee) => (
        <div>
          <strong>{employee.position?.name || 'Sin cargo'}</strong>
          <br />
          <small className="text-muted">{employee.position?.department || ''}</small>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: 'active',
      render: (employee) => (
        <span className={`badge ${employee.active ? 'badge-success' : 'badge-danger'}`}>
          {employee.active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (employee) => (
        <div className="table-actions">
          <Button size="small" variant="secondary" onClick={() => handleEditEmployee(employee)}>
            Editar
          </Button>
          <Button size="small" variant="danger" onClick={() => handleDeleteEmployee(employee.id)}>
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
            <h1><EmployeeIcon size={32} /> Gestión de Empleados</h1>
            <p>Administra los empleados y sus usuarios de acceso</p>
          </div>
          <Button onClick={handleCreateEmployee}>+ Nuevo Empleado</Button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="info-cards">
          <Card>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-value">{employees.length}</div>
                <div className="stat-label">Total Empleados</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-value">{employees.filter(e => e.active).length}</div>
                <div className="stat-label">Activos</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div>
                <div className="stat-value">{positions.length}</div>
                <div className="stat-label">Cargos Disponibles</div>
              </div>
            </div>
          </Card>
        </div>

        {employees.length > 0 ? (
          <Card>
            <Table columns={columns} data={employees} />
          </Card>
        ) : (
          <div className="empty-state">
            <p>No hay empleados registrados</p>
            <Button onClick={handleCreateEmployee}>Crear primer empleado</Button>
          </div>
        )}

        {/* Modal Empleado */}
        <Modal
          isOpen={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
        >
          <form onSubmit={handleEmployeeSubmit} className="employee-form">
            <div className="form-section">
              <h4>📋 Información Personal</h4>
              
              <div className="form-row">
                <Input
                  label="Nombres *"
                  value={employeeFormData.firstName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
                  placeholder="Ej: Juan Carlos"
                  required
                />

                <Input
                  label="Apellidos *"
                  value={employeeFormData.lastName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
                  placeholder="Ej: Pérez García"
                  required
                />
              </div>

              <Input
                label="Email *"
                type="email"
                value={employeeFormData.email}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                placeholder="Ej: juan.perez@restaurant.com"
                required
              />

              <Input
                label="Número de Documento"
                value={employeeFormData.documentNumber}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, documentNumber: e.target.value })}
                placeholder="Ej: 1234567890"
              />

              <Input
                label="Teléfono"
                value={employeeFormData.phone}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                placeholder="Ej: 3001234567"
              />

              <Input
                label="Dirección"
                value={employeeFormData.address}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, address: e.target.value })}
                placeholder="Ej: Calle 123 #45-67"
              />
            </div>

            <div className="form-section">
              <h4>💼 Información Laboral</h4>
              
              <div className="form-group">
                <label>Cargo *</label>
                <select
                  value={employeeFormData.positionId}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, positionId: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione un cargo</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.name} - {position.department}
                    </option>
                  ))}
                </select>
                {positions.length === 0 && (
                  <small className="text-muted">
                    No hay cargos disponibles. <a href="/admin/positions">Crear cargo</a>
                  </small>
                )}
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowEmployeeModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      <style>{`
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .profile-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
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

        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }

        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .employee-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-section {
          padding: 12px;
          background: var(--color-background);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-section h4 {
          margin: 0 0 6px 0;
          color: var(--color-primary);
          font-size: 14px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
        }

        .text-muted {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .text-muted a {
          color: var(--color-primary);
          text-decoration: none;
        }

        .text-muted a:hover {
          text-decoration: underline;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
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

export default EmployeesNew;
