using BasketService.Data;
using BasketService.DTOs;
using BasketService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

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

        // Helper Metot: Veritabanı modelini güvenli bir şekilde DTO'ya dönüştürür ve Toplam Tutarı otomatik hesaplar
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
                    Quantity = i.Quantity
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
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            if (itemDto == null)
                return BadRequest("Eklenecek ürün bilgisi bulunamadı.");

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
            return Ok(MapToCartDto(cart));
        }

        // 3. Sepet Miktarını Doğrudan Güncelleme (PUT)
        [HttpPut("items/{productId}")]
        public async Task<ActionResult<CartDto>> UpdateQuantity([FromHeader(Name = "X-User-Id")] string? userId, int productId, [FromBody] int quantity)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

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

            return Ok(MapToCartDto(cart));
        }

        // 4. Sepetten Ürün Çıkarma (DELETE)
        [HttpDelete("items/{productId}")]
        public async Task<ActionResult<CartDto>> RemoveFromBasket([FromHeader(Name = "X-User-Id")] string? userId, int productId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Sepet bulunamadı.");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return NotFound("Ürün sepette bulunamadı.");

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(MapToCartDto(cart));
        }
    }
}