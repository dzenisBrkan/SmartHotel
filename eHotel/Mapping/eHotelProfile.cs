using AutoMapper;

namespace eHotel.Mapping;

public class eHotelProfile : Profile
{
    public eHotelProfile()
    {
        CreateMap<Database.Korisnici, Model.Korisnici>();
    }
}
