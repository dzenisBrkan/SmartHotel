using eHotel.Dto.Recenzija;

namespace eHotel.eHotel.Services.Interface
{
    public interface IRecenzijaService
    {
        List<RecenzijaDto> Get(RecenzijaSearchObject search = null);
        RecenzijaDto GetById(int id);
        RecenzijaDto Insert(RecenzijaInsertRequest request);
        RecenzijaDto Update(int id, RecenzijaUpdateRequest request);
        bool Delete(int id);

        List<RecenzijaDto> GetByKorisnikId(int korisnikId);
        List<RecenzijaDto> GetBySobaId(int sobaId);

        decimal GetProsjecnaOcjenaZaSobu(int sobaId);
    }
}
