using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using Serilog;
using Serilog.Sinks.Elasticsearch;

var builder = WebApplication.CreateBuilder(args);
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Microservice", "PaymentService") 
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://dvu-elasticsearch:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = $"dvu-payment-logs-{DateTime.UtcNow:yyyy-MM}", // Index adı değişti
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

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