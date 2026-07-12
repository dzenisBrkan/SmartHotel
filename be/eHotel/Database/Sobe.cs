namespace eHotel.Database;

public partial class Sobe
{
    public int SobeId { get; set; }

    public string Naziv { get; set; } = null!;

    public string Sifra { get; set; } = null!;

    public int VrstaId { get; set; }

    public byte[] Slika { get; set; } = null!;

    public byte[] SlikaThumb { get; set; } = null!;

    public bool? Status { get; set; }

    public string StateMachine { get; set; } = null!;

    public virtual VrsteSoba Vrsta { get; set; } = null!;

    public virtual ICollection<Rezervacija> Rezervacije { get; set; } = new List<Rezervacija>();

    public virtual ICollection<Recenzije> Recenzije { get; set; } = new List<Recenzije>();
}