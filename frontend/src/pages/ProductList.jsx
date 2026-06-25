import React, { useEffect, useState } from 'react';
import { getProductsApi, getCategoriesApi } from '@/api/ProductApi'; 
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Grid, Card, CardContent, Typography, 
  Button, Box, CircularProgress, TextField, InputAdornment, CardMedia, Pagination
} from '@mui/material';
import { ShoppingBag, Search } from '@mui/icons-material';

const ProductList = () => {
  // URL'den kategori id'sini yakalıyoruz (Eğer /category/:id rotasından geldiyse dolu olur, /products'tan geldiyse undefined olur)
  const { id: categoryId } = useParams(); 
  
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Verileri Backend'den Çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProductsApi(),
          getCategoriesApi() // Başlıkta kategori adını göstermek için kategorileri de çekiyoruz
        ]);
        setAllProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Veriler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KULLANICI DENEYİMİ (UX) İÇİN HARİKA BİR DETAY: 
  // Menüden başka bir kategoriye tıklandığında sayfayı 1'e ve arama kutusunu sıfırla
  useEffect(() => {
    setPage(1);
    setSearchTerm('');
  }, [categoryId]);

  // 2. ADIM: Ürünleri Filtreleme Mantığı
  let displayedProducts = allProducts;

  // A) Eğer bir kategorinin içindeysek, önce o kategoriye ait olanları süz
  if (categoryId) {
    displayedProducts = displayedProducts.filter(p => p.categoryId === parseInt(categoryId));
  }

  // B) Ardından kullanıcının arama kutusuna yazdığı kelimeye göre süz
  displayedProducts = displayedProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. ADIM: Sayfalama (Pagination) İşlemleri
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
  const paginatedProducts = displayedProducts.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // Dinamik Sayfa Başlığı
  let pageTitle = "Tüm Ürünlerimiz";
  if (categoryId && categories.length > 0) {
    const currentCat = categories.find(c => c.id === parseInt(categoryId));
    if (currentCat) {
      pageTitle = `${currentCat.name} Ürünleri`; // Örn: Elektronik Ürünleri
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Üst Kısım: Başlık ve Arama Çubuğu */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        gap={3}
        sx={{ mb: 6 }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          {pageTitle} {/* 👈 BAŞLIK BURADA DİNAMİK DEĞİŞECEK */}
        </Typography>
        
        <TextField
          variant="outlined"
          placeholder="Ürün veya açıklama ara..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: { sm: 300 }, bgcolor: 'white', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} color="primary" />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {paginatedProducts.map((product) => {
              const imageArray = product.images || product.Images;
              const displayImage = (imageArray && imageArray.length > 0) 
                                    ? imageArray[0].imageUrl 
                                    : "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80";

              return (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%', display: 'flex', flexDirection: 'column', 
                      boxShadow: 2, borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 }
                    }}
                  >
                    <CardMedia
                      component="img" height="200" image={displayImage} alt={product.name} sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography gutterBottom variant="h6" component="h2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
                      </Typography>
                      <Typography variant="h5" color="secondary.main" fontWeight="bold">
                        {product.price} TL
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="contained" color="primary" component={Link} to={`/product/${product.id}`} startIcon={<ShoppingBag />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                        İncele ve Al
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 8 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton />
            </Box>
          )}

          {!loading && paginatedProducts.length === 0 && (
            <Box textAlign="center" sx={{ mt: 8, p: 4, bgcolor: '#f5f5f5', borderRadius: 3 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Bu kategoride veya aramada ürün bulunamadı.
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => { setSearchTerm(''); setPage(1); }} sx={{ mt: 2 }}>
                Filtreyi Temizle
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;