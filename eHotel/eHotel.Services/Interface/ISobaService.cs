using eHotel.Dto.Soba;

namespace eHotel.eHotel.Services.Interface
{
    public interface ISobaService
    {
        List<SobaDto> Get(SobaSearchObject search);
        SobaDto? GetById(int id);

        SobaDto Insert(SobaInsertRequest request);
        SobaDto Update(int id, SobaUpdateRequest request);

        bool Delete(int id);
    }
}
