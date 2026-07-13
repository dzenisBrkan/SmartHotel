using eHotel.Database;
using eHotel.Dto.Korisnici;

namespace eHotel.eHotel.Services.Interface
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<LoginResponse> RegisterAsync(KorisniciInsertRequest request);
        string GenerateJwtToken(Korisnici korisnik, List<string> roles);
        bool VerifyPassword(string password, string hash);
        string HashPassword(string password);
    }
}
