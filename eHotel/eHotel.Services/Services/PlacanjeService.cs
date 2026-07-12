using eHotel.Database;
using eHotel.Dto.Placanje;
using eHotel.eHotel.Services.Interface;

public class PlacanjaService : IPlacanjeService
{
    private readonly EHotelContext _context;

    public PlacanjaService(EHotelContext context)
    {
        _context = context;
    }

    public List<PlacanjeDto> Get()
    {
        return _context.Placanjas
            .Select(x => new PlacanjeDto
            {
                PlacanjeId = x.PlacanjeId,
                RezervacijaId = x.RezervacijaId,
                Iznos = x.Iznos,
                Datum = x.Datum,
                Status = x.Status,
                TransakcijaId = x.TransakcijaId
            })
            .ToList();
    }

    public PlacanjeDto GetById(int id)
    {
        var entity = _context.Placanjas.FirstOrDefault(x => x.PlacanjeId == id);

        if (entity == null)
            return null;

        return new PlacanjeDto
        {
            PlacanjeId = entity.PlacanjeId,
            RezervacijaId = entity.RezervacijaId,
            Iznos = entity.Iznos,
            Datum = entity.Datum,
            Status = entity.Status,
            TransakcijaId = entity.TransakcijaId
        };
    }

    public List<PlacanjeDto> GetByRezervacijaId(int rezervacijaId)
    {
        return _context.Placanjas
            .Where(x => x.RezervacijaId == rezervacijaId)
            .Select(x => new PlacanjeDto
            {
                PlacanjeId = x.PlacanjeId,
                RezervacijaId = x.RezervacijaId,
                Iznos = x.Iznos,
                Datum = x.Datum,
                Status = x.Status,
                TransakcijaId = x.TransakcijaId
            })
            .ToList();
    }

    public PlacanjeDto Insert(PlacanjeInsertRequest request)
    {
        bool postoji = _context.Placanjas
            .Any(x => x.RezervacijaId == request.RezervacijaId);

        if(postoji)
            throw new Exception("Rezervacija je već plaćena.");
        
        if (request.Iznos <= 0)
            throw new Exception("Iznos mora biti veći od 0.");

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new Exception("Status plaćanja je obavezan.");

        var rezervacija = _context.Rezervacijas.FirstOrDefault(x => x.RezervacijaId == request.RezervacijaId);
        if (rezervacija == null)
            throw new Exception("Rezervacija ne postoji.");

        var entity = new Placanja
        {
            RezervacijaId = request.RezervacijaId,
            Iznos = request.Iznos,
            Datum = DateTime.Now,
            Status = request.Status,
            TransakcijaId = request.TransakcijaId
        };

        _context.Placanjas.Add(entity);
        _context.SaveChanges();

        return new PlacanjeDto
        {
            PlacanjeId = entity.PlacanjeId,
            RezervacijaId = entity.RezervacijaId,
            Iznos = entity.Iznos,
            Datum = entity.Datum,
            Status = entity.Status,
            TransakcijaId = entity.TransakcijaId
        };
    }

    public PlacanjeDto Update(int id, PlacanjeUpdateRequest request)
    {
        var entity = _context.Placanjas.FirstOrDefault(x => x.PlacanjeId == id);

        if (entity == null)
            throw new Exception("Plaćanje nije pronađeno.");

        if (request.Iznos <= 0)
            throw new Exception("Iznos mora biti veći od 0.");

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new Exception("Status plaćanja je obavezan.");

        entity.Iznos = request.Iznos;
        entity.Datum = request.Datum;
        entity.Status = request.Status;
        entity.TransakcijaId = request.TransakcijaId;

        _context.SaveChanges();

        return new PlacanjeDto
        {
            PlacanjeId = entity.PlacanjeId,
            RezervacijaId = entity.RezervacijaId,
            Iznos = entity.Iznos,
            Datum = entity.Datum,
            Status = entity.Status,
            TransakcijaId = entity.TransakcijaId
        };
    }
    
    public List<PlacanjeDto> GetByGostId(int korisnikId)
    {
        return _context.Placanjas
            .Where(x => x.Rezervacija.KorisnikId == korisnikId)
            .Select(x => new PlacanjeDto
            {
                PlacanjeId = x.PlacanjeId,
                RezervacijaId = x.RezervacijaId,
                Iznos = x.Iznos,
                Datum = x.Datum,
                Status = x.Status,
                TransakcijaId = x.TransakcijaId
            })
            .ToList();
    }
}