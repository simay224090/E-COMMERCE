using BasketService.Data;
using BasketService.DTOs;
using BasketService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; 
using System.Linq;
using System.Threading.Tasks;

namespace BasketService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BasketController : ControllerBase
    {
        private readonly BasketDbContext _context;
        // 💡 YENİ: Logger nesnesini tanımlıyoruz
        private readonly ILogger<BasketController> _logger; 

        // 💡 YENİ: Constructor üzerinden ILogger'ı enjekte ediyoruz
        public BasketController(BasketDbContext context, ILogger<BasketController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Helper Metot
        private static CartDto MapToCartDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    ImageUrl = i.ImageUrl 
                }).ToList()
            };
        }

        // 1. Kullanıcının Aktif Sepetini Görüntüleme (GET)
        [HttpGet]
        public async Task<ActionResult<CartDto>> GetBasket([FromHeader(Name = "X-User-Id")] string? userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return Ok(MapToCartDto(cart));
        }

        // 2. Sepete Ürün Ekleme (POST) - CartItemDto Kullanarak
        [HttpPost("items")]
        public async Task<ActionResult<CartDto>> AddToBasket([FromHeader(Name = "X-User-Id")] string? userId, [FromBody] CartItemDto itemDto)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Başarısız işlem: Sepete ürün eklenemedi, kullanıcı kimliği (X-User-Id) eksik.");
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");
            }

            if (itemDto == null)
                return BadRequest("Eklenecek ürün bilgisi bulunamadı.");

            try
            {
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null)
                {
                    cart = new Cart { UserId = userId };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == itemDto.ProductId);

                if (existingItem != null)
                {
                    // Ürün zaten varsa miktarını artır
                    existingItem.Quantity += itemDto.Quantity;
                    
                    // 🟢 AUDIT LOG: Miktar Artırma
                    _logger.LogInformation("AuditLog: Kullanıcı sepetteki ürünün miktarını artırdı. UserId: {UserId}, ProductId: {ProductId}, ProductName: {ProductName}, EklenenMiktar: {AddedQuantity}, YeniToplam: {TotalQuantity}", 
                        userId, itemDto.ProductId, itemDto.ProductName, itemDto.Quantity, existingItem.Quantity);
                }
                else
                {
                    // Yoksa yeni kalem olarak ekle
                    var newItem = new CartItem
                    {
                        ProductId = itemDto.ProductId,
                        ProductName = itemDto.ProductName,
                        Price = itemDto.Price,
                        Quantity = itemDto.Quantity,
                        ImageUrl = itemDto.ImageUrl,
                        CartId = cart.Id
                    };
                    _context.CartItems.Add(newItem);
                    
                    // 🟢 AUDIT LOG: Yeni Ürün Ekleme
                    _logger.LogInformation("AuditLog: Kullanıcı sepete yeni ürün ekledi. UserId: {UserId}, ProductId: {ProductId}, ProductName: {ProductName}, Quantity: {Quantity}", 
                        userId, itemDto.ProductId, itemDto.ProductName, itemDto.Quantity);
                }

                await _context.SaveChangesAsync();
                return Ok(MapToCartDto(cart));
            }
            catch (System.Exception ex)
            {
                // 🔴 HATA LOGU
                _logger.LogError(ex, "AuditLog: Sepete ürün eklenirken veritabanı hatası oluştu. UserId: {UserId}, ProductId: {ProductId}", userId, itemDto.ProductId);
                return StatusCode(500, "Sunucu tarafında bir hata oluştu.");
            }
        }

        // 3. Sepet Miktarını Doğrudan Güncelleme (PUT)
        [HttpPut("items/{productId}")]
        public async Task<ActionResult<CartDto>> UpdateQuantity([FromHeader(Name = "X-User-Id")] string? userId, int productId, [FromBody] int quantity)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            if (quantity <= 0)
                return BadRequest("Miktar 1 veya daha büyük olmalıdır.");

            try
            {
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null) return NotFound("Sepet bulunamadı.");

                var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
                if (item == null) return NotFound("Ürün sepette bulunamadı.");

                item.Quantity = quantity;
                await _context.SaveChangesAsync();

                // 🟢 AUDIT LOG: Miktar Güncelleme
                _logger.LogInformation("AuditLog: Kullanıcı sepetteki ürün miktarını doğrudan güncelledi. UserId: {UserId}, ProductId: {ProductId}, ProductName: {ProductName}, YeniMiktar: {Quantity}", 
                    userId, productId, item.ProductName, quantity);

                return Ok(MapToCartDto(cart));
            }
            catch (System.Exception ex)
            {
                // 🔴 HATA LOGU
                _logger.LogError(ex, "AuditLog: Sepetteki ürün miktarı güncellenirken hata oluştu. UserId: {UserId}, ProductId: {ProductId}", userId, productId);
                return StatusCode(500, "Sunucu tarafında bir hata oluştu.");
            }
        }

        // 4. Sepetten Ürün Çıkarma (DELETE)
        [HttpDelete("items/{productId}")]
        public async Task<ActionResult<CartDto>> RemoveFromBasket([FromHeader(Name = "X-User-Id")] string? userId, int productId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Başarısız işlem: Sepetten ürün çıkarılamadı, kullanıcı kimliği (X-User-Id) eksik. ProductId: {ProductId}", productId);
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");
            }

            try
            {
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null) return NotFound("Sepet bulunamadı.");

                var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
                if (item == null) return NotFound("Ürün sepette bulunamadı.");

                var removedProductName = item.ProductName; // Loglamak için ismini önceden alıyoruz
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();

                // 🟡 AUDIT LOG: Ürün Çıkarma
                _logger.LogInformation("AuditLog: Kullanıcı sepetten ürün çıkardı. UserId: {UserId}, ProductId: {ProductId}, ProductName: {ProductName}", 
                    userId, productId, removedProductName);

                return Ok(MapToCartDto(cart));
            }
            catch (System.Exception ex)
            {
                // 🔴 HATA LOGU
                _logger.LogError(ex, "AuditLog: Sepetten ürün çıkarılırken hata oluştu. UserId: {UserId}, ProductId: {ProductId}", userId, productId);
                return StatusCode(500, "Sunucu tarafında bir hata oluştu.");
            }
        }
    }
}