namespace eHotel.Dto.Recenzija
{
    public class RecenzijaInsertRequest
    {
        public int KorisnikId { get; set; }
        public int SobaId { get; set; }
        public int Ocjena { get; set; }
        public string Komentar { get; set; } = string.Empty;
    }
}
