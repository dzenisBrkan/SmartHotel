namespace eHotel.Database;

public class Rezervacija
{
    public int RezervacijaId { get; set; }
    public int KorisnikId { get; set; }
    public int SobaId { get; set; }
    public DateTime DatumOd { get; set; }
    public DateTime DatumDo { get; set; }
    public int BrojOsoba { get; set; }
    public int Status { get; set; }
    public decimal UkupnaCijena { get; set; }
    public DateTime DatumKreiranja { get; set; }
    public virtual Korisnici Korisnik { get; set; } = null!;
    public virtual Sobe Soba { get; set; } = null!;
    public virtual ICollection<Placanja> Placanja { get; set; } = new List<Placanja>();
    public virtual ICollection<RezervacijaUsluge> RezervacijaUsluge { get; set; } = new List<RezervacijaUsluge>();
}