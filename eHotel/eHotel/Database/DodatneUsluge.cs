namespace eHotel.Database;

public class DodatneUsluge
{
    public int UslugaId { get; set; }

    public string Naziv { get; set; } = null!;

    public decimal Cijena { get; set; }

    public virtual ICollection<RezervacijaUsluge> RezervacijaUsluge { get; set; } = new List<RezervacijaUsluge>();
}