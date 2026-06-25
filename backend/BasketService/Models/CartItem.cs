namespace BasketService.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int CartId { get; set; }
        
        // Navigation Property
        public Cart? Cart { get; set; }
    }
}