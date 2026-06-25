import axiosInstance from './axiosInstance';
// Ana sayfada tüm ürünleri çeken fonksiyon
export const getProductsApi = async () => {
  // axiosInstance zaten başında 'http://localhost:5021' (Gateway portunu) taşıyor.
  // Senin controller metodun [HttpGet] ve direkt kök adreste olduğu için sonuna bunu ekliyoruz:
  return await axiosInstance.get('/api/products'); 
};

export const getCategoriesApi = async () => {
  return await axiosInstance.get('/api/products/categories'); // Backend endpoint'ine göre yazdım
};


export const getProductByIdApi = async (id) => {
  return await axiosInstance.get(`/api/products/${id}`);
};

