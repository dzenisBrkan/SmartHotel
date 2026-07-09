using eHotel.Database;
using eHotel.Dto.Recenzija;
using eHotel.Dto.Rezervacija;
using eHotel.eHotel.Services.Interface;
using Microsoft.EntityFrameworkCore;

public class RecenzijeService : IRecenzijaService
{
    private readonly EHotelContext _context;

    public RecenzijeService(EHotelContext context)
    {
        _context = context;
    }

    public List<RecenzijaDto> Get(RecenzijaSearchObject search = null)
    {
        var query = _context.Recenzijes
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
            .AsQueryable();

        if (search?.KorisnikId.HasValue == true)
            query = query.Where(x => x.KorisnikId == search.KorisnikId.Value);

        if (search?.SobaId.HasValue == true)
            query = query.Where(x => x.SobaId == search.SobaId.Value);

        if (search?.Ocjena.HasValue == true)
            query = query.Where(x => x.Ocjena == search.Ocjena.Value);

        return query
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public RecenzijaDto GetById(int id)
    {
        var entity = _context.Recenzijes
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
            .FirstOrDefault(x => x.RecenzijeId == id);

        if (entity == null)
            return null;

        return MapToDto(entity);
    }

    public RecenzijaDto Insert(RecenzijaInsertRequest request)
    {
        if (request.Ocjena < 1 || request.Ocjena > 5)
            throw new Exception("Ocjena mora biti između 1 i 5.");

        if (string.IsNullOrWhiteSpace(request.Komentar))
            throw new Exception("Komentar je obavezan.");

        var korisnik = _context.Korisnicis.FirstOrDefault(x => x.KorisnikId == request.KorisnikId);
        if (korisnik == null)
            throw new Exception("Korisnik ne postoji.");

        var soba = _context.Sobes.FirstOrDefault(x => x.SobeId == request.SobaId);
        if (soba == null)
            throw new Exception("Soba ne postoji.");

        // Korisnik mora imati završenu rezervaciju za tu sobu
        var imaZavrsenuRezervaciju = _context.Rezervacijas.Any(x =>
            x.KorisnikId == request.KorisnikId &&
            x.SobaId == request.SobaId &&
            x.Status == (int)StatusRezervacije.Zavrsena &&
            x.DatumDo < DateTime.Now);

        if (!imaZavrsenuRezervaciju)
            throw new Exception("Korisnik može ostaviti recenziju samo za sobu u kojoj je imao završenu rezervaciju.");

        // Jedan korisnik može ostaviti samo jednu recenziju za jednu sobu
        var postoji = _context.Recenzijes.Any(x =>
            x.KorisnikId == request.KorisnikId &&
            x.SobaId == request.SobaId);

        if (postoji)
            throw new Exception("Korisnik je već ostavio recenziju za ovu sobu.");

        var entity = new Recenzije
        {
            KorisnikId = request.KorisnikId,
            SobaId = request.SobaId,
            Ocjena = request.Ocjena,
            Komentar = request.Komentar,
            Datum = DateTime.Now
        };

        _context.Recenzijes.Add(entity);
        _context.SaveChanges();

        return GetById(entity.RecenzijeId);
    }

    public RecenzijaDto Update(int id, RecenzijaUpdateRequest request)
    {
        var entity = _context.Recenzijes.FirstOrDefault(x => x.RecenzijeId == id);

        if (entity == null)
            throw new Exception("Recenzija nije pronađena.");

        if (request.Ocjena < 1 || request.Ocjena > 5)
            throw new Exception("Ocjena mora biti između 1 i 5.");

        if (string.IsNullOrWhiteSpace(request.Komentar))
            throw new Exception("Komentar je obavezan.");

        entity.Ocjena = request.Ocjena;
        entity.Komentar = request.Komentar;

        _context.SaveChanges();

        return GetById(entity.RecenzijeId);
    }

    public bool Delete(int id)
    {
        var entity = _context.Recenzijes.FirstOrDefault(x => x.RecenzijeId == id);

        if (entity == null)
            return false;

        _context.Recenzijes.Remove(entity);
        _context.SaveChanges();

        return true;
    }

    public List<RecenzijaDto> GetByKorisnikId(int korisnikId)
    {
        return _context.Recenzijes
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
            .Where(x => x.KorisnikId == korisnikId)
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public List<RecenzijaDto> GetBySobaId(int sobaId)
    {
        return _context.Recenzijes
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
            .Where(x => x.SobaId == sobaId)
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public decimal GetProsjecnaOcjenaZaSobu(int sobaId)
    {
        var recenzije = _context.Recenzijes
            .Where(x => x.SobaId == sobaId)
            .ToList();

        if (!recenzije.Any())
            return 0;

        return Math.Round(recenzije.Average(x => (decimal)x.Ocjena), 2);
    }

    private RecenzijaDto MapToDto(Recenzije entity)
    {
        return new RecenzijaDto
        {
            RecenzijeId = entity.RecenzijeId,
            KorisnikId = entity.KorisnikId,
            SobaId = entity.SobaId,
            KorisnikImePrezime = entity.Korisnik != null
                ? entity.Korisnik.Ime + " " + entity.Korisnik.Prezime
                : "",
            SobaNaziv = entity.Soba != null
                ? entity.Soba.Naziv
                : "",
            Ocjena = entity.Ocjena,
            Komentar = entity.Komentar,
            Datum = entity.Datum
        };
    }
}