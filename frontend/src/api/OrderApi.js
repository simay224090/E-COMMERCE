// src/api/orderApi.js
import axiosInstance from './axiosInstance';

// Zaten var olan fonksiyonun (Sipariş Oluşturma)
export const createOrderApi = async (orderItems, userId) => {
  // Nesneye sarmalamadan, direkt array'in (listenin) kendisini gövde (body) olarak gönderiyoruz
  return await axiosInstance.post('/api/orders', orderItems, {
    headers: { 
      'X-User-Id': userId,
      'Content-Type': 'application/json'
    }
  });
};

// 🌟 YENİ EKLENEN: Kullanıcının Geçmiş Siparişlerini Getirme
export const getUserOrdersApi = async (userId) => {
  // Order Service'inden verileri çekiyoruz. 
  // (Backend'deki endpoint /api/orders/user/{id} şeklindeyse burası tam uyacaktır)
  return await axiosInstance.get(`/api/orders/user/${userId}`, {
    headers: { 
      'X-User-Id': userId,
      'Content-Type': 'application/json'
    }
  });
};