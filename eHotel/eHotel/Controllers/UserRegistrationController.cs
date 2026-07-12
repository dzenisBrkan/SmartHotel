using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers;

public class UserRegistrationController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}