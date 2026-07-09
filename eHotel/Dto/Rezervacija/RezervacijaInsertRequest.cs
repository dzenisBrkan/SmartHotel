namespace eHotel.Dto.Rezervacija
{
    public class RezervacijaInsertRequest
    {
        public int KorisnikId { get; set; }
        public int SobaId { get; set; }
        public DateTime DatumOd { get; set; }
        public DateTime DatumDo { get; set; }
        public int BrojOsoba { get; set; }

        public List<int> UslugeIds { get; set; } = new();
    }
}
