using System;

namespace PaymentService.Models
{
    public class PaymentLog
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty; // Order Service ile bağlayan alan
        public decimal TotalPrice { get; set; }
        public string CardNumberMasked { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Success / Failed
        public string Gateway { get; set; } = string.Empty; // iyzico-NON-3DS-Sandbox
        public string Message { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    }
}