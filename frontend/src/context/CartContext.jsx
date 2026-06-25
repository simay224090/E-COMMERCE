import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getBasketApi, addToBasketApi, updateQuantityApi, removeFromBasketApi } from '@/api/BasketApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const getUserId = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      const user = JSON.parse(storedUser);
      return user.id || user.userId || user._id || user.Id;
    } catch (e) {
      return null;
    }
  };

  const loadBasket = async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn("Kullanıcı ID bulunamadı.");
      return;
    }
    try {
      const response = await getBasketApi(userId);
      setCart(response.data.items || []);
    } catch (err) {
      console.error("Sepet yüklenemedi:", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadBasket();
    }
  }, []);

  const addToCart = async (product) => {
    const userId = getUserId();
    if (!userId) return;

    const imageArray = product.images || product.Images;
    const productImg = (imageArray && imageArray.length > 0)
      ? imageArray[0].imageUrl
      : "https://via.placeholder.com/150";

    try {
      const itemDto = {
        productId: product.id,
        productName: product.name,
        price: Number(product.price),
        quantity: 1,
        imageUrl: productImg,
      };
      await addToBasketApi(itemDto, userId);
      await loadBasket();
    } catch (err) {
      console.error("Sepete eklenirken hata oluştu:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const userId = getUserId();
    if (!userId) return;
    if (quantity <= 0) return;
    try {
      await updateQuantityApi(productId, quantity, userId);
      await loadBasket(); // ✅ Backend'i günceller ve cart state'ini taze veriyle doldurur
    } catch (err) {
      console.error("Miktar güncellenemedi:", err);
    }
  };

  const removeFromCart = async (productId) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await removeFromBasketApi(productId, userId);
      await loadBasket();
    } catch (err) {
      console.error("Silme başarısız!", err);
    }
  };

  const clearCart = async () => {
    const userId = getUserId();
    const itemsToDelete = [...cart];
    setCart([]);
    if (userId && itemsToDelete.length > 0) {
      try {
        for (const item of itemsToDelete) {
          const productId = item.productId || item.id;
          await removeFromBasketApi(productId, userId);
        }
      } catch (err) {
        console.error("Backend sepeti temizlenirken hata:", err);
      }
    }
  };

  // ✅ cart her değiştiğinde otomatik hesaplanır — Checkout artık bunu kullanır
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, loadBasket, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);