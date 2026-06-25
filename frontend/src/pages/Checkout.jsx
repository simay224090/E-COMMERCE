import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Container, Grid, Paper, Typography, TextField, Button, Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createOrderApi } from '@/api/OrderApi';
import { createPaymentApi } from '@/api/PaymentApi';

const Checkout = () => {
  // ✅ totalPrice artık doğrudan context'ten geliyor — cart güncellenince o da güncellenir
  const { cart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Bursa',
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      alert("Lütfen önce giriş yapın.");
      return;
    }

    const orderItems = cart.map(item => ({
      productId: Number(item.productId || item.id),
      productName: String(item.productName || item.name),
      price: Number(item.price),
      quantity: Number(item.quantity),
      imageUrl: String(
        item.imageUrl || item.ImageUrl ||
        (item.images?.length > 0 ? item.images[0].imageUrl : "https://via.placeholder.com/150")
      ),
    }));

    try {
      const orderResponse = await createOrderApi(orderItems, userId);
      const orderId = orderResponse.data?.id || orderResponse.data;

      let cleanMonth = String(formData.expireMonth || '').split('/')[0].trim().padStart(2, '0');
      if (cleanMonth.length > 2) cleanMonth = cleanMonth.substring(0, 2);

      const paymentPayload = {
        orderCode: String(orderId),
        totalPrice: Number(totalPrice), // ✅ Context'ten gelen taze değer
        cardHolderName: String(formData.cardHolderName),
        cardNumber: String(formData.cardNumber).replace(/\s+/g, ''),
        expireMonth: cleanMonth,
        expireYear: String(formData.expireYear).length === 2
          ? `20${formData.expireYear}`
          : String(formData.expireYear),
        cvc: String(formData.cvc),
      };

      const paymentResponse = await createPaymentApi(paymentPayload, userId);

      alert("💳 Ödeme onaylandı! Siparişiniz başarıyla tamamlandı.");

      navigate('/order-result', {
        state: {
          orderId,
          purchasedItems: cart,
          totalPrice,
        },
      });

      clearCart();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const iyzicoMessage =
          error.response.data?.result?.message || error.response.data?.message;
        alert("Ödeme Reddedildi:\n" + iyzicoMessage);
      } else {
        console.error("Kritik hata detayı:", error);
        alert("İşlem gerçekleştirilirken bir servis hatası meydana geldi.");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Ödeme İşlemleri</Typography>

      <Grid container spacing={6}>
        {/* SOL: Teslimat ve Kart Bilgileri */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Teslimat Formu */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 3 }} fontWeight="bold">Teslimat Bilgileri</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Ad Soyad" name="fullName" onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Telefon" name="phone" onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Şehir" name="city" value={formData.city} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Adres" name="address" multiline rows={3} onChange={handleInputChange} />
              </Grid>
            </Grid>
          </Paper>

          {/* Kart Bilgileri */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 3 }} fontWeight="bold">Kart İle Ödeme (Iyzipay Sandbox)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Kart Üzerindeki İsim" name="cardHolderName" onChange={handleInputChange} placeholder="John Doe" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Kart Numarası" name="cardNumber" onChange={handleInputChange} placeholder="4355 0000 0000 0000" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Son Kullanma Ay" name="expireMonth" onChange={handleInputChange} placeholder="12" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Son Kullanma Yıl" name="expireYear" onChange={handleInputChange} placeholder="2028" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="CVC" name="cvc" onChange={handleInputChange} placeholder="123" />
              </Grid>
            </Grid>
          </Paper>

        </Grid>

        {/* SAĞ: Sipariş Özeti */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight="bold">Sipariş Özeti</Typography>
            {cart && cart.map(item => (
              <Box key={item.productId || item.id} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {item.productName || item.name} (x{item.quantity})
                </Typography>
                <Typography variant="body2">
                  {(Number(item.price) * Number(item.quantity)).toFixed(2)} TL
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            {/* ✅ totalPrice context'ten geliyor, her zaman güncel */}
            <Typography variant="h5" color="primary" fontWeight="bold">
              Toplam: {totalPrice.toFixed(2)} TL
            </Typography>

            <Button
              fullWidth variant="contained" size="large"
              sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
              onClick={handlePlaceOrder}
              disabled={!cart || cart.length === 0}
            >
              Ödemeyi Tamamla ve Siparişi Aç
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;