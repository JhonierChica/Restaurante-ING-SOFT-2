import apiClient from './apiClient';

export const deliveryService = {
  getAllDeliveries: async () => {
    const response = await apiClient.get('/deliveries');
    return response.data;
  },

  getActiveDeliveries: async () => {
    const response = await apiClient.get('/deliveries?activeOnly=true');
    return response.data;
  },

  getDeliveryById: async (id) => {
    const response = await apiClient.get(`/deliveries/${id}`);
    return response.data;
  },

  getDeliveryByOrderId: async (orderId) => {
    const response = await apiClient.get(`/deliveries/order/${orderId}`);
    return response.data;
  },

  updateDeliveryStatus: async (id, status) => {
    const response = await apiClient.put(`/deliveries/${id}/status`, { status });
    return response.data;
  },

  getDeliveriesByStatus: async (status) => {
    const response = await apiClient.get(`/deliveries/status/${status}`);
    return response.data;
  },
};
