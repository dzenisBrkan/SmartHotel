using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
