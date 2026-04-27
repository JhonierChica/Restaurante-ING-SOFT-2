import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { MenuIcon, EditIcon, DeleteIcon, ToggleIcon } from '../../components/common/Icons';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import type { MenuItem, Category } from '../../types';

interface MenuFormData {
  name: string;
  description: string;
  price: string | number;
  categoryId: string | number;
  available: boolean;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
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
    } catch (err) {
      console.error('Error al cargar datos:', err);
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

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId || '',
      available: item.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (window.confirm(`¿Está seguro de eliminar ${item.name}?`)) {
      try {
        await menuService.deleteMenuItem(item.id);
        loadData();
      } catch (err) {
        console.error('Error al eliminar ítem:', err);
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const action = item.available ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} ${item.name}?`)) {
      try {
        await menuService.updateMenuItem(item.id, { ...item, available: !item.available });
        loadData();
      } catch (err) {
        console.error(`Error al ${action} ítem:`, err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId)
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, dataToSave as Partial<MenuItem>);
      } else {
        await menuService.createMenuItem(dataToSave as Partial<MenuItem>);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error al guardar ítem:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'N/A';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (loading) return <Loading message="Cargando menú..." />;

  return (
    <Layout>
      <div className="page-container p-4 md:p-8">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <MenuIcon size={32} className="text-blue-600" /> Gestión de Menú
            </h1>
            <p className="text-gray-500 mt-1">Administra los ítems del menú del restaurante</p>
          </div>
          <Button onClick={handleAdd} className="shadow-lg shadow-blue-100 font-bold px-6 py-3 rounded-2xl">
            + Nuevo Ítem
          </Button>
        </div>

        <div className="profiles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <div className="profile-card relative h-full flex flex-col">
                <div className="profile-header flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-800 leading-tight mb-1">{item.name}</h3>
                    <div className="text-blue-600 font-black text-xl">
                      ${(Number(item.price) || 0).toFixed(2)}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.available ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>

                <div className="profile-permissions flex-1 space-y-3 mb-6">
                  <div className="text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Descripción</span>
                    <p className="text-gray-600 line-clamp-2">{item.description || 'Sin descripción'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Categoría</span>
                    <p className="font-bold text-gray-700">{getCategoryName(item.categoryId)}</p>
                  </div>
                </div>

                <div className="card-actions flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                  <button
                    className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                    onClick={() => handleEdit(item)}
                    title="Editar ítem"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center p-2.5 rounded-xl transition-all ${item.available ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    onClick={() => handleToggleAvailability(item)}
                    title={item.available ? 'Desactivar ítem' : 'Activar ítem'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
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
          <div className="empty-state py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold">No hay ítems en el menú</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Editar Ítem' : 'Nuevo Ítem'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
              />
            </div>
            
            <div className="form-group">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Descripción <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e: any) => handleChange(e)}
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-sm h-24 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="form-group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Categoría <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-sm"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group flex h-[58px] items-center px-4 bg-gray-50 rounded-2xl border-2 border-transparent">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-600 transition-all"
                  />
                  <span className="text-sm font-bold text-gray-600">Disponible para la venta</span>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Menu;
