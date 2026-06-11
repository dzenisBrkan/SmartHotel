using Microsoft.AspNetCore.Mvc;

namespace eHotel.Controllers
{
    public class RecenzijeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
