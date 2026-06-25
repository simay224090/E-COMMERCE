## DVU E-Commerce Microservices

Bu proje, modern yazılım mimarisi prensiplerine uygun olarak geliştirilmiş, tam kapsamlı (Full-Stack) ve kapsayıcı (Containerized) bir e-ticaret mikroservis uygulamasıdır. Proje, API Gateway arkasında haberleşen bağımsız servislerden oluşmakta olup, uçtan uca Dockerize edilmiştir.

##🚀 Proje Hakkında
Sistem, kullanıcı kimlik doğrulamasından (Identity) sipariş (Order) ve sanal POS ödeme (Payment) adımlarına kadar bir e-ticaret platformunun temel yeteneklerini barındırır. Tüm servisler kendi veritabanlarını yönetir ve merkezi bir loglama mimarisi üzerinden izlenebilir durumdadır.

### 🛠️ Kullanılan Teknolojiler ve Mimari Özellikler
Frontend:React.js, Material UI (MUI), Axios (Backend ile API iletişimi), React Toastify (Kullanıcı bildirimleri / ToastContainer)
Backend:.NET (Web API)
API Gateway:YARP / Ocelot (Tüm dış isteklerin tek noktadan yönetimi)
Veritabanı:PostgreSQL
Ödeme Altyapısı:iyzico Sandbox (Non-3D Secure)
Merkezi Loglama:Serilog, Elasticsearch ve Kibana
Konteynerleştirme:Docker & Docker Compose
---

Servisler ve Port Konfigürasyonları
--
Sistem ayağa kalktıktan sonra ilgili servislere aşağıdaki adreslerden erişebilirsiniz:
-
Frontend: http://localhost:3000 (React tabanlı kullanıcı arayüzü)
API Gateway: http://localhost:5000 (Mikroservislere açılan ana kapı)
PostgreSQL: localhost:5432 (Servislerin veritabanı sunucusu)
Kibana: http://localhost:5601 (Merkezi log izleme ve filtreleme paneli)
Elasticsearch: localhost:9200 (Log verilerinin tutulduğu arama motoru)
Identity Service: Gateway üzerinden (Kullanıcı kayıt ve JWT doğrulama)
Product Service: Gateway üzerinden (Ürün katalog yönetimi)
Basket Service: Gateway üzerinden (Sepet yönetimi - Redis/Postgres)
Order Service: Gateway üzerinden (Sipariş oluşturma ve durum takibi)
Payment Service: Gateway üzerinden (iyzico entegrasyonlu ödeme işlemleri)

---
Kurulum ve Çalıştırma

Projenin tamamı tek bir Docker Compose dosyası üzerinden ayağa kalkacak şekilde tasarlanmıştır. Bilgisayarınızda Docker Desktop'ın çalıştığından emin olduktan sonra ana dizinde terminali açarak aşağıdaki komutu çalıştırmanız yeterlidir:
Kurulum ve Çalıştırma

Projenin tamamı tek bir Docker Compose dosyası üzerinden ayağa kalkacak şekilde tasarlanmıştır. Projeyi çalıştırmak için sırayla aşağıdaki adımları izleyebilirsiniz:

1. Projeyi bilgisayarınıza klonlayın ve ana dizine geçiş yapın:
   ```bash
=>  git clone <sizin-repo-linkiniz>
=> cd <proje-klasör-adınız>

2.Docker Desktop'ın çalıştığından emin olun ve konteynerleri ayağa kaldırın:
=> docker compose up -d
