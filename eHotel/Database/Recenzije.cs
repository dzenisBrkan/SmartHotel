namespace eHotel.Database;

public class Recenzije
{
    public int RecenzijeId { get; set; }
    public int KorisnikId { get; set; }
    public int SobaId { get; set; }
    public int Ocjena { get; set; }
    public string Komentar { get; set; } = null!;
    public DateTime Datum { get; set; }
    public virtual Korisnici Korisnik { get; set; } = null!;
    public virtual Sobe Soba { get; set; } = null!;
}