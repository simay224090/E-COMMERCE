using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer; // 1. Bunu ekle
using Microsoft.IdentityModel.Tokens;               // 2. Bunu ekle
using System.Text;
using ProductService.Models;                                  // 3. Bunu ekle

var builder = WebApplication.CreateBuilder(args);

// --- JWT Yapılandırması ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

// 4. Authentication (Kimlik Doğrulama) servisini ekle
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey)
        };
    });

// Mevcut servislerin...
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// 5. Sıralama çok önemli: Önce Authentication, sonra Authorization!
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();


// --- GARANTİLİ SEED DATA YÖNTEMİ ---
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    
    // 1. Tabloları oluştur
    dbContext.Database.Migrate();

    // 2. Eğer ürün tablosu boşsa, manuel olarak ekle
    if (!dbContext.Products.Any())
    {
        // Önce kategori
        var cat = new Category { Name = "Elektronik" };
        dbContext.Categories.Add(cat);
        dbContext.SaveChanges(); // ID oluştu

        // Sonra ürün
        var prod = new Product 
        { 
            Name = "Logitech MX Master 3S", 
            Price = 3500.00m, 
            Stock = 50, 
            Description = "Gelişmiş kablosuz mouse",
            CategoryId = cat.Id,
            CreatedDate = DateTime.UtcNow
        };
        dbContext.Products.Add(prod);
        dbContext.SaveChanges(); // Ürün kaydedildi
        
        // Sonra resim
        var img = new ProductImage { ProductId = prod.Id, ImageUrl = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80" };
        dbContext.ProductImages.Add(img);
        dbContext.SaveChanges();
    }
}

app.Run();