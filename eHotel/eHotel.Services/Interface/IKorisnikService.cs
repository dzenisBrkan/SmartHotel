

using eHotel.Database;
using eHotel.Dto.Korisnici;


namespace eHotel.eHotel.Services.Interface;

public interface IKorisnikService
{
    //List<Korisnici> Get();
    Task<List<Korisnici>> GetAsync(string? imePrezime = null);

    Task<Korisnici?> GetByIdAsync(int id);

    Task<Korisnici> InsertAsync(KorisniciInsertRequest request);

    Task<Korisnici?> UpdateAsync(int id, KorisniciUpdateRequest request);

    Task<bool> DeleteAsync(int id);

    //Task<Korisnici?> LoginAsync(string korisnickoIme, string lozinka);

    Task<Korisnici?> GetProfilAsync(int korisnikId);

    Task<Korisnici?> UpdateProfilAsync(int korisnikId, KorisnikProfilUpdateRequest request);

    Task<List<Korisnici>> GetZaposleniciAsync();

}