namespace eHotel.Dto.Rezervacija
{
    public class RezervacijaDto
    {
        public int RezervacijaId { get; set; }
        public int KorisnikId { get; set; }
        public int SobaId { get; set; }

        public string KorisnikImePrezime { get; set; } = string.Empty;
        public string SobaNaziv { get; set; } = string.Empty;

        public DateTime DatumOd { get; set; }
        public DateTime DatumDo { get; set; }
        public int BrojOsoba { get; set; }
        public int Status { get; set; }
        public decimal UkupnaCijena { get; set; }
        public DateTime DatumKreiranja { get; set; }

        public List<RezervacijaUsluga> Usluge { get; set; } = new();
        public List<Placanje> Placanja { get; set; } = new();
    }
}
