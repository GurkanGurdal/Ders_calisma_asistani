# 📚 Ders Yönetim Asistanı

Modern, responsive ve kullanıcı dostu bir ders çalışma yönetim uygulaması.

## 🚀 Yeni! Supabase Bulut Entegrasyonu

**Tüm verileriniz artık bulutta güvenle saklanıyor!**

✅ Gerçek zamanlı senkronizasyon  
✅ Farklı cihazlardan erişim  
✅ PDF ve görsel depolama  
✅ Otomatik yedekleme  

📖 **Detaylı kurulum için:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) dosyasına bakın

## ✨ Özellikler

- ✅ **Yapılacaklar Listesi**: Görevlerinizi önceliklendirin ve takip edin
- 📅 **Haftalık Program**: Ders programınızı görselleştirin
- 📚 **Ders Takibi**: Derslerinizi ve konularınızı yönetin
- ⏱️ **Pomodoro Timer**: Odaklanmış çalışma seansları
- 📝 **Notlar**: PDF dosyaları ve post-it notlar
- 🌓 **Dark/Light Mode**: Göz sağlığınız için
- 📱 **Responsive**: Tüm cihazlarda mükemmel görünüm
- ☁️ **Bulut Depolama**: Verileriniz her zaman güvende

## 🛠️ Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur ve Supabase bilgilerini ekle
cp .env.example .env

# Development server'ı başlat
npm run dev
```

## 🔧 Teknoloji Stack

- **Frontend:** React 19 + Vite
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **Styling:** Custom CSS (Glassmorphism)
- **Routing:** React Router v7

## 📱 Responsive Design

Uygulama tüm cihazlarda mükemmel çalışır:
- 💻 Desktop
- 💼 Laptop
- 📱 Tablet
- 📱 Mobile

## 🔐 Güvenlik

- Row Level Security (RLS) aktif
- Kullanıcılar sadece kendi verilerini görebilir
- Şifreli bağlantı
- Email/Password authentication
