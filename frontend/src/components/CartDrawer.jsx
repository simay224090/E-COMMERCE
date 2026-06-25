import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Drawer, Box, Typography, IconButton, Button
} from '@mui/material';
import { Close, Add, Remove, DeleteOutlined } from '@mui/icons-material';

// 💡 Context hook'u
import { useCart } from '../context/CartContext';

const CartDrawer = ({ open, onClose }) => {
    const navigate = useNavigate();
    
    // 💡 Global state ve fonksiyonlar
    const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { width: { xs: '100vw', sm: 420 }, display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Alışveriş Sepetim ({cart.length})
                </Typography>
                <IconButton onClick={onClose} sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#e0e0e0' } }}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {cart.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" textAlign="center" gap={2}>
                        <Typography variant="h2">🛒</Typography>
                        <Typography variant="h6" color="text.secondary">Sepetiniz şu an boş.</Typography>
                    </Box>
                ) : (
                    cart.map((item) => (
                        <Box key={item.productId} display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                            <Box sx={{ width: 80, height: 80, flexShrink: 0, borderRadius: 2, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                <img
                                    src={item.imageUrl || item.ImageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80'}
                                    alt={item.productName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
                                    {item.productName}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
                                    {Number(item.price).toFixed(2)} TL
                                </Typography>

                                <Box display="flex" alignItems="center" sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5, height: 28, px: 0.5, width: 'fit-content', flexShrink: 0 }}>
                                    <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} sx={{ p: 0.3 }}>
                                        <Remove sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <Typography variant="caption" sx={{ width: 25, textAlign: 'center', fontWeight: 'bold' }}>
                                        {item.quantity}
                                    </Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity + 1)} sx={{ p: 0.3 }}>
                                        <Add sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            </Box>

                            <IconButton color="error" size="small" onClick={() => removeFromCart(item.productId)} sx={{ flexShrink: 0, bgcolor: '#fff0f0' }}>
                                <DeleteOutlined fontSize="small" />
                            </IconButton>
                        </Box>
                    ))
                )}
            </Box>

            {cart.length > 0 && (
                <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                        <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">Ara Toplam</Typography>
                        <Typography variant="h5" color="primary.main" fontWeight="bold">{totalPrice.toFixed(2)} TL</Typography>
                    </Box>
                    <Button variant="contained" fullWidth size="large" onClick={handleCheckout} sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}>
                        Ödemeye Geç
                    </Button>
                </Box>
            )}
        </Drawer>
    );
};

export default CartDrawer;