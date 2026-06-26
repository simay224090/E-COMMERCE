import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, IconButton, Box } from '@mui/material';
import { ShoppingCart, AccountCircle, Dashboard } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

// Yeni eklediğimiz Context ve Çekmece importları
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

// Yeni logo importu (assets/logo klasöründen çekiyoruz)
import logoImage from '@/assets/logo/newLogo.png'; // Dosya ismine veya uzantısına (.png vb.) göre güncelleyebilirsin

const Navbar = () => {
  const navigate = useNavigate();

  // 1. Context'ten sepet verisini çekiyoruz
  const { cart } = useCart();

  // 2. Çekmecenin açık/kapalı durumunu tutacak State
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // 3. Sepetteki toplam ürün miktarını dinamik hesaplıyoruz
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // LocalStorage'dan kullanıcı bilgilerini simüle ederek çekiyoruz
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* Sol Kısım: Logo ve Başlık Grubu */}

          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              flexDirection: 'row',      // ← yan yana sırala
              alignItems: 'center',      // ← dikeyde ortala
              gap: 1.5,
              textDecoration: 'none',
              color: 'white',
              flexGrow: 1,
            }}
          >
            {/* Logo */}
            <Box
              component="img"
              src={logoImage}
              alt="DVU E-Commerce Logo"
              sx={{
                height: 70,
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,             // ← logo küçülmesin
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              }}
            />
            {/* Marka Adı */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', lineHeight: 1, whiteSpace: 'nowrap' }}
            >
              DVU E-Commerce
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {/* Ürünler Linki */}
            <Button component={Link} to="/products" color="inherit">Ürünler</Button>

            {/* Eğer kullanıcı Admin ise Dashboard butonu çıksın */}
            {user.role === 'Admin' && (
              <Button
                component={Link}
                to="/admin"
                color="secondary"
                variant="contained"
                startIcon={<Dashboard />}
                size="small"
              >
                Admin Paneli
              </Button>
            )}

            {/* 4. Sepet Butonu: Link iptal edildi, onClick ile çekmeceye bağlandı */}
            <IconButton color="inherit" onClick={() => setCartDrawerOpen(true)}>
              <Badge badgeContent={totalItems} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Giriş / Çıkış Kontrolü */}
            {token ? (
              <>
                <Button component={Link} to="/order-history" color="inherit" startIcon={<AccountCircle />}>
                  {user.username || 'Hesabım'}
                </Button>
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.7)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '1px solid white',
                    }
                  }}
                >
                  Çıkış
                </Button>
              </>
            ) : (
              <Button component={Link} to="/login" color="secondary" variant="contained">
                Giriş Yap
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 5. Çekmece Bileşeni: Navbar'ın dışında ama ekranda hazır bekleyecek */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;