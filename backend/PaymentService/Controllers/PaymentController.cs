using Microsoft.AspNetCore.Mvc;
using Iyzipay;
using Iyzipay.Model;
using Iyzipay.Request;
using PaymentService.Dtos;
using PaymentService.Models;
using PaymentService.Data;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/payments")] // DVU_Task.pdf route kuralı
    public class PaymentController : ControllerBase
    {
        private readonly Options _iyzipayOptions;
        private readonly PaymentDbContext _context;
        private readonly ILogger<PaymentController> _logger; // 💡 Logger tanımlandı

        // 💡 Constructor'a ILogger eklendi
        public PaymentController(IConfiguration configuration, PaymentDbContext context, ILogger<PaymentController> logger)
        {
            _context = context;
            _logger = logger;
            _iyzipayOptions = new Options
            {
                ApiKey = configuration["IyzipicoSandbox:ApiKey"],
                SecretKey = configuration["IyzipicoSandbox:SecretKey"],
                BaseUrl = configuration["IyzipicoSandbox:BaseUrl"]
            };
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessNon3dPayment([FromBody] PaymentRequestDto request)
        {
            if (string.IsNullOrEmpty(request.OrderCode))
            {
                _logger.LogWarning("Ödeme başarısız: İlişkilendirilecek Sipariş Kodu (OrderCode) eksik gönderildi."); // 💡 Uyarı Logu
                return BadRequest(new { Message = "Ödemenin ilişkilendirileceği Sipariş Kodu (OrderCode) eksik!" });
            }

            try
            {
                _logger.LogInformation("iyzico Sandbox ödeme isteği hazırlanıyor. Sipariş Kodu: {OrderCode}, Tutar: {TotalPrice}", request.OrderCode, request.TotalPrice); // 💡 Bilgi Logu

                CreatePaymentRequest iyzicoRequest = new CreatePaymentRequest
                {
                    Locale = Locale.TR.ToString(),
                    ConversationId = request.OrderCode,
                    Price = request.TotalPrice.ToString("F2").Replace(",", "."),
                    PaidPrice = request.TotalPrice.ToString("F2").Replace(",", "."),
                    Currency = Currency.TRY.ToString(),
                    Installment = 1,
                    BasketId = "B" + new Random().Next(10000, 99999),
                    PaymentChannel = PaymentChannel.WEB.ToString(),
                    PaymentGroup = PaymentGroup.PRODUCT.ToString()
                };

                iyzicoRequest.PaymentCard = new PaymentCard
                {
                    CardHolderName = request.CardHolderName,
                    CardNumber = request.CardNumber,
                    ExpireMonth = request.ExpireMonth,
                    ExpireYear = request.ExpireYear,
                    Cvc = request.Cvc,
                    RegisterCard = 0
                };

                iyzicoRequest.Buyer = new Buyer
                {
                    Id = "BY789", Name = "Simay", Surname = "Caliskan", IdentityNumber = "11111111111",
                    Email = "simay.caliskan@dvu.com.tr", GsmNumber = "+905555555555",
                    RegistrationAddress = "Bursa Nilüfer", City = "Bursa", Country = "Turkey", Ip = "127.0.0.1"
                };

                Address address = new Address
                {
                    ContactName = request.CardHolderName, City = "Bursa", Country = "Turkey", Description = "Nilüfer Merkez", ZipCode = "16140"
                };
                iyzicoRequest.ShippingAddress = address;
                iyzicoRequest.BillingAddress = address;

                iyzicoRequest.BasketItems = new List<BasketItem>
                {
                    new BasketItem { Id = "BI101", Name = $"Order {request.OrderCode} Payment", Category1 = "E-Commerce", ItemType = BasketItemType.VIRTUAL.ToString(), Price = iyzicoRequest.Price }
                };

                _logger.LogInformation("iyzico altyapısına ödeme çağrısı yapılıyor... Sipariş Kodu: {OrderCode}", request.OrderCode); // 💡 Bilgi Logu

                // iyzico Sandbox Canlı Çağrısı
                Iyzipay.Model.Payment iyzicoResponse = await Iyzipay.Model.Payment.Create(iyzicoRequest, _iyzipayOptions);

                string maskedCard = $"**** **** **** {request.CardNumber.Substring(12)}";
                var paymentLog = new PaymentLog
                {
                    Id = new Random().Next(10000, 99999),
                    OrderCode = request.OrderCode,
                    TotalPrice = request.TotalPrice,
                    CardNumberMasked = maskedCard,
                    Gateway = "iyzico-NON-3DS-Sandbox",
                    TransactionDate = DateTime.UtcNow
                };

                if (iyzicoResponse.Status == "success")
                {
                    paymentLog.Status = "Success";
                    paymentLog.Message = $"Ödeme onaylandı. iyzico PaymentId: {iyzicoResponse.PaymentId}";
                    
                    // VERİTABANINA KAYDETME
                    _context.Payments.Add(paymentLog);
                    await _context.SaveChangesAsync(); // 💡 SaveChangesAsync olarak güncellendi

                    _logger.LogInformation("Ödeme başarıyla tamamlandı ve DB'ye kaydedildi! Sipariş Kodu: {OrderCode}, iyzico PaymentId: {PaymentId}", request.OrderCode, iyzicoResponse.PaymentId); // 💡 Başarılı Log

                    return Ok(new { Message = "Ödeme Başarılı.", Result = paymentLog });
                }
                else
                {
                    paymentLog.Status = "Failed";
                    paymentLog.Message = $"iyzico Reddedildi: {iyzicoResponse.ErrorMessage}";
                    
                    // Başarısız ödeme denemesini de loglamak dökümanda isteniyor!
                    _context.Payments.Add(paymentLog);
                    await _context.SaveChangesAsync(); // 💡 SaveChangesAsync olarak güncellendi

                    _logger.LogWarning("Ödeme reddedildi! Sipariş Kodu: {OrderCode}, Hata Mesajı: {ErrorMessage}", request.OrderCode, iyzicoResponse.ErrorMessage); // 💡 Başarısız Log

                    return BadRequest(new { Message = "Ödeme başarısız.", Result = paymentLog });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ödeme isteği sırasında sistem kritik bir hata verdi! Sipariş Kodu: {OrderCode}", request.OrderCode); // 💡 Hata Logu
                return StatusCode(500, new { Message = "Ödeme sistemi şu an hizmet veremiyor.", Details = ex.Message });
            }
        }

        [HttpGet("bin-check/{binNumber}")]
        public async Task<IActionResult> GetBinDetails(string binNumber)
        {
            try
            {
                _logger.LogInformation("BIN numarası sorgusu başlatıldı. BIN: {BinNumber}", binNumber); // 💡 Bilgi Logu

                var iyzicoRequest = new RetrieveBinNumberRequest
                {
                    BinNumber = binNumber,
                    Locale = Locale.TR.ToString()
                };

                // iyzico Sandbox sunucusundan BIN sorguluyoruz
                BinNumber binNumberResponse = await BinNumber.Retrieve(iyzicoRequest, _iyzipayOptions);

                if (binNumberResponse.Status == "success")
                {
                    _logger.LogInformation("BIN numarası başarıyla çözümlendi. BIN: {BinNumber}, Banka: {BankName}, Tip: {CardType}", binNumber, binNumberResponse.BankName, binNumberResponse.CardType); // 💡 Başarılı Log

                    return Ok(new { 
                        Message = "BIN sorgulama başarılı.", 
                        CardType = binNumberResponse.CardType, 
                        Association = binNumberResponse.CardAssociation, 
                        BankName = binNumberResponse.BankName 
                    });
                }

                _logger.LogWarning("BIN numarası sorgusu başarısız oldu. BIN: {BinNumber}, Hata: {ErrorMessage}", binNumber, binNumberResponse.ErrorMessage); // 💡 Başarısız Log
                
                return BadRequest(new { Message = "iyzico BIN sorgusu başarısız.", Error = binNumberResponse.ErrorMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BIN numarası sorgulanırken sistem hatası oluştu. BIN: {BinNumber}", binNumber); // 💡 Hata Logu
                return StatusCode(500, new { Message = "Sistemsel bir hata oluştu.", Details = ex.Message });
            }
        }
    }
}