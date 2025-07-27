import React from 'react';
import './HomePage.css';

function HomePage({ onShowLogin, onShowRegister }) {
  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-content">
          <div className="logo">
            <h1>🚀 Trae</h1>
            <span>Modern User Management</span>
          </div>
          <nav className="header-nav">
            <button onClick={onShowLogin} className="nav-button login-btn">
              🔐 Giriş Yap
            </button>
            <button onClick={onShowRegister} className="nav-button register-btn">
              📝 Kayıt Ol
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Güvenli ve Modern
            <span className="gradient-text"> Kullanıcı Yönetimi</span>
          </h1>
          <p className="hero-description">
            Trae ile kullanıcılarınızı güvenli bir şekilde yönetin. 
            JWT tabanlı kimlik doğrulama, rol bazlı yetkilendirme ve 
            modern arayüz ile profesyonel deneyim.
          </p>
          <div className="hero-buttons">
            <button onClick={onShowRegister} className="cta-button primary">
              🚀 Hemen Başla
            </button>
            <button onClick={onShowLogin} className="cta-button secondary">
              👤 Giriş Yap
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-header">
              <div className="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="card-content">
              <div className="user-item">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <div className="user-name"></div>
                  <div className="user-email"></div>
                </div>
              </div>
              <div className="user-item">
                <div className="user-avatar">👨‍💼</div>
                <div className="user-info">
                  <div className="user-name"></div>
                  <div className="user-email"></div>
                </div>
              </div>
              <div className="user-item">
                <div className="user-avatar">👩‍💻</div>
                <div className="user-info">
                  <div className="user-name"></div>
                  <div className="user-email"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-content">
          <h2>✨ Özellikler</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>JWT Güvenlik</h3>
              <p>Modern JWT tabanlı kimlik doğrulama sistemi ile verileriniz güvende.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Kullanıcı Yönetimi</h3>
              <p>Kullanıcıları kolayca ekleyin, düzenleyin ve yönetin.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Tasarım</h3>
              <p>Responsive ve kullanıcı dostu arayüz tasarımı.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Hızlı Performans</h3>
              <p>React ve NestJS ile optimize edilmiş performans.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Rol Tabanlı Yetki</h3>
              <p>Admin ve kullanıcı rolleri ile güvenli erişim kontrolü.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">☁️</div>
              <h3>Cloud Ready</h3>
              <p>Render.com üzerinde canlı ve 7/24 erişilebilir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <p>© 2025 Trae - Modern User Management System</p>
          <p>Güvenli • Hızlı • Modern</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;