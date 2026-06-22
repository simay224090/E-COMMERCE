using System.Collections.Generic;

namespace BasketService.DTOs
{
    public class CartDto
    {
        // Controller'daki hatayı çözmek için bu eksik alanı ekliyoruz:
        public int Id { get; set; }
        
        public string UserId { get; set; } = string.Empty;
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        
        // Sepet toplam tutarını hesaplayan read-only property
        public decimal TotalPrice => Items.Sum(item => item.Price * item.Quantity);
    }
}