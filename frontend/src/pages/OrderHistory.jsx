import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Box, CircularProgress,
  Chip, Divider, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserOrdersApi } from '../api/OrderApi';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;

  // ✅ Kullanıcı bilgileri bir kez, component seviyesinde tanımlanıyor
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName =
    userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.fullName || 'Değerli Müşterimiz';

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = userData.id || userData.userId;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserOrdersApi(userId);
        const orderData = response.data?.result || response.data || [];
        setOrders(orderData);
      } catch (error) {
        console.error('Siparişler çekilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{ fontSize: '60px', mb: 2 }}>📦</Box>
        <Typography variant="h5" gutterBottom>
          Henüz hiç siparişiniz bulunmuyor.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sipariş verdikten sonra tüm geçmişinizi buradan takip edebilirsiniz.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Alışverişe Başla
        </Button>
      </Container>
    );
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ fontSize: '32px', mr: 2 }}>📋</Box>
        <Typography variant="h4" fontWeight="bold">
          Sipariş Geçmişim
        </Typography>
      </Box>

      {currentOrders.map((order, index) => {
        const orderDate = order.orderDate || Date.now();

        return (
          <Card key={order.id || index} sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              {/* ÜST KISIM: Sipariş No ve Durum */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Sipariş No: #{order.id}
                </Typography>
                <Chip
                  label={
                    order.status === 'Completed' || order.status === 'Success'
                      ? 'Tamamlandı'
                      : 'Hazırlanıyor'
                  }
                  color={
                    order.status === 'Completed' || order.status === 'Success'
                      ? 'success'
                      : 'warning'
                  }
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* ORTA KISIM: Ürün Listesi */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Sipariş İçeriği:
              </Typography>
              <List disablePadding sx={{ mb: 2 }}>
                {order.orderItems?.map((item, idx) => (
                  <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={item.imageUrl || 'https://via.placeholder.com/50'}
                        alt={item.productName}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="bold">
                          {item.productName}
                        </Typography>
                      }
                      secondary={`Adet: ${item.quantity} | Birim Fiyat: ${Number(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ mb: 2 }} />

              {/* ALT KISIM: Tarih, Alıcı ve Toplam Tutar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Sipariş Tarihi:</strong>{' '}
                    {new Date(orderDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  {/* ✅ buyerName yerine fullName kullanılıyor */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Alıcı:</strong> {fullName}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Tutar
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {Number(order.totalAmount || 0).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default OrderHistory;