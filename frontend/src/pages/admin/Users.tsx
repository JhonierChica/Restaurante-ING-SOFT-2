import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { UsersIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { userService } from '../../services/userService';
import { profileService } from '../../services/profileService';
import { employeeService } from '../../services/employeeService';
import type { User, Profile, Employee } from '../../types';

interface UserFormData {
  username: string;
  fullName: string;
  password?: string;
  profileId: string;
  employeeId: string;
  active?: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
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
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await profileService.getActive();
      setProfiles(data);
    } catch (err) {
      console.error('Error al cargar perfiles:', err);
    }
  };

  const loadAvailableEmployees = async () => {
    try {
      const data = await employeeService.getEmployeesWithoutUser();
      setAvailableEmployees(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
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
      profileId: profiles[0]?.id.toString() || '',
      employeeId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName || '',
      password: '',
      profileId: user.profile?.id.toString() || '',
      employeeId: '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este usuario?`)) {
      try {
        await userService.updateUser(userId, { active: !currentStatus });
        loadUsers();
      } catch (err) {
        console.error(`Error al ${action} usuario:`, err);
      }
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.username}?`)) {
      try {
        await userService.deleteUser(user.id);
        loadUsers();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.username?.trim()) { alert('El nombre de usuario es obligatorio'); return; }
      if (!formData.profileId) { alert('Debe seleccionar un perfil'); return; }
      if (!editingUser) {
        if (!formData.password?.trim()) { alert('La contraseña es obligatoria'); return; }
        if (!formData.employeeId) { alert('Debe seleccionar un empleado'); return; }
      }

      const dataToSubmit: any = {
        username: formData.username.trim(),
        fullName: formData.fullName ? formData.fullName.trim() : '',
        profileId: parseInt(formData.profileId),
      };

      if (formData.password?.trim()) {
        dataToSubmit.password = formData.password.trim();
      }
      
      if (!editingUser) {
        dataToSubmit.employeeId = parseInt(formData.employeeId);
        dataToSubmit.active = true;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, dataToSubmit);
      } else {
        await userService.createUser(dataToSubmit);
      }
      setShowModal(false);
      loadUsers();
      loadAvailableEmployees();
    } catch (err: any) {
      console.error('Error al guardar usuario:', err);
      alert(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'employeeId' && value) {
      const selectedEmployee = availableEmployees.find(emp => emp.id === parseInt(value));
      if (selectedEmployee) {
        const fullName = selectedEmployee.fullName || `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
        setFormData({
          ...formData,
          employeeId: value,
          fullName: fullName,
          username: selectedEmployee.email ? selectedEmployee.email.split('@')[0] : '',
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <Loading message="Cargando usuarios..." />;

  return (
    <Layout>
      <div className="page-container p-4 md:p-8">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <UsersIcon size={32} className="text-blue-600" /> Gestión de Usuarios
            </h1>
            <p className="text-gray-500 mt-1">Administra los usuarios y sus credenciales de acceso</p>
          </div>
          <Button onClick={handleAdd} className="shadow-lg shadow-blue-100 font-bold px-6 py-3 rounded-2xl">
            + Nuevo Usuario
          </Button>
        </div>

        <div className="profiles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const isActive = !!user.active;
            return (
              <Card key={user.id}>
                <div className="profile-card relative h-full flex flex-col">
                  <div className="profile-header flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-800 leading-tight mb-1">{user.username}</h3>
                      <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">{user.fullName || 'Sin nombre'}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="profile-permissions flex-1 space-y-3 mb-6">
                    <div className="text-sm">
                      <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Perfil de Seguridad</span>
                      <p className="font-bold text-gray-700">{user.profile?.name || 'Sin perfil'}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Registro</span>
                      <p className="text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="card-actions flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <button 
                      className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all" 
                      onClick={() => handleEdit(user)}
                      title="Editar usuario"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className={`flex-1 flex items-center justify-center p-2.5 rounded-xl transition-all ${isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      onClick={() => handleToggleStatus(user.id, isActive)}
                      title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all" 
                      onClick={() => handleDelete(user)}
                      title="Eliminar usuario"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="empty-state py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No hay usuarios registrados</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="space-y-6">
            {!editingUser && (
              <div className="form-group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Seleccionar Empleado <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-sm"
                  required
                >
                  <option value="">Seleccione un empleado...</option>
                  {availableEmployees.map(employee => {
                     const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
                     return (
                        <option key={employee.id} value={employee.id}>
                           {fullName}
                        </option>
                     );
                  })}
                </select>
                <p className="mt-2 text-[10px] text-gray-400 italic">Solo se muestran empleados sin usuario asignado</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre de Usuario" name="username" value={formData.username} onChange={handleChange} required />
              <Input label="Nombre Completo" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!editingUser && !!formData.employeeId} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Contraseña" type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} required={!editingUser} />
              <div className="form-group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Perfil de Seguridad <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="profileId"
                  value={formData.profileId}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-sm"
                  required
                >
                  <option value="">Seleccione un perfil...</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} {profile.code ? `(${profile.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Users;