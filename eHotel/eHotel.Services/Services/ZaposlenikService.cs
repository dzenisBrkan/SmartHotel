using eHotel.Database;
using eHotel.Dto.Korisnici;
using eHotel.eHotel.Services.Interface;
using eHotel.Helpers;
using Microsoft.EntityFrameworkCore;

namespace eHotel.eHotel.Services.Services
{
    public class ZaposlenikService : IZaposlenikService
    {
        private readonly EHotelContext _context;

        public ZaposlenikService(EHotelContext context)
        {
            _context = context;
        }

        public List<KorisnikDto> Get(string uloga, string? imePrezime = null)
        {
            var query = _context.Korisnicis
                .Include(x => x.KorisniciUloges)
                    .ThenInclude(ku => ku.Uloga)
                .Where(x => x.KorisniciUloges.Any(ku => ku.Uloga.Naziv == uloga))
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(imePrezime))
            {
                query = query.Where(x => (x.Ime + " " + x.Prezime).Contains(imePrezime));
            }

            return query.AsEnumerable().Select(MapToDto).ToList();
        }

        public KorisnikDto? GetById(int id)
        {
            var entity = _context.Korisnicis
                .Include(x => x.KorisniciUloges)
                    .ThenInclude(ku => ku.Uloga)
                .FirstOrDefault(x => x.KorisnikId == id);

            return entity == null ? null : MapToDto(entity);
        }

        public KorisnikDto Insert(KorisniciInsertRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Ime))
                throw new ArgumentException("Ime je obavezno.");

            if (string.IsNullOrWhiteSpace(request.Prezime))
                throw new ArgumentException("Prezime je obavezno.");

            if (string.IsNullOrWhiteSpace(request.KorisnickoIme))
                throw new ArgumentException("Korisničko ime je obavezno.");

            if (string.IsNullOrWhiteSpace(request.Lozinka) || request.Lozinka.Length < 6)
                throw new ArgumentException("Lozinka mora imati najmanje 6 znakova.");

            if (_context.Korisnicis.Any(x => x.KorisnickoIme == request.KorisnickoIme))
                throw new InvalidOperationException("Korisničko ime je već u upotrebi.");

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
            _context.SaveChanges();

            var gostRole = _context.Uloges.FirstOrDefault(x => x.Naziv == "Recepcioner");
            if (gostRole == null)
            {
                gostRole = new Uloge { Naziv = "Recepcioner", Opis = "Upravljanje rezervacijama i gostima" };
                _context.Uloges.Add(gostRole);
                _context.SaveChanges();
            }

            _context.KorisniciUloges.Add(new KorisniciUloge
            {
                KorisnikId = entity.KorisnikId,
                UlogaId = gostRole.UlogaId,
                DatumIzmjene = DateTime.UtcNow
            });
            _context.SaveChanges();

            return GetById(entity.KorisnikId)!;
        }

        public KorisnikDto? Update(int id, KorisniciUpdateRequest request)
        {
            var entity = _context.Korisnicis.Find(id);
            if (entity == null)
                return null;

            entity.Ime = request.Ime;
            entity.Prezime = request.Prezime;
            entity.Email = request.Email;

            _context.SaveChanges();
            return GetById(entity.KorisnikId);
        }

        public bool Delete(int id)
        {
            var entity = _context.Korisnicis.Find(id);
            if (entity == null)
                return false;

            _context.Korisnicis.Remove(entity);
            _context.SaveChanges();
            return true;
        }
        
        private KorisnikDto MapToDto(Korisnici entity)
        {
            return new KorisnikDto
            {
                KorisnikId = entity.KorisnikId,
                Ime = entity.Ime,
                Prezime = entity.Prezime,
                Email = entity.Email,
                Telefon = entity.Telefon,
                KorisnickoIme = entity.KorisnickoIme,
                Status = entity.Status,
                DatumRegistracije = entity.DatumRegistracije,
                Roles = entity.KorisniciUloges
                    .Where(x => x.Uloga != null)
                    .Select(x => x.Uloga.Naziv)
                    .ToList()
            };
        }
    }
}