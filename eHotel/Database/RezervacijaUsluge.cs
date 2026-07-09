namespace eHotel.Database;

public class RezervacijaUsluge
{
    public int RezervacijaUslugaId { get; set; }

    public int RezervacijaId { get; set; }

    public int UslugaId { get; set; }

    public virtual Rezervacija Rezervacija { get; set; } = null!;

    public virtual DodatneUsluge Usluga { get; set; } = null!;
}