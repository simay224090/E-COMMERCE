import React, { useEffect, useState } from 'react';
import { getProductsApi, getCategoriesApi } from '@/api/ProductApi';
import {
    Container, Grid, Card, CardContent, Typography,
    Button, Box, Paper
} from '@mui/material';
import { ShoppingBag, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import elektronikImg from '@/assets/electronics.jpg';
import giyimImg from '@/assets/clothes.jpg';
import kitapImg from '@/assets/books.jpg';
import kozmetikImg from '@/assets/kozmetik.jpg';

const categoryImages = {
    "Elektronik": elektronikImg,
    "Giyim": giyimImg,
    "Kitap": kitapImg,
    "Kozmetik": kozmetikImg,
};

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    getProductsApi(),
                    getCategoriesApi()
                ]);

                setFeaturedProducts(productsRes.data.slice(0, 3));
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error("Veriler yüklenirken hata oluştu:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <Box>

            {/* ✨ HERO SECTION (GLOW EFFECT) */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    py: 12,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #5C6BC0 0%, #8e99f3 100%)',
                    color: 'white',
                }}
            >
                {/* LIGHT GLOW */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '600px',
                        height: '600px',
                        background:
                            'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
                        filter: 'blur(35px)',
                        zIndex: 0,
                    }}
                />

                {/* EXTRA LIGHT SPOT */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-120px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '700px',
                        height: '700px',
                        background:
                            'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
                        filter: 'blur(50px)',
                        zIndex: 0,
                    }}
                />

                {/* TEXT */}
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                            textShadow: '0 10px 30px rgba(0,0,0,0.25)',
                        }}
                    >
                        Yeni Nesil Alışveriş Deneyimi
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{ mb: 4, opacity: 0.9 }}
                    >
                        Aradığın her şey, en uygun fiyatlar ve güvenilir altyapı ile tek tıkla kapında.
                    </Typography>

                    <Button
                        component={Link}
                        to="/products"
                        variant="contained"
                        color="secondary"
                        size="large"
                        endIcon={<ArrowForward />}
                        sx={{
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 1.50,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        }}
                    >
                        Tüm Ürünleri Gör
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mb: 8 }}>

                {/* KATEGORİLER */}
                <Box sx={{ mb: 8, mt: 5 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                        Kategorileri Keşfet
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                    }}>
                        {categories.map((cat) => {
                            const bgImage = categoryImages[cat.name];

                            return (
                                <Box key={cat.id} sx={{ minWidth: 260, flexShrink: 0 }}>
                                    <Link to={`/category/${cat.id}`} style={{ textDecoration: 'none' }}>
                                        <Card
                                            sx={{
                                                height: 180,
                                                backgroundImage: `url(${bgImage})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                position: 'relative',
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                transition: '0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: 8,
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundColor: 'rgba(0,0,0,0.45)'
                                            }} />

                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    position: 'relative',
                                                    zIndex: 2,
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    mt: 7,
                                                    textShadow: '0 5px 15px rgba(0,0,0,0.6)'
                                                }}
                                            >
                                                {cat.name}
                                            </Typography>
                                        </Card>
                                    </Link>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* ÜRÜNLER */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">Öne Çıkan Ürünler</Typography>
                    <Button component={Link} to="/products">Hepsini Gör</Button>
                </Box>

                <Grid container spacing={4}>
                    {featuredProducts.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4}>
                            <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                                <CardContent>
                                    <Typography fontWeight="bold">{product.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                    </Typography>
                                    <Typography fontWeight="bold" color="primary.main">
                                        {product.price} TL
                                    </Typography>
                                </CardContent>

                                <Box sx={{ p: 2 }}>
                                    <Button fullWidth variant="outlined" component={Link} to={`/product/${product.id}`}>
                                        Ürünü İncele
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Container>
        </Box>
    );
};

export default Home; 