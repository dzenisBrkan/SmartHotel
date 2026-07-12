using System.Security.Claims;
using eHotel.Database;
using eHotel.Dto.Rezervacija;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RezervacijeController : ControllerBase
    {
        private readonly IRezervacijeService _rezervacijeService;

        public RezervacijeController(IRezervacijeService rezervacijeService)
        {
            _rezervacijeService = rezervacijeService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<List<RezervacijaDto>> Get([FromQuery] RezervacijaSearchObject search)
        {
            return Ok(_rezervacijeService.Get(search));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<RezervacijaDto> GetById(int id)
        {
            var result = _rezervacijeService.GetById(id);
            
            if (result == null)
                return NotFound();
            
            return Ok(result);
        }
        
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<RezervacijaDto> Update(int id, [FromBody] RezervacijaUpdateRequest request)
        {
            var result = _rezervacijeService.Update(id, request);
            return Ok(result);
        }
        
        [HttpPost]
        [Authorize(Roles = "Admin,Recepcioner,Gost")]
        public ActionResult<RezervacijaDto> Insert([FromBody] RezervacijaInsertRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var result = _rezervacijeService.Insert(request, userId, role);
            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Gost")]
        public ActionResult<List<RezervacijaDto>> GetByKorisnikId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = _rezervacijeService.GetByKorisnikId(int.Parse(userId));
            return Ok(result);
        }

        [HttpPut("{rezervacijaId}/otkazi")]
        [Authorize(Roles = "Gost")]
        public ActionResult<RezervacijaDto> OtkaziRezervaciju(int rezervacijaId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = _rezervacijeService.OtkaziRezervaciju(int.Parse(userId),rezervacijaId);
            return Ok(result);
        }

        [HttpPut("{id}/checkin")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<RezervacijaDto> CheckIn(int id)
        {
            return Ok(_rezervacijeService.CheckIn(id));
        }

        [HttpPut("{id}/checkout")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<RezervacijaDto> CheckOut(int id)
        {
            return Ok(_rezervacijeService.CheckOut(id));
        }
    }
}