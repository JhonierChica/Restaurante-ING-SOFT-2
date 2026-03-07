import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ProfileIcon, EditIcon, ToggleIcon, DeleteIcon } from '../../components/common/Icons';
import { profileService } from '../../services/profileService';
import { permissionService } from '../../services/permissionService';
import '../../styles/Profiles.css';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [_permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [formData, setFormData] = useState({
    name: '',
    permissionIds: [],
  });
  const [error, setError] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    loadProfiles();
    loadPermissions();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAll();
      setProfiles(data);
    } catch (error) {
      setError('Error al cargar los perfiles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await permissionService.getActive();
      setPermissions(data);
      
      // Agrupar permisos por módulo
      const grouped = data.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      }, {});
      setGroupedPermissions(grouped);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      permissionIds: [],
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      permissionIds: profile.permissions.map(p => p.id),
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: '¿Eliminar Perfil?',
      message: 'Esta acción eliminará permanentemente el perfil y no se puede deshacer. ¿Desea continuar?',
      onConfirm: async () => {
        try {
          await profileService.delete(id);
          loadProfiles();
        } catch (error) {
          setError('Error al eliminar el perfil');
          console.error(error);
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} Perfil?`,
      message: `¿Está seguro de que desea ${action} este perfil?`,
      onConfirm: async () => {
        try {
          await profileService.toggleStatus(id);
          loadProfiles();
        } catch (error) {
          setError(`Error al ${action} el perfil`);
          console.error(error);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProfile) {
        await profileService.update(editingProfile.id, formData);
      } else {
        await profileService.create(formData);
      }
      setShowModal(false);
      loadProfiles();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el perfil');
      console.error(error);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const handleSelectAllModule = (module) => {
    const modulePermissionIds = groupedPermissions[module].map(p => p.id);
    const allSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos
      setFormData(prev => ({
        ...prev,
        permissionIds: prev.permissionIds.filter(id => !modulePermissionIds.includes(id))
      }));
    } else {
      // Seleccionar todos
      setFormData(prev => ({
        ...prev,
        permissionIds: [...new Set([...prev.permissionIds, ...modulePermissionIds])]
      }));
    }
  };

  if (loading) return <Loading />;

  // Filtrar perfiles según el estado seleccionado
  const filteredProfiles = profiles.filter(profile => {
    if (filterStatus === 'active') return profile.active;
    if (filterStatus === 'inactive') return !profile.active;
    return true; // 'all'
  });

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><ProfileIcon size={32} /> Gestión de Perfiles</h1>
            <p>Administra los perfiles de seguridad y sus permisos</p>
          </div>
          <Button onClick={handleCreate}>+ Nuevo Perfil</Button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* Filtros */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos ({profiles.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Activos ({profiles.filter(p => p.active).length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Inactivos ({profiles.filter(p => !p.active).length})
          </button>
        </div>

        <div className="profiles-grid">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{profile.name}</h3>
                    <span className="profile-id">ID: {profile.id}</span>
                  </div>
                  <span className={`badge ${profile.active ? 'badge-success' : 'badge-danger'}`}>
                    {profile.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  <strong>Permisos: {profile.permissions?.length || 0}</strong>
                  <div className="permissions-tags">
                    {profile.permissions?.slice(0, 5).map(permission => (
                      <span key={permission.id} className="permission-tag">
                        {permission.name}
                      </span>
                    ))}
                    {profile.permissions?.length > 5 && (
                      <span className="permission-tag">+{profile.permissions.length - 5} más</span>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(profile)}
                    title="Editar perfil"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${profile.active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(profile.id, profile.active)}
                    title={profile.active ? 'Desactivar perfil' : 'Activar perfil'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(profile.id)}
                    title="Eliminar perfil"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="empty-state">
            <p>
              {filterStatus === 'all' && 'No hay perfiles registrados'}
              {filterStatus === 'active' && 'No hay perfiles activos'}
              {filterStatus === 'inactive' && 'No hay perfiles inactivos'}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={handleCreate}>Crear primer perfil</Button>
            )}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <div>
                <strong>Importante:</strong> El nombre del perfil debe tener máximo 12 caracteres.
                Ejemplos válidos: MESERO, CAJERO, ADMINISTRADOR, SUPERVISOR
              </div>
            </div>

            <div className="form-grid-3">
              <Input
                label="Nombre del Perfil *"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (value.length <= 12) {
                    setFormData({ ...formData, name: value });
                  }
                }}
                placeholder="Ej: ADMINISTRADOR"
                maxLength={12}
                required
              />
              <div className="char-counter">
                {formData.name.length}/12 caracteres
              </div>
            </div>

            <div className="permissions-section">
              <h4>Permisos del Perfil ({formData.permissionIds.length} seleccionados)</h4>
              <p className="text-muted">Selecciona los permisos que tendrá este perfil</p>
              
              {Object.keys(groupedPermissions).map(module => (
                <div key={module} className="permission-module">
                  <div className="module-header">
                    <h5>📦 {module.toUpperCase()}</h5>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => handleSelectAllModule(module)}
                    >
                      {groupedPermissions[module].every(p => formData.permissionIds.includes(p.id))
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos'}
                    </Button>
                  </div>
                  <div className="permission-list">
                    {groupedPermissions[module].map(permission => (
                      <label key={permission.id} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                        <div>
                          <strong>{permission.name}</strong>
                          <span className="text-muted">{permission.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProfile ? 'Actualizar' : 'Crear'} Perfil
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'danger' ? 'Eliminar' : 'Confirmar'}
        cancelText="Cancelar"
      />
    </Layout>
  );
};

export default Profiles;
