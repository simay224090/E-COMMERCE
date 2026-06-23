namespace PaymentService.Dtos
{
    public class PaymentRequestDto
    {
        // Görev dökümanındaki başarılı/başarısız sonucu siparişle ilişkilendirme alanı[cite: 1]
        public string OrderCode { get; set; } = string.Empty; 
        public decimal TotalPrice { get; set; }
        public string CardHolderName { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public string ExpireMonth { get; set; } = string.Empty;
        public string ExpireYear { get; set; } = string.Empty;
        public string Cvc { get; set; } = string.Empty;
    }
}