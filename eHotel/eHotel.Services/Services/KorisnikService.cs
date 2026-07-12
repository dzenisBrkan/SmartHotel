using AutoMapper;
using eHotel.Database;
using eHotel.Dto.Korisnici;
using eHotel.eHotel.Services.Interface;
using eHotel.Helpers;
using Microsoft.EntityFrameworkCore;

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

    public async Task<Korisnici?> GetProfilAsync(int korisnikId)
    {
        return await _context.Korisnicis
            .FirstOrDefaultAsync(x => x.KorisnikId == korisnikId);
    }

    public async Task<Korisnici?> UpdateProfilAsync(int korisnikId, KorisnikProfilUpdateRequest request)
    {
        var korisnik = await _context.Korisnicis
            .FindAsync(korisnikId);

        if (korisnik == null)
            return null;

        korisnik.Ime = string.IsNullOrWhiteSpace(request.Ime) ? korisnik.Ime : request.Ime;
        korisnik.Prezime = string.IsNullOrWhiteSpace(request.Prezime) ? korisnik.Prezime : request.Prezime;
        korisnik.Email = string.IsNullOrWhiteSpace(request.Email) ? korisnik.Email : request.Email;
        korisnik.Telefon = string.IsNullOrWhiteSpace(request.Telefon) ? korisnik.Telefon : request.Telefon;

        await _context.SaveChangesAsync();
        return korisnik;
    }
}