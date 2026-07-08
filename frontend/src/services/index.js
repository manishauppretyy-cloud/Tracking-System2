import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  remove: (id) => api.delete(`/vehicles/${id}`),
  assignDriver: (id, driverId) => api.post(`/vehicles/${id}/assign-driver`, { driverId }),
};

export const driverService = {
  getAll: (params) => api.get('/drivers', { params }),
  getOne: (id) => api.get(`/drivers/${id}`),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  remove: (id) => api.delete(`/drivers/${id}`),
};

export const shipmentService = {
  getAll: (params) => api.get('/shipments', { params }),
  getOne: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  remove: (id) => api.delete(`/shipments/${id}`),
};

export const locationService = {
  getLive: () => api.get('/locations/live'),
  getHistory: (vehicleId) => api.get(`/locations/${vehicleId}`),
};

export const analyticsService = {
  getStats: () => api.get('/analytics/stats'),
  getDeliveryTrend: () => api.get('/analytics/delivery-trend'),
  getVehicleStatus: () => api.get('/analytics/vehicle-status'),
};
