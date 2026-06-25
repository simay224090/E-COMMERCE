using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // Yetkilendirme için gerekli!
using ProductService.Data;
using ProductService.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public ProductsController(ProductDbContext context)
        {
            _context = context;
        }

        // 1. TÜM ÜRÜNLERİ LİSTELE (Herkes erişebilir)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .ToListAsync();
                
            return Ok(products);
        }

        // 2. TEK BİR ÜRÜNÜ GETİR (Herkes erişebilir)
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { Message = "Ürün bulunamadı." });
            }

            return Ok(product);
        }

        // 3. YENİ ÜRÜN EKLE (SADECE ADMIN)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // ======================================================
        // KATEGORİ METODLARI
        // ======================================================

        // 4. KATEGORİLERİ GETİR (Herkes erişebilir)
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        // 5. YENİ KATEGORİ EKLE (SADECE ADMIN)
        [Authorize(Roles = "Admin")]
        [HttpPost("categories")]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }
    }
}