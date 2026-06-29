using BasketService.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Sinks.Elasticsearch;

var builder = WebApplication.CreateBuilder(args);


Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    // 💡 Hangi servisten geldiğini bilmek için adını yaz
    .Enrich.WithProperty("Microservice", "BasketService") 
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://dvu-elasticsearch:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = $"dvu-basket-logs-{DateTime.UtcNow:yyyy-MM}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

// 1. PostgreSQL DbContext Kaydı (Daha sonra Docker-compose ayarlarında dvu_basket_db adını vereceğiz)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<BasketDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();

// 2. Swagger/OpenAPI Ayarları
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. HTTP Request Pipeline Yapılandırması
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BasketDbContext>(); // Servisin DbContext'i neyse
    dbContext.Database.Migrate(); // Tabloları oluşturur
}
app.Run();