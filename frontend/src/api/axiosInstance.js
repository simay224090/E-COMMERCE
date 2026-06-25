import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token ekleme (Aynı, standart)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 ve 403 yönetimi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // 💡 ÇÖZÜM ADIMI 1: Hatanın hangi endpoint'ten geldiğini yakalıyoruz
      const requestUrl = error.config?.url;

      // 401: Token geçersiz veya süresi dolmuş
      if (status === 401) {
        // 💡 ÇÖZÜM ADIMI 2: Eğer bu hata zaten Login işleminden geliyorsa SAYFAYI YÖNLENDİRME!
        // Yönlendirme yapmadığımız için hata doğrudan Login.jsx'teki catch bloğuna düşecek.
        if (requestUrl && !requestUrl.includes('/api/auth/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      // 403: Token geçerli ama Admin yetkisi yok
      if (status === 403) {
        console.warn("Bu işlemi yapmaya yetkiniz yok!");
        window.location.href = '/unauthorized'; 
      }
    }
    // 💡 ÇÖZÜM ADIMI 3: Hata ne olursa olsun yoluna devam edip catch'e ulaşmasını sağlıyoruz
    return Promise.reject(error);
  }
);

export default axiosInstance;