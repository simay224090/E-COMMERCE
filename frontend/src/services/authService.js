import axiosInstance from '@/api/axiosConfig';

export const loginApi = async (credentials) => {
  // Backend'deki IdentityService endpoint'i ile eşleşmeli
  return await axiosInstance.post('/api/auth/login', credentials);
};

export const registerApi = async (userData) => {
  return await axiosInstance.post('/api/auth/register', userData);
};