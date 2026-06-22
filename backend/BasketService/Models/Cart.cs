namespace BasketService.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty; // JWT'den gelecek kullanıcı ID'si
        
        // Sepetteki ürünler
        public List<CartItem> Items { get; set; } = new List<CartItem>();

        // PDF'in istediği: "Sepet toplam tutarını hesaplama" sorumluluğu[cite: 1]
        public decimal TotalPrice => Items.Sum(item => item.Price * item.Quantity);
    }
}