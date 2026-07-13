namespace eHotel.Dto.Recenzija
{
        public class RecenzijaDto
        {
            public int RecenzijeId { get; set; }
            public int KorisnikId { get; set; }
            public int SobaId { get; set; }

            public string KorisnikImePrezime { get; set; } = string.Empty;
            public string SobaNaziv { get; set; } = string.Empty;

            public int Ocjena { get; set; }
            public string Komentar { get; set; } = string.Empty;
            public DateTime Datum { get; set; }
        }
    }

