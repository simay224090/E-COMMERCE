import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Card, CardContent, Button, Divider, Box, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar 
} from '@mui/material';

// İKON IMPORTLARINI TAMAMEN KALDIRDIK!

const OrderResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Checkout'tan gönderdiğimiz verileri karşılıyoruz
  const { orderId, purchasedItems, totalPrice } = location.state || {};

  // Eğer kullanıcı bu sayfaya direkt URL yazarak girdiyse (verisiz)
  if (!purchasedItems) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ fontSize: '60px', mb: 2 }}>🛍️</Box>
        <Typography variant="h5" gutterBottom>Sepetiniz şu an boş</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Alışverişe Başla
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {/* Yeşil tik yerine harika bir emoji koyduk */}
        <Box sx={{ fontSize: '80px', mb: 2 }}>✅</Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Siparişiniz Başarıyla Tamamlandı!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Sipariş Numaranız: <strong>#{orderId}</strong>
        </Typography>
      </Box>

      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Sipariş Özeti
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List disablePadding>
            {purchasedItems.map((item, index) => {
              // Sepetteki resim URL'ini güvenli şekilde alıyoruz
              const itemImage = item.imageUrl || item.ImageUrl || (item.images?.length > 0 ? item.images[0].imageUrl : 'https://via.placeholder.com/80');

              return (
                <ListItem key={index} sx={{ py: 2, px: 0, borderBottom: '1px solid #eee' }}>
                  <ListItemAvatar sx={{ mr: 2 }}>
                    <Avatar 
                      variant="rounded" 
                      src={itemImage} 
                      alt={item.productName || item.name} 
                      sx={{ width: 64, height: 64 }} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.productName || item.name}
                      </Typography>
                    }
                    secondary={`Adet: ${item.quantity}`}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {Number(item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </Typography>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6">Genel Toplam:</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {Number(totalPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate('/')}
          sx={{ px: 6, py: 1.5, borderRadius: 2 }}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    </Container>
  );
};

export default OrderResult;