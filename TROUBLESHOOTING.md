# Supabase Bağlantı Sorunu Giderme

## 🔍 Sorun: "Can't reach database server"

### Olası Nedenler ve Çözümler

#### 1. Supabase Projesi Durumu
- ✅ Supabase projenizin **aktif** olduğundan emin olun
- ✅ Proje **pause** edilmemiş olmalı
- ✅ Dashboard'da projenizin durumunu kontrol edin

#### 2. Connection String Formatı
Supabase Dashboard'dan **doğru** connection string'i alın:

**Adımlar:**
1. https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** (⚙️) > **Database**
4. **Connection String** bölümüne gidin
5. **URI** formatını seçin
6. Connection string'i **tam olarak** kopyalayın

**Örnek Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### 3. IP Allowlist (Güvenlik Duvarı)
Supabase'de IP allowlist ayarlarını kontrol edin:

1. Settings > Database > **Connection Pooling**
2. **IP Allowlist** bölümünü kontrol edin
3. Gerekirse IP adresinizi ekleyin veya "Allow all IPs" seçeneğini aktif edin

#### 4. Connection Pooler Kullanın
Bazen direct connection yerine pooler daha iyi çalışır:

**Transaction Mode (Önerilen):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session Mode:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Not:** `[REGION]` kısmını Supabase dashboard'dan alın (örn: `eu-central-1`, `us-east-1`)

#### 5. Şifre URL Encoding
Şifrenizde özel karakterler varsa URL encode edin:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- vb.

#### 6. Network/Firewall
- VPN kullanıyorsanız kapatmayı deneyin
- Firewall ayarlarınızı kontrol edin
- Farklı bir network'ten deneyin (örneğin mobil hotspot)

## 🧪 Bağlantı Testi

### PowerShell ile Test
```powershell
# Test connection (psql yüklüyse)
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Prisma ile Test
```powershell
# Schema'yı veritabanından çekmeyi dene
npx prisma db pull

# Veya sadece bağlantıyı test et
npx prisma migrate status
```

## ✅ Hızlı Kontrol Listesi

- [ ] Supabase projesi aktif mi?
- [ ] Connection string Supabase dashboard'dan kopyalandı mı?
- [ ] Şifre doğru mu? (URL encode edildi mi?)
- [ ] IP allowlist ayarları kontrol edildi mi?
- [ ] Connection pooler denendi mi?
- [ ] VPN kapalı mı?
- [ ] Firewall bağlantıyı engelliyor mu?

## 🆘 Hala Çalışmıyorsa

1. **Supabase Support** ile iletişime geçin
2. **Supabase Status Page**'i kontrol edin: https://status.supabase.com
3. **Yeni bir Supabase projesi** oluşturmayı deneyin
4. **Local PostgreSQL** kullanmayı düşünün (development için)

## 📝 Notlar

- Migration'lar için **direct connection** (port 5432) kullanın
- Uygulama için **connection pooler** (port 6543) önerilir
- Production'da mutlaka **connection pooler** kullanın




