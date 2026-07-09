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

    public async Task<List<Korisnici>> GetAsync(string? imePrezime = null)
    {
        var query = _context.Korisnicis.AsQueryable();

        if (!string.IsNullOrWhiteSpace(imePrezime))
        {
            query = query.Where(x =>
                (x.Ime + " " + x.Prezime).Contains(imePrezime));
        }

        return await query.ToListAsync();
    }

    public async Task<Korisnici?> GetByIdAsync(int id)
    {
        return await _context.Korisnicis.FindAsync(id);
    }

    public async Task<Korisnici> InsertAsync(KorisniciInsertRequest request)
    {
        var entity = new Korisnici
        {
            Ime = request.Ime,
            Prezime = request.Prezime,
            Email = request.Email,
            KorisnickoIme = request.KorisnickoIme,
            PasswordHash = PasswordHelper.Hash(request.Lozinka),
            Status = true,
            DatumRegistracije = DateTime.UtcNow
        };

        _context.Korisnicis.Add(entity);
        await _context.SaveChangesAsync();

        return entity;
    }

    public async Task<Korisnici?> UpdateAsync(int id,
        KorisniciUpdateRequest request)
    {
        var entity = await _context.Korisnicis.FindAsync(id);

        if (entity == null)
            return null;

        entity.Ime = request.Ime;
        entity.Prezime = request.Prezime;
        entity.Email = request.Email;

        await _context.SaveChangesAsync();

        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.Korisnicis.FindAsync(id);

        if (entity == null)
            return false;

        _context.Korisnicis.Remove(entity);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<Korisnici?> GetProfilAsync(int korisnikId)
    {
        return await _context.Korisnicis
            .FirstOrDefaultAsync(x => x.KorisnikId == korisnikId);
    }

    public async Task<Korisnici?> UpdateProfilAsync(
        int korisnikId,
        KorisnikProfilUpdateRequest request)
    {
        var korisnik = await _context.Korisnicis
            .FindAsync(korisnikId);

        if (korisnik == null)
            return null;

        korisnik.Ime = request.Ime;
        korisnik.Prezime = request.Prezime;
        korisnik.Email = request.Email;
        korisnik.Telefon = request.Telefon;

        await _context.SaveChangesAsync();

        return korisnik;
    }

    public async Task<List<Korisnici>> GetZaposleniciAsync()
    {
        return await _context.KorisniciUloges
            .Where(x => x.Uloga.Naziv == "Zaposlenik")
            .Select(x => x.Korisnik)
            .ToListAsync();
    }
}