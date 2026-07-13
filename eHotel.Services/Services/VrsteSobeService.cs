        public List<VrstaSobeDto> Get()
        {
            return _context.VrsteSobas
                .AsEnumerable()
                .Select(MapToDto)
                .ToList();
        }

        public VrstaSobeDto? GetById(int id)
        {
            var entity = _context.VrsteSobas
                .FirstOrDefault(x => x.VrstaId == id);

            return entity == null ? null : MapToDto(entity);
        }
...
        private static VrstaSobeDto MapToDto(VrsteSoba entity)
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
