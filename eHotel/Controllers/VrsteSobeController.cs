using eHotel.Dto.VrstaSobe;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VrsteSobeController : ControllerBase
    {
        private readonly IVrstaSobeService _service;

        public VrsteSobeController(IVrstaSobeService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<VrstaSobeDto>> Get()
        {
            return Ok(_service.Get());
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<VrstaSobeDto> GetById(int id)
        {
            var result = _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<VrstaSobeDto> Insert([FromBody] VrstaSobeInsertRequest request)
        {
            var result = _service.Insert(request);
            return CreatedAtAction(nameof(GetById), new { id = result.VrstaId }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult<VrstaSobeDto> Update(int id, [FromBody] VrstaSobeUpdateRequest request)
        {
            var result = _service.Update(id, request);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Recepcioner")]
        public ActionResult Delete(int id)
        {
            var deleted = _service.Delete(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
