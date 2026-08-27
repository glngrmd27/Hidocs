import api from './axiosInstance';

export const addQuestion = (formId, data) =>
  api.post(`/forms/${formId}/questions`, data);

export const getQuestionsByForm = (formId) =>
  api.get(`/forms/${formId}/questions`);

export const updateQuestion = (questionId, data) =>
  api.put(`/questions/${questionId}`, data);

export const deleteQuestion = (questionId) =>
  api.delete(`/questions/${questionId}`);

export const deleteOption = (optionId) =>
  api.delete(`/options/${optionId}`);

export const uploadQuestionImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/questions/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};