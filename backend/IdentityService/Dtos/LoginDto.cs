using System.ComponentModel.DataAnnotations;
namespace IdentityService.Dtos
{
    public class LoginDto
    {
        [Required(ErrorMessage = "E-posta adresi zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        public string Password { get; set; } = string.Empty;
    }
}