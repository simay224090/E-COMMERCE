using Microsoft.EntityFrameworkCore;
using PaymentService.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller Servislerini Konteynera Ekliyoruz (Çok Önemli!)
builder.Services.AddControllers();

// 2. Swagger/OpenAPI Yapılandırması
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. PostgreSQL Veritabanı Bağlantısını Tanımlıyoruz
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// HTTP İstek Boru Hattı (Pipeline) Yapılandırması
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 4. API İsteklerinin Controller Sınıflarına Yönlendirilmesini Sağlıyoruz
app.UseAuthorization();
app.MapControllers();

app.Run();