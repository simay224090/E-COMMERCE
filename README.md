# DVU E-Commerce Microservices

Bu proje, modern yazılım mimarisi prensiplerine uygun olarak geliştirilmiş, tam kapsamlı (Full-Stack) ve kapsayıcı (Containerized) bir e-ticaret mikroservis uygulamasıdır. Proje, API Gateway arkasında haberleşen bağımsız servislerden oluşmakta olup, uçtan uca Dockerize edilmiştir.

## Proje Hakkında
Sistem, kullanıcı kimlik doğrulamasından (Identity) sipariş (Order) ve sanal POS ödeme (Payment) adımlarına kadar bir e-ticaret platformunun temel yeteneklerini barındırır. Tüm servisler kendi veritabanlarını yönetir ve merkezi bir loglama mimarisi üzerinden izlenebilir durumdadır.

## Kullanılan Teknolojiler ve Mimari Özellikler
* **Frontend:** React.js, Material UI (MUI), Axios (Backend ile API iletişimi), React Toastify (Kullanıcı bildirimleri / ToastContainer)
* **Backend:** .NET (Web API)
* **API Gateway:** YARP / Ocelot (Tüm dış isteklerin tek noktadan yönetimi)
* **Veritabanı:** PostgreSQL
* **Veritabanı Yönetimi:** DBeaver
* **Ödeme Altyapısı:** iyzico Sandbox (Non-3D Secure)
* **Merkezi Loglama:** Serilog, Elasticsearch ve Kibana
* **Konteynerleştirme:** Docker & Docker Compose

## Servisler ve Port Konfigürasyonları
Sistem ayağa kalktıktan sonra ilgili servislere aşağıdaki adreslerden erişebilirsiniz:

* **Frontend:** http://localhost:3000 (React tabanlı kullanıcı arayüzü)
* **API Gateway:** http://localhost:5000 (Mikroservislere açılan ana kapı)
* **PostgreSQL:** localhost:5432 (Servislerin veritabanı sunucusu)
* **Kibana:** http://localhost:5601 (Merkezi log izleme ve filtreleme paneli)
* **Elasticsearch:** localhost:9200 (Log verilerinin tutulduğu arama motoru)
* **Identity Service:** Gateway üzerinden (Kullanıcı kayıt ve JWT doğrulama)
* **Product Service:** Gateway üzerinden (Ürün katalog yönetimi)
* **Basket Service:** Gateway üzerinden (Sepet yönetimi - Redis/Postgres)
* **Order Service:** Gateway üzerinden (Sipariş oluşturma ve durum takibi)
* **Payment Service:** Gateway üzerinden (iyzico entegrasyonlu ödeme işlemleri)

## İzlenebilirlik ve Loglama
Sistemdeki kritik servisler (Örn: OrderService ve PaymentService) Serilog entegrasyonuna sahiptir.
Atılan tüm başarılı/başarısız istekler, iyzico ödeme dönüşleri ve olası sistem hataları (Exceptions) Elasticsearch'e aktarılır.

Kibana paneli (http://localhost:5601) üzerinden "Microservice" bazlı filtreleme yapılarak e-ticaret akışı anlık olarak izlenebilir.


## Kurulum ve Çalıştırma
Projenin tamamı tek bir Docker Compose dosyası üzerinden ayağa kalkacak şekilde tasarlanmıştır.

1. Projeyi bilgisayarınıza klonlayın ve ana dizine geçiş yapın:
   ```bash
   git clone <https://github.com/simay224090/DVU-E-COMMERCE.git>
   cd <dvu-ecommerce>

   docker compose up -d

## Geliştirici
Simay Çalışkan
Bilgisayar Mühendisliği
