using System;
using System.Collections.Generic;
using System.Linq;
using eHotel.Database;
using eHotel.Dto.VrstaSobe;
using eHotel.eHotel.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace eHotel.eHotel.Services.Services
{
    public class VrsteSobeService : IVrstaSobeService
    {
        private readonly EHotelContext _context;

        public VrsteSobeService(EHotelContext context)
        {
            _context = context;
        }

        public List<VrstaSobeDto> Get()
        {
            return _context.VrsteSobas
                .Select(x => new VrstaSobeDto
                {
                    VrstaId = x.VrstaId,
                    Naziv = x.Naziv,
                    Opis = x.Opis,
                    Kapacitet = x.Kapacitet,
                    Cijena = x.Cijena
                })
                .ToList();
        }

        public VrstaSobeDto? GetById(int id)
        {
            var entity = _context.VrsteSobas
                .FirstOrDefault(x => x.VrstaId == id);

            return entity == null ? null : MapToDto(entity);
        }

        public VrstaSobeDto Insert(VrstaSobeInsertRequest request)
        {
            var entity = new VrsteSoba
            {
                Naziv = request.Naziv,
                Opis = request.Opis,
                Kapacitet = request.Kapacitet,
                Cijena = request.Cijena
            };

            _context.VrsteSobas.Add(entity);
            _context.SaveChanges();

            return MapToDto(entity);
        }

        public VrstaSobeDto Update(int id, VrstaSobeUpdateRequest request)
        {
            var entity = _context.VrsteSobas.FirstOrDefault(x => x.VrstaId == id);
            if (entity == null)
                throw new Exception("Vrsta sobe nije pronađena.");

            entity.Naziv = request.Naziv;
            entity.Opis = request.Opis;
            entity.Kapacitet = request.Kapacitet;
            entity.Cijena = request.Cijena;

            _context.SaveChanges();
            return MapToDto(entity);
        }

        public bool Delete(int id)
        {
            var entity = _context.VrsteSobas
                .Include(x => x.Sobe)
                .FirstOrDefault(x => x.VrstaId == id);

            if (entity == null)
                return false;

            if (entity.Sobe.Any())
                throw new Exception("Vrsta sobe se ne može obrisati jer postoje sobe povezane s njom.");

            _context.VrsteSobas.Remove(entity);
            _context.SaveChanges();
            return true;
        }

        private VrstaSobeDto MapToDto(VrsteSoba entity)
        {
            return new VrstaSobeDto
            {
                VrstaId = entity.VrstaId,
                Naziv = entity.Naziv,
                Opis = entity.Opis,
                Kapacitet = entity.Kapacitet,
                Cijena = entity.Cijena
            };
        }
    }
}
