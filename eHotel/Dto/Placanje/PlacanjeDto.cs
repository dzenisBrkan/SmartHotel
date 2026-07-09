namespace eHotel.Dto.Placanje
{
    public class PlacanjeDto
    {
        public int PlacanjeId { get; set; }
        public int RezervacijaId { get; set; }
        public decimal Iznos { get; set; }
        public DateTime Datum { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TransakcijaId { get; set; }
    }
}
