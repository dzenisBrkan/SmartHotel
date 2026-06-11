using eHotel.Model;
using Microsoft.AspNetCore.Mvc;
using eHotel.eHotel.Services.Interface;

namespace eHotel.Controllers;

[ApiController]
[Route("[controller]")]
public class KorisnikController : Controller
{
    private readonly IKorisnikService _korisnikService;
    public KorisnikController(IKorisnikService korisnikService) 
    {
        _korisnikService = korisnikService;
    }

//
    [HttpGet]
    public IList<Korisnici> Index()
    {
        return _korisnikService.Get();
    }
}
