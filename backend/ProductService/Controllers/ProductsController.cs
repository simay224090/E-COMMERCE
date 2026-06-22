using Microsoft.AspNetCore.Mvc;
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

        // 1. TÜM ÜRÜNLERİ LİSTELE (GET api/products)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        // 2. TEK BİR ÜRÜNÜ GETİR (GET api/products/5)
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(new { Message = "Ürün bulunamadı." });
            }

            return Ok(product);
        }

        // 3. YENİ ÜRÜN EKLE (POST api/products)
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            // Veritabanına ekleme işlemi
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Ürün başarıyla eklenince 201 Created döner ve ürünün detay adresini verir
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
    }
}