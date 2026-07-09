using eHotel.Database;
using eHotel.Dto.Rezervacija;

public interface IRezervacijeService
{
    List<RezervacijaDto> Get(RezervacijaSearchObject search);
    RezervacijaDto GetById(int id);
    RezervacijaDto Insert(RezervacijaInsertRequest request);
    RezervacijaDto Update(int id, RezervacijaUpdateRequest request);
    bool Delete(int id);
    List<RezervacijaDto> GetByKorisnikId(int korisnikId);
    RezervacijaDto OtkaziRezervaciju(int rezervacijaId);
}