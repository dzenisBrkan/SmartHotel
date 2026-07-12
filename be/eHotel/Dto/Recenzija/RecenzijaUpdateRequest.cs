namespace eHotel.Dto.Recenzija
{
    public class RecenzijaUpdateRequest
    {
        public int Ocjena { get; set; }
        public string Komentar { get; set; } = string.Empty;
    }
}
