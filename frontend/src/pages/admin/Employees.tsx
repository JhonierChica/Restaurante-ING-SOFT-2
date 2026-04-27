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
import type { Employee, Position } from '../../types';
import '../../styles/Profiles.css';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
    loadPositions();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await positionService.getActive();
      setPositions(data);
    } catch (err) {
      console.error('Error al cargar cargos:', err);
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

  const handleFormComplete = async (formData: any) => {
    try {
      setLoading(true);
      setFormError('');
      
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        setSuccess('✅ Empleado actualizado exitosamente');
      } else {
        await employeeService.createEmployee(formData);
        setSuccess('✅ Empleado creado exitosamente');
      }
      
      setShowForm(false);
      setFormError('');
      setEditingEmployee(null);
      await loadEmployees();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      const action = editingEmployee ? 'actualizar' : 'crear';
      let errorMessage = `Error al ${action} empleado`;
      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors;
        const errorList = Object.entries(fieldErrors)
          .map(([field, msg]) => `• ${field}: ${msg}`)
          .join('\n');
        errorMessage = `Errores de validación:\n${errorList}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormError('');
    setShowForm(true);
  };

  const handleToggleStatus = async (employeeId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este empleado?`)) {
      try {
        await employeeService.updateEmployee(employeeId, { active: !currentStatus });
        setSuccess(`Empleado ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(`Error al ${action} empleado:`, err);
        setError(`Error al ${action} empleado`);
      }
    }
  };

  const handleDelete = async (employee: Employee) => {
    const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
    if (window.confirm(`¿Está seguro de eliminar a ${fullName}? Esta acción también eliminará su usuario.`)) {
      try {
        await employeeService.deleteEmployee(employee.id);
        setSuccess('Empleado eliminado exitosamente');
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error al eliminar empleado:', err);
        setError('Error al eliminar empleado');
      }
    }
  };

  if (loading && employees.length === 0) {
    return <Loading message="Cargando empleados..." />;
  }

  return (
    <Layout>
      <div className="page-container p-4 md:p-8">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <EmployeeIcon size={32} className="text-blue-600" /> Gestión de Empleados
            </h1>
            <p className="text-gray-500 mt-1">Administra los empleados y sus credenciales de acceso</p>
          </div>
          <Button onClick={handleAdd} className="shadow-lg shadow-blue-100 font-bold px-6 py-3 rounded-2xl">
            + Nuevo Empleado
          </Button>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">{error}</div>}
        {success && <div className="p-4 mb-6 bg-green-50 text-green-600 rounded-2xl border border-green-100 font-bold">{success}</div>}

        {positions.length === 0 ? (
          <Card className="text-center py-12">
            <h3 className="text-xl font-black text-gray-800 mb-2">⚠️ Configuración Incompleta</h3>
            <p className="text-gray-500">Antes de crear empleados, necesitas crear Cargos en la sección de administración.</p>
          </Card>
        ) : employees.length === 0 ? (
          <div className="empty-state py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <h3 className="font-black text-gray-400">No hay empleados registrados</h3>
            <Button onClick={handleAdd} className="mt-4">Crear primer empleado</Button>
          </div>
        ) : (
          <div className="profiles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
              const isActive = !!(employee.active || employee.status);
              return (
                <Card key={employee.id}>
                  <div className="profile-card relative h-full flex flex-col">
                    <div className="profile-header flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-800 leading-tight mb-1">{fullName}</h3>
                        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">
                          {employee.documentNumber || employee.document || 'Sin documento'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <div className="profile-permissions flex-1 space-y-3 mb-6">
                      <div className="text-sm">
                        <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Cargo / Perfil</span>
                        <p className="font-bold text-gray-700">{employee.position?.name || 'N/A'} — {employee.profile?.name || 'Sin perfil'}</p>
                      </div>
                      {(employee.phone || employee.email) && (
                        <div className="text-sm">
                          <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Contacto</span>
                          <p className="text-gray-600">{employee.phone || ''} {employee.email ? `| ${employee.email}` : ''}</p>
                        </div>
                      )}
                      {employee.salary && (
                        <div className="text-sm">
                          <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Salario</span>
                          <p className="font-bold text-blue-600">${employee.salary.toLocaleString('es-CO')}</p>
                        </div>
                      )}
                    </div>

                    <div className="card-actions flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                      <button 
                        className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                        onClick={() => handleEdit(employee)}
                        title="Editar empleado"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button 
                        className={`flex-1 flex items-center justify-center p-2.5 rounded-xl transition-all ${isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        onClick={() => handleToggleStatus(employee.id, isActive)}
                        title={isActive ? 'Desactivar empleado' : 'Activar empleado'}
                      >
                        <ToggleIcon size={18} />
                      </button>
                      <button 
                        className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all" 
                        onClick={() => handleDelete(employee)}
                        title="Eliminar empleado"
                      >
                        <DeleteIcon size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

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