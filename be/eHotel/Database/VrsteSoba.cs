namespace eHotel.Database;

public partial class VrsteSoba
{
    public int VrstaId { get; set; }
    public string Naziv { get; set; } = null!;
    public string Opis { get; set; } = null!;
    public int Kapacitet { get; set; }
    public decimal Cijena { get; set; }
    public virtual ICollection<Sobe> Sobe { get; set; } = new List<Sobe>();
}