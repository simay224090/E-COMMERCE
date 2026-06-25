using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer; // 1. Bunu ekle
using Microsoft.IdentityModel.Tokens;               // 2. Bunu ekle
using System.Text;                                  // 3. Bunu ekle

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

// ... Migration bloğun burada kalmaya devam edebilir ...
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ProductDbContext>();
    context.Database.Migrate();
}

app.Run();