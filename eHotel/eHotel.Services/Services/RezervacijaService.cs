using AutoMapper;
using eHotel.Database;
using eHotel.Dto.Rezervacija;
using Microsoft.EntityFrameworkCore;

public class RezervacijaService : IRezervacijeService
{
    public EHotelContext _context { get; set; }
    private readonly IMapper _mapper;

    public RezervacijaService(EHotelContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public List<RezervacijaDto> Get(RezervacijaSearchObject search)
    {
        var query = _context.Rezervacijas
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
                .ThenInclude(s => s.Vrsta)
            .Include(x => x.Placanja)
            .Include(x => x.RezervacijaUsluge)
                .ThenInclude(ru => ru.Usluga)
            .AsQueryable();

        if (search?.KorisnikId.HasValue == true)
            query = query.Where(x => x.KorisnikId == search.KorisnikId.Value);

        if (search?.SobaId.HasValue == true)
            query = query.Where(x => x.SobaId == search.SobaId.Value);

        if (search?.Status.HasValue == true)
            query = query.Where(x => x.Status == search.Status.Value);

        if (search?.DatumOd.HasValue == true)
            query = query.Where(x => x.DatumOd >= search.DatumOd.Value);

        if (search?.DatumDo.HasValue == true)
            query = query.Where(x => x.DatumDo <= search.DatumDo.Value);

        return query
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public RezervacijaDto GetById(int id)
    {
        var entity = _context.Rezervacijas
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
                .ThenInclude(s => s.Vrsta)
            .Include(x => x.Placanja)
            .Include(x => x.RezervacijaUsluge)
                .ThenInclude(ru => ru.Usluga)
            .FirstOrDefault(x => x.RezervacijaId == id);

        if (entity == null)
            return null;

        return MapToDto(entity);
    }

    public RezervacijaDto Insert(RezervacijaInsertRequest request, int loggedUserId, string role)
    {
        if (role == "Gost")
            request.KorisnikId = loggedUserId;
        
        if ((role == "Admin" || role == "Recepcioner") && request.KorisnikId == null)
            throw new Exception("Morate odabrati gosta.");
        
        if (request.DatumOd.Date < DateTime.Today)
            throw new Exception("Datum početka rezervacije ne može biti u prošlosti.");
        
        if (request.DatumOd >= request.DatumDo)
            throw new Exception("Datum od mora biti manji od datuma do.");
        
        if (request.BrojOsoba <= 0)
            throw new Exception("Broj osoba mora biti veći od 0.");

        var korisnik = _context.Korisnicis.FirstOrDefault(x => x.KorisnikId == request.KorisnikId);
        
        if (korisnik == null)
            throw new Exception("Korisnik ne postoji.");

        var soba = _context.Sobes
            .Include(x => x.Vrsta)
            .FirstOrDefault(x => x.SobeId == request.SobaId);

        if (soba == null)
            throw new Exception("Soba ne postoji.");

        if (soba.Status == false)
            throw new Exception("Soba nije aktivna.");

        if (request.BrojOsoba > soba.Vrsta.Kapacitet)
            throw new Exception($"Maksimalan broj osoba za ovu sobu je {soba.Vrsta.Kapacitet}.");

        var postojiPreklapanje = _context.Rezervacijas.Any(x =>
            x.SobaId == request.SobaId &&
            x.Status != (int)StatusRezervacije.Otkazana &&
            request.DatumOd < x.DatumDo &&
            request.DatumDo > x.DatumOd);

        if (postojiPreklapanje)
            throw new Exception("Soba je već rezervisana za odabrani termin.");

        int brojNocenja = (request.DatumDo.Date - request.DatumOd.Date).Days;
        if (brojNocenja <= 0)
            throw new Exception("Rezervacija mora imati barem jedno noćenje.");

        decimal ukupnaCijena = brojNocenja * soba.Vrsta.Cijena;

        var entity = new Rezervacija
        {
            KorisnikId = request.KorisnikId!.Value,
            SobaId = request.SobaId,
            DatumOd = request.DatumOd,
            DatumDo = request.DatumDo,
            BrojOsoba = request.BrojOsoba,
            Status = (int)StatusRezervacije.Kreirana,
            DatumKreiranja = DateTime.Now,
            UkupnaCijena = 0
        };

        _context.Rezervacijas.Add(entity);
        _context.SaveChanges();

        if (request.UslugeIds != null && request.UslugeIds.Count > 0)
        {
            var usluge = _context.DodatneUsluges
                .Where(x => request.UslugeIds.Contains(x.UslugaId))
                .ToList();

            foreach (var usluga in usluge)
            {
                _context.RezervacijaUsluges.Add(new RezervacijaUsluge
                {
                    RezervacijaId = entity.RezervacijaId,
                    UslugaId = usluga.UslugaId
                });

                ukupnaCijena += usluga.Cijena;
            }
        }

        entity.UkupnaCijena = ukupnaCijena;
        _context.SaveChanges();

        return GetById(entity.RezervacijaId);
    }

    public RezervacijaDto Update(int id, RezervacijaUpdateRequest request)
    {
        var entity = _context.Rezervacijas
            .Include(x => x.RezervacijaUsluge)
            .FirstOrDefault(x => x.RezervacijaId == id);

        if (entity == null)
            throw new Exception("Rezervacija nije pronađena.");

        if (entity.Status == (int)StatusRezervacije.Otkazana)
            throw new Exception("Otkazana rezervacija se ne može mijenjati.");

        if (request.DatumOd >= request.DatumDo)
            throw new Exception("Datum od mora biti manji od datuma do.");

        if (request.BrojOsoba <= 0)
            throw new Exception("Broj osoba mora biti veći od 0.");

        var soba = _context.Sobes
            .Include(x => x.Vrsta)
            .FirstOrDefault(x => x.SobeId == request.SobaId);

        if (soba == null)
            throw new Exception("Soba ne postoji.");

        if (request.BrojOsoba > soba.Vrsta.Kapacitet)
            throw new Exception($"Maksimalan broj osoba za ovu sobu je {soba.Vrsta.Kapacitet}.");

        var postojiPreklapanje = _context.Rezervacijas.Any(x =>
            x.RezervacijaId != id &&
            x.SobaId == request.SobaId &&
            x.Status != (int)StatusRezervacije.Otkazana &&
            request.DatumOd < x.DatumDo &&
            request.DatumDo > x.DatumOd);

        if (postojiPreklapanje)
            throw new Exception("Soba je već rezervisana za odabrani termin.");

        entity.SobaId = request.SobaId;
        entity.DatumOd = request.DatumOd;
        entity.DatumDo = request.DatumDo;
        entity.BrojOsoba = request.BrojOsoba;
        entity.Status = request.Status;

        var stareUsluge = _context.RezervacijaUsluges
            .Where(x => x.RezervacijaId == entity.RezervacijaId)
            .ToList();

        if (stareUsluge.Any())
            _context.RezervacijaUsluges.RemoveRange(stareUsluge);

        int brojNocenja = (request.DatumDo.Date - request.DatumOd.Date).Days;
        if (brojNocenja <= 0)
            throw new Exception("Rezervacija mora imati barem jedno noćenje.");

        decimal ukupnaCijena = brojNocenja * soba.Vrsta.Cijena;

        if (request.UslugeIds != null && request.UslugeIds.Count > 0)
        {
            var usluge = _context.DodatneUsluges
                .Where(x => request.UslugeIds.Contains(x.UslugaId))
                .ToList();

            foreach (var usluga in usluge)
            {
                _context.RezervacijaUsluges.Add(new RezervacijaUsluge
                {
                    RezervacijaId = entity.RezervacijaId,
                    UslugaId = usluga.UslugaId
                });

                ukupnaCijena += usluga.Cijena;
            }
        }

        entity.UkupnaCijena = ukupnaCijena;
        _context.SaveChanges();

        return GetById(entity.RezervacijaId);
    }

    public bool Delete(int id)
    {
        var entity = _context.Rezervacijas
            .Include(x => x.RezervacijaUsluge)
            .Include(x => x.Placanja)
            .FirstOrDefault(x => x.RezervacijaId == id);

        if (entity == null)
            return false;

        if (entity.RezervacijaUsluge.Any())
            _context.RezervacijaUsluges.RemoveRange(entity.RezervacijaUsluge);

        if (entity.Placanja.Any())
            _context.Placanjas.RemoveRange(entity.Placanja);

        _context.Rezervacijas.Remove(entity);
        _context.SaveChanges();

        return true;
    }

    public List<RezervacijaDto> GetByKorisnikId(int korisnikId)
    {
        return _context.Rezervacijas
            .Include(x => x.Korisnik)
            .Include(x => x.Soba)
                .ThenInclude(s => s.Vrsta)
            .Include(x => x.Placanja)
            .Include(x => x.RezervacijaUsluge)
                .ThenInclude(ru => ru.Usluga)
            .Where(x => x.KorisnikId == korisnikId)
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    public RezervacijaDto OtkaziRezervaciju(int korisnikId, int rezervacijaId)
    {
        var entity = _context.Rezervacijas.FirstOrDefault(x => x.RezervacijaId == rezervacijaId && x.KorisnikId == korisnikId);

        if (entity == null)
            throw new Exception("Rezervacija nije pronađena.");

        if (entity.Status == (int)StatusRezervacije.Otkazana)
            throw new Exception("Rezervacija je već otkazana.");

        entity.Status = (int)StatusRezervacije.Otkazana;
        _context.SaveChanges();

        return GetById(entity.RezervacijaId);
    }

    private RezervacijaDto MapToDto(Rezervacija entity)
    {
        return new RezervacijaDto
        {
            RezervacijaId = entity.RezervacijaId,
            KorisnikId = entity.KorisnikId,
            SobaId = entity.SobaId,
            KorisnikImePrezime = entity.Korisnik != null ? entity.Korisnik.Ime + " " + entity.Korisnik.Prezime : "",
            SobaNaziv = entity.Soba != null ? entity.Soba.Naziv : "",
            DatumOd = entity.DatumOd,
            DatumDo = entity.DatumDo,
            BrojOsoba = entity.BrojOsoba,
            Status = entity.Status,
            UkupnaCijena = entity.UkupnaCijena,
            DatumKreiranja = entity.DatumKreiranja,

            Usluge = entity.RezervacijaUsluge.Select(ru => new RezervacijaUsluga
            {
                UslugaId = ru.UslugaId,
                Naziv = ru.Usluga.Naziv,
                Cijena = ru.Usluga.Cijena
            }).ToList(),

            Placanja = entity.Placanja.Select(p => new Placanje
            {
                PlacanjeId = p.PlacanjeId,
                Iznos = p.Iznos,
                Datum = p.Datum,
                Status = p.Status,
                TransakcijaId = p.TransakcijaId
            }).ToList()
        };
    }
    
    public RezervacijaDto CheckIn(int rezervacijaId)
    {
        var entity = _context.Rezervacijas.FirstOrDefault(x => x.RezervacijaId == rezervacijaId);

        if (entity == null)
            throw new Exception("Rezervacija nije pronađena.");

        entity.Status = (int)StatusRezervacije.Potvrdjena;

        _context.SaveChanges();

        return GetById(rezervacijaId);
    }
    
    public RezervacijaDto CheckOut(int rezervacijaId)
    {
        var entity = _context.Rezervacijas.FirstOrDefault(x => x.RezervacijaId == rezervacijaId);

        if (entity == null)
            throw new Exception("Rezervacija nije pronađena.");

        entity.Status = (int)StatusRezervacije.Zavrsena;

        _context.SaveChanges();

        return GetById(rezervacijaId);
    }
}