namespace eHotel.Model
{
    public partial class Sobe
    {
        public int SobeId { get; set; }

        public string Naziv { get; set; }

        public string Sifra { get; set; }

        public decimal Cijena { get; set; }

        public int VrstaId { get; set; }

        public int JedinicaMjereId { get; set; }

        public byte[] Slika { get; set; }

        public byte[] SlikaThumb { get; set; }

        public bool? Status { get; set; }

        public string StateMachine { get; set; }
    }
}
