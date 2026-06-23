import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  // LocalStorage'a login olurken user nesnesini string olarak gömeceğiz, içinden rolü okuyoruz
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    // Giriş yapmamışsa direkt logine gönder
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'Admin') {
    // Admin sayfasına girmeye çalışıyor ama rolü admin değilse ana sayfaya postala
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;