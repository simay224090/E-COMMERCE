import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from "./components/navbar"; 
import { Box } from '@mui/material';
import Login from './pages/Login'; 
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import ProductList from './pages/ProductList';
import AdminLayout from './features/Admin/layout/AdminLayout';
import Home from './pages/Home';
import Cart from './pages/Cart'; 
import Checkout from './pages/Checkout';
import OrderResult from './pages/OrderResult';
import OrderHistory from './pages/OrderHistory';
import { CartProvider } from "@/context/CartContext";

// 💡 EKLENEN ADIM 1: Toastify Kütüphanesi ve Stilleri
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 1. MÜŞTERİ (FRONTEND) ANA LAYOUT'U
const CustomerLayout = () => (
  <Box>
    <Navbar />
    <Box p={3}>
      <Outlet /> 
    </Box>
  </Box>
);

// Admin Geçici Sayfaları
const AdminDashboard = () => <h2>👑 Admin Dashboard</h2>;
const AdminProducts = () => <h2>📦 Admin Ürün Listesi</h2>;
const AdminProductAdd = () => <h2>➕ Ürün Ekleme</h2>;
const AdminProductUpdate = () => <h2>🔄 Ürün Güncelleme</h2>;
const AdminCategories = () => <h2>🗂️ Kategori Yönetimi</h2>;
const AdminOrders = () => <h2>📋 Sipariş Listesi</h2>;
const AdminUsers = () => <h2>👥 Kullanıcı Listesi</h2>;
const AdminStock = () => <h2>📉 Stok Takip Ekranı</h2>;

function App() {
  return (
    <CartProvider> 
      <Router>
        {/* 💡 EKLENEN ADIM 2: Kapsayıcıyı Router'ın hemen içine koyduk. 
            Böylece sayfa değişse bile bildirim ekranda kalmaya devam eder. */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />

        <Routes>
          
          {/* ===== MÜŞTERİ ROTALARI (Navbar Sabit) ===== */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:id" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-result" element={<OrderResult />} />
            <Route path="/order-history" element={<OrderHistory />} />
          </Route> 

          {/* ===== AUTHENTICATION ROTALARI (Navbar Yok) ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===== ADMİN ROTALARI ===== */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout /> 
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} /> 
            <Route path="products" element={<AdminProducts />} /> 
            <Route path="product/add" element={<AdminProductAdd />} />
            <Route path="product/update/:id" element={<AdminProductUpdate />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stock" element={<AdminStock />} />
          </Route>

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;