using System.ComponentModel.DataAnnotations;

namespace ProductService.Models
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;
    }
}