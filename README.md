# Trae Frontend - Modern Authentication System

React tabanlı modern kimlik doğrulama sistemi frontend'i.

## Özellikler

- 🔐 Kullanıcı giriş ve kayıt sayfaları
- 📊 Admin dashboard
- 👥 Kullanıcı yönetimi
- 🎨 Modern ve responsive tasarım
- 🔒 JWT token yönetimi
- ⚡ Real-time error handling

## Teknolojiler

- React 18
- Modern CSS
- Fetch API
- LocalStorage
- Responsive Design

## Kurulum

### Gereksinimler

- Node.js (v16+)
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ları ayarlayın:
```bash
cp .env.example .env
```

3. `.env` dosyasını düzenleyin:
```env
REACT_APP_API_URL=https://trae-backend.onrender.com
```

4. Uygulamayı başlatın:
```bash
npm start
```

## Render.com Deployment

### Otomatik Deployment

1. GitHub'a push edin
2. Render.com'da yeni Static Site oluşturun
3. GitHub repository'nizi bağlayın
4. `render.yaml` dosyası otomatik olarak deployment'ı yapılandıracak

### Environment Variables

Render.com'da şu environment variables'ları ayarlayın:
- `REACT_APP_API_URL`: Backend API URL'i

## Sayfalar

### 🏠 Ana Sayfa
- Hoş geldin mesajı
- Giriş ve kayıt linkleri

### 🔐 Giriş Sayfası
- Email ve şifre ile giriş
- Form validasyonu
- Error handling

### 📝 Kayıt Sayfası
- Email, şifre ve şifre onayı
- Client-side validasyon
- Güvenli kayıt işlemi

### 📊 Dashboard
- Kullanıcı listesi
- Yeni kullanıcı ekleme
- Kullanıcı silme
- Admin paneli

## Güvenlik

- JWT token'lar localStorage'da güvenli şekilde saklanır
- Otomatik token expiry kontrolü
- Protected routes
- CORS policy uyumlu

## Geliştirme

```bash
# Development mode
npm start

# Production build
npm run build

# Tests
npm test

# Eject (dikkatli kullanın)
npm run eject
```

## API Entegrasyonu

Frontend şu API endpoint'lerini kullanır:
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Kullanıcı kaydı
- `GET /users` - Kullanıcı listesi
- `POST /users` - Yeni kullanıcı
- `DELETE /users/:id` - Kullanıcı silme

## Responsive Tasarım

- Mobile-first approach
- Tablet ve desktop uyumlu
- Modern CSS Grid ve Flexbox
- Smooth animations

## Lisans

UNLICENSED
