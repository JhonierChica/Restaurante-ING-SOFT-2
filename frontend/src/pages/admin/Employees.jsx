import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmployeeForm from '../../components/common/EmployeeForm';
import { EmployeeIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { employeeService } from '../../services/employeeService';
import { positionService } from '../../services/positionService';
import '../../styles/Profiles.css';

// VERSIÓN 2.0 - Diseño de tarjetas con grid layout
const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

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
    setFormError('');
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleFormComplete = async (formData) => {
    try {
      setLoading(true);
      setFormError('');
      
      if (editingEmployee) {
        // Editar empleado existente
        await employeeService.updateEmployee(editingEmployee.id, formData);
        setSuccess('✅ Empleado actualizado exitosamente');
      } else {
        // Crear nuevo empleado
        await employeeService.createEmployee(formData);
        setSuccess('✅ Empleado creado exitosamente');
      }
      
      setShowForm(false);
      setFormError('');
      setEditingEmployee(null);
      await loadEmployees();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      
      // Extraer errores de validación del backend
      const action = editingEmployee ? 'actualizar' : 'crear';
      let errorMessage = `Error al ${action} empleado`;
      if (error.response?.data?.fieldErrors) {
        const fieldErrors = error.response.data.fieldErrors;
        const errorList = Object.entries(fieldErrors)
          .map(([field, msg]) => `• ${field}: ${msg}`)
          .join('\n');
        errorMessage = `Errores de validación:\n${errorList}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormError('');
    setShowForm(true);
  };

  const handleToggleStatus = async (employeeId, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este empleado?`)) {
      try {
        await employeeService.updateEmployee(employeeId, { active: !currentStatus });
        setSuccess(`Empleado ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error(`Error al ${action} empleado:`, error);
        setError(`Error al ${action} empleado`);
      }
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
        ) : employees.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No hay empleados registrados</h3>
            <p>Comienza agregando tu primer empleado</p>
            <Button onClick={handleAdd}>Crear primer empleado</Button>
          </div>
        ) : (
          <div className="profiles-grid">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <div className="profile-card">
                  <div className="profile-header">
                    <div>
                      <h3>{employee.fullName}</h3>
                      <span className="profile-id">
                        {employee.documentNumber || 'Sin documento'}
                      </span>
                    </div>
                    <span className={`badge ${employee.active ? 'badge-success' : 'badge-danger'}`}>
                      {employee.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="profile-permissions">
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Cargo:</strong> {employee.position?.name}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Perfil:</strong> {employee.profile?.name || 'Sin perfil'}
                    </div>
                    {employee.phone && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Teléfono:</strong> {employee.phone}
                      </div>
                    )}
                    {employee.email && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Email:</strong> {employee.email}
                      </div>
                    )}
                    {employee.salary && (
                      <div>
                        <strong>Salario:</strong> ${employee.salary.toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button 
                      className="icon-btn icon-btn-edit"
                      onClick={() => handleEdit(employee)}
                      title="Editar empleado"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className={`icon-btn ${employee.active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                      onClick={() => handleToggleStatus(employee.id, employee.active)}
                      title={employee.active ? 'Desactivar empleado' : 'Activar empleado'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="icon-btn icon-btn-danger" 
                      onClick={() => handleDelete(employee)}
                      title="Eliminar empleado"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal con Formulario */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
            setFormError('');
          }}
          title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
          size="large"
          showActions={false}
        >
          <EmployeeForm
            onComplete={handleFormComplete}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
              setFormError('');
            }}
            positions={positions}
            serverError={formError}
            initialData={editingEmployee}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default Employees;
