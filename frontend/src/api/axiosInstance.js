import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Docker'da ayağa kalkan API Gateway adresimiz
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte (request) eğer localStorage'da token varsa otomatik olarak Header'a ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt (response) hata dönerse ve hata 401 (Unauthorized) ise kullanıcıyı logine fırlat
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;