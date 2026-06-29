
using Microsoft.EntityFrameworkCore;
using ProductService.Models;
using System;

namespace ProductService.Data
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Kategorileri Ekliyoruz (Modelinde sadece Id ve Name var)
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Elektronik" },
                new Category { Id = 2, Name = "Giyim" }
            );

            // Seed verileri için sabit bir UTC tarihi belirliyoruz
            // (Migration dosyasının her defasında değişmemesi için HasData içinde sabit tarih vermek best practice'dir)
            var seedDate = new DateTime(2026, 6, 29, 0, 0, 0, DateTimeKind.Utc);

            // 2. Ürünleri Ekliyoruz
            modelBuilder.Entity<Product>().HasData(
                new Product 
                { 
                    Id = 1, 
                    Name = "Logitech MX Master 3S", 
                    Price = 3500.00m, 
                    Stock = 50, 
                    Description = "Gelişmiş kablosuz mouse",
                    CategoryId = 1, // Elektronik
                    CreatedDate = seedDate
                },
                new Product 
                { 
                    Id = 2, 
                    Name = "Apple Magic Keyboard", 
                    Price = 4200.00m, 
                    Stock = 20, 
                    Description = "Türkçe Q Klavye",
                    CategoryId = 1, // Elektronik
                    CreatedDate = seedDate
                },
                new Product 
                { 
                    Id = 3, 
                    Name = "Basic Pamuklu Tişört", 
                    Price = 350.00m, 
                    Stock = 100, 
                    Description = "%100 organik pamuk rahat kesim tişört.",
                    CategoryId = 2, // Giyim
                    CreatedDate = seedDate
                }
            );

            // 3. Ürün Görsellerini Ekliyoruz
            modelBuilder.Entity<ProductImage>().HasData(
                new ProductImage { Id = 1, ProductId = 1, ImageUrl = "https://via.placeholder.com/500?text=Mouse" },
                new ProductImage { Id = 2, ProductId = 2, ImageUrl = "https://via.placeholder.com/500?text=Klavye" },
                new ProductImage { Id = 3, ProductId = 3, ImageUrl = "https://via.placeholder.com/500?text=Tisort" }
            );
        }
    }
}