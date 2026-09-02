import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

export const studentAPI = {
  getAll: (params) => API.get('/students', { params }),
  getById: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
  getStats: () => API.get('/students/stats'),
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
