using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityService.Dtos;
using IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
// 💡 YENİ: Logger kütüphanesi eklendi
using Microsoft.Extensions.Logging; 

namespace IdentityService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        // 💡 YENİ: Logger tanımlandı
        private readonly ILogger<AuthController> _logger; 

        // 💡 YENİ: Constructor içine ILogger enjekte edildi
        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
            if (userExists != null)
            {
                // 🔴 LOG: Aynı e-posta ile kayıt denemesi
                _logger.LogWarning("Kayıt başarısız: Bu e-posta adresi zaten kullanımda. Email: {Email}", registerDto.Email);
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");
            }

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                // 🔴 LOG: Şifre kuralı ihlali vb.
                _logger.LogWarning("Kayıt başarısız: Validasyon hatası. Email: {Email}, Hatalar: {@Errors}", registerDto.Email, errors);
                return BadRequest(new { Errors = errors });
            }

            // 🟢 LOG: Başarılı kayıt
            _logger.LogInformation("Yeni kullanıcı başarıyla kaydedildi. Email: {Email}", registerDto.Email);
            return Ok("Kullanıcı başarıyla kaydedildi! Şimdi DBeaver'dan kontrol edebilirsin.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                // 🔴 LOG: Olmayan e-posta ile giriş denemesi
                _logger.LogWarning("Başarısız giriş denemesi: Kullanıcı bulunamadı. Email: {Email}", loginDto.Email);
                return Unauthorized(new { message = "E-posta veya şifre hatalı." });
            }

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!result)
            {
                // 🔴 LOG: Yanlış şifre girilmesi
                _logger.LogWarning("Başarısız giriş denemesi: Yanlış şifre. Email: {Email}", loginDto.Email);
                return Unauthorized(new { message = "E-posta veya şifre hatalı." });
            }

            // 🟢 LOG: Başarılı giriş
            _logger.LogInformation("Kullanıcı girişi başarılı. Email: {Email}", loginDto.Email);

            var token = GenerateJwtToken(user);

            return Ok(new { 
                Token = token, 
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            });
        }

        // JWT Üretimini Yapan Gizli Metot
        private string GenerateJwtToken(ApplicationUser user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}