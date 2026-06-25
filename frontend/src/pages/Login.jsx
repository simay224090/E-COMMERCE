import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', formData);

      const tokenPayload = JSON.parse(atob(response.data.token.split('.')[1]));
      const userId = tokenPayload.nameid;

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: userId,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      }));

      toast.success("Giriş başarılı, yönlendiriliyorsunuz...");

      if (tokenPayload.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Giriş Hatası Detayı:", err);
      
      const errorMessage = err.response?.data?.message || 'E-posta veya şifre hatalı! Lütfen tekrar deneyin.';
      
      // 💡 ÇÖZÜM BURADA: Her hataya Date.now() ile benzersiz bir kimlik (toastId) veriyoruz.
      // Bu sayede Toastify "Ben bu mesajı az önce gösterdim" diyerek engelleme yapamıyor!
      toast.error(errorMessage, {
        toastId: `login-error-${Date.now()}` 
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 4, md: 6 },
            borderRadius: '24px',
            boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
              boxShadow: '0px 4px 15px rgba(26, 35, 126, 0.3)',
            }}
          >
            <LockOutlined fontSize="large" />
          </Box>

          {/* MUI DOM uyarıları temizlendi */}
          <Typography variant="h4" component="h1" fontWeight="800" color="primary.main" sx={{ mb: 1 }}>
            Tekrar Hoş Geldin!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Hesabına erişmek için lütfen e-posta ve şifreni gir.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Posta Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                marginTop: 4,
                marginBottom: 2,
                paddingY: 1.5,
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0px 4px 12px rgba(26, 35, 126, 0.2)',
                '&:hover': {
                  boxShadow: '0px 6px 20px rgba(26, 35, 126, 0.4)',
                },
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hesabın yok mu?{' '}
                <Link
                  onClick={() => navigate('/register')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
                  color="secondary.main"
                >
                  Hemen Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;