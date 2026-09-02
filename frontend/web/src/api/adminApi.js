import api from './axiosInstance';

export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const listCreators = () => api.get('/admin/creators');
export const createCreator = (data) => api.post('/admin/creators', data);
export const updateCreatorStatus = (creatorId, isActive) =>
  api.put(`/admin/creators/${creatorId}/status`, { is_active: isActive });
export const listAllForms = () => api.get('/admin/forms');
export const adminDeleteForm = (formId) => api.delete(`/admin/forms/${formId}`);

export const getRealtimeMetrics = () => api.get('/admin/metrics/realtime');
export const getSystemMetrics = () => api.get('/admin/metrics/system');
export const getLiveExams = () => api.get('/admin/metrics/live-exams');
export const getTrafficHistory = (duration = '1h') =>
  api.get('/admin/metrics/traffic-history', { params: { duration } });
export const getAdminFormMetrics = (formId) => api.get(`/admin/metrics/forms/${formId}`);

export const listAdmins = () => api.get('/superadmin/list-admin');
export const createAdmin = (data) => api.post('/superadmin/create-admin', data);