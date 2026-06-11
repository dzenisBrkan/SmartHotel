namespace eHotel.Database;

public partial class Korisnici
{
    public int KorisnikId { get; set; }

    public string Ime { get; set; } = null!;

    public string Prezime { get; set; } = null!;

    public string? Email { get; set; }

    public string? Telefon { get; set; }

    public string KorisnickoIme { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool? Status { get; set; }

    public DateTime DatumRegistracije { get; set; }

    public virtual ICollection<KorisniciUloge> KorisniciUloges { get; set; } = new List<KorisniciUloge>();

    public virtual ICollection<Rezervacija> Rezervacije { get; set; } = new List<Rezervacija>();

    public virtual ICollection<Recenzije> Recenzije { get; set; } = new List<Recenzije>();
}