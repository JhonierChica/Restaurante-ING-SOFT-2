import apiClient from './apiClient';

export const profileService = {
  // Obtener todos los perfiles
  getAll: async () => {
    const response = await apiClient.get('/profiles');
    return response.data;
  },

  // Obtener perfil por ID
  getById: async (id) => {
    const response = await apiClient.get(`/profiles/${id}`);
    return response.data;
  },

  // Crear perfil
  create: async (profileData) => {
    const response = await apiClient.post('/profiles', profileData);
    return response.data;
  },

  // Actualizar perfil
  update: async (id, profileData) => {
    const response = await apiClient.put(`/profiles/${id}`, profileData);
    return response.data;
  },

  // Eliminar perfil
  delete: async (id) => {
    const response = await apiClient.delete(`/profiles/${id}`);
    return response.data;
  },

  // Cambiar estado del perfil (activo/inactivo)
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/profiles/${id}/toggle-status`);
    return response.data;
  },

  // Obtener perfiles activos
  getActive: async () => {
    const response = await apiClient.get('/profiles/active');
    return response.data;
  },

  // Obtener perfil por código
  getByCode: async (code) => {
    const response = await apiClient.get(`/profiles/code/${code}`);
    return response.data;
  },
};
