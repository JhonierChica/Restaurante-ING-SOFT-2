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

  createDelivery: async (deliveryData) => {
    const response = await apiClient.post('/deliveries', deliveryData);
    return response.data;
  },

  updateDeliveryStatus: async (id, statusData) => {
    const response = await apiClient.put(`/deliveries/${id}/status`, statusData);
    return response.data;
  },

  deleteDelivery: async (id) => {
    const response = await apiClient.delete(`/deliveries/${id}`);
    return response.data;
  },

  getDeliveriesByStatus: async (status) => {
    const response = await apiClient.get(`/deliveries/status/${status}`);
    return response.data;
  },

  getDeliveriesByDeliveryPerson: async (deliveryPersonId) => {
    const response = await apiClient.get(`/deliveries/delivery-person/${deliveryPersonId}`);
    return response.data;
  },

  getDeliveriesByDateRange: async (startDate, endDate) => {
    const response = await apiClient.get(`/deliveries/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};
