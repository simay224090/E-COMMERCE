var builder = WebApplication.CreateBuilder(args);

// YARP servislerini appsettings.json'dan okuyarak container'a ekliyoruz
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseHttpsRedirection();

// Gelen istekleri appsettings.json'daki kurallara göre mikroservislere paslar
app.MapReverseProxy();

app.Run();