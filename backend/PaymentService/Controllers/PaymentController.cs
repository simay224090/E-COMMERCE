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

        public PaymentController(IConfiguration configuration, PaymentDbContext context)
        {
            _context = context;
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
                return BadRequest(new { Message = "Ödemenin ilişkilendirileceği Sipariş Kodu (OrderCode) eksik!" });
            }

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
                _context.SaveChanges();

                return Ok(new { Message = "Ödeme Başarılı.", Result = paymentLog });
            }
            else
            {
                paymentLog.Status = "Failed";
                paymentLog.Message = $"iyzico Reddedildi: {iyzicoResponse.ErrorMessage}";
                
                // Başarısız ödeme denemesini de loglamak dökümanda isteniyor!
                _context.Payments.Add(paymentLog);
                _context.SaveChanges();

                return BadRequest(new { Message = "Ödeme başarısız.", Result = paymentLog });
            }
        }
        [HttpGet("bin-check/{binNumber}")]
public async Task<IActionResult> GetBinDetails(string binNumber)
{
    try
    {
        var iyzicoRequest = new RetrieveBinNumberRequest
        {
            BinNumber = binNumber,
            Locale = Locale.TR.ToString()
        };


        // iyzico Sandbox sunucusundan BIN sorguluyoruz
        BinNumber binNumberResponse = await BinNumber.Retrieve(iyzicoRequest, _iyzipayOptions);

        if (binNumberResponse.Status == "success")
        {
            return Ok(new { 
                Message = "BIN sorgulama başarılı.", 
                CardType = binNumberResponse.CardType, 
                Association = binNumberResponse.CardAssociation, 
                BankName = binNumberResponse.BankName 
            });
        }

        return BadRequest(new { Message = "iyzico BIN sorgusu başarısız.", Error = binNumberResponse.ErrorMessage });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { Message = "Sistemsel bir hata oluştu.", Details = ex.Message });
    }
}
    }
}