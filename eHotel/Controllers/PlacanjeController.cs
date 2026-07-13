
using System.Security.Claims;
using eHotel.Dto.Placanje;
using eHotel.Dto.Rezervacija;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlacanjaController : ControllerBase
    {
        private readonly IPlacanjeService _service;

        public PlacanjaController(IPlacanjeService service)
        {
            _service = service;
        }
        
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<PlacanjeDto> GetById(int id)
        {
            var result = _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("by-rezervacija/{rezervacijaId}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<List<PlacanjeDto>> GetByRezervacijaId(int rezervacijaId)
        {
            return Ok(_service.GetByRezervacijaId(rezervacijaId));
        }
        
        [HttpGet]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<List<PlacanjeDto>> Get()
        {
            return Ok(_service.Get());
        }
        
        [HttpPost]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<PlacanjeDto> Insert([FromBody] PlacanjeInsertRequest request)
        {
            return Ok(_service.Insert(request));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<PlacanjeDto> Update(int id, [FromBody] PlacanjeUpdateRequest request)
        {
            return Ok(_service.Update(id, request));
        }

        [HttpGet("me")]
        [Authorize(Roles = "Gost")]
        public ActionResult<List<PlacanjeDto>> GetByGostId()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = _service.GetByGostId(userId);

            return Ok(result);
        }
    }
}