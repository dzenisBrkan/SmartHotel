namespace eHotel.Database;

public class Placanja
{
    public int PlacanjeId { get; set; }
    public int RezervacijaId { get; set; }
    public decimal Iznos { get; set; }
    public DateTime Datum { get; set; }
    public string Status { get; set; } = null!;
    public int TransakcijaId { get; set; }
    public virtual Rezervacija Rezervacija { get; set; } = null!;
}