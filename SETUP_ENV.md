# .env Dosyası Kurulum Rehberi

## 📝 Adım Adım Kurulum

### 1. `.env` Dosyasını Açın

Proje kök dizininde (F:\kingshunt) `.env` dosyasını bir metin editörü ile açın.

### 2. Aşağıdaki Satırları Ekleyin

```env
DATABASE_URL="postgresql://postgres:!Teymur2026@db.zkxjtrhkommpfurpizrn.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YmE0YmM0YjYtMTk0Ni00OGVkLWFmMWYtZTU5M2FmYzdlNGRkNThhNmZiZWYtMDdhYy00Y2M1LTkwMjktMjllYzNiZDUxNzIzOTQwNWRkZjUtMmNjYy00MTI0LTljMjktNDVlZmJhNjJlNDcx"
```

### 3. Dosyayı Kaydedin

`.env` dosyasını kaydedin ve kapatın.

## 🔍 Kontrol

Dosyanın doğru oluşturulduğunu kontrol etmek için:

```powershell
# .env dosyasını kontrol et (değerleri göstermez, sadece satır sayısını gösterir)
Get-Content .env | Measure-Object -Line
```

## ✅ Sonraki Adımlar

1. Migration'ları çalıştırın:
   ```powershell
   npx prisma migrate dev --name init
   ```

2. Prisma Client'ı oluşturun (gerekirse):
   ```powershell
   npx prisma generate
   ```

3. Development server'ı başlatın:
   ```powershell
   npm run dev
   ```

## 🔒 Güvenlik Notları

- ✅ `.env` dosyası `.gitignore`'da olduğu için GitHub'a yüklenmez
- ✅ `NEXTAUTH_SECRET` değerini kimseyle paylaşmayın
- ✅ Production'da farklı bir `NEXTAUTH_SECRET` kullanın

## 🆘 Sorun Giderme

**Sorun**: "NEXTAUTH_SECRET is not defined" hatası alıyorum
**Çözüm**: `.env` dosyasının proje kök dizininde olduğundan emin olun ve server'ı yeniden başlatın.

**Sorun**: "Invalid DATABASE_URL" hatası alıyorum
**Çözüm**: Supabase connection string'inizin doğru olduğundan emin olun. Şifrede özel karakterler varsa URL encode edilmiş olmalı.




