import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { CategoryIcon } from '../../components/common/Icons';
import { categoryService } from '../../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'Descripción', field: 'description' },
  ];

  if (loading) return <Loading message="Cargando categorías..." />;

  return (
    <Layout>
      <div className="page-container">
        <Card
          title={<><CategoryIcon size={24} /> Gestión de Categorías</>}
          actions={
            <Button onClick={handleAdd}>
              + Nueva Categoría
            </Button>
          }
        >
          <Table
            columns={columns}
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

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
