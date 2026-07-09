using System.ComponentModel.DataAnnotations;

namespace eHotel.Dto.VrstaSobe
{
    public class VrstaSobeInsertRequest
    {
        [Required]
        public string Naziv { get; set; } = string.Empty;

        [Required]
        public string Opis { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Kapacitet { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Cijena { get; set; }
    }
}
