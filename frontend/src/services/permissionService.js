import apiClient from './apiClient';

export const permissionService = {
  // Obtener todos los permisos
  getAll: async () => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  // Obtener permisos activos
  getActive: async () => {
    const response = await apiClient.get('/permissions/active');
    return response.data;
  },

  // Obtener permisos por módulo
  getByModule: async (module) => {
    const response = await apiClient.get(`/permissions/module/${module}`);
    return response.data;
  },

  // Obtener todos los módulos
  getModules: async () => {
    const response = await apiClient.get('/permissions/modules');
    return response.data;
  },
};
