using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eHotel.eHotel.Services.Interface;
using eHotel.Dto.Korisnici;

namespace eHotel.Controllers;

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

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? imePrezime)
    {
        return Ok(await _service.GetAsync(imePrezime));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var korisnik = await _service.GetByIdAsync(id);

        if (korisnik == null)
            return NotFound();

        return Ok(korisnik);
    }

    [HttpPost]
    [Authorize(Roles = "Zaposlenik")]
    public async Task<IActionResult> Insert(KorisniciInsertRequest request)
    {
        return Ok(await _service.InsertAsync(request));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, KorisniciUpdateRequest request)
    {
        var korisnik = await _service.UpdateAsync(id, request);

        if (korisnik == null)
            return NotFound();

        return Ok(korisnik);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Zaposlenik")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);

        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpGet("profil/{id}")]
    public async Task<IActionResult> Profil(int id)
    {
        var korisnik = await _service.GetProfilAsync(id);

        if (korisnik == null)
            return NotFound();

        return Ok(korisnik);
    }

    [HttpPut("profil/{id}")]
    public async Task<IActionResult> UpdateProfil(
        int id,
        KorisnikProfilUpdateRequest request)
    {
        var korisnik = await _service
            .UpdateProfilAsync(id, request);

        if (korisnik == null)
            return NotFound();

        return Ok(korisnik);
    }

    [HttpGet("zaposlenici")]
    [Authorize(Roles = "Zaposlenik")]
    public async Task<IActionResult> GetZaposlenici()
    {
        return Ok(await _service.GetZaposleniciAsync());
    }
}

