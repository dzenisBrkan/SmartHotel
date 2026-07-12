using System.Security.Claims;
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
        [AllowAnonymous]
        public ActionResult<List<RecenzijaDto>> Get([FromQuery] RecenzijaSearchObject search)
        {
            return Ok(_service.Get(search));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<RecenzijaDto> GetById(int id)
        {
            var result = _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Gost")]
        public ActionResult<List<RecenzijaDto>> GetByKorisnikId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();
            
            var result = _service.GetByKorisnikId(int.Parse(userId));
            
            return Ok(result);
        }

        [HttpGet("by-soba/{sobaId}")]
        [AllowAnonymous]
        public ActionResult<List<RecenzijaDto>> GetBySobaId(int sobaId)
        {
            return Ok(_service.GetBySobaId(sobaId));
        }

        [HttpGet("prosjek/{sobaId}")]
        [AllowAnonymous]
        public ActionResult<decimal> GetProsjecnaOcjenaZaSobu(int sobaId)
        {
            return Ok(_service.GetProsjecnaOcjenaZaSobu(sobaId));
        }

        [HttpPost]
        [Authorize(Roles = "Gost")]
        public ActionResult<RecenzijaDto> Insert([FromBody] RecenzijaInsertRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = _service.Insert(request, userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Gost")]
        public ActionResult<RecenzijaDto> Update(int id, [FromBody] RecenzijaUpdateRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            return Ok(_service.Update(id, request, userId, role));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Gost")]
        public IActionResult Delete(int id)
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdValue == null)
                return Unauthorized();

            var userId = int.Parse(userIdValue);
            
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == null)
                return Unauthorized();
            
            var result = _service.Delete(id, userId, role);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}