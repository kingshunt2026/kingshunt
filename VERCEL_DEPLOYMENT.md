# Vercel Deployment Rehberi

## 🔍 NextAuth ve Vercel İlişkisi

### Yapılan Düzeltme
NextAuth route handler export formatı düzeltildi. Bu düzeltme **hem local hem Vercel'de** geçerli.

**Önceki (Hatalı - Vercel'de de hata verirdi):**
```typescript
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Yeni (Doğru - Vercel'de çalışır):**
```typescript
const { handlers } = NextAuth(authOptions)
export const { GET, POST } = handlers
```

## ⚠️ Vercel'de Dikkat Edilmesi Gerekenler

### 1. Environment Variables

Vercel Dashboard'da **mutlaka** şu environment variables'ları ekleyin:

| Variable | Development | Preview | Production | Açıklama |
|----------|-------------|---------|------------|----------|
| `DATABASE_URL` | ✅ | ✅ | ✅ | Supabase connection string |
| `NEXTAUTH_URL` | `http://localhost:3000` | Preview URL | Production URL | **ÖNEMLİ: Production'da Vercel URL'iniz olmalı!** |
| `NEXTAUTH_SECRET` | ✅ | ✅ | ✅ | Güvenli secret key (her environment için farklı olabilir) |

### 2. NEXTAUTH_URL Production'da

**❌ YANLIŞ:**
```env
NEXTAUTH_URL="http://localhost:3000"  # Production'da çalışmaz!
```

**✅ DOĞRU:**
```env
# Production için
NEXTAUTH_URL="https://your-project.vercel.app"

# Preview için
NEXTAUTH_URL="https://your-project-git-branch.vercel.app"
```

### 3. Prisma Client Generation

Vercel build sırasında Prisma Client otomatik olarak generate edilir, ancak `postinstall` script'i eklemek iyi bir pratik:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 4. Database Migrations

Production migration'ları için:

```bash
# Local'den production'a migration gönder
npx prisma migrate deploy
```

Veya Vercel'de build sırasında otomatik olarak çalıştırmak için:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**⚠️ NOT:** `prisma migrate deploy` sadece production'da çalıştırılmalı, development'ta `prisma migrate dev` kullanın.

## 🚀 Vercel Deployment Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Vercel'de Proje Oluştur
1. [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New Project**
3. GitHub repo'nuzu seçin
4. **Import**

### 3. Environment Variables Ekle
1. Project Settings > **Environment Variables**
2. Her variable için:
   - **Name**: Variable adı
   - **Value**: Variable değeri
   - **Environment**: Development, Preview, Production seçin
3. **Save**

### 4. Build Settings (Opsiyonel)
Vercel genellikle Next.js projelerini otomatik algılar, ancak özel build komutu gerekirse:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 5. Deploy
1. **Deploy** butonuna tıklayın
2. Build loglarını kontrol edin
3. Deployment tamamlandığında URL'inizi alın

## 🔧 Vercel'de Sorun Giderme

### NextAuth Hataları

**Sorun:** "NEXTAUTH_URL is not defined"
**Çözüm:** Vercel Dashboard'da `NEXTAUTH_URL` environment variable'ını ekleyin

**Sorun:** "Invalid NEXTAUTH_URL"
**Çözüm:** Production'da Vercel URL'inizi kullanın (örn: `https://your-project.vercel.app`)

**Sorun:** "Function.prototype.apply was called on #<Object>"
**Çözüm:** Route handler export formatını kontrol edin (yukarıdaki düzeltme yapıldı ✅)

### Database Bağlantı Hataları

**Sorun:** "Can't reach database server"
**Çözüm:** 
- `DATABASE_URL` environment variable'ının doğru olduğundan emin olun
- Supabase IP allowlist ayarlarını kontrol edin
- Connection pooler kullanmayı deneyin

### Build Hataları

**Sorun:** "Prisma Client not generated"
**Çözüm:** `package.json`'a `postinstall` script'i ekleyin:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## ✅ Deployment Kontrol Listesi

- [ ] GitHub'a push edildi
- [ ] Vercel'de proje oluşturuldu
- [ ] Environment variables eklendi (Development, Preview, Production)
- [ ] `NEXTAUTH_URL` production'da Vercel URL'i
- [ ] `NEXTAUTH_SECRET` güvenli bir değer
- [ ] `DATABASE_URL` doğru formatta
- [ ] Migration'lar çalıştırıldı (`npx prisma migrate deploy`)
- [ ] Build başarılı
- [ ] Test edildi (login, register, admin panel)

## 📝 Notlar

- Vercel'de NextAuth v5 beta tam desteklenir
- Route handler export formatı hem local hem Vercel'de aynı
- Environment variables'ı her environment için ayrı ayrı ekleyin
- Production'da mutlaka `NEXTAUTH_URL`'i Vercel URL'iniz olarak ayarlayın




