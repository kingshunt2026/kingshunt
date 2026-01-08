# Şah Avı Akademi - Membership System

Modern satranç kulübü web sitesi ile tam üyelik sistemi.

## Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Rol tabanlı erişim kontrolü (ADMIN, COACH, MEMBER)
- ✅ Program yönetimi ve kayıt sistemi
- ✅ Turnuva yönetimi
- ✅ Admin paneli
- ✅ Üye profil sayfası

## Teknoloji Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Validation**: Zod

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanı Kurulumu

**⚠️ ÖNEMLİ: `.env` dosyası `.gitignore`'da olduğu için GitHub'a yüklenmez. Şifrelerinizi güvende tutun!**

#### Yerel Geliştirme için `.env` Dosyası

Proje kök dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Supabase için:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Veya yerel PostgreSQL için:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/kingshunt?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
```

**Şifreleri Nerede Saklamalıyım?**

1. **Yerel Geliştirme**: `.env` dosyasında (GitHub'a yüklenmez ✅)
2. **Vercel Deployment**: Vercel Dashboard > Project Settings > Environment Variables
3. **GitHub Secrets** (opsiyonel): GitHub Actions kullanıyorsanız Settings > Secrets

### 3. Prisma Migrasyonu

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. İlk Admin Kullanıcısı Oluşturun

Prisma Studio'yu kullanarak veya SQL ile ilk admin kullanıcısını oluşturun:

```bash
npx prisma studio
```

Veya doğrudan veritabanında:

```sql
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-id',
  'Admin User',
  'admin@example.com',
  '$2a$10$hashedpassword', -- bcrypt hash of your password
  'ADMIN',
  NOW(),
  NOW()
);
```

Şifreyi hash'lemek için:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('yourpassword', 10);
console.log(hash);
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

## Deployment (Vercel + Supabase)

### Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Project Settings > Database > Connection String'den connection string'i alın
4. Connection string'i `.env` dosyasına ekleyin

### Vercel Deployment

1. Projeyi GitHub'a push edin (`.env` dosyası otomatik olarak yüklenmez ✅)
2. [Vercel](https://vercel.com) hesabınıza giriş yapın
3. Yeni proje oluşturun ve GitHub repo'nuzu seçin
4. **Environment Variables ekleyin** (Vercel Dashboard > Project Settings > Environment Variables):
   - `DATABASE_URL`: Supabase connection string (şifre dahil)
   - `NEXTAUTH_URL`: Vercel deployment URL (örn: `https://your-project.vercel.app`)
   - `NEXTAUTH_SECRET`: Güvenli bir secret key (üretmek için: `openssl rand -base64 32`)

   **⚠️ ÖNEMLİ**: Environment Variables'ı hem **Development**, hem **Preview**, hem de **Production** için ekleyin!

5. Deploy edin

### Production Migrasyonu

Vercel deployment sonrası:

```bash
npx prisma migrate deploy
```

## API Routes

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - NextAuth endpoint

### Programs
- `GET /api/programs` - Tüm programları listele
- `POST /api/programs` - Yeni program oluştur (Admin only)
- `GET /api/programs/[id]` - Program detayı
- `PUT /api/programs/[id]` - Program güncelle (Admin only)
- `DELETE /api/programs/[id]` - Program sil (Admin only)

### Tournaments
- `GET /api/tournaments` - Tüm turnuvaları listele
- `POST /api/tournaments` - Yeni turnuva oluştur (Admin only)
- `GET /api/tournaments/[id]` - Turnuva detayı
- `PUT /api/tournaments/[id]` - Turnuva güncelle (Admin only)
- `DELETE /api/tournaments/[id]` - Turnuva sil (Admin only)

### Enrollments
- `GET /api/enrollments` - Kayıtları listele
- `POST /api/enrollments` - Programa kayıt ol
- `DELETE /api/enrollments/[id]` - Kayıt sil

## Sayfalar

- `/auth/login` - Giriş sayfası
- `/auth/register` - Kayıt sayfası
- `/profile` - Üye profil sayfası (Giriş gerekli)
- `/admin` - Admin paneli (Admin only)
- `/admin/programs/new` - Yeni program oluştur
- `/admin/tournaments/new` - Yeni turnuva oluştur

## Güvenlik

- Şifreler bcrypt ile hash'lenir
- NextAuth JWT session kullanır
- Middleware ile route koruması
- Server-side authorization kontrolü
- Input validation (Zod)

## Lisans

MIT
