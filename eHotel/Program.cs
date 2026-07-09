using eHotel.Database;
using eHotel.eHotel.Services;
using eHotel.eHotel.Services.Interface;
using eHotel.eHotel.Services.Services;
using eHotel.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(context.ModelState);
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Configure JWT Settings
var jwtSettings = new JwtSettings
{
    SecretKey = builder.Configuration["JwtSettings:SecretKey"]
                ?? Environment.GetEnvironmentVariable("JwtSettings__SecretKey")
                ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? "your-super-secret-key-that-is-at-least-32-characters-long-12345",
    Issuer = builder.Configuration["JwtSettings:Issuer"] ?? "eHotelAPI",
    Audience = builder.Configuration["JwtSettings:Audience"] ?? "eHotelClients",
    ExpirationMinutes = int.Parse(builder.Configuration["JwtSettings:ExpirationMinutes"] ?? "60")
};
builder.Services.AddSingleton(jwtSettings);

// Configure JWT Authentication
var key = Encoding.ASCII.GetBytes(jwtSettings.SecretKey ?? "");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "eHotel API",
        Version = "v1",
        Description = "eHotel Management System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer <token>' to authenticate."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IKorisnikService, KorisnikService>();
builder.Services.AddScoped<IZaposlenikService, ZaposlenikService>();
builder.Services.AddScoped<IRezervacijeService, RezervacijaService>();
builder.Services.AddScoped<IDodatneUslugeService, DodatneUslugeService>();
builder.Services.AddScoped<IPlacanjeService, PlacanjaService>();
builder.Services.AddScoped<IRecenzijaService, RecenzijeService>();
builder.Services.AddScoped<ISobaService, SobeService>();
builder.Services.AddScoped<IVrstaSobeService, VrsteSobeService>();

// Add DbContext
builder.Services.AddDbContext<EHotelContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "eHotel API v1");
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
    });
}

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed roles and default admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<EHotelContext>();
        // ensure roles
        if (!context.Uloges.Any(u => u.Naziv == "Gost"))
        {
            context.Uloges.Add(new eHotel.Database.Uloge { Naziv = "Gost", Opis = "Gost hotela" });
        }
        if (!context.Uloges.Any(u => u.Naziv == "Zaposlenik"))
        {
            context.Uloges.Add(new eHotel.Database.Uloge { Naziv = "Zaposlenik", Opis = "Zaposlenik hotela" });
        }
        context.SaveChanges();

        // create default admin employee if not exists
        var adminUser = context.Korisnicis.FirstOrDefault(k => k.KorisnickoIme == "admin");
        var zaposlenikRole = context.Uloges.FirstOrDefault(r => r.Naziv == "Zaposlenik");
        if (adminUser == null)
        {
            adminUser = new eHotel.Database.Korisnici
            {
                Ime = "Admin",
                Prezime = "Admin",
                Email = "admin@example.com",
                KorisnickoIme = "admin",
                PasswordHash = eHotel.Helpers.PasswordHelper.Hash("Admin123!"),
                Status = true,
                DatumRegistracije = DateTime.UtcNow
            };
            context.Korisnicis.Add(adminUser);
            context.SaveChanges();
        }

        if (zaposlenikRole != null && !context.KorisniciUloges.Any(ku => ku.KorisnikId == adminUser.KorisnikId && ku.UlogaId == zaposlenikRole.UlogaId))
        {
            context.KorisniciUloges.Add(new eHotel.Database.KorisniciUloge
            {
                KorisnikId = adminUser.KorisnikId,
                UlogaId = zaposlenikRole.UlogaId,
                DatumIzmjene = DateTime.UtcNow
            });
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

app.Run();


