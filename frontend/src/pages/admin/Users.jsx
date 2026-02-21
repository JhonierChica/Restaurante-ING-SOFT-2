import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { UsersIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { userService } from '../../services/userService';
import { profileService } from '../../services/profileService';
import { employeeService } from '../../services/employeeService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    profileId: '',
    employeeId: '',
  });

  useEffect(() => {
    loadUsers();
    loadProfiles();
    loadAvailableEmployees();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await profileService.getActive();
      setProfiles(data);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      alert('Error al cargar perfiles. Cree perfiles primero.');
    }
  };

  const loadAvailableEmployees = async () => {
    try {
      const data = await employeeService.getEmployeesWithoutUser();
      setAvailableEmployees(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const handleAdd = () => {
    if (profiles.length === 0) {
      alert('Debe crear perfiles primero en /admin/profiles');
      return;
    }
    if (availableEmployees.length === 0) {
      alert('No hay empleados disponibles sin usuario. Cree empleados primero en /admin/employees');
      return;
    }
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      password: '',
      profileId: profiles[0]?.id || '',
      employeeId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName || '',
      password: '',
      profileId: user.profile?.id || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este usuario?`)) {
      try {
        await userService.updateUser(userId, { active: !currentStatus });
        alert(`Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
        loadUsers();
      } catch (error) {
        console.error(`Error al ${action} usuario:`, error);
        alert(`Error al ${action} usuario`);
      }
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.username}?`)) {
      try {
        await userService.deleteUser(user.id);
        alert('Usuario eliminado exitosamente');
        loadUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validar campos obligatorios
      if (!formData.username || !formData.username.trim()) {
        alert('El nombre de usuario es obligatorio');
        return;
      }
      
      if (!formData.profileId) {
        alert('Debe seleccionar un perfil');
        return;
      }
      
      if (!editingUser) {
        if (!formData.password || !formData.password.trim()) {
          alert('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
        if (!formData.employeeId) {
          alert('Debe seleccionar un empleado');
          return;
        }
      }

      // Convertir IDs a número y limpiar espacios
      const dataToSubmit = {
        username: formData.username.trim(),
        fullName: formData.fullName ? formData.fullName.trim() : '',
        password: formData.password ? formData.password.trim() : undefined,
        profileId: parseInt(formData.profileId),
      };
      
      // Solo incluir employeeId si se está creando (no editando)
      if (!editingUser) {
        dataToSubmit.employeeId = parseInt(formData.employeeId);
        dataToSubmit.active = true; // Los nuevos usuarios siempre se crean activos
      }
      
      // Si es edición y no hay password, no enviar el campo
      if (editingUser && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, dataToSubmit);
        alert('Usuario actualizado exitosamente');
      } else {
        await userService.createUser(dataToSubmit);
        alert('Usuario creado exitosamente');
      }
      setShowModal(false);
      loadUsers();
      loadAvailableEmployees(); // Recargar empleados disponibles
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar usuario';
      alert(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si cambia el empleado seleccionado, auto-llenar campos
    if (name === 'employeeId' && value) {
      const selectedEmployee = availableEmployees.find(emp => emp.id === parseInt(value));
      if (selectedEmployee) {
        setFormData({
          ...formData,
          employeeId: value,
          fullName: selectedEmployee.fullName,
          username: selectedEmployee.email ? selectedEmployee.email.split('@')[0] : '', // Sugerir username desde email
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading) return <Loading message="Cargando usuarios..." />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><UsersIcon size={32} /> Gestión de Usuarios</h1>
            <p>Administra los usuarios y sus credenciales de acceso</p>
          </div>
          <Button onClick={handleAdd}>+ Nuevo Usuario</Button>
        </div>

        <div className="profiles-grid">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{user.username}</h3>
                    <span className="profile-id">{user.fullName}</span>
                  </div>
                  <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Perfil:</strong> {user.profile?.name || 'Sin perfil'}
                  </div>
                  <div>
                    <strong>Fecha de registro:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '-'}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(user)}
                    title="Editar usuario"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${user.active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(user.id, user.active)}
                    title={user.active ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(user)}
                    title="Eliminar usuario"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            <p>No hay usuarios registrados</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          onConfirm={handleSubmit}
          size="large"
        >
          <div className="form-grid-2">
            {!editingUser && (
              <div className="input-group col-span-2">
                <label className="input-label">
                  Seleccionar Empleado <span className="required">*</span>
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Seleccione un empleado...</option>
                  {availableEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
                <small className="helper-text">
                  Solo se muestran empleados sin usuario asignado
                </small>
              </div>
            )}
            
            <Input
              label="Nombre de Usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!editingUser && formData.employeeId}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''}
              required={!editingUser}
            />
            <div className="input-group">
              <label className="input-label">
                Perfil <span className="required">*</span>
              </label>
              <select
                name="profileId"
                value={formData.profileId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccione un perfil...</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Users;
