namespace eHotel.Dto.Rezervacija
{
    public class RezervacijaUsluga
    {
        public int UslugaId { get; set; }
        public string Naziv { get; set; } = string.Empty;
        public decimal Cijena { get; set; }
    }
}
