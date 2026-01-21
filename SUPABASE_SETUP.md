# 📚 Ders Yönetim Asistanı - Supabase Kurulum Rehberi

## 🚀 Supabase Database Entegrasyonu Tamamlandı!

Tüm veriler artık **Supabase bulut veritabanında** saklanıyor ve gerçek zamanlı senkronize ediliyor.

## 📋 Kurulum Adımları

### 1️⃣ Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git ve ücretsiz hesap aç
2. "New Project" butonuna tıkla
3. Proje adı ve şifre belirle
4. Bölge seç (Europe - Frankfurt önerilir)
5. Projeyi oluştur (1-2 dakika sürer)

### 2️⃣ Database Şemasını Oluştur

1. Supabase Dashboard'da **SQL Editor**'e git
2. `supabase-schema.sql` dosyasındaki tüm SQL kodunu kopyala
3. SQL Editor'e yapıştır ve **Run** butonuna bas
4. Tüm tablolar ve politikalar otomatik oluşturulacak

### 3️⃣ Storage Bucket'ları Oluştur

#### PDF Bucket:
1. Dashboard'da **Storage** sekmesine git
2. "Create bucket" butonuna tıkla
3. İsim: `pdfs`
4. **Public bucket** seçeneğini işaretle
5. "Create bucket" butonuna bas

#### Images Bucket:
1. Tekrar "Create bucket" butonuna tıkla
2. İsim: `images`
3. **Public bucket** seçeneğini işaretle
4. "Create bucket" butonuna bas

#### Bucket Policies (Her iki bucket için):
1. Bucket'a tıkla
2. "Policies" tab'ına git
3. "New Policy" butonuna tıkla
4. Şu politikaları ekle:

**INSERT (Upload):**
```sql
(bucket_id = 'pdfs' OR bucket_id = 'images') AND auth.uid()::text = (storage.foldername(name))[1]
```

**SELECT (View):**
```sql
(bucket_id = 'pdfs' OR bucket_id = 'images') AND auth.uid()::text = (storage.foldername(name))[1]
```

**DELETE:**
```sql
(bucket_id = 'pdfs' OR bucket_id = 'images') AND auth.uid()::text = (storage.foldername(name))[1]
```

### 4️⃣ Environment Variables (.env)

Projenin kök dizininde `.env` dosyası oluştur:

```env
VITE_SUPABASE_URL=your_project_url_buraya
VITE_SUPABASE_ANON_KEY=your_anon_key_buraya
```

**API bilgilerini bulma:**
1. Supabase Dashboard'da **Settings** > **API** sekmesine git
2. "Project URL" kopyala → `VITE_SUPABASE_URL`
3. "anon public" key'i kopyala → `VITE_SUPABASE_ANON_KEY`

### 5️⃣ Projeyi Çalıştır

```bash
# Bağımlılıkları yükle
npm install

# Development server başlat
npm run dev
```

## ✨ Yeni Özellikler

### 🔄 Gerçek Zamanlı Senkronizasyon
- Tüm değişiklikler anlık olarak bulutta saklanır
- Farklı cihazlardan aynı hesaba giriş yapınca veriler senkronize
- Realtime subscription ile otomatik güncelleme

### ☁️ Bulut Depolama
- **PDFs**: 10MB'a kadar PDF dosyaları
- **Images**: Sıkıştırılmış görsel notlar
- Dosyalar Supabase Storage'da güvenle saklanır

### 🔒 Güvenlik
- Row Level Security (RLS) aktif
- Her kullanıcı sadece kendi verilerini görebilir
- Şifreli bağlantı ve kimlik doğrulama

### 📊 Veri Yapısı

**Tablolar:**
- `todos` - Yapılacak görevler
- `courses` - Dersler
- `topics` - Ders konuları
- `schedule_blocks` - Haftalık program
- `postits` - Post-it notlar
- `pdfs` - PDF dosya metadata'sı
- `pomodoro_sessions` - Pomodoro oturumları

**Storage Buckets:**
- `pdfs` - PDF dosyaları
- `images` - Post-it görselleri

## 🎯 Kullanım

### Todo Yönetimi
```javascript
import { useTodos } from './hooks/useTodos'

const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos()
```

### Ders Yönetimi
```javascript
import { useCourses } from './hooks/useCourses'

const { courses, addCourse, addTopic, toggleTopic } = useCourses()
```

### Not Yönetimi
```javascript
import { useNotes } from './hooks/useNotes'

const { pdfs, postits, uploadPdf, addTextPostit, uploadImagePostit } = useNotes()
```

### Pomodoro
```javascript
import { usePomodoro } from './hooks/usePomodoro'

const { stats, sessions, addSession } = usePomodoro()
```

## 🐛 Sorun Giderme

### "Failed to fetch" Hatası
- `.env` dosyasının doğru konumda olduğundan emin ol
- Supabase URL ve Key'lerin doğru olduğunu kontrol et
- Development server'ı yeniden başlat

### "Row Level Security" Hatası
- SQL şemasının tamamen çalıştırıldığından emin ol
- Policies'lerin doğru oluşturulduğunu kontrol et

### Storage Upload Hatası
- Bucket'ların public olarak işaretlendiğinden emin ol
- Bucket policies'lerin doğru eklendiğini kontrol et
- Dosya boyutu limitlerini kontrol et (PDF: 10MB)

## 📱 Responsive Tasarım

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (320px - 768px)

## 🎨 Özellikler

- 🌓 Dark/Light Mode
- 📊 Real-time Dashboard
- ✅ Todo Management
- 📅 Weekly Schedule
- 📚 Course Tracking
- ⏱️ Pomodoro Timer
- 📝 Notes & PDFs
- 🎯 Progress Tracking

## 🔧 Teknoloji Stack

- **Frontend:** React 19 + Vite
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **Styling:** Custom CSS (Glassmorphism)
- **Routing:** React Router v7
- **Real-time:** Supabase Realtime

## 📄 Lisans

MIT License

---

**Geliştirici Notu:** Tüm localStorage kullanımı kaldırıldı ve Supabase ile değiştirildi. Veriler artık güvenli şekilde bulutta saklanıyor! 🎉
