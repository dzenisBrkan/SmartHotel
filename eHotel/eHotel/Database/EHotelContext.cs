using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace eHotel.Database;

public partial class EHotelContext : DbContext
{
    public EHotelContext()
    {
    }

    public EHotelContext(DbContextOptions<EHotelContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Korisnici> Korisnicis { get; set; }
    public virtual DbSet<KorisniciUloge> KorisniciUloges { get; set; }
    public virtual DbSet<Uloge> Uloges { get; set; }
    public virtual DbSet<Sobe> Sobes { get; set; }
    public virtual DbSet<VrsteSoba> VrsteSobas { get; set; }
    public virtual DbSet<Rezervacija> Rezervacijas { get; set; }
    public virtual DbSet<RezervacijaUsluge> RezervacijaUsluges { get; set; }
    public virtual DbSet<DodatneUsluge> DodatneUsluges { get; set; }
    public virtual DbSet<Placanja> Placanjas { get; set; }
    public virtual DbSet<Recenzije> Recenzijes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Server=.;Database=eHotel;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Korisnici>(entity =>
        {
            entity.HasKey(e => e.KorisnikId);
            entity.ToTable("Korisnici");
        });

        modelBuilder.Entity<Uloge>(entity =>
        {
            entity.HasKey(e => e.UlogaId);
            entity.ToTable("Uloge");
        });

        modelBuilder.Entity<KorisniciUloge>(entity =>
        {
            entity.HasKey(e => e.KorisnikUlogaId);

            entity.ToTable("KorisniciUloge");

            entity.HasOne(d => d.Korisnik)
                .WithMany(p => p.KorisniciUloges)
                .HasForeignKey(d => d.KorisnikId);

            entity.HasOne(d => d.Uloga)
                .WithMany(p => p.KorisniciUloges)
                .HasForeignKey(d => d.UlogaId);
        });

        modelBuilder.Entity<VrsteSoba>(entity =>
        {
            entity.HasKey(e => e.VrstaId);
            entity.ToTable("VrsteSoba");

            entity.Property(e => e.Cijena)
                .HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Sobe>(entity =>
        {
            entity.HasKey(e => e.SobeId);

            entity.ToTable("Sobe");

            entity.HasOne(d => d.Vrsta)
                .WithMany(p => p.Sobe)
                .HasForeignKey(d => d.VrstaId);
        });

        modelBuilder.Entity<Rezervacija>(entity =>
        {
            entity.HasKey(e => e.RezervacijaId);

            entity.ToTable("Rezervacija");

            entity.Property(e => e.UkupnaCijena)
                .HasColumnType("decimal(18,2)");

            entity.HasOne(d => d.Korisnik)
                .WithMany(p => p.Rezervacije)
                .HasForeignKey(d => d.KorisnikId);

            entity.HasOne(d => d.Soba)
                .WithMany(p => p.Rezervacije)
                .HasForeignKey(d => d.SobaId);
        });

        modelBuilder.Entity<DodatneUsluge>(entity =>
        {
            entity.HasKey(e => e.UslugaId);

            entity.ToTable("DodatneUsluge");

            entity.Property(e => e.Cijena)
                .HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<RezervacijaUsluge>(entity =>
        {
            entity.HasKey(e => e.RezervacijaUslugaId);

            entity.ToTable("RezervacijaUsluge");

            entity.HasOne(d => d.Rezervacija)
                .WithMany(p => p.RezervacijaUsluge)
                .HasForeignKey(d => d.RezervacijaId);

            entity.HasOne(d => d.Usluga)
                .WithMany(p => p.RezervacijaUsluge)
                .HasForeignKey(d => d.UslugaId);
        });

        modelBuilder.Entity<Placanja>(entity =>
        {
            entity.HasKey(e => e.PlacanjeId);

            entity.ToTable("Placanja");

            entity.Property(e => e.Iznos)
                .HasColumnType("decimal(18,2)");

            entity.HasOne(d => d.Rezervacija)
                .WithMany(p => p.Placanja)
                .HasForeignKey(d => d.RezervacijaId);
        });

        modelBuilder.Entity<Recenzije>(entity =>
        {
            entity.HasKey(e => e.RecenzijeId);

            entity.ToTable("Recenzije");

            entity.HasOne(d => d.Korisnik)
                .WithMany(p => p.Recenzije)
                .HasForeignKey(d => d.KorisnikId);

            entity.HasOne(d => d.Soba)
                .WithMany(p => p.Recenzije)
                .HasForeignKey(d => d.SobaId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
