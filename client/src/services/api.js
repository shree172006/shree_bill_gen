import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: API_BASE,
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getSession: () => API.get('/auth/session'),
};

export const studentAPI = {
  getAll: (params) => API.get('/students', { params }),
  getById: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
  getStats: (params) => API.get('/students/stats', { params }),
};

export const excelAPI = {
  downloadTemplate: () => API.get('/excel/template', { responseType: 'blob' }),
  uploadExcel: (formData) =>
    API.post('/excel/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportStudents: (params) =>
    API.get('/excel/export', {
      params,
      responseType: 'blob',
    }),
};

export const settingAPI = {
  get: () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};
