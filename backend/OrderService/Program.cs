using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using Serilog;
using Serilog.Sinks.Elasticsearch;
var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Microservice", "OrderService") 
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://dvu-elasticsearch:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = $"dvu-order-logs-{DateTime.UtcNow:yyyy-MM}", // Index adı değişti
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

// PostgreSQL DbContext Kaydı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    // Veritabanı ve tabloların olduğundan emin ol
    dbContext.Database.EnsureCreated();
}

app.Run();