import api from './axiosInstance';

export const registerUser = (data) =>
  api.post('/auth/register', data); // { name, email, password }

export const loginUser = (data) =>
  api.post('/auth/login', data); // { email, password }

export const verifyOtp = (data) =>
  api.post('/auth/verify-otp', data); // { email, otp }

export const resendOtp = (data) =>
  api.post('/auth/resend-otp', data); // { email }