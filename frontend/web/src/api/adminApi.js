import api from './axiosInstance';

export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const listCreators = () => api.get('/admin/creators');
export const createCreator = (data) => api.post('/admin/creators', data);
export const updateCreatorStatus = (creatorId, status) =>
  api.put(`/admin/creators/${creatorId}/status`, { status });
export const listAllForms = () => api.get('/admin/forms');
export const adminDeleteForm = (formId) => api.delete(`/admin/forms/${formId}`);