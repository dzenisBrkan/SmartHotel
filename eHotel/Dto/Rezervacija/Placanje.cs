namespace eHotel.Dto.Rezervacija
{
    public class Placanje
    {
        public int PlacanjeId { get; set; }
        public decimal Iznos { get; set; }
        public DateTime Datum { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TransakcijaId { get; set; }
    }
}
