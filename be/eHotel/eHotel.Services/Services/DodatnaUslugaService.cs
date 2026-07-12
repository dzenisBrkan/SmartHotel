using eHotel.Database;
using eHotel.Dto.DodatneUsluge;
using eHotel.eHotel.Services.Interface;
using Microsoft.EntityFrameworkCore;

public class DodatneUslugeService : IDodatneUslugeService
{
    private readonly EHotelContext _context;

    public DodatneUslugeService(EHotelContext context)
    {
        _context = context;
    }

    public List<DodatnaUslugaDto> Get()
    {
        return _context.DodatneUsluges
            .Select(x => new DodatnaUslugaDto
            {
                UslugaId = x.UslugaId,
                Naziv = x.Naziv,
                Cijena = x.Cijena
            })
            .ToList();
    }

    public DodatnaUslugaDto GetById(int id)
    {
        var entity = _context.DodatneUsluges.FirstOrDefault(x => x.UslugaId == id);

        if (entity == null)
            return null;

        return new DodatnaUslugaDto
        {
            UslugaId = entity.UslugaId,
            Naziv = entity.Naziv,
            Cijena = entity.Cijena
        };
    }

    public DodatnaUslugaDto Insert(DodatnaUslugaInsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Naziv))
            throw new Exception("Naziv usluge je obavezan.");

        if (request.Cijena < 0)
            throw new Exception("Cijena ne može biti negativna.");

        var postoji = _context.DodatneUsluges.Any(x => x.Naziv == request.Naziv);
        if (postoji)
            throw new Exception("Dodatna usluga sa istim nazivom već postoji.");

        var entity = new DodatneUsluge
        {
            Naziv = request.Naziv,
            Cijena = request.Cijena
        };

        _context.DodatneUsluges.Add(entity);
        _context.SaveChanges();

        return new DodatnaUslugaDto
        {
            UslugaId = entity.UslugaId,
            Naziv = entity.Naziv,
            Cijena = entity.Cijena
        };
    }

    public DodatnaUslugaDto Update(int id, DodatnaUslugaUpdateRequest request)
    {
        var entity = _context.DodatneUsluges.FirstOrDefault(x => x.UslugaId == id);

        if (entity == null)
            throw new Exception("Dodatna usluga nije pronađena.");

        if (string.IsNullOrWhiteSpace(request.Naziv))
            throw new Exception("Naziv usluge je obavezan.");

        if (request.Cijena < 0)
            throw new Exception("Cijena ne može biti negativna.");

        var postoji = _context.DodatneUsluges.Any(x => x.UslugaId != id && x.Naziv == request.Naziv);
        if (postoji)
            throw new Exception("Druga usluga sa istim nazivom već postoji.");

        entity.Naziv = request.Naziv;
        entity.Cijena = request.Cijena;

        _context.SaveChanges();

        return new DodatnaUslugaDto
        {
            UslugaId = entity.UslugaId,
            Naziv = entity.Naziv,
            Cijena = entity.Cijena
        };
    }

    public bool Delete(int id)
    {
        var entity = _context.DodatneUsluges
            .Include(x => x.RezervacijaUsluge)
            .FirstOrDefault(x => x.UslugaId == id);

        if (entity == null)
            return false;

        if (entity.RezervacijaUsluge.Any())
            _context.RezervacijaUsluges.RemoveRange(entity.RezervacijaUsluge);

        _context.DodatneUsluges.Remove(entity);
        _context.SaveChanges();

        return true;
    }
}