using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Models;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderDbContext _context;
        private readonly ILogger<OrdersController> _logger; // 💡 Logger tanımlandı

        // 💡 Constructor'a ILogger eklendi
        public OrdersController(OrderDbContext context, ILogger<OrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // 1. Sepetten Gelen DTO Listesiyle Sipariş Oluşturma (POST)
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromHeader(Name = "X-User-Id")] string? userId, [FromBody] List<OrderItemDto> itemsDto)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Sipariş oluşturma başarısız: Kullanıcı bilgisi (X-User-Id) eksik."); // 💡 Uyarı Logu
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");
            }

            if (itemsDto == null || !itemsDto.Any())
            {
                _logger.LogWarning("Sipariş oluşturma başarısız: Sipariş kalemi bulunamadı. Kullanıcı: {UserId}", userId); // 💡 Uyarı Logu
                return BadRequest("Sipariş kalemi bulunamadı.");
            }

            try
            {
                // Toplam tutarı hesapla
                decimal totalAmount = itemsDto.Sum(i => i.Price * i.Quantity);

                // Veritabanına kaydedilecek asıl model nesnesi
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = totalAmount,
                    Status = "Pending",
                    OrderItems = itemsDto.Select(i => new OrderItem
                    {
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Price = i.Price,
                        Quantity = i.Quantity,
                        ImageUrl = i.ImageUrl ?? "https://via.placeholder.com/150"
                    }).ToList()
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Döngü hatasını engellemek için sadece gerekli alanları DTO'ya eşliyoruz (Mapping)
                var responseDto = new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    OrderItems = order.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Price = i.Price,
                        Quantity = i.Quantity,
                        ImageUrl = i.ImageUrl ?? "https://via.placeholder.com/150"
                    }).ToList()
                };

                _logger.LogInformation("Sipariş başarıyla oluşturuldu. Sipariş No: {OrderId}, Kullanıcı: {UserId}, Toplam Tutar: {TotalAmount}", order.Id, userId, totalAmount); // 💡 Başarılı İşlem Logu

                return CreatedAtAction(nameof(GetOrderById), new { id = responseDto.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş veritabanına kaydedilirken kritik bir hata oluştu. Kullanıcı: {UserId}", userId); // 💡 Hata Logu
                return StatusCode(500, "Sipariş oluşturulurken sunucu kaynaklı bir hata meydana geldi.");
            }
        }

        // 2. Belirli Bir Siparişi DTO Olarak Getirme (GET by ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                _logger.LogWarning("Sipariş arandı fakat bulunamadı. Aranan Sipariş No: {OrderId}", id); // 💡 Uyarı Logu
                return NotFound("Sipariş bulunamadı.");
            }

            var orderDto = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                OrderItems = order.OrderItems.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    ImageUrl = i.ImageUrl ?? "https://via.placeholder.com/150"
                }).ToList()
            };

            return Ok(orderDto);
        }

        // 3. Kullanıcının Tüm Geçmiş Siparişlerini Getirme (GET by UserId)
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<OrderDto>>> GetUserOrders(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Geçmiş siparişler getirilirken kullanıcı bilgisi eksik gönderildi."); // 💡 Uyarı Logu
                return BadRequest("Kullanıcı bilgisi eksik.");
            }

            // Include ile OrderItems tablosunu da joinleyip, kullanıcının siparişlerini tarihe göre tersten (en yeni en üstte) çekiyoruz
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(order => new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    // DTO'ndaki alanlara birebir uygun mapping:
                    OrderItems = order.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Price = i.Price, 
                        Quantity = i.Quantity,
                        ImageUrl = i.ImageUrl ?? "https://via.placeholder.com/150"
                    }).ToList()
                })
                .ToListAsync();

            _logger.LogInformation("{UserId} ID'li kullanıcı için {OrderCount} adet geçmiş sipariş getirildi.", userId, orders.Count); // 💡 Başarılı İşlem Logu

            // Eğer kullanıcının hiç siparişi yoksa boş liste döner, böylece frontend patlamaz
            return Ok(orders);
        }
    }
}