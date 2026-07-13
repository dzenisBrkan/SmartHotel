namespace eHotel.Dto.Soba
{
    public class SobaUpdateRequest
    {
        public string Naziv { get; set; } = string.Empty;
        public string Sifra { get; set; } = string.Empty;
        public int VrstaId { get; set; }

        public byte[]? Slika { get; set; }
        public byte[]? SlikaThumb { get; set; }

        public bool? Status { get; set; }
        public string StateMachine { get; set; } = string.Empty;
    }
}
