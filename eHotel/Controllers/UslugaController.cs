using eHotel.Dto.DodatneUsluge;
using eHotel.eHotel.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UslugaController : ControllerBase
    {
        private readonly IDodatneUslugeService _service;

        public  UslugaController(IDodatneUslugeService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<List<DodatnaUslugaDto>> Get()
        {
            return Ok(_service.Get());
        }

        [HttpGet("{id}")]
        public ActionResult<DodatnaUslugaDto> GetById(int id)
        {
            var result = _service.GetById(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public ActionResult<DodatnaUslugaDto> Insert([FromBody] DodatnaUslugaInsertRequest request)
        {
            return Ok(_service.Insert(request));
        }

        [HttpPut("{id}")]
        public ActionResult<DodatnaUslugaDto> Update(int id, [FromBody] DodatnaUslugaUpdateRequest request)
        {
            return Ok(_service.Update(id, request));
        }

        [HttpDelete("{id}")]
        public ActionResult<bool> Delete(int id)
        {
            var result = _service.Delete(id);

            if (!result)
                return NotFound();

            return Ok(result);
        }
    }
}
