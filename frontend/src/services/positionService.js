import apiClient from './apiClient';

export const positionService = {
  // Obtener todos los cargos
  getAll: async () => {
    const response = await apiClient.get('/positions');
    return response.data;
  },

  // Obtener cargo por ID
  getById: async (id) => {
    const response = await apiClient.get(`/positions/${id}`);
    return response.data;
  },

  // Crear cargo
  create: async (positionData) => {
    const response = await apiClient.post('/positions', positionData);
    return response.data;
  },

  // Actualizar cargo
  update: async (id, positionData) => {
    const response = await apiClient.put(`/positions/${id}`, positionData);
    return response.data;
  },

  // Eliminar cargo
  delete: async (id) => {
    const response = await apiClient.delete(`/positions/${id}`);
    return response.data;
  },

  // Obtener cargos activos
  getActive: async () => {
    const response = await apiClient.get('/positions/active');
    return response.data;
  },

  // Obtener cargos por departamento
  getByDepartment: async (department) => {
    const response = await apiClient.get(`/positions/department/${department}`);
    return response.data;
  },
};
