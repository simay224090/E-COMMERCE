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

        public OrdersController(OrderDbContext context)
        {
            _context = context;
        }

        // 1. Sepetten Gelen DTO Listesiyle Sipariş Oluşturma (POST)
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromHeader(Name = "X-User-Id")] string? userId, [FromBody] List<OrderItemDto> itemsDto)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı bilgisi (X-User-Id) eksik.");

            if (itemsDto == null || !itemsDto.Any())
                return BadRequest("Sipariş kalemi bulunamadı.");

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
                    Quantity = i.Quantity
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
                    Quantity = i.Quantity
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrderById), new { id = responseDto.Id }, responseDto);
        }

        // 2. Belirli Bir Siparişi DTO Olarak Getirme (GET by ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Sipariş bulunamadı.");

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
                    Quantity = i.Quantity
                }).ToList()
            };

            return Ok(orderDto);
        }
    }
}