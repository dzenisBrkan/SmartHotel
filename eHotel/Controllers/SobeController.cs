using eHotel.Dto.Soba;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SobeController : ControllerBase
    {
        private readonly ISobaService _service;

        public SobeController(ISobaService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<SobaDto>> Get([FromQuery] SobaSearchObject search)
        {
            return Ok(_service.Get(search));
        }
        
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<SobaDto> GetById(int id)
        {
            var result = _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<SobaDto> Insert([FromBody] SobaInsertRequest request)
        {
            return Ok(_service.Insert(request));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<SobaDto> Update(int id, [FromBody] SobaUpdateRequest request)
        {
            return Ok(_service.Update(id, request));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<bool> Delete(int id)
        {
            return Ok(_service.Delete(id));
        }
    }
}