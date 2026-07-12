using eHotel.Database;
using eHotel.Helpers;

namespace eHotel.Seed
{
    public class DatabaseSeeder
    {
        private readonly EHotelContext _context;

        public DatabaseSeeder(EHotelContext context)
        {
            _context = context;
        }

        public void Seed()
        {
            SeedRoles();
            SeedAdmin();
            SeedRoomTypes();
            SeedServices();
            SeedRooms();
        }

        private void SeedRoles()
        {
            if (!_context.Uloges.Any())
            {
                _context.Uloges.AddRange(
                    new Uloge
                    {
                        Naziv = "Admin",
                        Opis = "Administrator sistema"
                    },
                    new Uloge
                    {
                        Naziv = "Recepcioner",
                        Opis = "Upravljanje rezervacijama i gostima"
                    },
                    new Uloge
                    {
                        Naziv = "Gost",
                        Opis = "Korisnik hotela"
                    }
                );

                _context.SaveChanges();
            }
        }

        private void SeedAdmin()
        {
            if (!_context.Korisnicis.Any(x => x.KorisnickoIme == "admin"))
            {
                var admin = new Korisnici
                {
                    Ime = "Admin",
                    Prezime = "Sistem",
                    Email = "admin@ehotel.ba",
                    Telefon = "000000000",
                    KorisnickoIme = "admin",
                    PasswordHash = PasswordHelper.Hash("admin123"),
                    Status = true,
                    DatumRegistracije = DateTime.Now
                };

                _context.Korisnicis.Add(admin);
                _context.SaveChanges();


                var adminRole = _context.Uloges
                    .First(x => x.Naziv == "Admin");


                _context.KorisniciUloges.Add(new KorisniciUloge
                {
                    KorisnikId = admin.KorisnikId,
                    UlogaId = adminRole.UlogaId,
                    DatumIzmjene = DateTime.Now
                });

                _context.SaveChanges();
            }
        }

        private void SeedRoomTypes()
        {
            if (!_context.VrsteSobas.Any())
            {
                _context.VrsteSobas.AddRange(
                    new VrsteSoba
                    {
                        Naziv = "Jednokrevetna",
                        Opis = "Soba za jednu osobu",
                        Kapacitet = 1,
                        Cijena = 80
                    },
                    new VrsteSoba
                    {
                        Naziv = "Dvokrevetna",
                        Opis = "Soba za dvije osobe",
                        Kapacitet = 2,
                        Cijena = 120
                    },
                    new VrsteSoba
                    {
                        Naziv = "Apartman",
                        Opis = "Prostrani apartman",
                        Kapacitet = 4,
                        Cijena = 220
                    },
                    new VrsteSoba
                    {
                        Naziv = "Deluxe",
                        Opis = "Luksuzna soba",
                        Kapacitet = 2,
                        Cijena = 300
                    }
                );

                _context.SaveChanges();
            }
        }

        private void SeedServices()
        {
            if (!_context.DodatneUsluges.Any())
            {
                _context.DodatneUsluges.AddRange(
                    new DodatneUsluge
                    {
                        Naziv = "Dorucak",
                        Cijena = 15
                    },
                    new DodatneUsluge
                    {
                        Naziv = "Spa",
                        Cijena = 30
                    },
                    new DodatneUsluge
                    {
                        Naziv = "Parking",
                        Cijena = 10
                    },
                    new DodatneUsluge
                    {
                        Naziv = "Fitness",
                        Cijena = 20
                    },
                    new DodatneUsluge
                    {
                        Naziv = "Aerodromski transfer",
                        Cijena = 40
                    }
                );

                _context.SaveChanges();
            }
        }

        private void SeedRooms()
        {
            if (!_context.Sobes.Any())
            {
                var single = _context.VrsteSobas
                    .First(x => x.Naziv == "Jednokrevetna");

                var doubleRoom = _context.VrsteSobas
                    .First(x => x.Naziv == "Dvokrevetna");

                var apartment = _context.VrsteSobas
                    .First(x => x.Naziv == "Apartman");

                var deluxe = _context.VrsteSobas
                    .First(x => x.Naziv == "Deluxe");


                _context.Sobes.AddRange(
                    CreateRoom("101", "Soba 101", single.VrstaId),
                    CreateRoom("102", "Soba 102", single.VrstaId),

                    CreateRoom("201", "Soba 201", doubleRoom.VrstaId),
                    CreateRoom("202", "Soba 202", doubleRoom.VrstaId),

                    CreateRoom("301", "Apartman 301", apartment.VrstaId),
                    CreateRoom("302", "Apartman 302", apartment.VrstaId),

                    CreateRoom("401", "Deluxe 401", deluxe.VrstaId),
                    CreateRoom("402", "Deluxe 402", deluxe.VrstaId)
                );

                _context.SaveChanges();
            }
        }

        private Sobe CreateRoom(string sifra, string naziv, int vrstaId)
        {
            return new Sobe
            {
                Naziv = naziv,
                Sifra = sifra,
                VrstaId = vrstaId,
                Status = true,
                StateMachine = "Aktivna",
                Slika = Array.Empty<byte>(),
                SlikaThumb = Array.Empty<byte>()
            };
        }
    }
}