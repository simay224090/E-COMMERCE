import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByIdApi } from '@/api/ProductApi';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-toastify'; // ✅ Snackbar yerine toast
import { 
  Container, Grid, Typography, Button, Box, 
  CircularProgress, Divider, Paper, Chip
} from '@mui/material';
import { ShoppingCart, ArrowBack, LocalShipping, Security } from '@mui/icons-material';

const ProductDetail = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); 

  // ✅ Snackbar state'i kaldırıldı — toast kendi state'ini yönetiyor

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductByIdApi(id);
        setProduct(response.data);
      } catch (error) {
        console.error("Ürün detayı çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} color="primary" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" color="text.secondary">Ürün bulunamadı.</Typography>
        <Button component={Link} to="/products" variant="contained" sx={{ mt: 3 }}>
          Ürünlere Dön
        </Button>
      </Container>
    );
  }

  const imageArray = product.images || product.Images;
  const displayImage = (imageArray && imageArray.length > 0) 
    ? imageArray[0].imageUrl 
    : "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80";

  const handleAddToCart = () => {
    addToCart(product, displayImage);
    // ✅ Snackbar yerine toast — App.jsx'teki ToastContainer'ı kullanır
    toast.success(`🛒 ${product.name} sepete eklendi!`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      <Button component={Link} to="/products" startIcon={<ArrowBack />} color="inherit" sx={{ mb: 4 }}>
        Tüm Ürünlere Dön
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
        <Grid container spacing={6}>
          
          {/* SOL TARAF: Ürün Görseli */}
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', height: { xs: 300, sm: 400, md: 500 }, borderRadius: 3, overflow: 'hidden', boxShadow: 1 }}>
              <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          </Grid>

          {/* SAĞ TARAF: Ürün Bilgileri */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            
            {product.category && (
              <Box mb={2}>
                <Chip label={product.category.name || "Kategori"} color="primary" variant="outlined" />
              </Box>
            )}

            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {product.name}
            </Typography>
            
            <Typography variant="h4" color="secondary.main" fontWeight="bold" sx={{ mb: 3 }}>
              {product.price} TL
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" color={product.stock > 0 ? "success.main" : "error.main"} sx={{ mb: 4 }}>
              {product.stock > 0 ? `Stokta var (${product.stock} adet)` : "Tükendi"}
            </Typography>

            {/* SEPETE EKLE BUTONU */}
            <Box sx={{ mt: 'auto' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                fullWidth 
                startIcon={<ShoppingCart />}
                disabled={product.stock <= 0}
                sx={{ py: 2, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}
                onClick={handleAddToCart}
              >
                Sepete Ekle
              </Button>
            </Box>

            <Box display="flex" gap={3} mt={4} color="text.secondary">
              <Box display="flex" alignItems="center" gap={1}>
                <LocalShipping /> <Typography variant="body2">Ücretsiz Kargo</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Security /> <Typography variant="body2">Güvenli Alışveriş</Typography>
              </Box>
            </Box>

          </Grid>
        </Grid>
      </Paper>

      {/* ✅ Snackbar tamamen kaldırıldı — App.jsx'teki ToastContainer devralıyor */}

    </Container>
  );
};

export default ProductDetail;