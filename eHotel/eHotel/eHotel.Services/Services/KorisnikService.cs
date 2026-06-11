using AutoMapper;
using eHotel.Database;
using eHotel.eHotel.Services.Interface;

namespace eHotel.eHotel.Services.Services;

public class KorisnikService : IKorisnikService
{
    public EHotelContext _context { get; set; }
    private readonly IMapper _mapper;

    public KorisnikService(EHotelContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public List<Model.Korisnici> Get()
    {
        return _context.Korisnicis.ToList().Select(x => _mapper.Map<Model.Korisnici>(x)).ToList();
    }
}
