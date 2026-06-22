using BasketService.Data;
using BasketService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasketService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BasketController : ControllerBase
    {
        private readonly BasketDbContext _context;

        public BasketController(BasketDbContext context)
        {
            _context = context;
        }

        // 1. Kullanıcının Aktif Sepetini Görüntüleme (GET)
        [HttpGet]
        public async Task<ActionResult<Cart>> GetBasket([FromHeader(Name = "X-User-Id")] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            // Eğer kullanıcının henüz bir sepeti yoksa, boş bir sepet oluşturup dönelim
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return Ok(cart);
        }

        // 2. Sepete Ürün Ekleme (POST)
        [HttpPost("items")]
        public async Task<IActionResult> AddToBasket([FromHeader(Name = "X-User-Id")] string userId, [FromBody] CartItem itemDto)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi eksik.");

            // Kullanıcının sepetini bul veya yoksa yeni oluştur
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Sepette bu ürün zaten var mı kontrol et
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == itemDto.ProductId);

            if (existingItem != null)
            {
                // Varsa miktarını artır (Miktar güncelleme sorumluluğu)
                existingItem.Quantity += itemDto.Quantity;
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
                    CartId = cart.Id
                };
                _context.CartItems.Add(newItem);
            }

            await _context.SaveChangesAsync();
            return Ok(cart);
        }

        // 3. Sepet Miktarını Doğrudan Güncelleme (PUT)
        [HttpPut("items/{productId}")]
        public async Task<IActionResult> UpdateQuantity([FromHeader(Name = "X-User-Id")] string userId, int productId, [FromBody] int quantity)
        {
            if (quantity <= 0)
                return BadRequest("Miktar 1 veya daha büyük olmalıdır.");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Sepet bulunamadı.");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return NotFound("Ürün sepette bulunamadı.");

            item.Quantity = quantity;
            await _context.SaveChangesAsync();

            return Ok(cart);
        }

        // 4. Sepetten Ürün Çıkarma (DELETE)
        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveFromBasket([FromHeader(Name = "X-User-Id")] string userId, int productId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Sepet bulunamadı.");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return NotFound("Ürün sepette bulunamadı.");

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(cart);
        }
    }
}