# Supabase Bağlantı Rehberi

## 🔗 Connection String Nasıl Alınır?

### 1. Supabase Dashboard'a Giriş Yapın
- https://supabase.com adresine gidin
- Projenizi seçin

### 2. Connection String'i Alın
1. Sol menüden **Settings** (⚙️) seçin
2. **Database** sekmesine tıklayın
3. **Connection String** bölümüne gidin
4. **URI** formatını seçin
5. Connection string'i kopyalayın

### 3. Connection String Formatları

#### Direct Connection (Migration için)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Connection Pooler (Uygulama için - Önerilen)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**⚠️ ÖNEMLİ**: 
- **Migration'lar için**: Direct connection (port 5432) kullanın
- **Uygulama için**: Connection pooler (port 6543) kullanın

### 4. .env Dosyasına Ekleyin

```env
# Migration için (Direct Connection)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Veya uygulama için (Connection Pooler - Production'da önerilen)
# DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

## 🔍 Bağlantı Testi

### PowerShell ile Test
```powershell
# PostgreSQL client yüklüyse
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Prisma ile Test
```powershell
npx prisma db pull
```

## ❓ Sık Sorulan Sorular

**S: "Can't reach database server" hatası alıyorum**
C: 
- Supabase projenizin aktif olduğundan emin olun
- Connection string'deki şifreyi kontrol edin
- Firewall veya VPN'in bağlantıyı engellemediğinden emin olun

**S: Şifremde özel karakterler var**
C: Şifreyi URL encode edin:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- vb.

**S: Hangi portu kullanmalıyım?**
C:
- **5432**: Direct connection (migration'lar için)
- **6543**: Connection pooler (uygulama için, önerilen)

## 🚀 Hızlı Başlangıç

1. Supabase Dashboard > Settings > Database > Connection String
2. URI formatını seçin
3. Connection string'i kopyalayın
4. `.env` dosyasına `DATABASE_URL` olarak ekleyin
5. Migration çalıştırın: `npx prisma migrate dev --name init`




