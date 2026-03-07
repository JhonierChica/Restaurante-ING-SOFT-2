import apiClient from './apiClient';

export const orderService = {
  getAllOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getAllOrdersForPayments: async () => {
    const response = await apiClient.get('/orders/all-for-payments');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  getOrdersByTable: async (tableId) => {
    const response = await apiClient.get(`/orders?tableId=${tableId}`);
    return response.data;
  },

  getPendingOrders: async () => {
    const response = await apiClient.get('/orders?status=PENDIENTE');
    return response.data;
  },
};
