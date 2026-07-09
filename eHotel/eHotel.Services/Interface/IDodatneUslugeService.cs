using eHotel.Dto.DodatneUsluge;

namespace eHotel.eHotel.Services.Interface
{
    public interface IDodatneUslugeService
    {
        List<DodatnaUslugaDto> Get();
        DodatnaUslugaDto GetById(int id);
        DodatnaUslugaDto Insert(DodatnaUslugaInsertRequest request);
        DodatnaUslugaDto Update(int id, DodatnaUslugaUpdateRequest request);
        bool Delete(int id);
    }
}
