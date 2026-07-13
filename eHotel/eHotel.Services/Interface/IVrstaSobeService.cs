using eHotel.Dto.VrstaSobe;

namespace eHotel.eHotel.Services.Interface;

public interface IVrstaSobeService
{
    List<VrstaSobeDto> Get();
    VrstaSobeDto? GetById(int id);
    VrstaSobeDto Insert(VrstaSobeInsertRequest request);
    VrstaSobeDto Update(int id, VrstaSobeUpdateRequest request);
    bool Delete(int id);
}
