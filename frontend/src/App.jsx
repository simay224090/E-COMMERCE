import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Geçici Sayfa Bileşenleri (Yarın içlerini dolduracağız)
const Home = () => <div><h2>Ana Sayfa</h2></div>;
const Login = () => <div><h2>Giriş Sayfası</h2></div>;
const Register = () => <div><h2>Kayıt Sayfası</h2></div>;
const ProductList = () => <div><h2>Ürün Listeleme</h2></div>;
const ProductDetail = () => <div><h2>Ürün Detay</h2></div>;
const CategoryProducts = () => <div><h2>Kategoriye Göre Ürünler</h2></div>;
const Cart = () => <div><h2>Sepet Sayfası</h2></div>;
const Checkout = () => <div><h2>Ödeme Sayfası</h2></div>;
const OrderResult = () => <div><h2>Sipariş Sonucu</h2></div>;
const OrderHistory = () => <div><h2>Sipariş Geçmişi</h2></div>;

// Admin Sayfaları
const AdminDashboard = () => <div><h2>Admin Dashboard</h2></div>;
const AdminProducts = () => <div><h2>Admin Ürün Listesi</h2></div>;
const AdminProductAdd = () => <div><h2>Ürün Ekleme</h2></div>;
const AdminProductUpdate = () => <div><h2>Ürün Güncelleme</h2></div>;
const AdminCategories = () => <div><h2>Kategori Yönetimi</h2></div>;
const AdminOrders = () => <div><h2>Sipariş Listesi</h2></div>;
const AdminUsers = () => <div><h2>Kullanıcı Listesi</h2></div>;
const AdminStock = () => <div><h2>Stok Takip Ekranı</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== GENEL KULLANICI ROTALARI ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-result" element={<OrderResult />} />
        <Route path="/order-history" element={<OrderHistory />} />

        {/* ===== KORUMALI ADMİN ROTALARI ===== */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/product/add" element={<ProtectedRoute adminOnly><AdminProductAdd /></ProtectedRoute>} />
        <Route path="/admin/product/update/:id" element={<ProtectedRoute adminOnly><AdminProductUpdate /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/stock" element={<ProtectedRoute adminOnly><AdminStock /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;