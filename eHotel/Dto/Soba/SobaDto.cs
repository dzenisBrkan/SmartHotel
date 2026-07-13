namespace eHotel.Dto.Soba
{
    public class SobaDto
    {
        public int SobeId { get; set; }
        public string Naziv { get; set; } = string.Empty;
        public string Sifra { get; set; } = string.Empty;

        public int VrstaId { get; set; }
        public string VrstaNaziv { get; set; } = string.Empty;

        public int Kapacitet { get; set; }
        public decimal Cijena { get; set; }

        public bool? Status { get; set; }
        public string StateMachine { get; set; } = string.Empty;
    }
}
