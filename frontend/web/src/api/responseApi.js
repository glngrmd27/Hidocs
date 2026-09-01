import api from './axiosInstance';

const myHistoryEndpoints = [
  '/responses/me',
  '/responses/my',
  '/responses/user',
  '/responses/current-user',
  '/submissions/me',
  '/submissions/my',
  '/users/me/responses',
  '/users/me/submissions',
  '/forms/my-responses',
];

export const getMySubmissionHistory = async () => {
  let lastError = null;

  for (const endpoint of myHistoryEndpoints) {
    try {
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404) {
        continue;
      }
      if (status === 401 || status === 403) {
        throw error;
      }
      continue;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return { data: { data: [] } };
};

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