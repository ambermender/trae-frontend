# 🚀 Trae Chat Application

Modern, gerçek zamanlı sohbet uygulaması. React frontend ve NestJS backend ile geliştirilmiştir.

## ✨ Özellikler

- 🔐 **Güvenli Kimlik Doğrulama**: JWT tabanlı giriş sistemi
- 💬 **Gerçek Zamanlı Sohbet**: Socket.IO ile anlık mesajlaşma
- 🏠 **Oda Yönetimi**: Özel ve genel sohbet odaları
- 👥 **Kullanıcı Rolleri**: Admin ve kullanıcı yetkilendirmesi
- 📱 **Responsive Tasarım**: Mobil uyumlu modern arayüz
- 🎨 **Modern UI**: Gradient ve glass effect tasarım

## 🛠️ Teknolojiler

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Veritabanı
- **Socket.IO** - Gerçek zamanlı iletişim
- **JWT** - Kimlik doğrulama
- **bcryptjs** - Şifre hashleme

### Frontend
- **React** - UI framework
- **Socket.IO Client** - Gerçek zamanlı bağlantı
- **Modern CSS** - Gradient ve animasyonlar

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- npm veya yarn

### Backend Kurulumu
```bash
cd trae-backend
npm install

# Environment dosyasını kopyala ve düzenle
cp .env.example .env

# Veritabanını hazırla
npx prisma migrate dev
npx prisma generate

# Sunucuyu başlat
npm run start:dev
```

### Frontend Kurulumu
```bash
cd trae-frontend
npm install

# Geliştirme sunucusunu başlat
npm start
```

## 🌐 Deploy (Render.com)

### Otomatik Deploy
1. GitHub'a push yapın
2. Render.com'da hesap oluşturun
3. Repository'yi bağlayın
4. `render.yaml` dosyası otomatik olarak algılanacak

### Manuel Deploy
1. **Backend Deploy**:
   - New Web Service oluşturun
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Environment Variables ekleyin

2. **Frontend Deploy**:
   - New Static Site oluşturun
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

3. **Database**:
   - PostgreSQL database oluşturun
   - CONNECTION_STRING'i backend'e ekleyin

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 🔧 Geliştirme

### Veritabanı Değişiklikleri
```bash
# Yeni migration oluştur
npx prisma migrate dev --name migration-name

# Prisma client'ı güncelle
npx prisma generate
```

### Test
```bash
# Backend testleri
cd trae-backend
npm test

# Frontend testleri
cd trae-frontend
npm test
```

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Kullanıcı kaydı

### Rooms
- `GET /rooms` - Tüm odaları listele
- `POST /rooms` - Yeni oda oluştur
- `DELETE /rooms/:id` - Oda sil

### Users
- `GET /users/profile` - Kullanıcı profili
- `PUT /users/profile` - Profil güncelle

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorularınız için issue oluşturabilir veya iletişime geçebilirsiniz.

---

**Geliştirici**: Trae AI ile geliştirilmiştir 🤖✨