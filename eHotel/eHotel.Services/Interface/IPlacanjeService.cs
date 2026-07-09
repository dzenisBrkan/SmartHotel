using eHotel.Dto.Placanje;

namespace eHotel.eHotel.Services.Interface
{
    public interface IPlacanjeService
    {
        List<PlacanjeDto> Get();
        PlacanjeDto GetById(int id);
        List<PlacanjeDto> GetByRezervacijaId(int rezervacijaId);
        PlacanjeDto Insert(PlacanjeInsertRequest request);
        PlacanjeDto Update(int id, PlacanjeUpdateRequest request);
        bool Delete(int id);
    }
}
