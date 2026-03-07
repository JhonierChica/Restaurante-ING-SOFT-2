import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { MenuIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        menuService.getAllMenuItems(),
        categoryService.getAllCategories(),
      ]);
      setMenuItems(menuData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      available: true,
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      available: item.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`¿Está seguro de eliminar ${item.name}?`)) {
      try {
        await menuService.deleteMenuItem(item.id);
        alert('Ítem eliminado exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar ítem:', error);
        alert('Error al eliminar ítem');
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    const action = item.available ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} ${item.name}?`)) {
      try {
        await menuService.updateMenuItem(item.id, { ...item, available: !item.available });
        alert(`Ítem ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
        loadData();
      } catch (error) {
        console.error(`Error al ${action} ítem:`, error);
        alert(`Error al ${action} ítem`);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, formData);
        alert('Ítem actualizado exitosamente');
      } else {
        await menuService.createMenuItem(formData);
        alert('Ítem creado exitosamente');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al guardar ítem:', error);
      alert('Error al guardar ítem');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (loading) return <Loading message="Cargando menú..." />;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1><MenuIcon size={32} /> Gestión de Menú</h1>
            <p>Administra los ítems del menú del restaurante</p>
          </div>
          <Button onClick={handleAdd}>
            + Nuevo Ítem
          </Button>
        </div>

        <div className="profiles-grid">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <div className="profile-card">
                <div className="profile-header">
                  <div>
                    <h3>{item.name}</h3>
                    <span className="profile-id">${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                  <span className={`badge ${item.available ? 'badge-success' : 'badge-danger'}`}>
                    {item.available ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>
                
                <div className="profile-permissions">
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>📋 Descripción:</strong> {item.description || '-'}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>🏷️ Categoría:</strong> {getCategoryName(item.categoryId)}
                  </div>
                  <div>
                    <strong>💵 Precio:</strong> ${parseFloat(item.price).toFixed(2)}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="icon-btn icon-btn-edit" 
                    onClick={() => handleEdit(item)}
                    title="Editar ítem"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`icon-btn ${item.available ? 'icon-btn-warning' : 'icon-btn-success'}`}
                    onClick={() => handleToggleAvailability(item)}
                    title={item.available ? 'Desactivar ítem' : 'Activar ítem'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="icon-btn icon-btn-danger" 
                    onClick={() => handleDelete(item)}
                    title="Eliminar ítem"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="empty-state">
            <p>No hay ítems en el menú</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Editar Ítem' : 'Nuevo Ítem'}
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
              label="Precio"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              required
            />
            <div className="input-group col-span-2">
              <label className="input-label">
                Descripción <span className="required">*</span>
              </label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">
                Categoría <span className="required">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="input"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Disponible
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Menu;
