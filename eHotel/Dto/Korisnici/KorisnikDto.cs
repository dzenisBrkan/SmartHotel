using System;
using System.Collections.Generic;

namespace eHotel.Dto.Korisnici
{
    public class KorisnikDto
    {
        public int KorisnikId { get; set; }
        public string Ime { get; set; } = string.Empty;
        public string Prezime { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefon { get; set; }
        public string KorisnickoIme { get; set; } = string.Empty;
        public bool? Status { get; set; }
        public DateTime DatumRegistracije { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}
