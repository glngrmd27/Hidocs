import api from './axiosInstance';

export const getForms = (status) =>
  api.get('/forms', { params: status ? { status } : {} });

export const getFormById = (formId) => api.get(`/forms/${formId}`);
export const createForm = (data) => api.post('/forms', data);
export const updateForm = (formId, data) => api.put(`/forms/${formId}`, data);
export const deleteForm = (formId) => api.delete(`/forms/${formId}`);
export const updateFormSettings = (formId, data) =>
  api.put(`/forms/${formId}/settings`, data);

export const importFormFromDocx = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/forms/import-docx', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPublicForm = (shortCode) =>
  api.get(`/public/forms/${shortCode}`);

export const submitForm = (formId, data) =>
  api.post(`/forms/${formId}/submit`, data);