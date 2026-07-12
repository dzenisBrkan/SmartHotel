using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eHotel.eHotel.Services.Interface;
using eHotel.Dto.Korisnici;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class KorisnikController : ControllerBase
    {
        private readonly IKorisnikService _service;
        public KorisnikController(IKorisnikService korisnikService)
        {
            _service = korisnikService;
        }
        
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var korisnik = await _service.GetProfilAsync(int.Parse(userId));

            if (korisnik == null)
                return NotFound();

            return Ok(korisnik);
        }
        
        [HttpPatch("me")]
        public async Task<IActionResult> UpdateProfile(KorisnikProfilUpdateRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var result = await _service.UpdateProfilAsync(int.Parse(userId), request);

            if(result == null)
                return NotFound();

            return Ok(result);
        }
    }
}