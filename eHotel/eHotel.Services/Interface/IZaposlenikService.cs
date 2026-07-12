using eHotel.Dto.Korisnici;

namespace eHotel.eHotel.Services.Interface
{
    public interface IZaposlenikService
    {
        List<KorisnikDto> Get(string uloga, string? imePrezime = null);
        KorisnikDto? GetById(int id);
        KorisnikDto Insert(KorisniciInsertRequest request);
        KorisnikDto? Update(int id, KorisniciUpdateRequest request);
        bool Delete(int id);
    }
}