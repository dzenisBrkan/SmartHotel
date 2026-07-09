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
        public ActionResult<List<Rezervacija>> Get([FromQuery] RezervacijaSearchObject search)
        {
            return Ok(_rezervacijeService.Get(search));
        }

        [HttpGet("{id}")]
        public ActionResult<Rezervacija> GetById(int id)
        {
            var result = _rezervacijeService.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public ActionResult<Rezervacija> Insert([FromBody] RezervacijaInsertRequest request)
        {
            var result = _rezervacijeService.Insert(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Zaposlenik")]
        public ActionResult<Rezervacija> Update(int id, [FromBody] RezervacijaUpdateRequest request)
        {
            var result = _rezervacijeService.Update(id, request);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Zaposlenik")]
        public ActionResult Delete(int id)
        {
            var result = _rezervacijeService.Delete(id);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("korisnik/{korisnikId}")]
        public ActionResult<List<Rezervacija>> GetByKorisnikId(int korisnikId)
        {
            return Ok(_rezervacijeService.GetByKorisnikId(korisnikId));
        }

        [HttpPut("{rezervacijaId}/otkazi")]
        public ActionResult<Rezervacija> OtkaziRezervaciju(int rezervacijaId)
        {
            var result = _rezervacijeService.OtkaziRezervaciju(rezervacijaId);
            return Ok(result);
        }
    }
}
