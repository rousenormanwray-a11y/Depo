import { apiClient } from './client';

export const authAPI = {
  login: (payload: { email?: string; phoneNumber?: string; password: string }) =>
    apiClient.post('/auth/login', payload),

  register: (payload: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
  }) => apiClient.post('/auth/register', payload),

  verifyOTP: (payload: { phoneNumber: string; otp: string }) =>
    apiClient.post('/auth/verify-otp', payload),

  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (payload: { email: string }) => apiClient.post('/auth/forgot-password', payload),
  resetPassword: (payload: { token: string; password: string }) => apiClient.post('/auth/reset-password', payload),
};
