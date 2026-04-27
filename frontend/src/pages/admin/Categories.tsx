import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { CategoryIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types';

interface FormData {
  name: string;
  description: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: (category as any).description || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} esta categoría?`)) {
      try {
        await categoryService.updateCategory(categoryId, { active: !currentStatus });
        alert(`Categoría ${action === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
        loadCategories();
      } catch (error) {
        console.error(`Error al ${action} categoría:`, error);
        alert(`Error al ${action} categoría`);
      }
    }
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`¿Está seguro de eliminar la categoría ${category.name}?`)) {
      try {
        await categoryService.deleteCategory(category.id);
        alert('Categoría eliminada exitosamente');
        loadCategories();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('Error al eliminar categoría');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        alert('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(formData);
        alert('Categoría creada exitosamente');
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar categoría');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <Loading message="Cargando categorías..." />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><CategoryIcon size={32} /> Gestión de Categorías</h1>
            <p>Administra las categorías del menú</p>
          </div>
          <Button onClick={handleAdd}>+ Nueva Categoría</Button>
        </div>

        <div className="profiles-grid">
          {categories.map((category) => (
            <Card key={category.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{category.name}</h3>
                    <span className="profile-id">ID: {category.id}</span>
                  </div>
                  <span className={`badge ${category.status || category.active ? 'badge-success' : 'badge-danger'}`}>
                    {category.status || category.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  {(category as any).description && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <small className="text-muted">{(category as any).description}</small>
                    </div>
                  )}
                  <div>
                    <strong>Fecha de creación:</strong> {(category as any).createdAt ? new Date((category as any).createdAt).toLocaleDateString('es-ES') : '-'}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(category)}
                    title="Editar categoría"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${category.active ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleStatus(category.id, !!category.active)}
                    title={category.active ? 'Desactivar categoría' : 'Activar categoría'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(category)}
                    title="Eliminar categoría"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <p>No hay categorías registradas</p>
            <Button onClick={handleAdd}>Crear primera categoría</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="form-grid-2">
            <Input
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Categories;