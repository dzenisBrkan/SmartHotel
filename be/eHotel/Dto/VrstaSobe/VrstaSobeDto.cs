namespace eHotel.Dto.VrstaSobe
{
    public class VrstaSobeDto
    {
        public int VrstaId { get; set; }
        public string Naziv { get; set; } = string.Empty;
        public string Opis { get; set; } = string.Empty;
        public int Kapacitet { get; set; }
        public decimal Cijena { get; set; }
    }
}
