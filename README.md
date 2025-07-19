# UstaKıbrıs - KKTC Usta ve İş İlanları Platformu

## Proje Açıklaması

UstaKıbrıs, Kuzey Kıbrıs Türk Cumhuriyeti'nde faaliyet gösteren ustalar ve iş sahiplerini bir araya getiren modern bir web platformudur. Bu proje, KKTC'deki işgücü potansiyelini dijital ortamda buluşturarak ekonomiye katkı sağlamayı amaçlamaktadır.

## Özellikler

### MVP (Minimum Viable Product) Özellikleri
- ✅ Usta kayıt sistemi (ad, şehir, kategori, iletişim)
- ✅ İş ilanı verme sistemi
- ✅ Usta ve iş ilanları listeleme
- ✅ WhatsApp entegrasyonu ile hızlı iletişim
- ✅ Admin paneli (onay/silme/IP logları)
- ✅ KKTC şehirleri ve kategoriler
- ✅ Responsive tasarım
- ✅ Türkçe arayüz

### Teknik Özellikler
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: HTML5 + TailwindCSS + Vanilla JavaScript
- **Database**: SQLite (kolay kurulum ve taşınabilirlik)
- **Deployment**: Native (Docker'sız)

## Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.11+
- pip package manager

### Adım 1: Projeyi İndirin
```bash
git clone <repository-url>
cd ustakibris-platform
```

### Adım 2: Sanal Ortam Oluşturun
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### Adım 3: Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

### Adım 4: Çevre Değişkenlerini Ayarlayın
`.env` dosyasını düzenleyin:
```env
DATABASE_URL=sqlite:///./ustakibris.db
SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
DEBUG=True
VERSION=1.0.0
```

### Adım 5: Uygulamayı Çalıştırın
```bash
python main.py
```

Alternatif olarak:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Adım 6: Tarayıcıda Açın
http://localhost:8000

## FTP Deployment (Hosting)

### Gerekli Dosyalar
Sunucuya yüklenecek dosyalar:
- `main.py`
- `models.py`
- `database.py`
- `settings.py`
- `init_db.py`
- `requirements.txt`
- `.env`
- `routes/` klasörü
- `templates/` klasörü
- `static/` klasörü (varsa)

### Hosting Kurulum Adımları
1. Sunucuda Python 3.11+ kurulu olduğundan emin olun
2. Tüm dosyaları FTP ile yükleyin
3. SSH ile sunucuya bağlanın
4. Bağımlılıkları yükleyin: `pip install -r requirements.txt`
5. Uygulamayı çalıştırın: `python main.py`

### Nginx Konfigürasyonu
```nginx
server {
    listen 80;
    server_name ustakibris.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Kullanım

### Admin Paneli
- URL: `/admin`
- Kullanıcı: `admin`
- Şifre: `admin123`

### Önemli Sayfalar
- Ana Sayfa: `/`
- Usta Ara: `/ustalar`
- İş İlanları: `/is-ilanlari`
- Usta Kayıt: `/usta-kayit`
- İş İlanı Ver: `/is-ilan-ver`

### Şehirler
- Lefkoşa
- Girne
- Gazimağusa
- İskele
- Güzelyurt
- Lefke

### Kategoriler
- Elektrikçi
- Tesisatçı
- Boyacı
- Marangoz
- Kaportacı
- Temizlik
- Bahçıvan
- Klimacı
- İnşaat
- Cam Ustası

## Gelecek Özellikler

### Stage 2: Gelişmiş Özellikler
- Üyelik sistemi (email doğrulama)
- Profil fotoğrafı yükleme
- Değerlendirme ve yorum sistemi
- Ücretli öne çıkarma paketi
- Konum bazlı öneriler

### Stage 3: AI Desteği
- Akıllı iş önerileri
- Otomatik kategorilendirme
- Spam tespiti
- AI destekli CV oluşturucu

### Stage 4: B2B & Kurumsal
- Şirket paneli
- Toplu iş ilanı
- PDF rapor üretimi
- Bildirim sistemi

## Katkı Sağlama

Bu proje açık kaynak kodlu olup, katkılarınızı bekliyoruz:

1. Fork edin
2. Feature branch oluşturun
3. Commit edin
4. Push edin
5. Pull request açın

## İletişim

- Email: info@ustakibris.com
- WhatsApp: +90 392 XXX XX XX

## Lisans

Bu proje MIT lisansı altındadır.

## Versiyon Geçmişi

- v1.0.0 (2025-01-11): İlk MVP sürümü
  - Temel usta kayıt sistemi
  - İş ilanı verme
  - Admin paneli
  - WhatsApp entegrasyonu
  - Responsive tasarım