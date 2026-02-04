import apiClient from './apiClient';

export const tableService = {
  getAllTables: async () => {
    const response = await apiClient.get('/tables');
    return response.data;
  },

  getTableById: async (id) => {
    const response = await apiClient.get(`/tables/${id}`);
    return response.data;
  },

  createTable: async (tableData) => {
    const response = await apiClient.post('/tables', tableData);
    return response.data;
  },

  updateTable: async (id, tableData) => {
    const response = await apiClient.put(`/tables/${id}`, tableData);
    return response.data;
  },

  deleteTable: async (id) => {
    const response = await apiClient.delete(`/tables/${id}`);
    return response.data;
  },

  getAvailableTables: async () => {
    const response = await apiClient.get('/tables/available');
    return response.data;
  },
};
