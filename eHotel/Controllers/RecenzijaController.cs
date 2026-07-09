using eHotel.Dto.Recenzija;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecenzijaController : ControllerBase
    {
        private readonly IRecenzijaService _service;

        public RecenzijaController(IRecenzijaService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<List<RecenzijaDto>> Get([FromQuery] RecenzijaSearchObject search)
        {
            return Ok(_service.Get(search));
        }

        [HttpGet("{id}")]
        public ActionResult<RecenzijaDto> GetById(int id)
        {
            var result = _service.GetById(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("by-korisnik/{korisnikId}")]
        public ActionResult<List<RecenzijaDto>> GetByKorisnikId(int korisnikId)
        {
            return Ok(_service.GetByKorisnikId(korisnikId));
        }

        [HttpGet("by-soba/{sobaId}")]
        public ActionResult<List<RecenzijaDto>> GetBySobaId(int sobaId)
        {
            return Ok(_service.GetBySobaId(sobaId));
        }

        [HttpGet("prosjek/{sobaId}")]
        public ActionResult<decimal> GetProsjecnaOcjenaZaSobu(int sobaId)
        {
            return Ok(_service.GetProsjecnaOcjenaZaSobu(sobaId));
        }

        [HttpPost]
        public ActionResult<RecenzijaDto> Insert([FromBody] RecenzijaInsertRequest request)
        {
            return Ok(_service.Insert(request));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Zaposlenik")]
        public ActionResult<RecenzijaDto> Update(int id, [FromBody] RecenzijaUpdateRequest request)
        {
            return Ok(_service.Update(id, request));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Zaposlenik")]
        public ActionResult<bool> Delete(int id)
        {
            var result = _service.Delete(id);

            if (!result)
                return NotFound();

            return Ok(result);
        }
    }
}