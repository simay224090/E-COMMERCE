import axiosInstance from './axiosInstance';

// İyzipay ödemesini tetikleyecek olan API fonksiyonu
export const createPaymentApi = async (paymentPayload, userId) => {
  return await axiosInstance.post('/api/payments/process', paymentPayload, {
    headers: { 
      'X-User-Id': userId,
      'Content-Type': 'application/json'
    }
  });
};