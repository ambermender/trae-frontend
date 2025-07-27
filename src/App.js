import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './HomePage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register'
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde localStorage'dan token kontrol et
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Giriş başarılı
  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentPage('dashboard');
  };

  // Kayıt başarılı
  const handleRegister = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentPage('dashboard');
  };

  // Çıkış yap
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  // Sayfa geçişleri
  const showLogin = () => setCurrentPage('login');
  const showRegister = () => setCurrentPage('register');
  const showHome = () => setCurrentPage('home');
  const switchToRegister = () => setCurrentPage('register');
  const switchToLogin = () => setCurrentPage('login');

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  // Kullanıcı giriş yapmışsa Dashboard göster
  if (user && token && currentPage === 'dashboard') {
    return (
      <Dashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout} 
      />
    );
  }

  // Sayfa durumuna göre render
  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage 
          onShowLogin={showLogin}
          onShowRegister={showRegister}
        />
      )}
      
      {currentPage === 'login' && (
        <Login 
          onLogin={handleLogin} 
          switchToRegister={switchToRegister} 
        />
      )}
      
      {currentPage === 'register' && (
        <Register 
          onRegister={handleRegister} 
          switchToLogin={switchToLogin} 
        />
      )}
    </div>
  );
}

export default App;
