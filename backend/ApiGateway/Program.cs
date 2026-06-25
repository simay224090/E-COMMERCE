var builder = WebApplication.CreateBuilder(args);

// 1. CORS Ayarları
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// 2. YARP Ayarları
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// 💣 DİKKAT: Docker içinde HTTP çalıştığımız için HttpsRedirection'ı sildik/kapattık!
// app.UseHttpsRedirection(); 

// 3. CORS tam olarak burada, rotalamadan hemen önce devreye girmeli!
app.UseCors("AllowAll");

// 4. YARP Proxy
app.MapReverseProxy();

app.Run();