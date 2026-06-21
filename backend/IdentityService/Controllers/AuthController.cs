using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityService.Dtos;
using IdentityService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;



namespace IdentityService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        

        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            // 1. E-posta adresi zaten kullanımda mı kontrol et
            var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
            if (userExists != null)
            {
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");
            }

            // 2. Yeni kullanıcı nesnesini oluştur (Identity'den türeyen modelimiz)
            var user = new ApplicationUser
            {
                UserName = registerDto.Email, // Identity için UserName zorunludur, e-posta ile eşliyoruz
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            // 3. Kullanıcıyı şifresiyle birlikte veritabanına kaydet (Şifre arkada otomatik hash'lenir)
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                // Eğer şifre politikasına uymuyorsa (büyük harf, sayı vb.) hataları dönüyoruz
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { Errors = errors });
            }

            return Ok("Kullanıcı başarıyla kaydedildi! Şimdi DBeaver'dan kontrol edebilirsin.");
        }

        [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
{
    // 1. Kullanıcı veritabanında var mı e-postadan bul
    var user = await _userManager.FindByEmailAsync(loginDto.Email);
    if (user == null)
    {
        return Unauthorized("E-posta veya şifre hatalı.");
    }

    // 2. Şifreyi doğrula (Identity bizim için arkada hash'leri karşılaştırır)
    var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
    if (!result)
    {
        return Unauthorized("E-posta veya şifre hatalı.");
    }

    // 3. Şifre doğruysa kullanıcıya özel bir JWT Token üret
    var token = GenerateJwtToken(user);

    // 4. Token'ı ve kullanıcı bilgilerini frontend'e (Axios'a) dön
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

    // Token içerisine kullanıcının kimlik kartı bilgilerini (Claims) ekiyoruz
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