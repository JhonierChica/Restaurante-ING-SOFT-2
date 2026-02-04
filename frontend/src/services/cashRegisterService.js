import apiClient from './apiClient';

export const cashRegisterService = {
  getAllCloses: async () => {
    const response = await apiClient.get('/cash-register-closes');
    return response.data;
  },

  getCloseById: async (id) => {
    const response = await apiClient.get(`/cash-register-closes/${id}`);
    return response.data;
  },

  getLastClose: async () => {
    const response = await apiClient.get('/cash-register-closes/last');
    return response.data;
  },

  createCashRegisterClose: async (closeData) => {
    const response = await apiClient.post('/cash-register-closes', closeData);
    return response.data;
  },

  getClosesByDateRange: async (startDate, endDate) => {
    const response = await apiClient.get(
      `/cash-register-closes/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  getClosesByUser: async (closedBy) => {
    const response = await apiClient.get(`/cash-register-closes/user/${closedBy}`);
    return response.data;
  },
};
