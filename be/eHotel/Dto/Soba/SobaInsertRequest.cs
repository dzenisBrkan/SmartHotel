namespace eHotel.Dto.Soba
{
    public class SobaInsertRequest
    {
        public string Naziv { get; set; } = string.Empty;
        public string Sifra { get; set; } = string.Empty;
        public int VrstaId { get; set; }

        public byte[] Slika { get; set; } = Array.Empty<byte>();
        public byte[] SlikaThumb { get; set; } = Array.Empty<byte>();

        public bool? Status { get; set; } = true;
        public string StateMachine { get; set; } = "draft";
    }
}
