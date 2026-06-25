import React from 'react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { 
  Container, Grid, Typography, Button, Box, 
  Paper, IconButton, Divider, CardMedia 
} from '@mui/material';
import { Add, Remove, DeleteOutlined, ShoppingBag, ArrowBack } from '@mui/icons-material';
const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Sepetiniz Şu An Boş 🛒
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Görünüşe göre henüz sepetinize bir ürün eklememişsiniz. Harika ürünlerimize göz atmaya ne dersiniz?
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/products" 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<ShoppingBag />}
          sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2, px: 4 }}
        >
          Alışverişe Başla
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, md: 6 } }}> {/* maxWidth'i xl yapıp ekranı daha iyi kullandık */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 5, color: '#1a1a1a' }}>
        Alışveriş Sepetim
      </Typography>

      <Grid container spacing={{ xs: 4, md: 8 }}> {/* İki kolon arasını iyice açtık */}
        
        {/* SOL TARAF: ÜRÜN LİSTESİ */}
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={3}>
            {cart.map((item) => {
              const imageArray = item.images || item.Images;
              const displayImage = (imageArray && imageArray.length > 0) 
                                    ? imageArray[0].imageUrl 
                                    : "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80";

              return (
                <Paper 
                  key={item.id} 
                  elevation={0} // Gölgeyi kaldırdık
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    border: '1px solid #e0e0e0', // İnce zarif bir çizgi ekledik
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center', 
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: 'primary.main' } // Hover olunca çerçeve renklensin
                  }}
                >
                  {/* Görsel */}
                  <CardMedia
                    component="img"
                    image={displayImage}
                    alt={item.name}
                    sx={{ width: { xs: '100%', sm: 120 }, height: 120, borderRadius: 2, objectFit: 'cover' }}
                  />

                  {/* Ürün Detayları (Arayı doldurup diğerlerini sağa iten kısım) */}
                  <Box sx={{ flexGrow: 1, ml: { sm: 3 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Tahmini Teslimat: Yarın
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {item.price} TL
                    </Typography>
                  </Box>

                  {/* Sağ Taraf: Miktar ve Silme Butonu */}
                  <Box display="flex" alignItems="center" gap={3} mt={{ xs: 2, sm: 0 }}>
                    
                    {/* Şık ve Yatay Miktar Kutusu */}
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      sx={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 2,
                        p: 0.5
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      
                      <Typography sx={{ width: 30, textAlign: 'center', fontWeight: 'bold' }}>
                        {item.quantity}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Silme Butonu */}
                    <IconButton 
                      onClick={() => removeFromCart(item.id)}
                      sx={{ 
                        color: 'error.main', 
                        bgcolor: '#fff0f0', 
                        '&:hover': { bgcolor: '#ffe0e0' } 
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          <Button 
            component={Link} 
            to="/products" 
            startIcon={<ArrowBack />} 
            sx={{ mt: 4, color: 'text.secondary', textTransform: 'none', fontWeight: 'bold' }}
          >
            Alışverişe Devam Et
          </Button>
        </Grid>

        {/* SAĞ TARAF: SİPARİŞ ÖZETİ */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              border: '1px solid #e0e0e0',
              bgcolor: '#fafafa', 
              position: 'sticky', 
              top: 100 // Sayfa kaydırıldıkça özet ekranda kalsın
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Sipariş Özeti
            </Typography>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography color="text.secondary" fontSize="1.1rem">Ürünlerin Toplamı</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem">{totalPrice.toFixed(2)} TL</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography color="text.secondary" fontSize="1.1rem">Kargo Ücreti</Typography>
              <Typography color="success.main" fontWeight="bold" fontSize="1.1rem">Ücretsiz</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold">Ödenecek Tutar</Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {totalPrice.toFixed(2)} TL
              </Typography>
            </Box>

            <Button 
              component={Link}
              to="/checkout"
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              sx={{ 
                py: 2, 
                fontWeight: 'bold', 
                fontSize: '1.1rem', 
                textTransform: 'none', 
                borderRadius: 2,
                boxShadow: 4
              }}
            >
              Alışverişi Tamamla
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default Cart;