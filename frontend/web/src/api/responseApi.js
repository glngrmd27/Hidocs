import api from './axiosInstance';

export const getFormResponses = (formId) =>
  api.get(`/forms/${formId}/responses`);

export const getResponseById = (responseId) =>
  api.get(`/responses/${responseId}`);

export const gradeResponse = (responseId, totalScore) =>
  api.put(`/responses/${responseId}/grade`, { total_score: totalScore });

export const exportResponses = (formId) =>
  api.get(`/forms/${formId}/export`);

export const getAnalytics = (formId) =>
  api.get(`/forms/${formId}/analytics`);