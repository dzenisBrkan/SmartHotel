namespace eHotel.Dto.DodatneUsluge
{
    public class DodatnaUslugaDto
    {
        public int UslugaId { get; set; }
        public string Naziv { get; set; } = string.Empty;
        public decimal Cijena { get; set; }
    }
}
