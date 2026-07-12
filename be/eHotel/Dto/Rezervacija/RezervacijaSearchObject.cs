namespace eHotel.Dto.Rezervacija
{
    public class RezervacijaSearchObject
    {
        public int? KorisnikId { get; set; }
        public int? SobaId { get; set; }
        public int? Status { get; set; }
        public DateTime? DatumOd { get; set; }
        public DateTime? DatumDo { get; set; }
    }
}
