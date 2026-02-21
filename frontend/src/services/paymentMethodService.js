import apiClient from './apiClient';

export const paymentMethodService = {
  getAllPaymentMethods: async () => {
    const response = await apiClient.get('/payment-methods');
    return response.data;
  },

  getActivePaymentMethods: async () => {
    const response = await apiClient.get('/payment-methods?activeOnly=true');
    return response.data;
  },

  getPaymentMethodById: async (id) => {
    const response = await apiClient.get(`/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (paymentMethodData) => {
    const response = await apiClient.post('/payment-methods', paymentMethodData);
    return response.data;
  },

  updatePaymentMethod: async (id, paymentMethodData) => {
    const response = await apiClient.put(`/payment-methods/${id}`, paymentMethodData);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await apiClient.delete(`/payment-methods/${id}`);
    return response.data;
  },

  togglePaymentMethodStatus: async (id) => {
    const response = await apiClient.patch(`/payment-methods/${id}/toggle-status`);
    return response.data;
  },
};
