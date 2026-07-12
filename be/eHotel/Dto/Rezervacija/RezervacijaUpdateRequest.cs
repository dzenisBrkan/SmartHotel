namespace eHotel.Dto.Rezervacija
{
    public class RezervacijaUpdateRequest
    {
        public int SobaId { get; set; }
        public DateTime DatumOd { get; set; }
        public DateTime DatumDo { get; set; }
        public int BrojOsoba { get; set; }
        public int Status { get; set; }

        public List<int> UslugeIds { get; set; } = new();
    }
}
