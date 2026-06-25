import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Link, Alert } from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // Backend'deki RegisterDto alanları ile birebir eşitledik!
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Identity Service kayıt endpoint'ine tam uyumlu objeyi fırlatıyoruz
      await axiosInstance.post('/api/auth/register', formData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt esnasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: 2 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ padding: { xs: 4, md: 6 }, borderRadius: '24px', boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <Box sx={{ backgroundColor: 'secondary.main', color: 'white', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
            <PersonAddOutlined fontSize="large" />
          </Box>

          <Typography variant="h4" component="h1" fontWeight="800" color="primary.main" gutterBottom>
            Aramıza Katıl!
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', borderRadius: '12px', mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', borderRadius: '12px', mb: 3 }}>Kayıt başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Ad ve Soyad alanlarını yan yana şık bir şekilde koyalım */}
            <Box display="flex" gap={2}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Posta Adresi"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{ sx: { borderRadius: '12px' } }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                sx: { borderRadius: '12px' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" fullWidth variant="contained" disabled={loading || success} sx={{ marginTop: 4, marginBottom: 2, paddingY: 1.5, borderRadius: '12px', fontWeight: 'bold', textTransform: 'none' }}>
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Button>

            <Box display="flex" justifyContent="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Zaten bir hesabın var mı?{' '}
                <Link onClick={() => navigate('/login')} sx={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }} color="primary.main">
                  Giriş Yap
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;