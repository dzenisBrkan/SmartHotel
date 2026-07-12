using eHotel.Database;
using eHotel.Dto.Korisnici;
using eHotel.eHotel.Services.Interface;
using eHotel.Helpers;
using eHotel.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace eHotel.eHotel.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly EHotelContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthService(EHotelContext context, JwtSettings jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var korisnik = await _context.Korisnicis
                .Include(x => x.KorisniciUloges)
                    .ThenInclude(ku => ku.Uloga)
                .FirstOrDefaultAsync(x => x.KorisnickoIme == request.KorisnickoIme);

            if (korisnik == null)
                return new LoginResponse { Success = false, Message = "Korisnik ne postoji!" };

            if (!PasswordHelper.Verify(request.Lozinka, korisnik.PasswordHash))
                return new LoginResponse { Success = false, Message = "Lozinka je pogrešna!" };

            var roles = korisnik.KorisniciUloges
                .Select(x => x.Uloga?.Naziv)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            var token = GenerateJwtToken(korisnik, roles);
            return new LoginResponse
            {
                Success = true,
                Message = "Uspješna prijava!",
                Token = token,
                Roles = roles,
                User = new KorisnikLoginInfo
                {
                    KorisnikId = korisnik.KorisnikId,
                    KorisnickoIme = korisnik.KorisnickoIme,
                    Ime = korisnik.Ime,
                    Prezime = korisnik.Prezime,
                    Email = korisnik.Email ?? string.Empty
                }
            };
        }

        public async Task<LoginResponse> RegisterAsync(KorisniciInsertRequest request)
        {
            var existing = await _context.Korisnicis
                .FirstOrDefaultAsync(x => x.KorisnickoIme == request.KorisnickoIme);

            if (existing != null)
                return new LoginResponse { Success = false, Message = "Korisničko ime je zauzeto!" };

            var newKorisnik = new Korisnici
            {
                Ime = request.Ime,
                Prezime = request.Prezime,
                Email = request.Email,
                KorisnickoIme = request.KorisnickoIme,
                PasswordHash = PasswordHelper.Hash(request.Lozinka),
                Status = true,
                DatumRegistracije = DateTime.UtcNow
            };

            _context.Korisnicis.Add(newKorisnik);
            await _context.SaveChangesAsync();

            var gostRole = await _context.Uloges.FirstOrDefaultAsync(x => x.Naziv == "Gost");
            if (gostRole == null)
            {
                gostRole = new Uloge { Naziv = "Gost", Opis = "Korisnik hotela" };
                _context.Uloges.Add(gostRole);
                await _context.SaveChangesAsync();
            }

            _context.KorisniciUloges.Add(new KorisniciUloge
            {
                KorisnikId = newKorisnik.KorisnikId,
                UlogaId = gostRole.UlogaId,
                DatumIzmjene = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            var roles = new List<string> { "Gost" };
            var token = GenerateJwtToken(newKorisnik, roles);

            return new LoginResponse
            {
                Success = true,
                Message = "Registracija uspješna!",
                Token = token,
                Roles = roles,
                User = new KorisnikLoginInfo
                {
                    KorisnikId = newKorisnik.KorisnikId,
                    KorisnickoIme = newKorisnik.KorisnickoIme,
                    Ime = newKorisnik.Ime,
                    Prezime = newKorisnik.Prezime,
                    Email = newKorisnik.Email ?? string.Empty
                }
            };
        }

        public string GenerateJwtToken(Korisnici korisnik, List<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey ?? string.Empty);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, korisnik.KorisnikId.ToString()),
                new Claim(ClaimTypes.Name, korisnik.KorisnickoIme),
                new Claim("FullName", korisnik.Ime + " " + korisnik.Prezime)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(descriptor);
            return tokenHandler.WriteToken(token);
        }

        public string HashPassword(string password)
        {
            return PasswordHelper.Hash(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return PasswordHelper.Verify(password, hash);
        }
    }
}