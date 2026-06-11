using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    public class SobeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
