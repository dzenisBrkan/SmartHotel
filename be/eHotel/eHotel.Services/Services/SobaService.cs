using eHotel.Database;
using eHotel.Dto.Rezervacija;
using eHotel.Dto.Soba;
using eHotel.eHotel.Services.Interface;
using Microsoft.EntityFrameworkCore;

public class SobeService : ISobaService
{
    private readonly EHotelContext _context;

    public SobeService(EHotelContext context)
    {
        _context = context;
    }

    public List<SobaDto> Get(SobaSearchObject search)
    {
        var query = _context.Sobes
            .Include(x => x.Vrsta)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search?.Naziv))
            query = query.Where(x => x.Naziv.Contains(search.Naziv));

        if (search?.VrstaId.HasValue == true)
            query = query.Where(x => x.VrstaId == search.VrstaId);

        if (search?.Status.HasValue == true)
            query = query.Where(x => x.Status == search.Status);

        return query
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public SobaDto? GetById(int id)
    {
        var entity = _context.Sobes
            .Include(x => x.Vrsta)
            .FirstOrDefault(x => x.SobeId == id);

        if (entity == null)
            return null;

        return MapToDto(entity);
    }

    public SobaDto Insert(SobaInsertRequest request)
    {
        var vrsta = _context.VrsteSobas.FirstOrDefault(x => x.VrstaId == request.VrstaId);

        if (vrsta == null)
            throw new Exception("Vrsta sobe ne postoji.");

        var entity = new Sobe
        {
            Naziv = request.Naziv,
            Sifra = request.Sifra,
            VrstaId = request.VrstaId,
            Slika = request.Slika,
            SlikaThumb = request.SlikaThumb,
            Status = request.Status ?? true,
            StateMachine = request.StateMachine
        };

        _context.Sobes.Add(entity);
        _context.SaveChanges();

        return GetById(entity.SobeId)!;
    }

    public SobaDto Update(int id, SobaUpdateRequest request)
    {
        var entity = _context.Sobes.FirstOrDefault(x => x.SobeId == id);

        if (entity == null)
            throw new Exception("Soba ne postoji.");

        var vrsta = _context.VrsteSobas.FirstOrDefault(x => x.VrstaId == request.VrstaId);

        if (vrsta == null)
            throw new Exception("Vrsta sobe ne postoji.");

        entity.Naziv = request.Naziv;
        entity.Sifra = request.Sifra;
        entity.VrstaId = request.VrstaId;

        if (request.Slika != null)
            entity.Slika = request.Slika;

        if (request.SlikaThumb != null)
            entity.SlikaThumb = request.SlikaThumb;

        entity.Status = request.Status;
        entity.StateMachine = request.StateMachine;

        _context.SaveChanges();

        return GetById(entity.SobeId)!;
    }

    public bool Delete(int id)
    {
        var entity = _context.Sobes
            .Include(x => x.Rezervacije)
            .Include(x => x.Recenzije)
            .FirstOrDefault(x => x.SobeId == id);

        if (entity == null)
            return false;

        // zaštita (ne dozvoli brisanje ako postoji aktivna rezervacija)
        if (entity.Rezervacije.Any(x => x.Status != (int)StatusRezervacije.Otkazana))
            throw new Exception("Soba ima aktivne rezervacije i ne može se obrisati.");

        _context.Sobes.Remove(entity);
        _context.SaveChanges();

        return true;
    }

    private SobaDto MapToDto(Sobe entity)
    {
        return new SobaDto
        {
            SobeId = entity.SobeId,
            Naziv = entity.Naziv,
            Sifra = entity.Sifra,

            VrstaId = entity.VrstaId,
            VrstaNaziv = entity.Vrsta?.Naziv ?? "",

            Kapacitet = entity.Vrsta?.Kapacitet ?? 0,
            Cijena = entity.Vrsta?.Cijena ?? 0,

            Status = entity.Status,
            StateMachine = entity.StateMachine
        };
    }
}