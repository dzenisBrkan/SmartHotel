using eHotel.Dto.Recenzija;

namespace eHotel.eHotel.Services.Interface
{
    public interface IRecenzijaService
    {
        List<RecenzijaDto> Get(RecenzijaSearchObject search = null);
        RecenzijaDto GetById(int id);
        RecenzijaDto Insert(RecenzijaInsertRequest request, int korisnikId);
        RecenzijaDto Update(int id, RecenzijaUpdateRequest request,int korisnikId, string role);
        bool Delete(int id,int korisnikId, string role);
        List<RecenzijaDto> GetByKorisnikId(int korisnikId);
        List<RecenzijaDto> GetBySobaId(int sobaId);
        decimal GetProsjecnaOcjenaZaSobu(int sobaId);
    }
}
