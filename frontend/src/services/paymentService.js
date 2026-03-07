import apiClient from './apiClient';

export const paymentService = {
  getAllPayments: async () => {
    const response = await apiClient.get('/payments');
    return response.data;
  },

  getUnclosedPayments: async () => {
    const response = await apiClient.get('/payments/unclosed');
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },

  getPaymentsByOrder: async (orderId) => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },

  getPendingPayments: async () => {
    const response = await apiClient.get('/payments/pending');
    return response.data;
  },

  getPaymentsByDateRange: async (startDate, endDate) => {
    const response = await apiClient.get(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getDailySummary: async (date) => {
    const response = await apiClient.get(`/payments/daily-summary?date=${date}`);
    return response.data;
  },
};
