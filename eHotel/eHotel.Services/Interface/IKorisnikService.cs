

using eHotel.Database;
using eHotel.Dto.Korisnici;


namespace eHotel.eHotel.Services.Interface;

public interface IKorisnikService
{
    Task<Korisnici?> GetProfilAsync(int korisnikId);

    Task<Korisnici?> UpdateProfilAsync(int korisnikId, KorisnikProfilUpdateRequest request);
}