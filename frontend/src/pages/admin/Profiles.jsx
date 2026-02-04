import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { ProfileIcon } from '../../components/common/Icons';
import { profileService } from '../../services/profileService';
import { permissionService } from '../../services/permissionService';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    permissionIds: [],
  });
  const [error, setError] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState({});

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
      code: '',
      name: '',
      description: '',
      permissionIds: [],
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      code: profile.code,
      name: profile.name,
      description: profile.description || '',
      permissionIds: profile.permissions.map(p => p.id),
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este perfil?')) {
      try {
        await profileService.delete(id);
        loadProfiles();
      } catch (error) {
        setError('Error al eliminar el perfil');
        console.error(error);
      }
    }
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

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{profile.name}</h3>
                    <span className="profile-code">{profile.code}</span>
                  </div>
                  <span className={`badge ${profile.active ? 'badge-success' : 'badge-danger'}`}>
                    {profile.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <p className="profile-description">{profile.description}</p>
                
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
                  <Button variant="secondary" onClick={() => handleEdit(profile)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(profile.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="empty-state">
            <p>No hay perfiles registrados</p>
            <Button onClick={handleCreate}>Crear primer perfil</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid-3">
              <Input
                label="Código *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: MESERO"
                required
                disabled={editingProfile !== null}
              />

              <Input
                label="Nombre *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Mesero"
                required
              />

              <div className="form-group col-span-1">
                <label>Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el perfil"
                  className="form-input"
                />
              </div>
            </div>

            <div className="permissions-section">
              <h4>Permisos del Perfil</h4>
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

      <style jsx>{`
        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .profile-header h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
        }

        .profile-code {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .profile-description {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .profile-permissions {
          border-top: 1px solid var(--color-border);
          padding-top: 1rem;
        }

        .profile-permissions strong {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
        }

        .permissions-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .permission-tag {
          padding: 0.25rem 0.75rem;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
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

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .permissions-section {
          max-height: 350px;
          overflow-y: auto;
          padding: 12px;
          background: var(--color-background);
          border-radius: 8px;
        }

        .permissions-section h4 {
          margin: 0 0 6px 0;
          color: var(--color-text-primary);
          font-size: 14px;
        }

        .text-muted {
          color: var(--color-text-secondary);
          font-size: 12px;
        }

        .permission-module {
          margin-top: 12px;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid var(--color-border);
        }

        .module-header h5 {
          margin: 0;
          color: var(--color-primary);
          font-size: 13px;
        }

        .permission-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .permission-checkbox {
          display: flex;
          align-items: start;
          gap: 8px;
          padding: 8px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .permission-checkbox:hover {
          border-color: var(--color-primary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .permission-checkbox input[type="checkbox"] {
          margin-top: 2px;
          cursor: pointer;
        }

        .permission-checkbox div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .permission-checkbox strong {
          color: var(--color-text-primary);
          font-size: 13px;
        }

        .permission-checkbox span {
          font-size: 11px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
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

export default Profiles;
