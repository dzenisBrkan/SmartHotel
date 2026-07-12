using AutoMapper;

namespace eHotel.Mapping;

public class EHotelProfile : Profile
{
    public EHotelProfile()
    {
        CreateMap<Database.Korisnici, Model.Korisnici>();
    }
}