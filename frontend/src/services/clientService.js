import apiClient from './apiClient';

export const clientService = {
  getAllClients: async () => {
    const response = await apiClient.get('/clients');
    return response.data;
  },

  getClientById: async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  searchClients: async (searchTerm) => {
    const response = await apiClient.get(`/clients/search?query=${searchTerm}`);
    return response.data;
  },
};
