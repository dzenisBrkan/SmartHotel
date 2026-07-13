namespace eHotel.Dto.Korisnici
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? Token { get; set; }
        public List<string>? Roles { get; set; }
        public KorisnikLoginInfo? User { get; set; }
    }

    public class KorisnikLoginInfo
    {
        public int KorisnikId { get; set; }
        public string KorisnickoIme { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Email { get; set; }
    }
}
