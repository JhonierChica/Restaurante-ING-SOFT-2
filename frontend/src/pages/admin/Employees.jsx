import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmployeeForm from '../../components/common/EmployeeForm';
import { EmployeeIcon } from '../../components/common/Icons';
import { employeeService } from '../../services/employeeService';
import { positionService } from '../../services/positionService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadEmployees();
    loadPositions();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setError('Error al cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await positionService.getActive();
      setPositions(data);
    } catch (error) {
      console.error('Error al cargar cargos:', error);
      setError('Error al cargar los cargos. Asegúrese de crear cargos primero.');
    }
  };

  const handleAdd = () => {
    if (positions.length === 0) {
      setError('Debe crear al menos un cargo antes de agregar empleados');
      return;
    }
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleFormComplete = async (formData) => {
    try {
      setLoading(true);
      await employeeService.createEmployee(formData);
      setSuccess('✅ Empleado creado exitosamente');
      setShowForm(false);
      await loadEmployees();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error al crear empleado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear empleado';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`¿Está seguro de eliminar a ${employee.fullName}? Esta acción también eliminará su usuario.`)) {
      try {
        await employeeService.deleteEmployee(employee.id);
        setSuccess('Empleado eliminado exitosamente');
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        setError('Error al eliminar empleado');
      }
    }
  };

  const columns = [
    {
      header: 'Nombre',
      accessor: 'fullName',
      render: (employee) => (
        <div>
          <strong>{employee.fullName}</strong>
          <br />
          <small className="text-muted">@{employee.username}</small>
        </div>
      ),
    },
    {
      header: 'Documento',
      accessor: 'documentNumber',
      render: (employee) => employee.documentNumber || <span className="text-muted">No especificado</span>,
    },
    {
      header: 'Cargo',
      accessor: 'position',
      render: (employee) => (
        <div>
          <strong>{employee.position?.name}</strong>
          <br />
          <small className="text-muted">{employee.position?.department}</small>
        </div>
      ),
    },
    {
      header: 'Perfil',
      accessor: 'profile',
      render: (employee) => (
        <span className="profile-badge">
          {employee.profile?.name}
        </span>
      ),
    },
    {
      header: 'Contacto',
      accessor: 'phone',
      render: (employee) => (
        <div>
          {employee.phone && <div>📞 {employee.phone}</div>}
          {employee.email && <div>✉️ {employee.email}</div>}
        </div>
      ),
    },
    {
      header: 'Salario',
      accessor: 'salary',
      render: (employee) => (
        employee.salary ? (
          <span className="salary">
            ${employee.salary.toLocaleString('es-CO')}
          </span>
        ) : (
          <span className="text-muted">No especificado</span>
        )
      ),
    },
    {
      header: 'Fecha Contratación',
      accessor: 'hireDate',
      render: (employee) => (
        employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('es-ES') : '-'
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
          <Button size="small" variant="danger" onClick={() => handleDelete(employee)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (loading && employees.length === 0) {
    return <Loading message="Cargando empleados..." />;
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><EmployeeIcon size={32} /> Gestión de Empleados</h1>
            <p>Administra los empleados y sus credenciales de acceso</p>
          </div>
          <Button onClick={handleAdd}>+ Nuevo Empleado</Button>
        </div>

        {error && (
          <div className="error-alert" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '6px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-alert" style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        {positions.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>⚠️ Configuración Incompleta</h3>
              <p>Antes de crear empleados, necesitas:</p>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto' }}>
                <li><strong>Crear Cargos</strong> en /admin/positions</li>
              </ul>
            </div>
          </Card>
        ) : employees.length > 0 ? (
          <Card>
            <Table columns={columns} data={employees} />
          </Card>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No hay empleados registrados</h3>
            <p>Comienza agregando tu primer empleado</p>
            <Button onClick={handleAdd}>Crear primer empleado</Button>
          </div>
        )}

        {/* Modal con Formulario */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Nuevo Empleado"
          size="large"
          showActions={false}
        >
          <EmployeeForm
            onComplete={handleFormComplete}
            onCancel={() => setShowForm(false)}
            positions={positions}
          />
        </Modal>
      </div>

      <style jsx>{`
        .profile-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #007bff;
          color: white;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .salary {
          font-weight: 600;
          color: #28a745;
        }

        .text-muted {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </Layout>
  );
};

export default Employees;
