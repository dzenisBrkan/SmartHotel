using eHotel.Dto.Korisnici;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Zaposlenik")]
    public class ZaposlenikController : ControllerBase
    {
        private readonly IZaposlenikService _service;

        public ZaposlenikController(IZaposlenikService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<List<KorisnikDto>> Get([FromQuery] string? imePrezime)
        {
            return Ok(_service.Get(imePrezime));
        }

        [HttpGet("{id}")]
        public ActionResult<KorisnikDto> GetById(int id)
        {
            var korisnik = _service.GetById(id);
            if (korisnik == null)
                return NotFound();

            return Ok(korisnik);
        }

        [HttpPost]
        public ActionResult<KorisnikDto> Insert([FromBody] KorisniciInsertRequest request)
        {
            var result = _service.Insert(request);
            return CreatedAtAction(nameof(GetById), new { id = result.KorisnikId }, result);
        }

        [HttpPut("{id}")]
        public ActionResult<KorisnikDto> Update(int id, [FromBody] KorisniciUpdateRequest request)
        {
            var korisnik = _service.Update(id, request);
            if (korisnik == null)
                return NotFound();

            return Ok(korisnik);
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var deleted = _service.Delete(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/roles/{roleName}")]
        public ActionResult<KorisnikDto> AssignRole(int id, string roleName)
        {
            return Ok(_service.AssignRole(id, roleName));
        }

        [HttpDelete("{id}/roles/{roleName}")]
        public ActionResult<KorisnikDto> RemoveRole(int id, string roleName)
        {
            return Ok(_service.RemoveRole(id, roleName));
        }
    }
}
