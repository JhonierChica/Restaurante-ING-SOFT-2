import apiClient from './apiClient';

export const menuService = {
  getAllMenuItems: async () => {
    const response = await apiClient.get('/menu');
    return response.data;
  },

  getMenuItemById: async (id) => {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  createMenuItem: async (menuData) => {
    const response = await apiClient.post('/menu', menuData);
    return response.data;
  },

  updateMenuItem: async (id, menuData) => {
    const response = await apiClient.put(`/menu/${id}`, menuData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  getMenuByCategory: async (categoryId) => {
    const response = await apiClient.get(`/menu/category/${categoryId}`);
    return response.data;
  },
};
