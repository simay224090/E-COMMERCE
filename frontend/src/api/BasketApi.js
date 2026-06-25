import axiosInstance from './axiosInstance';

// Sepeti getir (GET)
export const getBasketApi = async (userId) => {
  return await axiosInstance.get('/api/basket', {
    headers: { 'X-User-Id': userId } // Header buraya gelecek!
  });
};

// Sepete ürün ekle (POST) -> Rotası: /items
// src/api/basketApi.js içindeki fonksiyonun tam hali bu olmalı:
// src/api/basketApi.js - addToBasketApi fonksiyonunu bu hale getir
export const addToBasketApi = async (itemDto, userId) => {
    
    // --- DEBUG BAŞLANGICI ---
    console.log("=== API İstek Detayları ===");
    console.log("Hedef URL: /api/basket/items");
    console.log("Header X-User-Id:", userId);
    console.log("Gönderilen JSON Payload:", JSON.stringify(itemDto));
    
    if (!userId || userId === "undefined" || userId === "null") {
        console.error("HATA: UserId boş! LocalStorage kontrol et.");
    }
    // --- DEBUG BİTİŞİ ---

    return await axiosInstance.post('/api/basket/items', itemDto, {
        headers: { 
            'X-User-Id': userId 
        }
    });
};

// Miktar güncelle (PUT) -> Rotası: /items/{productId}
export const updateQuantityApi = async (productId, quantity, userId) => {
  return await axiosInstance.put(`/api/basket/items/${productId}`, quantity, {
    headers: { 
      'X-User-Id': userId,
      'Content-Type': 'application/json' 
    }
  });
};

// Sepetten ürün sil (DELETE) -> Rotası: /items/{productId}
export const removeFromBasketApi = async (productId, userId) => {
  return await axiosInstance.delete(`/api/basket/items/${productId}`, {
    headers: { 'X-User-Id': userId }
  });
};