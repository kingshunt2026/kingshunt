# Environment Variables Kurulum Rehberi

## 🔒 Güvenlik Notları

- ✅ `.env` dosyası `.gitignore`'da olduğu için **GitHub'a yüklenmez**
- ✅ Şifrelerinizi **asla** GitHub'a commit etmeyin
- ✅ Production'da environment variables'ı Vercel Dashboard'dan ekleyin

## 📝 Yerel Geliştirme

### 1. `.env` Dosyası Oluşturun

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Supabase Connection String
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Supabase Connection String Nasıl Alınır?

1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. Projenizi seçin
3. **Settings** > **Database** > **Connection String** bölümüne gidin
4. **URI** formatını seçin
5. Connection string'i kopyalayın (şifre otomatik olarak içinde olacak)

**Örnek format:**
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 3. NEXTAUTH_SECRET Nasıl Oluşturulur?

Terminal'de çalıştırın:

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# Linux/Mac
openssl rand -base64 32
```

## 🚀 Vercel Deployment

### Environment Variables Ekleme

1. Vercel Dashboard'a giriş yapın
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. Aşağıdaki değişkenleri ekleyin:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Supabase connection string | All (Development, Preview, Production) |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | Güvenli secret key | All |

**⚠️ ÖNEMLİ**: Her environment için (Development, Preview, Production) ayrı ayrı ekleyin!

### Vercel'de Environment Variables Nasıl Eklenir?

1. Vercel Dashboard > Projeniz > **Settings**
2. Sol menüden **Environment Variables** seçin
3. **Add New** butonuna tıklayın
4. Variable name ve value'yu girin
5. Hangi environment'lar için geçerli olacağını seçin (Development, Preview, Production)
6. **Save** butonuna tıklayın

## 🔍 Kontrol Listesi

- [ ] `.env` dosyası oluşturuldu
- [ ] `DATABASE_URL` doğru formatta
- [ ] `NEXTAUTH_SECRET` güvenli bir değer
- [ ] `.env` dosyası `.gitignore`'da (otomatik)
- [ ] Vercel'de environment variables eklendi
- [ ] Migration'lar çalıştırıldı (`npx prisma migrate dev`)

## ❓ Sık Sorulan Sorular

**S: `.env` dosyasını GitHub'a yüklemem gerekir mi?**
C: **HAYIR!** `.env` dosyası `.gitignore`'da olduğu için otomatik olarak yüklenmez. Şifrelerinizi GitHub'a yüklemeyin.

**S: Vercel'de environment variables eklemeden deploy edebilir miyim?**
C: Hayır, uygulama çalışmaz. Environment variables'ı mutlaka Vercel Dashboard'dan eklemeniz gerekir.

**S: Development ve Production için farklı veritabanları kullanabilir miyim?**
C: Evet! Vercel'de environment variables eklerken Development ve Production için farklı `DATABASE_URL` değerleri ekleyebilirsiniz.

**S: NEXTAUTH_SECRET'i nasıl güvenli tutabilirim?**
C: Her environment için farklı secret kullanın ve bunları Vercel Dashboard'dan yönetin. Asla kod içine yazmayın.




