import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Country API
export const countryAPI = {
  getAll: () => api.get('/api/country'),
  create: (data) => api.post('/api/country', data),
  update: (data) => api.put('/api/country', data),
  delete: (id) => api.delete('/api/country', { data: { id } }),
};

// DataTypes API
export const dataTypesAPI = {
  getAll: () => api.get('/api/datatypes'),
  create: (data) => api.post('/api/datatypes', data),
  update: (data) => api.put('/api/datatypes', data),
  delete: (id) => api.delete('/api/datatypes', { data: { id } }),
};

// TimeUnits API
export const timeUnitsAPI = {
  getAll: () => api.get('/api/timeunits'),
  create: (data) => api.post('/api/timeunits', data),
  update: (data) => api.put('/api/timeunits', data),
  delete: (id) => api.delete('/api/timeunits', { data: { id } }),
};

// Schedules API
export const schedulesAPI = {
  getAll: () => api.get('/api/schedules'),
  create: (data) => api.post('/api/schedules', data),
  update: (data) => api.put('/api/schedules', data),
  delete: (id) => api.delete('/api/schedules', { data: { id } }),
};

// TaskStatus API
export const taskStatusAPI = {
  getAll: () => api.get('/api/taskstatus'),
  create: (data) => api.post('/api/taskstatus', data),
  update: (data) => api.put('/api/taskstatus', data),
  delete: (id) => api.delete('/api/taskstatus', { data: { id } }),
};

// PrivacyPolicies API
export const privacyPoliciesAPI = {
  getAll: () => api.get('/api/privacypolicies'),
  create: (data) => api.post('/api/privacypolicies', data),
  update: (data) => api.put('/api/privacypolicies', data),
  delete: (id) => api.delete('/api/privacypolicies', { data: { id } }),
};

export default api;

