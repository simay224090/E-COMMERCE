using IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Data
{
    // Standart DbContext yerine Identity veritabanı tablolarını otomatik oluşturması için IdentityDbContext kullanıyoruz
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Burada ilerleyen adımlarda veritabanı ilk açıldığında 
            // varsayılan rolleri (Admin, Customer) otomatik ekleyeceğimiz ayarları yapabiliriz.
        }
    }
}