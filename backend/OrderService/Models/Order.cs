namespace OrderService.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        
        // Sipariş Durumu: Beklemede, Ödendi, İptal Edildi vb.
        public string Status { get; set; } = "Pending"; 
        
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}