using eHotel.Database;
using eHotel.Dto.Rezervacija;

public interface IRezervacijeService
{
    List<RezervacijaDto> Get(RezervacijaSearchObject search);
    RezervacijaDto GetById(int id);
    RezervacijaDto Insert(RezervacijaInsertRequest request, int loggedUserId, string role);
    RezervacijaDto Update(int id, RezervacijaUpdateRequest request);
    bool Delete(int id);
    List<RezervacijaDto> GetByKorisnikId(int korisnikId);
    RezervacijaDto OtkaziRezervaciju(int korisnikId, int rezervacijaId);
    RezervacijaDto CheckIn(int rezervacijaId);
    RezervacijaDto CheckOut(int rezervacijaId);
}