using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductService.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        // --- YENİ EKLENEN İLİŞKİLER ---
        
        [Required]
        public int? CategoryId { get; set; }
        
        // Entity Framework'ün ilişkiyi kurması için Navigation Property
        public Category? Category { get; set; } 
        
        // Bir ürünün birden fazla resmi olabilir (One-to-Many)
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}